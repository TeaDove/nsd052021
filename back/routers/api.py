from typing import List

from fastapi import APIRouter, UploadFile, File

from internal.processing import process_pdf, process_jpg, process_png
from models.models import ContentType, ProcessedResponse

router = APIRouter(prefix="/api", tags=["api"])


@router.post("/upload-files", response_model=List[ProcessedResponse])
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
        contents = await file.read()
        processed_response = await process_function(contents)
        processed_response.name = filename
        processed_responses.append(processed_response)

    return processed_responses