from typing import List

from fastapi import APIRouter, UploadFile, File
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse

from internal.processing import process_pdf, process_jpg, process_png
from models.models import ContentType, ProcessedResponse

router = APIRouter(prefix="/api", tags=["api"])


@router.post("/upload-files")
async def upload_files(files: List[UploadFile] = File(...)):
    processed_responses = []
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
        processed_response = ProcessedResponse(name=table_name, content=table.rows)
        processed_responses.append(processed_response)

    json_compatible_response = jsonable_encoder(processed_responses)
    return JSONResponse(content=json_compatible_response)
