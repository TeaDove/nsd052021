from enum import Enum
from typing import Optional, Any

from pydantic import BaseModel


class ContentType(str, Enum):
    pdf = "application/pdf"
    jpg = "image/jpeg"
    png = "image/png"


class ProcessedResponse(BaseModel):
    name: Optional[str]
    content: Any
