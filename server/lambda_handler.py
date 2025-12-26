"""AWS Lambda handler for FastAPI application using Mangum."""

from mangum import Mangum
from main import app

# Mangum adapter for AWS Lambda
# lifespan="off" disables ASGI lifespan events (not supported in Lambda)
handler = Mangum(app, lifespan="off")
