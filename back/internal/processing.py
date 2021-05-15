from typing import IO
from detect_tesseract import get_text
from models.models import ProcessedResponse

# [{top: 100, left: 100, text: "hui"}]
# 1 2 3
# 4 5 6


async def process_pdf(contents: IO) -> ProcessedResponse:
    rois = get_text(contents)
    result = ProcessedResponse()
    return result


async def process_jpg(contents: IO) -> ProcessedResponse:
    rois = get_text(contents)
    result = ProcessedResponse()
    return result


async def process_png(contents: IO) -> ProcessedResponse:
    rois = get_text(contents)
    result = ProcessedResponse()
    return result
