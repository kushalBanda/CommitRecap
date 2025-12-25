from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from pydantic_core import ValidationError as PydanticCoreValidationError
import logging

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "data": None}
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle FastAPI request validation errors"""
    error_details = []
    for error in exc.errors():
        field_name = " -> ".join(str(loc) for loc in error["loc"])
        error_details.append({
            "field": field_name,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error", 
            "data": error_details,
            "error_count": len(error_details)
        }
    )


async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic model validation errors"""
    logger.warning(f"Pydantic validation error on {request.url}: {exc}")
    
    error_details = []
    for error in exc.errors():
        field_name = " -> ".join(str(loc) for loc in error["loc"])
        error_details.append({
            "field": field_name,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "message": "Data validation error",
            "data": error_details,
            "error_count": len(error_details)
        }
    )


async def pydantic_core_validation_exception_handler(request: Request, exc: PydanticCoreValidationError):
    """Handle Pydantic core validation errors"""
    logger.warning(f"Pydantic core validation error on {request.url}: {exc}")
    
    error_details = []
    for error in exc.errors():
        field_name = " -> ".join(str(loc) for loc in error["loc"])
        error_details.append({
            "field": field_name,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "message": "Data validation error", 
            "data": error_details,
            "error_count": len(error_details)
        }
    )


async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle unexpected server errors"""
    logger.error(f"Internal server error on {request.url}: {exc}", exc_info=True)
    
    # Don't expose internal error details in production
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error", 
            "data": None,
            "error_type": type(exc).__name__
        }
    )


exception_handlers = [
    (HTTPException, http_exception_handler),
    (RequestValidationError, validation_exception_handler),
    (ValidationError, pydantic_validation_exception_handler),
    (PydanticCoreValidationError, pydantic_core_validation_exception_handler),
    (Exception, internal_server_error_handler)
]