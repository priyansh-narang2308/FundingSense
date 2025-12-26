from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's question or message")
    analysis_id: Optional[str] = Field(None, description="Context from a specific analysis")
    language: str = Field("en", description="Preferred response language")
    user_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Recent conversation history")

class ChatSource(BaseModel):
    title: str
    url: Optional[str] = None
    source_name: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource] = []
    language: str
