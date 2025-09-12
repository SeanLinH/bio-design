"""
FastAPI application main entry point for the Advanced Multi-Agent Debate System
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.config import settings
from app.api.router import api_router
from app.middleware.cors import setup_cors
from app.middleware.logging import setup_logging
from app.utils.logging import get_logger

logger = get_logger(__name__)

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    app = FastAPI(
        title="Advanced Multi-Agent Debate System",
        description="AI-powered multi-agent debate system for biodesign innovation",
        version="2.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    )
    
    # Setup middleware
    setup_cors(app)
    setup_logging(app)
    
    # Include routers
    app.include_router(api_router, prefix="/api")
    
    @app.get("/", response_class=JSONResponse)
    async def root():
        """Root endpoint"""
        return {
            "message": "Advanced Multi-Agent Debate System API",
            "version": "2.0.0",
            "status": "operational"
        }
    
    @app.get("/health", response_class=JSONResponse)
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "timestamp": "2025-09-11T00:00:00Z"
        }
    
    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
