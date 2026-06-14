import os
import requests
import json
from io import BytesIO
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.schemas import ProductSchema, PredictionResponse, ChatRequest, ChatResponse
from app.products import products
from app.ai_predictor import predictor

app = FastAPI(title="AI Hardware Store Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API is running."}

@app.get("/api/products", response_model=list[ProductSchema])
def get_products():
    return products

@app.get("/api/products/{class_id}", response_model=ProductSchema)
def get_product(class_id: int):
    for product in products:
        if product["class_id"] == class_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    prediction = predictor.predict(image)

    if "error" in prediction:
        raise HTTPException(status_code=503, detail="Model not loaded")

    product_details = None
    message = None
    
    if prediction["is_unknown"] or prediction["class_id"] == 0:
        message = "Produk belum ditemukan di katalog kami."
    else:
        for p in products:
            if p["class_id"] == prediction["class_id"]:
                product_details = p
                break
        if not product_details:
             message = "Produk terdeteksi tapi tidak ada di katalog."

    return PredictionResponse(
        class_id=prediction["class_id"],
        class_name=prediction["class_name"],
        confidence=prediction["confidence"],
        is_unknown=prediction["is_unknown"],
        reason=prediction["reason"],
        top_3=prediction["top_3"],
        product=product_details,
        message=message
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_assistant(request: ChatRequest):
    context_str = ""
    
    if request.context_product_id:
        p = next((prod for prod in products if prod["class_id"] == request.context_product_id), None)
        if p:
            context_str = f"\n[Konteks saat ini: User sedang melihat produk: {p['name']}. Harga: Rp {p['price']}, Stok: {p['stock']}. Deskripsi: {p['description']}.]"

    prompt = f"""Kamu adalah AI Assistant yang ramah di sebuah toko perkakas (Hardware Store).
Gunakan bahasa Indonesia. Dilarang menggunakan format markdown tebal (bold) dengan tanda bintang (**).{context_str}

Daftar produk yang kami miliki: {', '.join([p['name'] for p in products])}

Berikan balasan yang membantu, ringkas, dan relevan dengan toko hardware."""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    api_messages = [{"role": "system", "content": prompt}]
    for m in request.messages:
        api_messages.append({"role": m.role, "content": m.content})
        
    payload = {
        "model": GROQ_MODEL,
        "messages": api_messages,
        "stream": True
    }

    def generate():
        try:
            with requests.post(GROQ_URL, headers=headers, json=payload, stream=True, timeout=30) as r:
                r.raise_for_status()
                for line in r.iter_lines():
                    if line:
                        line = line.decode('utf-8')
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            data = json.loads(data_str)
                            if "choices" in data and len(data["choices"]) > 0:
                                delta = data["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield f"data: {json.dumps({'content': delta['content']})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
