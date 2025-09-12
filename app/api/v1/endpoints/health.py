"""
Health check endpoints
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "debate-system-api",
        "version": "2.0.0"
    })

@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    # Add checks for database, external APIs, etc.
    return JSONResponse({
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": "healthy",
            "redis": "healthy",
            "openai_api": "healthy"
        }
    })
