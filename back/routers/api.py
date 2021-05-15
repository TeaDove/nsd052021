from typing import List

from fastapi import APIRouter, UploadFile, File

from internal.processing import process_pdf, process_jpg, process_png
from models.models import ContentType, ProcessedResponse

router = APIRouter(prefix="/api", tags=["api"])


@router.post("/upload-files")
async def upload_files(files: List[UploadFile] = File(...)) -> List[ProcessedResponse]:
    processed_responses: List[ProcessedResponse] = []
    for file in files:
        content_type = ContentType(file.content_type)
        filename = file.filename
        process_function = {
            ContentType.pdf: process_pdf,
            ContentType.jpg: process_jpg,
            ContentType.png: process_png,
        }.get(content_type, ContentType.png)
        table = process_function(file.file)
        table_name = filename
        processed_response = ProcessedResponse(name=table_name, content=table)
        processed_responses.append(processed_response)
    return processed_responses
