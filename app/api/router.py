"""
API router configuration
"""

from fastapi import APIRouter
from app.api.v1.endpoints import debate, agents, evaluation, health, websocket, innovation

# Import multi-agent endpoints if available
try:
    from app.api.v1.endpoints import multi_agent
    MULTI_AGENT_AVAILABLE = True
except ImportError:
    MULTI_AGENT_AVAILABLE = False

api_router = APIRouter()

# Include v1 API routes
api_router.include_router(health.router, prefix="/v1", tags=["health"])
api_router.include_router(debate.router, prefix="/v1/debate", tags=["debate"])
api_router.include_router(agents.router, prefix="/v1/agents", tags=["agents"])
api_router.include_router(evaluation.router, prefix="/v1/evaluation", tags=["evaluation"])
api_router.include_router(websocket.router, prefix="/v1/ws", tags=["websocket"])
api_router.include_router(innovation.router, prefix="/v1/innovation", tags=["innovation"])

# Include multi-agent router if available
if MULTI_AGENT_AVAILABLE:
    api_router.include_router(multi_agent.router, tags=["multi-agent"])
