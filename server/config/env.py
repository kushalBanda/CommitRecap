# config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


class Environment():

    # General
    ENV = os.getenv("ENV")
    PRODUCT_NAME = "CommitRecap"
    APP_URL = os.getenv("APP_URL")
    LANDING_URL = os.getenv("LANDING_URL")
    
    # GitHub
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    GITHUB_BASE_URL = os.getenv("GITHUB_BASE_URL")