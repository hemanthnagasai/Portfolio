from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime, timezone
import uuid

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str = Field(..., min_length=1, max_length=100)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str = Field(..., min_length=1, max_length=100)

class TraceCreate(BaseModel):
    word: str

class Trace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    word: str

class ChatMessage(BaseModel):
    role: str = Field(..., max_length=20)
    content: str = Field(..., max_length=2000)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    # Hard cap on history length: without it a single request could carry
    # thousands of messages, each forwarded to Gemini as tokens (quota/cost
    # exhaustion). The frontend only ever sends the last 20; 40 leaves slack
    # so legitimate clients never hit a 422.
    history: List[ChatMessage] = Field(default_factory=list, max_length=40)

# Note: /api/chat streams plain text chunks (StreamingResponse), so there is
# no response schema for it.

