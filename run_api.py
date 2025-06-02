"""
FastAPI Application for Medical Reflection System

This API provides endpoints to:
1. POST /api/reflection - Submit query to run MedicalReflectionSystem
2. GET /api/reflection/{session_id} - Get reflection results
3. GET /api/evaluation/{session_id} - Get needs evaluation results  
4. GET /api/prioritization/{session_id} - Get needs prioritization results
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
import asyncio
from datetime import datetime
from loguru import logger
import sys
import json
import time

# Configure loguru logger
logger.remove()  # Remove default handler
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/api.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="DEBUG",
    rotation="10 MB",
    retention="7 days",
    compression="zip"
)

# Import your existing modules
from src.agents.need_finder import MedicalReflectionSystem, run_reflection_sync
from src.agents.need_finder_fixed import MedicalReflectionSystemWithRealtime, run_reflection_sync_realtime
from src.agents.evaluator import NeedEvaluator

def evaluate_needs_list(needs_list):
    """Helper function to evaluate needs list using NeedEvaluator"""
    evaluator = NeedEvaluator()
    return evaluator.evaluate_needs(needs_list)

# Global storage for sessions (in production, use a database)
sessions: Dict[str, Dict[str, Any]] = {}
session_streams: Dict[str, List[Dict[str, Any]]] = {}  # Store stream events

app = FastAPI(
    title="Medical Reflection System API",
    description="API for medical needs analysis and evaluation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models for request/response
class ReflectionRequest(BaseModel):
    query: str = Field(..., description="The medical query to analyze")
    max_rounds: int = Field(default=3, description="Maximum discussion rounds", ge=1, le=10)

class ReflectionResponse(BaseModel):
    session_id: str
    status: str
    message: str

class ReflectionResult(BaseModel):
    session_id: str
    status: str
    original_query: str
    discussion_rounds: int
    medical_insights: List[str]
    engineering_insights: List[str]
    parsed_needs: Dict[str, Any]
    final_summary: str
    full_conversation: List[str]
    created_at: datetime
    completed_at: Optional[datetime] = None

class EvaluationResult(BaseModel):
    session_id: str
    status: str
    evaluations: List[Dict[str, Any]]
    summary: str
    top_priority_needs: List[str]
    created_at: datetime

class PrioritizationResult(BaseModel):
    session_id: str
    status: str
    prioritized_needs: List[Dict[str, Any]]
    ranking_criteria: Dict[str, str]
    recommendations: List[str]
    created_at: datetime

def process_reflection(session_id: str, query: str, max_rounds: int):
    """Background task to process reflection"""
    logger.info(f"Starting reflection processing for session {session_id} with query: '{query[:100]}{'...' if len(query) > 100 else ''}'")
    
    try:
        # Update session status
        sessions[session_id]["status"] = "processing"
        logger.debug(f"Updated session {session_id} status to 'processing'")
        
        # Run the reflection system
        logger.info(f"Running reflection system for session {session_id} with max_rounds={max_rounds}")
        result = run_reflection_sync(query, max_rounds)
        logger.success(f"Reflection completed successfully for session {session_id}")
        
        # Store the result
        sessions[session_id].update({
            "status": "completed",
            "result": result,
            "completed_at": datetime.now()
        })
        logger.debug(f"Stored reflection result for session {session_id}")
        
        # Run evaluation automatically after reflection completes
        if result.get('parsed_needs', {}).get('needs'):
            logger.info(f"Starting automatic evaluation for session {session_id}")
            try:
                evaluator = NeedEvaluator()
                evaluation_result = evaluator.evaluate_needs(result['parsed_needs']['needs'])
                
                sessions[session_id]["evaluation"] = {
                    "status": "completed",
                    "result": evaluation_result.model_dump(),
                    "created_at": datetime.now()
                }
                logger.success(f"Evaluation completed for session {session_id}")
                
                # Create prioritization based on evaluation
                logger.info(f"Starting prioritization for session {session_id}")
                prioritization = create_prioritization(evaluation_result)
                sessions[session_id]["prioritization"] = {
                    "status": "completed", 
                    "result": prioritization,
                    "created_at": datetime.now()
                }
                logger.success(f"Prioritization completed for session {session_id}")
                
            except Exception as e:
                logger.error(f"Evaluation/prioritization failed for session {session_id}: {str(e)}")
                sessions[session_id]["evaluation"] = {
                    "status": "error",
                    "error": str(e),
                    "created_at": datetime.now()
                }
                sessions[session_id]["prioritization"] = {
                    "status": "error",
                    "error": str(e),
                    "created_at": datetime.now()
                }
        else:
            logger.warning(f"No parsed needs found for session {session_id}, skipping evaluation")
        
    except Exception as e:
        logger.error(f"Reflection processing failed for session {session_id}: {str(e)}")
        sessions[session_id].update({
            "status": "error",
            "error": str(e),
            "completed_at": datetime.now()
        })

def create_prioritization(evaluation_result) -> Dict[str, Any]:
    """Create prioritization results from evaluation"""
    logger.debug(f"Creating prioritization from {len(evaluation_result.evaluations)} evaluations")
    
    evaluations = evaluation_result.evaluations
    
    # Sort by overall score
    sorted_needs = sorted(evaluations, key=lambda x: x.overall_score, reverse=True)
    logger.debug(f"Sorted needs by overall score, top score: {sorted_needs[0].overall_score if sorted_needs else 'N/A'}")
    
    prioritized_needs = []
    for i, need_eval in enumerate(sorted_needs, 1):
        prioritized_needs.append({
            "rank": i,
            "need_title": need_eval.need_title,
            "overall_score": need_eval.overall_score,
            "feasibility_score": need_eval.feasibility_score,
            "impact_score": need_eval.impact_score,
            "innovation_score": need_eval.innovation_score,
            "resource_score": need_eval.resource_score,
            "priority_level": "High" if i <= 2 else "Medium" if i <= 4 else "Low"
        })
    
    ranking_criteria = {
        "primary": "Overall Score (weighted combination of all factors)",
        "feasibility": "Technical implementation possibility (0-10)",
        "impact": "Potential impact on medical system (0-10)", 
        "innovation": "Innovation level and differentiation (0-10)",
        "resource": "Resource efficiency (10 = low resource requirement)"
    }
    
    recommendations = []
    if len(prioritized_needs) > 0:
        top_need = prioritized_needs[0]
        recommendations.append(f"Prioritize '{top_need['need_title']}' as it has the highest overall score of {top_need['overall_score']}")
    
    if len(prioritized_needs) > 1:
        recommendations.append("Focus on top 3 ranked needs for maximum impact")
        
    recommendations.append("Consider resource constraints when selecting implementation order")
    recommendations.append("Regularly reassess priorities based on changing requirements")
    
    logger.debug(f"Generated {len(prioritized_needs)} prioritized needs with {len(recommendations)} recommendations")
    
    return {
        "prioritized_needs": prioritized_needs,
        "ranking_criteria": ranking_criteria,
        "recommendations": recommendations
    }

# Status callback function for real-time updates
def create_status_callback(session_id: str):
    """Create a status callback function for a specific session"""
    def status_callback(event_type: str, agent: str, data: Dict[str, Any]):
        timestamp = datetime.now().isoformat()
        event = {
            "timestamp": timestamp,
            "event_type": event_type,
            "agent": agent,
            "data": data
        }
        
        # Store event in session streams
        if session_id not in session_streams:
            session_streams[session_id] = []
        session_streams[session_id].append(event)
        
        logger.debug(f"Session {session_id}: {event_type} from {agent}")
    
    return status_callback

def process_reflection_realtime(session_id: str, query: str, max_rounds: int):
    """Background task to process reflection with real-time updates"""
    logger.info(f"Starting real-time reflection processing for session {session_id}")
    
    try:
        # Update session status
        sessions[session_id]["status"] = "processing"
        
        # Create status callback
        status_callback = create_status_callback(session_id)
        
        # Run the reflection system with real-time updates
        result = run_reflection_sync_realtime(query, max_rounds, status_callback)
        
        # Store the result
        sessions[session_id].update({
            "status": "completed",
            "result": result,
            "completed_at": datetime.now()
        })
        
        # Run evaluation automatically after reflection completes
        if result.get('parsed_needs', {}).get('needs'):
            try:
                evaluator = NeedEvaluator()
                evaluation_result = evaluator.evaluate_needs(result['parsed_needs']['needs'])
                
                sessions[session_id]["evaluation"] = {
                    "status": "completed",
                    "result": evaluation_result.model_dump(),
                    "created_at": datetime.now()
                }
                
                # Create prioritization based on evaluation
                prioritization = create_prioritization(evaluation_result)
                sessions[session_id]["prioritization"] = {
                    "status": "completed", 
                    "result": prioritization,
                    "created_at": datetime.now()
                }
                
            except Exception as e:
                logger.error(f"Evaluation/prioritization failed for session {session_id}: {str(e)}")
                sessions[session_id]["evaluation"] = {
                    "status": "error",
                    "error": str(e),
                    "created_at": datetime.now()
                }
        
    except Exception as e:
        logger.error(f"Real-time reflection processing failed for session {session_id}: {str(e)}")
        sessions[session_id].update({
            "status": "error",
            "error": str(e),
            "completed_at": datetime.now()
        })

@app.get("/")
async def root():
    """Serve the main HTML interface"""
    logger.info("Serving main HTML interface")
    return FileResponse('static/index.html')

@app.get("/api")
async def api_info():
    """API information endpoint"""
    logger.info("API info requested")
    return {
        "message": "Medical Reflection System API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/reflection": "Submit query for medical reflection analysis",
            "GET /api/reflection/{session_id}": "Get reflection results",
            "GET /api/evaluation/{session_id}": "Get needs evaluation results",
            "GET /api/prioritization/{session_id}": "Get needs prioritization results",
            "GET /health": "Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.debug("Health check requested")
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/reflection", response_model=ReflectionResponse)
async def submit_reflection_query(request: ReflectionRequest, background_tasks: BackgroundTasks):
    """
    Submit a medical query for reflection analysis.
    This will run the MedicalReflectionSystem in the background.
    """
    session_id = str(uuid.uuid4())
    logger.info(f"New reflection request submitted - Session ID: {session_id}, Query length: {len(request.query)}, Max rounds: {request.max_rounds}")
    
    # Initialize session
    sessions[session_id] = {
        "status": "queued",
        "query": request.query,
        "max_rounds": request.max_rounds,
        "created_at": datetime.now()
    }
    logger.debug(f"Initialized session {session_id}")
    
    # Add background task
    background_tasks.add_task(process_reflection, session_id, request.query, request.max_rounds)
    logger.info(f"Background task queued for session {session_id}")
    
    return ReflectionResponse(
        session_id=session_id,
        status="queued",
        message="Reflection analysis has been queued for processing"
    )

@app.post("/api/reflection-realtime", response_model=ReflectionResponse)
async def submit_reflection_query_realtime(request: ReflectionRequest, background_tasks: BackgroundTasks):
    """
    Submit a medical query for reflection analysis with real-time updates.
    Use the /api/reflection-stream/{session_id} endpoint to get real-time updates.
    """
    session_id = str(uuid.uuid4())
    logger.info(f"New real-time reflection request - Session ID: {session_id}")
    
    # Initialize session
    sessions[session_id] = {
        "status": "queued",
        "query": request.query,
        "max_rounds": request.max_rounds,
        "created_at": datetime.now()
    }
    
    # Initialize stream storage
    session_streams[session_id] = []
    
    # Add background task for real-time processing
    background_tasks.add_task(process_reflection_realtime, session_id, request.query, request.max_rounds)
    
    logger.info(f"Real-time reflection processing queued for session {session_id}")
    return ReflectionResponse(
        session_id=session_id,
        status="queued",
        message="Real-time reflection analysis queued successfully. Use /api/reflection-stream/{session_id} for real-time updates."
    )

@app.get("/api/reflection/{session_id}", response_model=ReflectionResult)
async def get_reflection_result(session_id: str):
    """Get the reflection analysis results for a session"""
    logger.info(f"Reflection result requested for session {session_id}")
    
    if session_id not in sessions:
        logger.warning(f"Session {session_id} not found")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    if session["status"] == "error":
        logger.error(f"Session {session_id} has error status: {session.get('error')}")
        raise HTTPException(status_code=500, detail=f"Reflection failed: {session.get('error')}")
    
    if session["status"] != "completed":
        logger.debug(f"Session {session_id} status: {session['status']} - returning partial result")
        return ReflectionResult(
            session_id=session_id,
            status=session["status"],
            original_query=session["query"],
            discussion_rounds=0,
            medical_insights=[],
            engineering_insights=[],
            parsed_needs={},
            final_summary="",
            full_conversation=[],
            created_at=session["created_at"]
        )
    
    logger.success(f"Returning completed reflection result for session {session_id}")
    result = session["result"]
    return ReflectionResult(
        session_id=session_id,
        status="completed",
        original_query=result["original_query"],
        discussion_rounds=result["discussion_rounds"],
        medical_insights=result["medical_insights"],
        engineering_insights=result["engineering_insights"],
        parsed_needs=result["parsed_needs"],
        final_summary=result["final_summary"],
        full_conversation=result["full_conversation"],
        created_at=session["created_at"],
        completed_at=session.get("completed_at")
    )

@app.get("/api/evaluation/{session_id}", response_model=EvaluationResult)
async def get_evaluation_result(session_id: str):
    """Get the needs evaluation results for a session"""
    logger.info(f"Evaluation result requested for session {session_id}")
    
    if session_id not in sessions:
        logger.warning(f"Session {session_id} not found for evaluation")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    if "evaluation" not in session:
        logger.warning(f"No evaluation available for session {session_id}")
        raise HTTPException(status_code=404, detail="Evaluation not available. Reflection must complete first.")
    
    evaluation = session["evaluation"]
    
    if evaluation["status"] == "error":
        logger.error(f"Evaluation error for session {session_id}: {evaluation.get('error')}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {evaluation.get('error')}")
    
    if evaluation["status"] != "completed":
        logger.debug(f"Evaluation still processing for session {session_id}")
        raise HTTPException(status_code=202, detail="Evaluation is still processing")
    
    logger.success(f"Returning evaluation result for session {session_id}")
    result = evaluation["result"]
    return EvaluationResult(
        session_id=session_id,
        status="completed",
        evaluations=[eval_item for eval_item in result["evaluations"]],
        summary=result["summary"],
        top_priority_needs=result["top_priority_needs"],
        created_at=evaluation["created_at"]
    )

@app.get("/api/prioritization/{session_id}", response_model=PrioritizationResult)
async def get_prioritization_result(session_id: str):
    """Get the needs prioritization results for a session"""
    logger.info(f"Prioritization result requested for session {session_id}")
    
    if session_id not in sessions:
        logger.warning(f"Session {session_id} not found for prioritization")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    if "prioritization" not in session:
        logger.warning(f"No prioritization available for session {session_id}")
        raise HTTPException(status_code=404, detail="Prioritization not available. Evaluation must complete first.")
    
    prioritization = session["prioritization"]
    
    if prioritization["status"] == "error":
        logger.error(f"Prioritization error for session {session_id}: {prioritization.get('error')}")
        raise HTTPException(status_code=500, detail=f"Prioritization failed: {prioritization.get('error')}")
    
    if prioritization["status"] != "completed":
        logger.debug(f"Prioritization still processing for session {session_id}")
        raise HTTPException(status_code=202, detail="Prioritization is still processing")
    
    logger.success(f"Returning prioritization result for session {session_id}")
    result = prioritization["result"]
    return PrioritizationResult(
        session_id=session_id,
        status="completed",
        prioritized_needs=result["prioritized_needs"],
        ranking_criteria=result["ranking_criteria"],
        recommendations=result["recommendations"],
        created_at=prioritization["created_at"]
    )

@app.get("/api/sessions")
async def list_sessions():
    """List all active sessions (for debugging/monitoring)"""
    logger.info(f"Sessions list requested - Total sessions: {len(sessions)}")
    session_summaries = {}
    for session_id, session_data in sessions.items():
        session_summaries[session_id] = {
            "status": session_data["status"],
            "query": session_data["query"][:100] + "..." if len(session_data["query"]) > 100 else session_data["query"],
            "created_at": session_data["created_at"],
            "has_evaluation": "evaluation" in session_data,
            "has_prioritization": "prioritization" in session_data
        }
    logger.debug(f"Returning summary for {len(session_summaries)} sessions")
    return session_summaries

@app.get("/api/reflection-stream/{session_id}")
async def stream_reflection_updates(session_id: str):
    """
    Stream real-time updates for a reflection session using Server-Sent Events (SSE).
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    def generate_events():
        last_event_index = 0
        
        while True:
            # Check if session is still active
            session = sessions.get(session_id)
            if not session:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Session not found'})}\n\n"
                break
            
            # Get new events
            events = session_streams.get(session_id, [])
            new_events = events[last_event_index:]
            
            # Send new events
            for event in new_events:
                yield f"data: {json.dumps(event)}\n\n"
                last_event_index += 1
            
            # Check if session is completed or errored
            if session.get("status") in ["completed", "error"]:
                final_event = {
                    "timestamp": datetime.now().isoformat(),
                    "event_type": "session_completed",
                    "agent": "system",
                    "data": {
                        "status": session.get("status"),
                        "message": "Session completed" if session.get("status") == "completed" else f"Session failed: {session.get('error', 'Unknown error')}"
                    }
                }
                yield f"data: {json.dumps(final_event)}\n\n"
                break
            
            # Wait before checking for new events
            time.sleep(1)
    
    return StreamingResponse(
        generate_events(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Medical Reflection System API server")
    uvicorn.run("run_api:app", host="0.0.0.0", port=8000, reload=True)
