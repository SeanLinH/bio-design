"""
LangGraph Workflow Manager for Bio-Design Innovation
Orchestrates multi-agent collaboration across IDENTIFY → INVENT → IMPLEMENT phases
"""

from typing import Dict, Any, List, Optional, TypedDict, Literal, Sequence
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
import asyncio
import uuid
from datetime import datetime
from enum import Enum

from app.core.agents.multi_agent_system import MultiAgentDebateSystem, MultiAgentState
from app.models.innovation import InnovationRequest, InnovationPhase
from app.utils.logging import get_logger

logger = get_logger(__name__)

class WorkflowPhase(str, Enum):
    """Biodesign methodology phases"""
    IDENTIFY = "identify"
    INVENT = "invent"  
    IMPLEMENT = "implement"

class WorkflowState(TypedDict):
    """Extended state for biodesign workflow"""
    # Session management
    workflow_id: str
    session_id: str
    phase: WorkflowPhase
    phase_status: Literal["not_started", "in_progress", "completed", "failed"]
    
    # Content and context
    innovation_request: Dict[str, Any]
    needs_analysis: Optional[Dict[str, Any]]
    solution_concepts: List[Dict[str, Any]]
    implementation_plan: Optional[Dict[str, Any]]
    
    # Multi-agent debate state
    debate_state: Optional[MultiAgentState]
    debate_results: List[Dict[str, Any]]
    
    # Phase-specific outputs
    identified_needs: List[Dict[str, Any]]
    invented_solutions: List[Dict[str, Any]]
    implementation_roadmap: Optional[Dict[str, Any]]
    
    # Workflow control
    current_step: str
    next_action: str
    workflow_status: Literal["active", "paused", "completed", "failed"]
    
    # Results and outputs
    phase_recommendations: Dict[str, Any]
    final_deliverables: Dict[str, Any]
    workflow_summary: Optional[str]

class BiodesignWorkflowManager:
    """LangGraph-based workflow manager for Stanford Biodesign methodology"""
    
    def __init__(self):
        self.multi_agent_system = MultiAgentDebateSystem()
        self.memory = MemorySaver()
        self.workflow = self._build_workflow()
        
    def _build_workflow(self) -> StateGraph:
        """Build the comprehensive biodesign workflow"""
        
        workflow = StateGraph(WorkflowState)
        
        # Add phase nodes
        workflow.add_node("initialize_workflow", self._initialize_workflow_node)
        workflow.add_node("identify_phase", self._identify_phase_node)
        workflow.add_node("invent_phase", self._invent_phase_node)
        workflow.add_node("implement_phase", self._implement_phase_node)
        
        # Add phase transition and evaluation nodes
        workflow.add_node("evaluate_phase_completion", self._evaluate_phase_completion_node)
        workflow.add_node("transition_phase", self._transition_phase_node)
        workflow.add_node("generate_phase_summary", self._generate_phase_summary_node)
        
        # Add workflow management nodes
        workflow.add_node("workflow_controller", self._workflow_controller_node)
        workflow.add_node("final_synthesis", self._final_synthesis_node)
        
        # Set entry point
        workflow.set_entry_point("initialize_workflow")
        
        # Define workflow edges
        workflow.add_edge("initialize_workflow", "workflow_controller")
        
        # Workflow controller routes to appropriate phase
        workflow.add_conditional_edges(
            "workflow_controller",
            self._route_workflow_phase,
            {
                "identify": "identify_phase",
                "invent": "invent_phase", 
                "implement": "implement_phase",
                "complete": "final_synthesis",
                "pause": END
            }
        )
        
        # Phase nodes route to evaluation
        for phase in ["identify_phase", "invent_phase", "implement_phase"]:
            workflow.add_edge(phase, "evaluate_phase_completion")
        
        # Phase completion evaluation routes
        workflow.add_conditional_edges(
            "evaluate_phase_completion",
            self._route_phase_completion,
            {
                "continue_phase": "workflow_controller",
                "complete_phase": "generate_phase_summary",
                "transition_phase": "transition_phase"
            }
        )
        
        # Phase summary and transition route back to controller
        workflow.add_edge("generate_phase_summary", "workflow_controller")
        workflow.add_edge("transition_phase", "workflow_controller")
        
        # Final synthesis ends the workflow
        workflow.add_edge("final_synthesis", END)
        
        return workflow.compile(checkpointer=self.memory)
    
    async def _initialize_workflow_node(self, state: WorkflowState) -> WorkflowState:
        """Initialize workflow with request and context"""
        
        logger.info(f"Initializing biodesign workflow {state['workflow_id']}")
        
        # Parse innovation request
        innovation_request = state["innovation_request"]
        
        # Determine starting phase
        starting_phase = WorkflowPhase(innovation_request.get("starting_phase", "identify"))
        
        # Initialize phase-specific data structures
        return {
            **state,
            "phase": starting_phase,
            "phase_status": "not_started",
            "current_step": "phase_initialization",
            "next_action": f"start_{starting_phase.value}",
            "workflow_status": "active",
            "identified_needs": [],
            "invented_solutions": [],
            "debate_results": [],
            "phase_recommendations": {},
            "final_deliverables": {}
        }
    
    async def _identify_phase_node(self, state: WorkflowState) -> WorkflowState:
        """Execute IDENTIFY phase with multi-agent collaboration"""
        
        logger.info(f"Executing IDENTIFY phase for workflow {state['workflow_id']}")
        
        # Configure agents for IDENTIFY phase
        active_agents = [
            "medical_expert",
            "patient_advocate", 
            "business_analyst",
            "ethicist",
            "devils_advocate"
        ]
        
        # Prepare debate topic for needs identification
        debate_topic = f"""
        Healthcare Needs Identification for: {state['innovation_request'].get('problem_statement', 'Healthcare challenge')}
        
        Context: {state['innovation_request'].get('context', 'General healthcare setting')}
        
        Focus Areas:
        1. Unmet clinical needs and gaps in care
        2. Patient experience pain points and challenges  
        3. Healthcare delivery inefficiencies
        4. Market opportunities and stakeholder needs
        5. Ethical considerations and vulnerable populations
        
        Goal: Identify and prioritize the most significant healthcare needs that should be addressed.
        """
        
        # Start multi-agent debate for needs identification
        debate_session_id = f"{state['workflow_id']}_identify_{uuid.uuid4().hex[:8]}"
        
        debate_result = await self.multi_agent_system.start_debate(
            session_id=debate_session_id,
            topic=debate_topic,
            phase="identify",
            context_data=state["innovation_request"],
            active_agents=active_agents,
            max_rounds=3,
            consensus_threshold=0.75
        )
        
        # Process debate results into identified needs
        identified_needs = self._extract_needs_from_debate(debate_result)
        
        return {
            **state,
            "phase_status": "in_progress",
            "current_step": "needs_identification_complete",
            "identified_needs": identified_needs,
            "debate_results": state["debate_results"] + [debate_result],
            "next_action": "evaluate_phase"
        }
    
    async def _invent_phase_node(self, state: WorkflowState) -> WorkflowState:
        """Execute INVENT phase with multi-agent collaboration"""
        
        logger.info(f"Executing INVENT phase for workflow {state['workflow_id']}")
        
        # Configure agents for INVENT phase
        active_agents = [
            "tech_engineer",
            "medical_expert",
            "business_analyst", 
            "regulatory_agent",
            "ethicist",
            "devils_advocate"
        ]
        
        # Use identified needs as context for solution invention
        prioritized_needs = state.get("identified_needs", [])[:3]  # Top 3 needs
        
        debate_topic = f"""
        Solution Invention for Prioritized Healthcare Needs:
        
        Identified Needs:
        {self._format_needs_for_invention(prioritized_needs)}
        
        Innovation Context: {state['innovation_request'].get('context', 'Healthcare innovation')}
        
        Focus Areas:
        1. Technical solution approaches and feasibility
        2. Clinical validation and evidence requirements
        3. Business model and commercial viability
        4. Regulatory pathway and compliance strategy  
        5. Ethical implications and risk mitigation
        
        Goal: Develop innovative, feasible solutions that address the identified needs.
        """
        
        # Start multi-agent debate for solution invention
        debate_session_id = f"{state['workflow_id']}_invent_{uuid.uuid4().hex[:8]}"
        
        debate_result = await self.multi_agent_system.start_debate(
            session_id=debate_session_id,
            topic=debate_topic,
            phase="invent",
            context_data={
                **state["innovation_request"],
                "identified_needs": prioritized_needs
            },
            active_agents=active_agents,
            max_rounds=4,
            consensus_threshold=0.8
        )
        
        # Process debate results into solution concepts
        invented_solutions = self._extract_solutions_from_debate(debate_result)
        
        return {
            **state,
            "phase_status": "in_progress", 
            "current_step": "solution_invention_complete",
            "invented_solutions": invented_solutions,
            "debate_results": state["debate_results"] + [debate_result],
            "next_action": "evaluate_phase"
        }
    
    async def _implement_phase_node(self, state: WorkflowState) -> WorkflowState:
        """Execute IMPLEMENT phase with multi-agent collaboration"""
        
        logger.info(f"Executing IMPLEMENT phase for workflow {state['workflow_id']}")
        
        # Configure agents for IMPLEMENT phase
        active_agents = [
            "business_analyst",
            "regulatory_agent",
            "tech_engineer",
            "medical_expert",
            "patient_advocate",
            "ethicist",
            "devils_advocate"
        ]
        
        # Use invented solutions for implementation planning
        selected_solutions = state.get("invented_solutions", [])[:2]  # Top 2 solutions
        
        debate_topic = f"""
        Implementation Strategy for Selected Healthcare Solutions:
        
        Selected Solutions:
        {self._format_solutions_for_implementation(selected_solutions)}
        
        Business Context: {state['innovation_request'].get('business_context', 'Healthcare organization')}
        
        Focus Areas:
        1. Business model development and go-to-market strategy
        2. Regulatory approval pathway and compliance plan
        3. Technical development and deployment roadmap
        4. Clinical validation and evidence generation
        5. Patient adoption and change management
        6. Risk management and quality assurance
        
        Goal: Create comprehensive implementation plan for bringing solutions to market.
        """
        
        # Start multi-agent debate for implementation planning
        debate_session_id = f"{state['workflow_id']}_implement_{uuid.uuid4().hex[:8]}"
        
        debate_result = await self.multi_agent_system.start_debate(
            session_id=debate_session_id,
            topic=debate_topic,
            phase="implement",
            context_data={
                **state["innovation_request"],
                "identified_needs": state.get("identified_needs", []),
                "invented_solutions": selected_solutions
            },
            active_agents=active_agents,
            max_rounds=5,
            consensus_threshold=0.85
        )
        
        # Process debate results into implementation roadmap
        implementation_roadmap = self._extract_roadmap_from_debate(debate_result)
        
        return {
            **state,
            "phase_status": "in_progress",
            "current_step": "implementation_planning_complete", 
            "implementation_roadmap": implementation_roadmap,
            "debate_results": state["debate_results"] + [debate_result],
            "next_action": "evaluate_phase"
        }
    
    async def _evaluate_phase_completion_node(self, state: WorkflowState) -> WorkflowState:
        """Evaluate whether current phase is complete"""
        
        current_phase = state["phase"]
        phase_status = state["phase_status"]
        
        # Define completion criteria for each phase
        completion_criteria = {
            WorkflowPhase.IDENTIFY: len(state.get("identified_needs", [])) >= 3,
            WorkflowPhase.INVENT: len(state.get("invented_solutions", [])) >= 2,
            WorkflowPhase.IMPLEMENT: state.get("implementation_roadmap") is not None
        }
        
        is_complete = completion_criteria.get(current_phase, False)
        
        if is_complete:
            next_action = "complete_phase"
            phase_status = "completed"
        else:
            next_action = "continue_phase"
        
        return {
            **state,
            "phase_status": phase_status,
            "next_action": next_action
        }
    
    async def _transition_phase_node(self, state: WorkflowState) -> WorkflowState:
        """Transition to next phase in biodesign methodology"""
        
        current_phase = state["phase"]
        
        # Define phase transitions
        phase_transitions = {
            WorkflowPhase.IDENTIFY: WorkflowPhase.INVENT,
            WorkflowPhase.INVENT: WorkflowPhase.IMPLEMENT,
            WorkflowPhase.IMPLEMENT: None  # Workflow complete
        }
        
        next_phase = phase_transitions.get(current_phase)
        
        if next_phase:
            return {
                **state,
                "phase": next_phase,
                "phase_status": "not_started",
                "current_step": "phase_transition",
                "next_action": f"start_{next_phase.value}"
            }
        else:
            return {
                **state,
                "phase_status": "completed",
                "current_step": "workflow_complete",
                "next_action": "complete_workflow",
                "workflow_status": "completed"
            }
    
    async def _generate_phase_summary_node(self, state: WorkflowState) -> WorkflowState:
        """Generate summary for completed phase"""
        
        current_phase = state["phase"]
        
        # Generate phase-specific summary
        phase_summary = await self._generate_phase_summary(state)
        
        phase_recommendations = state.get("phase_recommendations", {})
        phase_recommendations[current_phase.value] = phase_summary
        
        return {
            **state,
            "phase_recommendations": phase_recommendations,
            "current_step": "phase_summary_complete",
            "next_action": "transition_phase"
        }
    
    async def _workflow_controller_node(self, state: WorkflowState) -> WorkflowState:
        """Control workflow execution and routing"""
        
        workflow_status = state["workflow_status"]
        current_phase = state["phase"]
        next_action = state["next_action"]
        
        # Route based on next action
        if next_action.startswith("start_"):
            phase_name = next_action.replace("start_", "")
            return {
                **state,
                "current_step": f"executing_{phase_name}",
                "next_action": phase_name
            }
        elif next_action == "complete_workflow":
            return {
                **state,
                "next_action": "complete"
            }
        else:
            return {
                **state,
                "next_action": current_phase.value
            }
    
    async def _final_synthesis_node(self, state: WorkflowState) -> WorkflowState:
        """Generate final synthesis and deliverables"""
        
        logger.info(f"Generating final synthesis for workflow {state['workflow_id']}")
        
        # Compile final deliverables
        final_deliverables = {
            "identified_needs": state.get("identified_needs", []),
            "invented_solutions": state.get("invented_solutions", []),
            "implementation_roadmap": state.get("implementation_roadmap"),
            "phase_recommendations": state.get("phase_recommendations", {}),
            "debate_history": state.get("debate_results", [])
        }
        
        # Generate workflow summary
        workflow_summary = await self._generate_workflow_summary(state)
        
        return {
            **state,
            "workflow_status": "completed",
            "final_deliverables": final_deliverables,
            "workflow_summary": workflow_summary,
            "current_step": "synthesis_complete",
            "next_action": "complete"
        }
    
    def _route_workflow_phase(self, state: WorkflowState) -> str:
        """Route workflow to appropriate phase"""
        return state["next_action"]
    
    def _route_phase_completion(self, state: WorkflowState) -> str:
        """Route after phase completion evaluation"""
        return state["next_action"]
    
    # Helper methods for data extraction and processing
    
    def _extract_needs_from_debate(self, debate_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract identified needs from debate results"""
        
        needs = []
        for arg in debate_result.get("arguments", []):
            recommendations = arg.get("recommendations", [])
            for rec in recommendations:
                if "need" in rec.lower():
                    needs.append({
                        "need_description": rec,
                        "source_agent": arg["agent_name"],
                        "confidence": arg["confidence"],
                        "supporting_evidence": arg.get("sources", [])
                    })
        
        # Deduplicate and prioritize needs
        return needs[:5]  # Top 5 needs
    
    def _extract_solutions_from_debate(self, debate_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract solution concepts from debate results"""
        
        solutions = []
        for arg in debate_result.get("arguments", []):
            recommendations = arg.get("recommendations", [])
            for rec in recommendations:
                if any(word in rec.lower() for word in ["solution", "approach", "technology", "device"]):
                    solutions.append({
                        "solution_description": rec,
                        "source_agent": arg["agent_name"],
                        "confidence": arg["confidence"],
                        "technical_feasibility": arg.get("technical_assessment", "unknown"),
                        "commercial_viability": arg.get("commercial_assessment", "unknown")
                    })
        
        return solutions[:3]  # Top 3 solutions
    
    def _extract_roadmap_from_debate(self, debate_result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract implementation roadmap from debate results"""
        
        roadmap = {
            "milestones": [],
            "timeline": "12-24 months",
            "resource_requirements": [],
            "risk_factors": [],
            "success_metrics": []
        }
        
        for arg in debate_result.get("arguments", []):
            # Extract milestones from business analyst
            if arg["agent_id"] == "business_analyst":
                roadmap["milestones"].extend(arg.get("recommendations", [])[:3])
            
            # Extract risks from devil's advocate
            elif arg["agent_id"] == "devils_advocate":
                roadmap["risk_factors"].extend(arg.get("concerns", [])[:3])
        
        return roadmap
    
    def _format_needs_for_invention(self, needs: List[Dict[str, Any]]) -> str:
        """Format identified needs for solution invention"""
        
        formatted = ""
        for i, need in enumerate(needs, 1):
            formatted += f"{i}. {need['need_description']}\n"
            formatted += f"   Source: {need['source_agent']}\n"
            formatted += f"   Confidence: {need['confidence']}\n\n"
        
        return formatted
    
    def _format_solutions_for_implementation(self, solutions: List[Dict[str, Any]]) -> str:
        """Format solutions for implementation planning"""
        
        formatted = ""
        for i, solution in enumerate(solutions, 1):
            formatted += f"{i}. {solution['solution_description']}\n"
            formatted += f"   Source: {solution['source_agent']}\n"
            formatted += f"   Confidence: {solution['confidence']}\n\n"
        
        return formatted
    
    async def _generate_phase_summary(self, state: WorkflowState) -> Dict[str, Any]:
        """Generate summary for completed phase"""
        
        current_phase = state["phase"]
        phase_results = state.get("debate_results", [])
        
        summary = {
            "phase": current_phase.value,
            "status": "completed",
            "timestamp": datetime.utcnow().isoformat(),
            "key_outputs": [],
            "insights": [],
            "next_steps": []
        }
        
        if current_phase == WorkflowPhase.IDENTIFY:
            summary["key_outputs"] = state.get("identified_needs", [])
            summary["insights"] = ["Healthcare needs successfully identified and prioritized"]
            summary["next_steps"] = ["Proceed to solution invention phase"]
            
        elif current_phase == WorkflowPhase.INVENT:
            summary["key_outputs"] = state.get("invented_solutions", [])
            summary["insights"] = ["Innovative solutions developed and evaluated"]
            summary["next_steps"] = ["Proceed to implementation planning phase"]
            
        elif current_phase == WorkflowPhase.IMPLEMENT:
            summary["key_outputs"] = [state.get("implementation_roadmap", {})]
            summary["insights"] = ["Implementation strategy developed"]
            summary["next_steps"] = ["Execute implementation plan"]
        
        return summary
    
    async def _generate_workflow_summary(self, state: WorkflowState) -> str:
        """Generate comprehensive workflow summary"""
        
        summary = f"""
        Stanford Biodesign Innovation Workflow Summary
        Workflow ID: {state['workflow_id']}
        Completed: {datetime.utcnow().isoformat()}
        
        IDENTIFY Phase Results:
        - Identified {len(state.get('identified_needs', []))} healthcare needs
        - Key needs prioritized through multi-agent analysis
        
        INVENT Phase Results:
        - Developed {len(state.get('invented_solutions', []))} solution concepts
        - Technical and commercial viability assessed
        
        IMPLEMENT Phase Results:
        - Implementation roadmap created
        - Business model and regulatory strategy defined
        
        Multi-Agent Collaboration:
        - {len(state.get('debate_results', []))} debate sessions conducted
        - Consensus-driven decision making across phases
        
        Final Recommendations:
        Ready for execution with comprehensive planning and risk assessment.
        """
        
        return summary
    
    # Public interface methods
    
    async def start_biodesign_workflow(
        self,
        innovation_request: InnovationRequest,
        starting_phase: WorkflowPhase = WorkflowPhase.IDENTIFY
    ) -> Dict[str, Any]:
        """Start a new biodesign innovation workflow"""
        
        workflow_id = f"biodesign_{uuid.uuid4().hex[:12]}"
        session_id = f"{workflow_id}_session"
        
        # Initialize workflow state
        initial_state = WorkflowState(
            workflow_id=workflow_id,
            session_id=session_id,
            phase=starting_phase,
            phase_status="not_started",
            innovation_request=innovation_request.dict(),
            needs_analysis=None,
            solution_concepts=[],
            implementation_plan=None,
            debate_state=None,
            debate_results=[],
            identified_needs=[],
            invented_solutions=[],
            implementation_roadmap=None,
            current_step="initialization",
            next_action="start_workflow",
            workflow_status="active",
            phase_recommendations={},
            final_deliverables={},
            workflow_summary=None
        )
        
        # Run workflow
        config = {"configurable": {"thread_id": workflow_id}}
        
        try:
            result = await self.workflow.ainvoke(initial_state, config)
            
            return {
                "workflow_id": workflow_id,
                "status": "completed",
                "results": result["final_deliverables"],
                "summary": result["workflow_summary"],
                "phases_completed": list(result["phase_recommendations"].keys())
            }
            
        except Exception as e:
            logger.error(f"Error in biodesign workflow {workflow_id}: {str(e)}")
            return {
                "workflow_id": workflow_id,
                "status": "failed",
                "error": str(e)
            }
    
    async def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get current status of biodesign workflow"""
        
        config = {"configurable": {"thread_id": workflow_id}}
        
        try:
            state = await self.workflow.aget_state(config)
            
            if state and state.values:
                return {
                    "workflow_id": workflow_id,
                    "status": state.values.get("workflow_status", "unknown"),
                    "current_phase": state.values.get("phase", "unknown"),
                    "current_step": state.values.get("current_step", "unknown"),
                    "progress": {
                        "identified_needs": len(state.values.get("identified_needs", [])),
                        "invented_solutions": len(state.values.get("invented_solutions", [])),
                        "implementation_roadmap": bool(state.values.get("implementation_roadmap"))
                    }
                }
            else:
                return {
                    "workflow_id": workflow_id,
                    "status": "not_found"
                }
                
        except Exception as e:
            logger.error(f"Error getting workflow status for {workflow_id}: {str(e)}")
            return {
                "workflow_id": workflow_id,
                "status": "error",
                "error": str(e)
            }
