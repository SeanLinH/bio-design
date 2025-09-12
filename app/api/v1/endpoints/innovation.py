"""
Phase-specific endpoints for IDENTIFY, INVENT, IMPLEMENT workflows
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional, List, Dict, Any
from uuid import uuid4
from datetime import datetime
import json

from app.models.innovation import (
    InnovationSession, InnovationPhase, PhaseStatus, 
    StartPhaseRequest, PhaseProgressUpdate, NeedItem, 
    SolutionConcept, ImplementationPlan, MermaidDiagramRequest
)
from app.services.innovation_service import InnovationService
from app.services.rag_service import RAGService
from app.services.mermaid_service import MermaidService
from app.dependencies import get_innovation_service, get_rag_service, get_mermaid_service
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

# ================== Session Management ==================

@router.post("/sessions", response_model=InnovationSession)
async def create_innovation_session(
    title: str,
    description: Optional[str] = None,
    user_id: Optional[str] = None,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Create a new three-phase innovation session"""
    try:
        session_id = str(uuid4())
        session = await innovation_service.create_session(
            session_id=session_id,
            title=title,
            description=description,
            user_id=user_id
        )
        return session
    except Exception as e:
        logger.error(f"Error creating innovation session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/sessions/{session_id}", response_model=InnovationSession)
async def get_innovation_session(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get details of an innovation session"""
    try:
        session = await innovation_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve session: {str(e)}")

@router.get("/sessions", response_model=List[InnovationSession])
async def list_innovation_sessions(
    user_id: Optional[str] = None,
    limit: int = 50,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """List innovation sessions for a user or all sessions"""
    try:
        sessions = await innovation_service.list_sessions(user_id=user_id, limit=limit)
        return sessions
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")

# ================== IDENTIFY Phase Endpoints ==================

@router.post("/sessions/{session_id}/identify/start")
async def start_identify_phase(
    session_id: str,
    request: StartPhaseRequest,
    background_tasks: BackgroundTasks,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Start the IDENTIFY phase - Problem definition & need discovery"""
    try:
        # Validate session exists and is in correct state
        session = await innovation_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.current_phase != InnovationPhase.IDENTIFY:
            raise HTTPException(
                status_code=400, 
                detail=f"Session is in {session.current_phase} phase, cannot start IDENTIFY"
            )
        
        # Start IDENTIFY phase in background
        background_tasks.add_task(
            innovation_service.execute_identify_phase,
            session_id,
            request.context_data,
            request.uploaded_documents
        )
        
        return JSONResponse({
            "message": "IDENTIFY phase started",
            "session_id": session_id,
            "phase": "identify",
            "status": "processing",
            "estimated_duration": "15-20 minutes"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting IDENTIFY phase for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start IDENTIFY phase: {str(e)}")

@router.get("/sessions/{session_id}/identify/progress")
async def get_identify_progress(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get progress of IDENTIFY phase"""
    try:
        progress = await innovation_service.get_phase_progress(session_id, InnovationPhase.IDENTIFY)
        return progress
    except Exception as e:
        logger.error(f"Error getting IDENTIFY progress for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")

@router.get("/sessions/{session_id}/identify/results", response_model=List[NeedItem])
async def get_identify_results(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get results from IDENTIFY phase - identified needs"""
    try:
        results = await innovation_service.get_identify_results(session_id)
        return results
    except Exception as e:
        logger.error(f"Error getting IDENTIFY results for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

@router.post("/sessions/{session_id}/identify/upload-documents")
async def upload_documents_for_identify(
    session_id: str,
    files: List[UploadFile] = File(...),
    rag_service: RAGService = Depends(get_rag_service)
):
    """Upload documents to enhance IDENTIFY phase analysis"""
    try:
        uploaded_docs = []
        for file in files:
            doc_response = await rag_service.upload_document(
                file=file,
                session_id=session_id,
                phase=InnovationPhase.IDENTIFY
            )
            uploaded_docs.append(doc_response)
        
        return JSONResponse({
            "message": f"Uploaded {len(uploaded_docs)} documents",
            "documents": uploaded_docs,
            "session_id": session_id
        })
        
    except Exception as e:
        logger.error(f"Error uploading documents for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload documents: {str(e)}")

# ================== INVENT Phase Endpoints ==================

@router.post("/sessions/{session_id}/invent/start")
async def start_invent_phase(
    session_id: str,
    request: StartPhaseRequest,
    background_tasks: BackgroundTasks,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Start the INVENT phase - Solution ideation & development"""
    try:
        # Validate session exists and IDENTIFY phase is complete
        session = await innovation_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.current_phase != InnovationPhase.INVENT:
            raise HTTPException(
                status_code=400,
                detail=f"Session is in {session.current_phase} phase, cannot start INVENT"
            )
        
        # Check if IDENTIFY phase is complete
        identify_results = session.phase_results.get("identify")
        if not identify_results or identify_results.status != PhaseStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail="IDENTIFY phase must be completed before starting INVENT"
            )
        
        # Start INVENT phase in background
        background_tasks.add_task(
            innovation_service.execute_invent_phase,
            session_id,
            request.context_data,
            request.uploaded_documents
        )
        
        return JSONResponse({
            "message": "INVENT phase started",
            "session_id": session_id,
            "phase": "invent",
            "status": "processing",
            "estimated_duration": "20-25 minutes"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting INVENT phase for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start INVENT phase: {str(e)}")

@router.get("/sessions/{session_id}/invent/progress")
async def get_invent_progress(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get progress of INVENT phase"""
    try:
        progress = await innovation_service.get_phase_progress(session_id, InnovationPhase.INVENT)
        return progress
    except Exception as e:
        logger.error(f"Error getting INVENT progress for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")

@router.get("/sessions/{session_id}/invent/results", response_model=List[SolutionConcept])
async def get_invent_results(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get results from INVENT phase - solution concepts"""
    try:
        results = await innovation_service.get_invent_results(session_id)
        return results
    except Exception as e:
        logger.error(f"Error getting INVENT results for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

# ================== IMPLEMENT Phase Endpoints ==================

@router.post("/sessions/{session_id}/implement/start")
async def start_implement_phase(
    session_id: str,
    request: StartPhaseRequest,
    background_tasks: BackgroundTasks,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Start the IMPLEMENT phase - Business strategy & go-to-market"""
    try:
        # Validate session exists and INVENT phase is complete
        session = await innovation_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.current_phase != InnovationPhase.IMPLEMENT:
            raise HTTPException(
                status_code=400,
                detail=f"Session is in {session.current_phase} phase, cannot start IMPLEMENT"
            )
        
        # Check if INVENT phase is complete
        invent_results = session.phase_results.get("invent")
        if not invent_results or invent_results.status != PhaseStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail="INVENT phase must be completed before starting IMPLEMENT"
            )
        
        # Start IMPLEMENT phase in background
        background_tasks.add_task(
            innovation_service.execute_implement_phase,
            session_id,
            request.context_data,
            request.uploaded_documents
        )
        
        return JSONResponse({
            "message": "IMPLEMENT phase started",
            "session_id": session_id,
            "phase": "implement",
            "status": "processing",
            "estimated_duration": "25-30 minutes"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting IMPLEMENT phase for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start IMPLEMENT phase: {str(e)}")

@router.get("/sessions/{session_id}/implement/progress")
async def get_implement_progress(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get progress of IMPLEMENT phase"""
    try:
        progress = await innovation_service.get_phase_progress(session_id, InnovationPhase.IMPLEMENT)
        return progress
    except Exception as e:
        logger.error(f"Error getting IMPLEMENT progress for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")

@router.get("/sessions/{session_id}/implement/results", response_model=List[ImplementationPlan])
async def get_implement_results(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Get results from IMPLEMENT phase - implementation plans"""
    try:
        results = await innovation_service.get_implement_results(session_id)
        return results
    except Exception as e:
        logger.error(f"Error getting IMPLEMENT results for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

# ================== Phase Transition Endpoints ==================

@router.post("/sessions/{session_id}/transition/{target_phase}")
async def transition_to_phase(
    session_id: str,
    target_phase: InnovationPhase,
    force: bool = False,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Transition session to the next phase"""
    try:
        success = await innovation_service.transition_phase(
            session_id=session_id,
            target_phase=target_phase,
            force=force
        )
        
        if success:
            return JSONResponse({
                "message": f"Successfully transitioned to {target_phase} phase",
                "session_id": session_id,
                "new_phase": target_phase
            })
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "message": f"Cannot transition to {target_phase} phase",
                    "reason": "Transition criteria not met"
                }
            )
    except Exception as e:
        logger.error(f"Error transitioning session {session_id} to {target_phase}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to transition phase: {str(e)}")

@router.get("/sessions/{session_id}/transition-readiness/{target_phase}")
async def check_transition_readiness(
    session_id: str,
    target_phase: InnovationPhase,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Check if session is ready to transition to target phase"""
    try:
        readiness = await innovation_service.check_transition_readiness(session_id, target_phase)
        return readiness
    except Exception as e:
        logger.error(f"Error checking transition readiness for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to check readiness: {str(e)}")

# ================== Visualization Endpoints ==================

@router.get("/diagrams/types")
async def get_available_diagram_types(
    mermaid_service: MermaidService = Depends(get_mermaid_service)
):
    """Get available diagram types"""
    try:
        diagram_types = await mermaid_service.get_available_diagram_types()
        return diagram_types
    except Exception as e:
        logger.error(f"Error getting diagram types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get diagram types: {str(e)}")

@router.post("/sessions/{session_id}/diagrams/generate")
async def generate_phase_diagram(
    session_id: str,
    request: MermaidDiagramRequest,
    mermaid_service: MermaidService = Depends(get_mermaid_service)
):
    """Generate Mermaid diagram for session data"""
    try:
        diagram = await mermaid_service.generate_diagram(
            session_id=session_id,
            diagram_type=request.diagram_type,
            phase=request.phase,
            data_source=request.data_source,
            customization=request.customization
        )
        return diagram
    except Exception as e:
        logger.error(f"Error generating diagram for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate diagram: {str(e)}")

# ================== Real-time Updates ==================

@router.get("/sessions/{session_id}/stream")
async def stream_session_updates(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Stream real-time updates for a session"""
    try:
        return StreamingResponse(
            innovation_service.stream_session_updates(session_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        logger.error(f"Error streaming updates for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stream updates: {str(e)}")

# ================== Export and Reporting ==================

@router.get("/sessions/{session_id}/export/{format}")
async def export_session_report(
    session_id: str,
    format: str,  # pdf, docx, json
    include_diagrams: bool = True,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Export comprehensive session report"""
    try:
        if format not in ["pdf", "docx", "json"]:
            raise HTTPException(status_code=400, detail="Format must be pdf, docx, or json")
        
        report_data = await innovation_service.export_session_report(
            session_id=session_id,
            format=format,
            include_diagrams=include_diagrams
        )
        
        # Return appropriate response based on format
        if format == "json":
            return JSONResponse(report_data)
        else:
            # For PDF/DOCX, return file download
            return StreamingResponse(
                report_data["content"],
                media_type=report_data["media_type"],
                headers={"Content-Disposition": f"attachment; filename={report_data['filename']}"}
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export session: {str(e)}")

# ================== Administrative Endpoints ==================

@router.delete("/sessions/{session_id}")
async def delete_innovation_session(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Delete an innovation session"""
    try:
        success = await innovation_service.delete_session(session_id)
        if success:
            return JSONResponse({"message": f"Session {session_id} deleted successfully"})
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@router.post("/sessions/{session_id}/pause")
async def pause_session(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Pause an active session"""
    try:
        success = await innovation_service.pause_session(session_id)
        if success:
            return JSONResponse({"message": f"Session {session_id} paused"})
        else:
            raise HTTPException(status_code=400, detail="Cannot pause session")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error pausing session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to pause session: {str(e)}")

@router.post("/sessions/{session_id}/resume")
async def resume_session(
    session_id: str,
    innovation_service: InnovationService = Depends(get_innovation_service)
):
    """Resume a paused session"""
    try:
        success = await innovation_service.resume_session(session_id)
        if success:
            return JSONResponse({"message": f"Session {session_id} resumed"})
        else:
            raise HTTPException(status_code=400, detail="Cannot resume session")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resuming session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to resume session: {str(e)}")
