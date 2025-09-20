"""
Multi-Agent API Endpoints for Bio-Design Innovation
Integrates LangGraph-based workflow and debate systems
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

from app.core.agents.multi_agent_system import MultiAgentDebateSystem
from app.core.workflow.biodesign_workflow import BiodesignWorkflowManager, WorkflowPhase
from app.models.innovation import InnovationRequest, InnovationResponse
from app.models.debate import MultiAgentDebateRequest
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

# Initialize systems
multi_agent_system = MultiAgentDebateSystem()
workflow_manager = BiodesignWorkflowManager()

@router.post("/debate/start", response_model=Dict[str, Any])
async def start_debate(request: MultiAgentDebateRequest):
    """
    Start a new multi-agent debate session
    
    **Parameters:**
    - **topic**: The debate topic or question
    - **phase**: Biodesign phase (identify, invent, implement)
    - **active_agents**: List of agent IDs to participate (optional)
    - **max_rounds**: Maximum number of debate rounds
    - **consensus_threshold**: Consensus threshold for completion (0.0-1.0)
    - **context_data**: Additional context for the debate
    
    **Returns:**
    Debate session information and results
    """
    
    try:
        session_id = f"debate_{uuid.uuid4().hex[:12]}"
        
        result = await multi_agent_system.start_debate(
            session_id=session_id,
            topic=request.topic,
            phase=request.phase,
            context_data=request.context_data or {},
            active_agents=request.active_agents,
            max_rounds=request.max_rounds,
            consensus_threshold=request.consensus_threshold
        )
        
        return {
            "success": True,
            "message": "Debate session completed successfully",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error starting debate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start debate: {str(e)}")

@router.get("/debate/{session_id}/status", response_model=Dict[str, Any])
async def get_debate_status(session_id: str):
    """
    Get current status of a debate session
    
    **Parameters:**
    - **session_id**: The debate session ID
    
    **Returns:**
    Current debate status and progress
    """
    
    try:
        status = await multi_agent_system.get_debate_status(session_id)
        
        return {
            "success": True,
            "data": status
        }
        
    except Exception as e:
        logger.error(f"Error getting debate status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get debate status: {str(e)}")

@router.post("/workflow/biodesign/start", response_model=Dict[str, Any])
async def start_biodesign_workflow(
    innovation_request: InnovationRequest,
    starting_phase: str = "identify"
):
    """
    Start a comprehensive Stanford Biodesign innovation workflow
    
    **Parameters:**
    - **innovation_request**: Innovation request with problem statement and context
    - **starting_phase**: Starting phase (identify, invent, implement)
    
    **Returns:**
    Workflow execution results and deliverables
    """
    
    try:
        # Validate starting phase
        if starting_phase not in ["identify", "invent", "implement"]:
            raise HTTPException(status_code=400, detail="Invalid starting phase")
        
        phase = WorkflowPhase(starting_phase)
        
        result = await workflow_manager.start_biodesign_workflow(
            innovation_request=innovation_request,
            starting_phase=phase
        )
        
        return {
            "success": True,
            "message": "Biodesign workflow completed successfully",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error starting biodesign workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start workflow: {str(e)}")

@router.get("/workflow/{workflow_id}/status", response_model=Dict[str, Any])
async def get_workflow_status(workflow_id: str):
    """
    Get current status of a biodesign workflow
    
    **Parameters:**
    - **workflow_id**: The workflow ID
    
    **Returns:**
    Current workflow status and progress
    """
    
    try:
        status = await workflow_manager.get_workflow_status(workflow_id)
        
        return {
            "success": True,
            "data": status
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")

@router.post("/agent/{agent_id}/analyze", response_model=Dict[str, Any])
async def agent_analysis(
    agent_id: str,
    analysis_request: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None
):
    """
    Request analysis from a specific agent
    
    **Parameters:**
    - **agent_id**: ID of the agent to use for analysis
    - **analysis_request**: Analysis request data
    - **context**: Additional context for the analysis
    
    **Returns:**
    Agent analysis results
    """
    
    try:
        # Get agent from multi-agent system
        if agent_id not in multi_agent_system.agents:
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
        
        agent = multi_agent_system.agents[agent_id]
        
        # Perform analysis
        result = await agent.analyze(analysis_request, context)
        
        return {
            "success": True,
            "agent_id": agent_id,
            "agent_name": agent.agent_name,
            "data": {
                "content": result.content,
                "confidence": result.confidence,
                "reasoning": result.reasoning,
                "sources": result.sources,
                "recommendations": result.recommendations,
                "concerns": result.concerns
            }
        }
        
    except Exception as e:
        logger.error(f"Error in agent analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent analysis failed: {str(e)}")

@router.get("/agents", response_model=Dict[str, Any])
async def list_agents():
    """
    List all available agents and their capabilities
    
    **Returns:**
    List of agents with their expertise areas
    """
    
    try:
        agents_info = []
        
        for agent_id, agent in multi_agent_system.agents.items():
            agents_info.append({
                "agent_id": agent_id,
                "agent_name": agent.agent_name,
                "expertise_areas": agent.expertise_areas,
                "description": f"Specialized in {', '.join(agent.expertise_areas[:3])}"
            })
        
        return {
            "success": True,
            "data": {
                "agents": agents_info,
                "total_agents": len(agents_info)
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")

@router.post("/consensus/evaluate", response_model=Dict[str, Any])
async def evaluate_consensus(
    arguments: List[Dict[str, Any]],
    threshold: float = 0.8
):
    """
    Evaluate consensus level among a set of arguments
    
    **Parameters:**
    - **arguments**: List of arguments/positions to evaluate
    - **threshold**: Consensus threshold (0.0-1.0)
    
    **Returns:**
    Consensus analysis and scores
    """
    
    try:
        # Use multi-agent system's consensus calculation
        consensus_scores = await multi_agent_system._calculate_consensus_scores(arguments)
        
        overall_consensus = consensus_scores.get("overall", 0.0)
        consensus_reached = overall_consensus >= threshold
        
        return {
            "success": True,
            "data": {
                "consensus_scores": consensus_scores,
                "overall_consensus": overall_consensus,
                "threshold": threshold,
                "consensus_reached": consensus_reached,
                "argument_count": len(arguments)
            }
        }
        
    except Exception as e:
        logger.error(f"Error evaluating consensus: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Consensus evaluation failed: {str(e)}")

@router.post("/synthesis/generate", response_model=Dict[str, Any])
async def generate_synthesis(
    arguments: List[Dict[str, Any]],
    synthesis_prompt: Optional[str] = None
):
    """
    Generate synthesis from multiple agent arguments
    
    **Parameters:**
    - **arguments**: List of arguments to synthesize
    - **synthesis_prompt**: Custom synthesis prompt (optional)
    
    **Returns:**
    Generated synthesis and recommendations
    """
    
    try:
        if not synthesis_prompt:
            synthesis_prompt = f"""
            Synthesize the following {len(arguments)} expert perspectives into a balanced analysis:
            
            Please provide:
            1. Key points of agreement
            2. Main areas of disagreement
            3. Synthesized recommendations
            4. Next steps and considerations
            """
        
        synthesis = await multi_agent_system._generate_synthesis(arguments, synthesis_prompt)
        recommendations = await multi_agent_system._extract_recommendations(arguments)
        
        return {
            "success": True,
            "data": {
                "synthesis": synthesis,
                "recommendations": recommendations,
                "argument_count": len(arguments),
                "synthesis_timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating synthesis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Synthesis generation failed: {str(e)}")

@router.post("/workflow/phase/{phase}/analyze", response_model=Dict[str, Any])
async def analyze_phase_specific(
    phase: str,
    analysis_data: Dict[str, Any],
    active_agents: Optional[List[str]] = None
):
    """
    Perform phase-specific analysis using relevant agents
    
    **Parameters:**
    - **phase**: Biodesign phase (identify, invent, implement)
    - **analysis_data**: Data to analyze
    - **active_agents**: Specific agents to use (optional)
    
    **Returns:**
    Phase-specific analysis results
    """
    
    try:
        # Validate phase
        if phase not in ["identify", "invent", "implement"]:
            raise HTTPException(status_code=400, detail="Invalid phase")
        
        # Determine phase-appropriate agents if not specified
        if not active_agents:
            phase_agents = {
                "identify": ["medical_expert", "patient_advocate", "business_analyst", "ethicist"],
                "invent": ["tech_engineer", "medical_expert", "business_analyst", "regulatory_agent"],
                "implement": ["business_analyst", "regulatory_agent", "tech_engineer", "patient_advocate"]
            }
            active_agents = phase_agents.get(phase, list(multi_agent_system.agents.keys()))
        
        # Filter to available agents
        available_agents = [agent_id for agent_id in active_agents if agent_id in multi_agent_system.agents]
        
        # Collect analyses from each agent
        agent_analyses = []
        for agent_id in available_agents:
            agent = multi_agent_system.agents[agent_id]
            try:
                result = await agent.analyze(analysis_data)
                agent_analyses.append({
                    "agent_id": agent_id,
                    "agent_name": agent.agent_name,
                    "analysis": result.content,
                    "confidence": result.confidence,
                    "recommendations": result.recommendations
                })
            except Exception as e:
                logger.warning(f"Agent {agent_id} analysis failed: {str(e)}")
        
        # Generate synthesis
        synthesis = await multi_agent_system._generate_synthesis(
            agent_analyses,
            f"Phase-specific analysis synthesis for {phase} phase"
        )
        
        return {
            "success": True,
            "data": {
                "phase": phase,
                "agent_analyses": agent_analyses,
                "synthesis": synthesis,
                "agents_used": available_agents
            }
        }
        
    except Exception as e:
        logger.error(f"Error in phase-specific analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Phase analysis failed: {str(e)}")

# Health check endpoint
@router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """
    Health check for multi-agent system
    
    **Returns:**
    System health status
    """
    
    try:
        agent_count = len(multi_agent_system.agents)
        agent_status = {
            agent_id: "healthy" for agent_id in multi_agent_system.agents.keys()
        }
        
        return {
            "success": True,
            "data": {
                "status": "healthy",
                "agents_available": agent_count,
                "agent_status": agent_status,
                "workflow_manager": "available",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "success": False,
            "data": {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
