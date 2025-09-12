"""
Multi-Agent System using LangGraph for Bio-Design Innovation
"""

from typing import Dict, Any, List, Optional, TypedDict, Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import asyncio
import uuid
from datetime import datetime

from app.core.agents.base import BaseAgent, AgentResponse
from app.core.agents.medical_expert import MedicalExpertAgent
from app.core.agents.tech_engineer import TechEngineerAgent
# Import agents with error handling
try:
    from app.core.agents.tech_engineer import TechEngineerAgent
    from app.core.agents.business_analyst import BusinessAnalystAgent
    from app.core.agents.regulatory_agent import RegulatoryAgent
    from app.core.agents.ethicist import EthicistAgent
    from app.core.agents.patient_advocate import PatientAdvocateAgent
    from app.core.agents.devils_advocate import DevilsAdvocateAgent
except ImportError as e:
    logger.warning(f"Some agent modules not yet available: {e}")
    # Provide fallback imports
    TechEngineerAgent = None
    BusinessAnalystAgent = None
    RegulatoryAgent = None
    EthicistAgent = None
    PatientAdvocateAgent = None
    DevilsAdvocateAgent = None
from app.utils.logging import get_logger

logger = get_logger(__name__)

class MultiAgentState(TypedDict):
    """State structure for multi-agent debate system"""
    session_id: str
    topic: str
    phase: Literal["identify", "invent", "implement"]
    current_round: int
    max_rounds: int
    
    # Agent management
    active_agents: List[str]
    current_speaker: Optional[str]
    speaking_order: List[str]
    
    # Debate content
    arguments: List[Dict[str, Any]]
    positions: Dict[str, str]  # agent_id -> position (for/against/neutral)
    
    # Context and data
    context_data: Dict[str, Any]
    uploaded_documents: List[str]
    multimodal_content: List[str]
    
    # Consensus tracking
    consensus_scores: Dict[str, float]
    consensus_threshold: float
    consensus_reached: bool
    
    # Output
    final_recommendations: List[Dict[str, Any]]
    synthesis: Optional[str]
    next_action: str

class MultiAgentDebateSystem:
    """LangGraph-based multi-agent debate system for bio-design innovation"""
    
    def __init__(self):
        self.agents = self._initialize_agents()
        self.memory = MemorySaver()
        self.graph = self._build_graph()
        
    def _initialize_agents(self) -> Dict[str, BaseAgent]:
        """Initialize all specialized agents with error handling"""
        agents = {
            "medical_expert": MedicalExpertAgent(),
        }
        
        # Add other agents if available
        try:
            if TechEngineerAgent:
                agents["tech_engineer"] = TechEngineerAgent()
        except Exception as e:
            logger.warning(f"Failed to initialize TechEngineerAgent: {e}")
            
        try:
            if BusinessAnalystAgent:
                agents["business_analyst"] = BusinessAnalystAgent()
        except Exception as e:
            logger.warning(f"Failed to initialize BusinessAnalystAgent: {e}")
            
        try:
            if RegulatoryAgent:
                agents["regulatory_agent"] = RegulatoryAgent()
        except Exception as e:
            logger.warning(f"Failed to initialize RegulatoryAgent: {e}")
            
        try:
            if EthicistAgent:
                agents["ethicist"] = EthicistAgent()
        except Exception as e:
            logger.warning(f"Failed to initialize EthicistAgent: {e}")
            
        try:
            if PatientAdvocateAgent:
                agents["patient_advocate"] = PatientAdvocateAgent()
        except Exception as e:
            logger.warning(f"Failed to initialize PatientAdvocateAgent: {e}")
            
        try:
            if DevilsAdvocateAgent:
                agents["devils_advocate"] = DevilsAdvocateAgent()
        except Exception as e:
            logger.warning(f"Failed to initialize DevilsAdvocateAgent: {e}")
            
        logger.info(f"Initialized {len(agents)} agents: {list(agents.keys())}")
        return agents
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow for multi-agent debate"""
        
        # Create the graph
        workflow = StateGraph(MultiAgentState)
        
        # Add nodes for each agent
        for agent_id in self.agents.keys():
            workflow.add_node(agent_id, self._create_agent_node(agent_id))
        
        # Add orchestration nodes
        workflow.add_node("orchestrator", self._orchestrator_node)
        workflow.add_node("consensus_evaluator", self._consensus_evaluator_node)
        workflow.add_node("synthesis_generator", self._synthesis_generator_node)
        workflow.add_node("round_manager", self._round_manager_node)
        
        # Define the workflow edges
        workflow.set_entry_point("orchestrator")
        
        # Orchestrator decides which agent speaks next
        workflow.add_conditional_edges(
            "orchestrator",
            self._route_to_next_speaker,
            {
                "medical_expert": "medical_expert",
                "tech_engineer": "tech_engineer", 
                "business_analyst": "business_analyst",
                "regulatory_agent": "regulatory_agent",
                "ethicist": "ethicist",
                "patient_advocate": "patient_advocate",
                "devils_advocate": "devils_advocate",
                "evaluate_consensus": "consensus_evaluator",
                "end_debate": "synthesis_generator"
            }
        )
        
        # All agents flow to round manager after speaking
        for agent_id in self.agents.keys():
            workflow.add_edge(agent_id, "round_manager")
        
        # Round manager decides what to do next
        workflow.add_conditional_edges(
            "round_manager",
            self._route_after_round,
            {
                "continue_debate": "orchestrator",
                "evaluate_consensus": "consensus_evaluator", 
                "end_debate": "synthesis_generator"
            }
        )
        
        # Consensus evaluator routes based on consensus level
        workflow.add_conditional_edges(
            "consensus_evaluator",
            self._route_after_consensus,
            {
                "continue_debate": "orchestrator",
                "generate_synthesis": "synthesis_generator"
            }
        )
        
        # Synthesis generator ends the workflow
        workflow.add_edge("synthesis_generator", END)
        
        return workflow.compile(checkpointer=self.memory)
    
    def _create_agent_node(self, agent_id: str):
        """Create a node function for a specific agent"""
        
        async def agent_node(state: MultiAgentState) -> MultiAgentState:
            """Execute agent analysis and update state"""
            
            agent = self.agents[agent_id]
            
            # Prepare input for the agent
            agent_input = {
                "topic": state["topic"],
                "phase": state["phase"],
                "context_data": state["context_data"],
                "previous_arguments": state["arguments"],
                "position": state["positions"].get(agent_id, "neutral"),
                "round": state["current_round"]
            }
            
            # Get agent response
            response = await agent.debate_response(
                topic=state["topic"],
                other_agent_arguments=state["arguments"],
                position=state["positions"].get(agent_id, "neutral")
            )
            
            # Create argument record
            argument = {
                "agent_id": agent_id,
                "agent_name": agent.agent_name,
                "round": state["current_round"],
                "content": response.content,
                "confidence": response.confidence,
                "reasoning": response.reasoning,
                "sources": response.sources,
                "recommendations": response.recommendations,
                "concerns": response.concerns,
                "timestamp": datetime.utcnow().isoformat(),
                "position": state["positions"].get(agent_id, "neutral")
            }
            
            # Update state
            new_arguments = state["arguments"] + [argument]
            
            return {
                **state,
                "arguments": new_arguments,
                "current_speaker": agent_id
            }
        
        return agent_node
    
    async def _orchestrator_node(self, state: MultiAgentState) -> MultiAgentState:
        """Orchestrate the debate flow and decide next speaker"""
        
        # Determine speaking order if not set
        if not state.get("speaking_order"):
            speaking_order = self._determine_speaking_order(
                state["active_agents"], 
                state["phase"]
            )
            state = {**state, "speaking_order": speaking_order}
        
        # Determine next speaker
        next_speaker = self._get_next_speaker(state)
        
        return {
            **state,
            "current_speaker": next_speaker,
            "next_action": f"speak_{next_speaker}" if next_speaker else "evaluate_consensus"
        }
    
    async def _consensus_evaluator_node(self, state: MultiAgentState) -> MultiAgentState:
        """Evaluate consensus level among agents"""
        
        if not state["arguments"]:
            return {
                **state,
                "consensus_scores": {},
                "consensus_reached": False,
                "next_action": "continue_debate"
            }
        
        # Calculate consensus scores
        consensus_scores = await self._calculate_consensus_scores(state["arguments"])
        overall_consensus = sum(consensus_scores.values()) / len(consensus_scores)
        
        consensus_reached = overall_consensus >= state["consensus_threshold"]
        
        return {
            **state,
            "consensus_scores": consensus_scores,
            "consensus_reached": consensus_reached,
            "next_action": "generate_synthesis" if consensus_reached else "continue_debate"
        }
    
    async def _synthesis_generator_node(self, state: MultiAgentState) -> MultiAgentState:
        """Generate final synthesis and recommendations"""
        
        synthesis_prompt = f"""
        Based on the multi-agent debate on "{state['topic']}" in the {state['phase']} phase, 
        synthesize the key insights and generate final recommendations.
        
        Arguments from {len(state['arguments'])} contributions across {state['current_round']} rounds.
        
        Consider all agent perspectives and create a balanced synthesis that:
        1. Summarizes key points of agreement
        2. Acknowledges remaining disagreements
        3. Provides actionable recommendations
        4. Identifies next steps for the {state['phase']} phase
        """
        
        # Use a neutral synthesis agent (could be enhanced)
        synthesis = await self._generate_synthesis(state["arguments"], synthesis_prompt)
        
        # Extract final recommendations
        recommendations = await self._extract_recommendations(state["arguments"])
        
        return {
            **state,
            "synthesis": synthesis,
            "final_recommendations": recommendations,
            "next_action": "complete"
        }
    
    async def _round_manager_node(self, state: MultiAgentState) -> MultiAgentState:
        """Manage debate rounds and decide when to progress"""
        
        # Check if all agents have spoken in current round
        current_round_speakers = [
            arg["agent_id"] for arg in state["arguments"] 
            if arg["round"] == state["current_round"]
        ]
        
        all_spoke = all(agent in current_round_speakers for agent in state["active_agents"])
        
        if all_spoke and state["current_round"] < state["max_rounds"]:
            # Move to next round
            return {
                **state,
                "current_round": state["current_round"] + 1,
                "next_action": "continue_debate"
            }
        elif state["current_round"] >= state["max_rounds"]:
            # Max rounds reached
            return {
                **state,
                "next_action": "end_debate"
            }
        else:
            # Continue current round
            return {
                **state,
                "next_action": "continue_debate"
            }
    
    def _route_to_next_speaker(self, state: MultiAgentState) -> str:
        """Determine routing based on next speaker"""
        
        if state["next_action"].startswith("speak_"):
            return state["next_action"].replace("speak_", "")
        elif state["next_action"] == "evaluate_consensus":
            return "evaluate_consensus"
        else:
            return "end_debate"
    
    def _route_after_round(self, state: MultiAgentState) -> str:
        """Route after round management"""
        return state["next_action"]
    
    def _route_after_consensus(self, state: MultiAgentState) -> str:
        """Route after consensus evaluation"""
        return state["next_action"]
    
    def _determine_speaking_order(self, active_agents: List[str], phase: str) -> List[str]:
        """Determine optimal speaking order based on phase"""
        
        # Phase-specific agent priorities
        phase_priorities = {
            "identify": [
                "medical_expert",
                "patient_advocate", 
                "business_analyst",
                "regulatory_agent",
                "ethicist",
                "devils_advocate"
            ],
            "invent": [
                "tech_engineer",
                "medical_expert",
                "business_analyst",
                "regulatory_agent",
                "ethicist",
                "patient_advocate",
                "devils_advocate"
            ],
            "implement": [
                "business_analyst",
                "regulatory_agent",
                "tech_engineer",
                "medical_expert",
                "patient_advocate",
                "ethicist",
                "devils_advocate"
            ]
        }
        
        priority_order = phase_priorities.get(phase, active_agents)
        return [agent for agent in priority_order if agent in active_agents]
    
    def _get_next_speaker(self, state: MultiAgentState) -> Optional[str]:
        """Get the next agent who should speak"""
        
        current_round_speakers = [
            arg["agent_id"] for arg in state["arguments"] 
            if arg["round"] == state["current_round"]
        ]
        
        for agent_id in state["speaking_order"]:
            if agent_id not in current_round_speakers:
                return agent_id
        
        return None
    
    async def _calculate_consensus_scores(self, arguments: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate consensus scores between agents"""
        
        # Simplified consensus calculation
        # In practice, this could use NLP similarity measures
        
        if len(arguments) < 2:
            return {"overall": 0.0}
        
        # Extract agent positions and confidence levels
        agent_positions = {}
        for arg in arguments:
            agent_id = arg["agent_id"]
            confidence = arg["confidence"]
            position = arg.get("position", "neutral")
            
            if agent_id not in agent_positions:
                agent_positions[agent_id] = []
            
            agent_positions[agent_id].append({
                "position": position,
                "confidence": confidence
            })
        
        # Simple consensus metric based on position alignment
        total_alignment = 0
        comparisons = 0
        
        agents = list(agent_positions.keys())
        for i in range(len(agents)):
            for j in range(i + 1, len(agents)):
                agent1_pos = agent_positions[agents[i]][-1]  # Latest position
                agent2_pos = agent_positions[agents[j]][-1]  # Latest position
                
                # Calculate alignment score
                if agent1_pos["position"] == agent2_pos["position"]:
                    alignment = min(agent1_pos["confidence"], agent2_pos["confidence"])
                else:
                    alignment = 1.0 - abs(agent1_pos["confidence"] - agent2_pos["confidence"])
                
                total_alignment += alignment
                comparisons += 1
        
        overall_consensus = total_alignment / comparisons if comparisons > 0 else 0.0
        
        return {
            "overall": overall_consensus,
            "agent_count": len(agent_positions),
            "argument_count": len(arguments)
        }
    
    async def _generate_synthesis(self, arguments: List[Dict[str, Any]], prompt: str) -> str:
        """Generate synthesis from all arguments"""
        
        # Combine all arguments for synthesis
        combined_content = "\n\n".join([
            f"{arg['agent_name']}: {arg['content']}" 
            for arg in arguments
        ])
        
        # Use medical expert for neutral synthesis (could be improved)
        medical_expert = self.agents["medical_expert"]
        
        synthesis_response = await medical_expert.llm.ainvoke([
            {"role": "system", "content": "You are a neutral synthesizer combining multiple expert perspectives."},
            {"role": "user", "content": f"{prompt}\n\nArguments:\n{combined_content}"}
        ])
        
        return synthesis_response.content
    
    async def _extract_recommendations(self, arguments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract and consolidate recommendations from all arguments"""
        
        recommendations = []
        for arg in arguments:
            for rec in arg.get("recommendations", []):
                recommendations.append({
                    "recommendation": rec,
                    "source_agent": arg["agent_name"],
                    "confidence": arg["confidence"],
                    "round": arg["round"]
                })
        
        return recommendations
    
    async def start_debate(
        self,
        session_id: str,
        topic: str,
        phase: str,
        context_data: Dict[str, Any] = None,
        active_agents: List[str] = None,
        max_rounds: int = 5,
        consensus_threshold: float = 0.8
    ) -> Dict[str, Any]:
        """Start a new multi-agent debate session"""
        
        if active_agents is None:
            active_agents = list(self.agents.keys())
        
        # Initialize state
        initial_state = MultiAgentState(
            session_id=session_id,
            topic=topic,
            phase=phase,
            current_round=1,
            max_rounds=max_rounds,
            active_agents=active_agents,
            current_speaker=None,
            speaking_order=[],
            arguments=[],
            positions={agent: "neutral" for agent in active_agents},
            context_data=context_data or {},
            uploaded_documents=[],
            multimodal_content=[],
            consensus_scores={},
            consensus_threshold=consensus_threshold,
            consensus_reached=False,
            final_recommendations=[],
            synthesis=None,
            next_action="start"
        )
        
        # Run the debate workflow
        config = {"configurable": {"thread_id": session_id}}
        
        try:
            result = await self.graph.ainvoke(initial_state, config)
            
            return {
                "session_id": session_id,
                "status": "completed",
                "rounds_completed": result["current_round"],
                "consensus_reached": result["consensus_reached"],
                "consensus_scores": result["consensus_scores"],
                "arguments": result["arguments"],
                "synthesis": result["synthesis"],
                "recommendations": result["final_recommendations"]
            }
            
        except Exception as e:
            logger.error(f"Error in debate session {session_id}: {str(e)}")
            return {
                "session_id": session_id,
                "status": "failed",
                "error": str(e)
            }
    
    async def get_debate_status(self, session_id: str) -> Dict[str, Any]:
        """Get current status of a debate session"""
        
        config = {"configurable": {"thread_id": session_id}}
        
        try:
            # Get current state from memory
            state = await self.graph.aget_state(config)
            
            if state and state.values:
                return {
                    "session_id": session_id,
                    "status": "active" if not state.values.get("synthesis") else "completed",
                    "current_round": state.values.get("current_round", 0),
                    "arguments_count": len(state.values.get("arguments", [])),
                    "consensus_reached": state.values.get("consensus_reached", False),
                    "current_speaker": state.values.get("current_speaker")
                }
            else:
                return {
                    "session_id": session_id,
                    "status": "not_found"
                }
                
        except Exception as e:
            logger.error(f"Error getting debate status for {session_id}: {str(e)}")
            return {
                "session_id": session_id,
                "status": "error",
                "error": str(e)
            }
