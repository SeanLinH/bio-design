"""
FastAPI dependencies for dependency injection
"""

from typing import Annotated
from fastapi import Depends

from app.services.debate_service import DebateService
from app.services.innovation_service import InnovationService
from app.services.rag_service import RAGService
from app.services.mermaid_service import MermaidService
from app.services.multimodal_service import MultimodalService
from app.config import settings

# Service instances (singletons for development)
_innovation_service_instance = None
_debate_service_instance = None
_rag_service_instance = None
_mermaid_service_instance = None
_multimodal_service_instance = None

def get_debate_service() -> DebateService:
    """Get debate service instance"""
    global _debate_service_instance
    if _debate_service_instance is None:
        _debate_service_instance = DebateService()
    return _debate_service_instance

def get_innovation_service() -> InnovationService:
    """Get innovation service instance"""
    global _innovation_service_instance
    if _innovation_service_instance is None:
        _innovation_service_instance = InnovationService()
    return _innovation_service_instance

def get_rag_service() -> RAGService:
    """Get RAG service instance"""
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = RAGService()
    return _rag_service_instance

def get_mermaid_service() -> MermaidService:
    """Get Mermaid service instance"""
    global _mermaid_service_instance
    if _mermaid_service_instance is None:
        _mermaid_service_instance = MermaidService()
    return _mermaid_service_instance

def get_multimodal_service() -> MultimodalService:
    """Get Multimodal service instance"""
    global _multimodal_service_instance
    if _multimodal_service_instance is None:
        _multimodal_service_instance = MultimodalService()
    return _multimodal_service_instance

# Type annotations for common dependencies  
def get_settings():
    """Get application settings"""
    return settings

DebateServiceDep = Annotated[DebateService, Depends(get_debate_service)]
InnovationServiceDep = Annotated[InnovationService, Depends(get_innovation_service)]
RAGServiceDep = Annotated[RAGService, Depends(get_rag_service)]
MermaidServiceDep = Annotated[MermaidService, Depends(get_mermaid_service)]
