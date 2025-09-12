"""
FastAPI dependencies for dependency injection
"""

from typing import Annotated
from fastapi import Depends

from app.services.debate_service import DebateService
from app.services.innovation_service import InnovationService
from app.services.rag_service import RAGService
from app.services.mermaid_service import MermaidService
from app.config import settings

def get_debate_service() -> DebateService:
    """Get debate service instance"""
    return DebateService()

def get_innovation_service() -> InnovationService:
    """Get innovation service instance"""
    return InnovationService()

def get_rag_service() -> RAGService:
    """Get RAG service instance"""
    return RAGService()

def get_mermaid_service() -> MermaidService:
    """Get Mermaid service instance"""
    return MermaidService()

# Type annotations for common dependencies  
def get_settings():
    """Get application settings"""
    return settings

DebateServiceDep = Annotated[DebateService, Depends(get_debate_service)]
InnovationServiceDep = Annotated[InnovationService, Depends(get_innovation_service)]
RAGServiceDep = Annotated[RAGService, Depends(get_rag_service)]
MermaidServiceDep = Annotated[MermaidService, Depends(get_mermaid_service)]
