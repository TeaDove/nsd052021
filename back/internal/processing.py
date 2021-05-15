from models.models import ProcessedResponse


async def process_pdf(contents: bytes) -> ProcessedResponse:
    return ProcessedResponse(name="Not implemented", data=[])


async def process_jpg(contents: bytes) -> ProcessedResponse:
    return ProcessedResponse(name="Not implemented", data=[])


async def process_png(contents: bytes) -> ProcessedResponse:
    return ProcessedResponse(name="Not implemented", data=[])
