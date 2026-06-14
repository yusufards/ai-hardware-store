import os
import json
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "best_model.pth")
LABEL_MAP_PATH = os.path.join(MODEL_DIR, "label_map.json")
THRESHOLD_CONFIG_PATH = os.path.join(MODEL_DIR, "threshold_config.json")

class AIPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.label_map = {}
        self.config = {
            "confidence_threshold": 0.6,
            "margin_threshold": 0.1,
            "entropy_threshold": 2.0
        }
        self.transform = transforms.Compose([
            transforms.Resize(224),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self.load_resources()

    def load_resources(self):
        try:
            # Load label map
            if os.path.exists(LABEL_MAP_PATH):
                with open(LABEL_MAP_PATH, "r") as f:
                    self.label_map = json.load(f)
            else:
                print(f"Warning: {LABEL_MAP_PATH} not found.")
            
            # Load threshold config
            if os.path.exists(THRESHOLD_CONFIG_PATH):
                with open(THRESHOLD_CONFIG_PATH, "r") as f:
                    self.config = json.load(f)
            else:
                print(f"Warning: {THRESHOLD_CONFIG_PATH} not found. Using default configs.")

            # Load model
            if os.path.exists(MODEL_PATH):
                self.model = models.mobilenet_v3_large(weights=None)
                # Modify classifier for 11 classes (0 to 10)
                num_classes = 11
                in_features = self.model.classifier[3].in_features
                self.model.classifier[3] = torch.nn.Linear(in_features, num_classes)
                
                # Load state dict
                self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
                print("Model loaded successfully.")
            else:
                print(f"Warning: {MODEL_PATH} not found. Predictions will return errors.")
        except Exception as e:
            print(f"Error loading model resources: {e}")

    def calculate_entropy(self, probabilities):
        return -torch.sum(probabilities * torch.log(probabilities + 1e-9)).item()

    def predict(self, image: Image.Image):
        if self.model is None:
            self.load_resources()
            
        if self.model is None:
            return {"error": "Model not loaded"}

        image = image.convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
            top_probs, top_indices = torch.topk(probabilities, 3)
            
            top_probs = top_probs.cpu().numpy()
            top_indices = top_indices.cpu().numpy()
            
            top_1_prob = top_probs[0]
            top_2_prob = top_probs[1]
            top_1_class = int(top_indices[0])
            
            entropy = self.calculate_entropy(probabilities)
            margin = top_1_prob - top_2_prob

            is_unknown = False
            reason = "normal_prediction"

            # Rule-based unknown handling
            if top_1_class == 0:
                is_unknown = True
                reason = "predicted_undefined_class"
            elif top_1_prob < self.config.get("confidence_threshold", 0.6):
                is_unknown = True
                reason = "low_confidence"
            elif margin < self.config.get("margin_threshold", 0.1):
                is_unknown = True
                reason = "low_margin"
            elif entropy > self.config.get("entropy_threshold", 2.0):
                is_unknown = True
                reason = "high_entropy"

            top_3 = []
            for i in range(3):
                class_id = int(top_indices[i])
                # Convert label_map keys from string to int if necessary
                class_name = self.label_map.get(str(class_id), f"Class {class_id}")
                top_3.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": float(top_probs[i])
                })

            result_class_id = 0 if is_unknown else top_1_class
            result_class_name = "Undefined" if is_unknown else self.label_map.get(str(result_class_id), f"Class {result_class_id}")

            return {
                "class_id": result_class_id,
                "class_name": result_class_name,
                "confidence": float(top_1_prob),
                "is_unknown": is_unknown,
                "reason": reason,
                "top_3": top_3
            }

predictor = AIPredictor()
