"""
API router configuration
"""

from fastapi import APIRouter
from app.api.v1.endpoints import debate, agents, evaluation, health, websocket, innovation, multi_agent, multimodal



api_router = APIRouter()

# Include v1 API routes
api_router.include_router(health.router, prefix="/v1", tags=["health"])
api_router.include_router(debate.router, prefix="/v1/debate", tags=["debate"])
api_router.include_router(agents.router, prefix="/v1/agents", tags=["agents"])
api_router.include_router(evaluation.router, prefix="/v1/evaluation", tags=["evaluation"])
api_router.include_router(websocket.router, prefix="/v1/ws", tags=["websocket"])
api_router.include_router(innovation.router, prefix="/v1/innovation", tags=["innovation"])
api_router.include_router(multi_agent.router, prefix="/v1/multi-agent", tags=["multi-agent"])
api_router.include_router(multimodal.router, prefix="/v1/innovation", tags=["multimodal"])
