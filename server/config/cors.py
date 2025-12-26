from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.env import Environment

def setup_cors(app: FastAPI):
    origins = list(filter(None, [
        Environment.APP_URL,
        Environment.LANDING_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:10000",
    ]))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"https://.*\.render\.com" if origins else None,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )