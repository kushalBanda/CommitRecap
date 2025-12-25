from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.env import Environment

def setup_cors(app: FastAPI):
    origins = list(filter(None, [
        Environment.APP_URL,
        Environment.LANDING_URL
    ]))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )