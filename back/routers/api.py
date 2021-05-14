import json
from typing import List

from fastapi import APIRouter, UploadFile, File

from internal.processing import process_pdf, process_jpg, process_png
from models.models import ContentType, ProcessedResponse

router = APIRouter(
    prefix="/api",
    tags=["api"]
)


@router.post("/api/upload-files")
async def upload_files(files: List[UploadFile] = File(...)):
    processed_responses: List[ProcessedResponse] = []
    for file in files:
        content_type = ContentType(file.content_type)
        filename = file.filename
        process_function = {
            ContentType.pdf: process_pdf,
            ContentType.jpg: process_jpg,
            ContentType.png: process_png
        }.get(content_type, ContentType.png)
        with await file.read() as contents:
            processed_response = await process_function(contents)
            processed_response.name = filename
            processed_responses.append(processed_response)

    response = json.dumps(processed_responses)
    return response
