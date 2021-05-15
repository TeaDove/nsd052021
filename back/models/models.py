from enum import Enum
from typing import List, Optional, Any

from pydantic import BaseModel


class ContentType(str, Enum):
    pdf = "application/pdf"
    jpg = "image/jpeg"
    png = "image/png"


class DataType(str, Enum):
    text = "text"
    table = "table"


class ProcessedData(BaseModel):
    data_type: Optional[DataType]
    data: Any

    def __dict__(self):
        return {"type": self.data_type.__str__, "data": self.data.__dict__}


class ProcessedText(ProcessedData):
    data_type = DataType.text


class ProcessedTable(ProcessedData):
    data_type = DataType.table


class ProcessedResponse:
    name: Optional[str] = ""
    content: Any

    # def __init__(self):
    #     self.data = []

    def get_dict(self):
        return {"name": self.name, "data": [d.__dict__ for d in self.content]}

    def __dict__(self):
        return {"name": self.name, "data": [d.__dict__ for d in self.content]}
