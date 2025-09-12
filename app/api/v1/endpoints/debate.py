"""
Debate management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
from uuid import uuid4
from datetime import datetime

from app.models.debate import DebateRequest, DebateResponse, DebateStatus
from app.services.debate_service import DebateService
from app.dependencies import get_debate_service
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/start", response_model=DebateResponse)
async def start_debate(
    request: DebateRequest,
    background_tasks: BackgroundTasks,
    debate_service: DebateService = Depends(get_debate_service)
):
    """Start a new multi-agent debate session"""
    try:
        session_id = str(uuid4())
        
        # Start the debate process in background
        background_tasks.add_task(
            debate_service.start_debate,
            session_id=session_id,
            topic=request.topic,
            agents=request.agents,
            config=request.config
        )
        
        return DebateResponse(
            session_id=session_id,
            status=DebateStatus.STARTING,
            message="Debate session started successfully",
            created_at=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Failed to start debate: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start debate session")

@router.get("/{session_id}/status", response_model=DebateStatus)
async def get_debate_status(
    session_id: str,
    debate_service: DebateService = Depends(get_debate_service)
):
    """Get the current status of a debate session"""
    try:
        status = await debate_service.get_debate_status(session_id)
        if not status:
            raise HTTPException(status_code=404, detail="Debate session not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get debate status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve debate status")

@router.get("/{session_id}/arguments")
async def get_debate_arguments(
    session_id: str,
    round_number: Optional[int] = None,
    agent_id: Optional[str] = None,
    debate_service: DebateService = Depends(get_debate_service)
):
    """Get arguments from a debate session"""
    try:
        arguments = await debate_service.get_debate_arguments(
            session_id=session_id,
            round_number=round_number,
            agent_id=agent_id
        )
        if not arguments and round_number:
            raise HTTPException(status_code=404, detail="No arguments found for specified criteria")
        return {"session_id": session_id, "arguments": arguments}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get debate arguments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve debate arguments")

@router.get("/{session_id}/consensus")
async def get_consensus_level(
    session_id: str,
    debate_service: DebateService = Depends(get_debate_service)
):
    """Get the current consensus level of a debate"""
    try:
        consensus = await debate_service.get_consensus_level(session_id)
        if consensus is None:
            raise HTTPException(status_code=404, detail="Debate session not found")
        return {
            "session_id": session_id,
            "consensus_level": consensus.level,
            "consensus_areas": consensus.areas,
            "remaining_disputes": consensus.disputes
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get consensus level: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve consensus information")

@router.post("/{session_id}/stop")
async def stop_debate(
    session_id: str,
    debate_service: DebateService = Depends(get_debate_service)
):
    """Stop a running debate session"""
    try:
        success = await debate_service.stop_debate(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Debate session not found or already stopped")
        return {"session_id": session_id, "status": "stopped", "message": "Debate session stopped successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop debate: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stop debate session")

@router.get("/{session_id}/export")
async def export_debate(
    session_id: str,
    format: str = "json",
    debate_service: DebateService = Depends(get_debate_service)
):
    """Export complete debate results"""
    try:
        export_data = await debate_service.export_debate_results(session_id, format)
        if not export_data:
            raise HTTPException(status_code=404, detail="Debate session not found")
        
        return {
            "session_id": session_id,
            "format": format,
            "data": export_data,
            "exported_at": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to export debate: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export debate results")
