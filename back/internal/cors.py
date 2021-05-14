from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware


def add_cors(app: FastAPI) -> FastAPI:
    origins = [
        "http://localhost",
        "http://localhost:3000",
        "http://65.21.155.166:8000",
        "http://65.21.155.166:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app
