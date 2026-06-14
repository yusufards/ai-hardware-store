# AI Hardware Store Assistant

A full-stack web application for an AI-powered e-commerce hardware store. Customers can browse products, interact with an AI assistant, and upload images to get product recommendations based on a PyTorch MobileNetV3 Large model.

## Project Structure
- `/frontend`: React application using Vite and Tailwind CSS.
- `/backend`: FastAPI application and PyTorch model logic.

## Prerequisites
- Node.js (v18+)
- Python 3.9+
- The trained PyTorch model files

## Setting Up the AI Model
Before running the backend, you MUST place your trained model files in the `backend/models` directory.

Copy the following files into `ai-hardware-store/backend/models/`:
- `best_model.pth`
- `label_map.json`
- `threshold_config.json`

## Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
The backend will be available at `http://localhost:8000`.

## Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
The frontend will be available at the URL provided by Vite (usually `http://localhost:5173`).

## Features
- **Modern UI**: Built with React and Tailwind CSS featuring a dark navy theme with orange and purple accents.
- **AI Prediction**: Upload an image to the AI Assistant, and it will predict the hardware tool and match it with a catalog product.
- **Smart Handling**: If the product is not in the catalog or the confidence is low, the system gracefully informs the user.
- **Chatbot**: Rule-based chatbot for answering basic questions about products, stock, and prices.
