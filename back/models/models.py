from enum import Enum
from typing import List, Optional, Any

from pydantic import BaseModel

from models.tables import Table


class ContentType(str, Enum):
    pdf = "application/pdf"
    jpg = "image/jpeg"
    png = "image/png"


class ProcessedResponse(BaseModel):
    name: Optional[str]
    content: Optional[Table]

