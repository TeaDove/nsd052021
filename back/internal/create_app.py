from fastapi import FastAPI

from internal.cors import add_cors
from routers import api


def create_app() -> FastAPI:
    app = FastAPI()

    @app.get("/")
    async def root():
        return {"Hello": "World!"}

    app = add_cors(app)

    app.include_router(api.router)

    return app
