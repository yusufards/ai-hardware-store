from pydantic import BaseModel
from typing import List, Optional

class ProductSchema(BaseModel):
    id: int
    name: str
    price: int
    old_price: Optional[int] = None
    stock: int
    rating: float
    sold: int
    description: str
    category: str
    specs: List[str]
    tags: List[str]
    image_url: Optional[str] = None

class PredictionTopItem(BaseModel):
    class_id: int
    class_name: str
    confidence: float

class PredictionResponse(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    is_unknown: bool
    reason: str
    top_3: List[PredictionTopItem]
    product: Optional[ProductSchema] = None
    message: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context_product_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
