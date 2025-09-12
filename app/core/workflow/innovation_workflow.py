"""
LangGraph Workflow Orchestration for Three-Phase Innovation Process
"""

from typing import Dict, Any, List, Optional, TypedDict, Annotated
from datetime import datetime
import json
import asyncio

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from pydantic import BaseModel, Field

from app.models.innovation import (
    InnovationPhase, InnovationSession, NeedItem, SolutionConcept,
    ImplementationPlan, StakeholderPerspective, TechnicalFeasibility,
    PhaseTransitionDecision, DecisionGate
)
from app.core.agents.base import BaseAgent
from app.services.rag_service import RAGService
from app.services.perplexity_service import PerplexityService
from app.services.mermaid_service import MermaidService
from app.utils.logging import get_logger

logger = get_logger(__name__)

class WorkflowState(TypedDict):
    """State management for the innovation workflow"""
    session_id: str
    current_phase: InnovationPhase
    session_data: Dict[str, Any]
    identified_needs: List[Dict[str, Any]]
    solution_concepts: List[Dict[str, Any]]
    implementation_plans: List[Dict[str, Any]]
    stakeholder_feedback: List[Dict[str, Any]]
    agent_messages: List[BaseMessage]
    phase_progress: Dict[str, float]
    decision_gates: List[Dict[str, Any]]
    next_action: Optional[str]
    iteration_count: int
    max_iterations: int

class InnovationWorkflow:
    """LangGraph workflow for orchestrating the three-phase innovation process"""
    
    def __init__(self):
        self.rag_service = RAGService()
        self.perplexity_service = PerplexityService()
        self.mermaid_service = MermaidService()
        
        # Initialize agents (would be injected in real implementation)
        self.agents = {}
        
        # Build the workflow graph
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow for three-phase innovation"""
        
        # Define the workflow graph
        workflow = StateGraph(WorkflowState)
        
        # Add nodes for each phase and decision points
        workflow.add_node("start_session", self._start_session)
        workflow.add_node("identify_phase", self._execute_identify_phase)
        workflow.add_node("identify_evaluation", self._evaluate_identify_phase)
        workflow.add_node("identify_decision_gate", self._identify_decision_gate)
        workflow.add_node("invent_phase", self._execute_invent_phase)
        workflow.add_node("invent_evaluation", self._evaluate_invent_phase)
        workflow.add_node("invent_decision_gate", self._invent_decision_gate)
        workflow.add_node("implement_phase", self._execute_implement_phase)
        workflow.add_node("implement_evaluation", self._evaluate_implement_phase)
        workflow.add_node("final_decision", self._final_decision)
        workflow.add_node("generate_reports", self._generate_reports)
        
        # Define workflow edges and transitions
        workflow.set_entry_point("start_session")
        
        # Session start transitions
        workflow.add_edge("start_session", "identify_phase")
        
        # IDENTIFY phase flow
        workflow.add_edge("identify_phase", "identify_evaluation")
        workflow.add_edge("identify_evaluation", "identify_decision_gate")
        workflow.add_conditional_edges(
            "identify_decision_gate",
            self._identify_gate_condition,
            {
                "continue_identify": "identify_phase",
                "proceed_to_invent": "invent_phase",
                "end_session": "generate_reports"
            }
        )
        
        # INVENT phase flow
        workflow.add_edge("invent_phase", "invent_evaluation")
        workflow.add_edge("invent_evaluation", "invent_decision_gate")
        workflow.add_conditional_edges(
            "invent_decision_gate",
            self._invent_gate_condition,
            {
                "continue_invent": "invent_phase",
                "back_to_identify": "identify_phase",
                "proceed_to_implement": "implement_phase",
                "end_session": "generate_reports"
            }
        )
        
        # IMPLEMENT phase flow
        workflow.add_edge("implement_phase", "implement_evaluation")
        workflow.add_edge("implement_evaluation", "final_decision")
        workflow.add_conditional_edges(
            "final_decision",
            self._final_decision_condition,
            {
                "continue_implement": "implement_phase",
                "back_to_invent": "invent_phase",
                "back_to_identify": "identify_phase",
                "complete_session": "generate_reports"
            }
        )
        
        # End flow
        workflow.add_edge("generate_reports", END)
        
        return workflow.compile()
    
    async def _start_session(self, state: WorkflowState) -> WorkflowState:
        """Initialize the innovation session"""
        
        logger.info(f"Starting innovation session: {state['session_id']}")
        
        # Initialize session state
        state["current_phase"] = InnovationPhase.IDENTIFY
        state["identified_needs"] = []
        state["solution_concepts"] = []
        state["implementation_plans"] = []
        state["stakeholder_feedback"] = []
        state["agent_messages"] = []
        state["phase_progress"] = {
            "identify": 0.0,
            "invent": 0.0,
            "implement": 0.0
        }
        state["decision_gates"] = []
        state["iteration_count"] = 0
        state["max_iterations"] = state.get("max_iterations", 10)
        
        # Add initial message
        state["agent_messages"].append(
            AIMessage(content=f"Innovation session {state['session_id']} started. Beginning IDENTIFY phase.")
        )
        
        return state
    
    async def _execute_identify_phase(self, state: WorkflowState) -> WorkflowState:
        """Execute the IDENTIFY phase - problem definition and need discovery"""
        
        logger.info(f"Executing IDENTIFY phase for session: {state['session_id']}")
        
        state["current_phase"] = InnovationPhase.IDENTIFY
        state["iteration_count"] += 1
        
        # Gather context from uploaded documents
        session_data = state.get("session_data", {})
        uploaded_documents = session_data.get("uploaded_documents", [])
        
        # Process documents through RAG service
        if uploaded_documents:
            for doc in uploaded_documents:
                try:
                    await self.rag_service.process_document(
                        state["session_id"],
                        doc["content"],
                        doc.get("metadata", {})
                    )
                except Exception as e:
                    logger.error(f"Error processing document: {str(e)}")
        
        # Perform market research using Perplexity
        market_query = session_data.get("research_query", "healthcare innovation opportunities")
        try:
            market_intelligence = await self.perplexity_service.search_market_intelligence(
                query=market_query,
                focus_areas=["market size", "unmet needs", "competitive landscape"]
            )
            
            # Extract needs from market intelligence
            needs_from_research = self._extract_needs_from_research(market_intelligence)
            state["identified_needs"].extend(needs_from_research)
            
        except Exception as e:
            logger.error(f"Error gathering market intelligence: {str(e)}")
        
        # Analyze clinical evidence and stakeholder input
        clinical_query = f"{market_query} clinical evidence unmet medical needs"
        try:
            clinical_evidence = await self.rag_service.search_documents(
                state["session_id"],
                clinical_query,
                max_results=10
            )
            
            # Extract clinical needs
            needs_from_clinical = self._extract_needs_from_clinical(clinical_evidence)
            state["identified_needs"].extend(needs_from_clinical)
            
        except Exception as e:
            logger.error(f"Error analyzing clinical evidence: {str(e)}")
        
        # Multi-agent debate on identified needs (simplified for now)
        if len(state["identified_needs"]) > 0:
            # In full implementation, would orchestrate agent debates
            debate_summary = await self._simulate_agent_debate(
                state["identified_needs"],
                "need_prioritization"
            )
            
            state["agent_messages"].append(
                AIMessage(content=f"Agent debate on needs completed: {debate_summary}")
            )
        
        # Update progress
        state["phase_progress"]["identify"] = min(
            0.2 + (len(state["identified_needs"]) * 0.1),
            1.0
        )
        
        logger.info(f"IDENTIFY phase progress: {state['phase_progress']['identify']:.2f}")
        
        return state
    
    async def _evaluate_identify_phase(self, state: WorkflowState) -> WorkflowState:
        """Evaluate the IDENTIFY phase progress and quality"""
        
        logger.info(f"Evaluating IDENTIFY phase for session: {state['session_id']}")
        
        needs = state["identified_needs"]
        evaluation_criteria = {
            "needs_quantity": len(needs) >= 3,
            "needs_quality": self._assess_needs_quality(needs),
            "stakeholder_coverage": self._assess_stakeholder_coverage(needs),
            "evidence_support": self._assess_evidence_support(needs),
            "market_validation": self._assess_market_validation(needs)
        }
        
        # Calculate overall readiness score
        readiness_score = sum(evaluation_criteria.values()) / len(evaluation_criteria)
        
        # Create evaluation summary
        evaluation_summary = {
            "phase": "identify",
            "readiness_score": readiness_score,
            "criteria": evaluation_criteria,
            "recommendations": self._generate_identify_recommendations(evaluation_criteria),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        state["decision_gates"].append(evaluation_summary)
        
        state["agent_messages"].append(
            AIMessage(content=f"IDENTIFY phase evaluation completed. Readiness score: {readiness_score:.2f}")
        )
        
        return state
    
    async def _identify_decision_gate(self, state: WorkflowState) -> WorkflowState:
        """Decision gate for IDENTIFY phase - determine next action"""
        
        logger.info(f"IDENTIFY decision gate for session: {state['session_id']}")
        
        latest_evaluation = state["decision_gates"][-1] if state["decision_gates"] else {}
        readiness_score = latest_evaluation.get("readiness_score", 0.0)
        iteration_count = state["iteration_count"]
        max_iterations = state["max_iterations"]
        
        # Decision logic
        if readiness_score >= 0.7:
            state["next_action"] = "proceed_to_invent"
            state["agent_messages"].append(
                AIMessage(content="IDENTIFY phase complete. Proceeding to INVENT phase.")
            )
        elif iteration_count < max_iterations and readiness_score >= 0.3:
            state["next_action"] = "continue_identify"
            state["agent_messages"].append(
                AIMessage(content="IDENTIFY phase needs more work. Continuing iterations.")
            )
        else:
            state["next_action"] = "end_session"
            state["agent_messages"].append(
                AIMessage(content="IDENTIFY phase incomplete. Ending session for review.")
            )
        
        return state
    
    def _identify_gate_condition(self, state: WorkflowState) -> str:
        """Condition function for IDENTIFY phase decision gate"""
        return state.get("next_action", "end_session")
    
    async def _execute_invent_phase(self, state: WorkflowState) -> WorkflowState:
        """Execute the INVENT phase - solution ideation and development"""
        
        logger.info(f"Executing INVENT phase for session: {state['session_id']}")
        
        state["current_phase"] = InnovationPhase.INVENT
        state["iteration_count"] += 1
        
        # Generate solution concepts based on identified needs
        prioritized_needs = sorted(
            state["identified_needs"],
            key=lambda x: x.get("priority_score", 0),
            reverse=True
        )[:5]  # Focus on top 5 needs
        
        for need in prioritized_needs:
            try:
                # Generate solutions using AI and research
                solutions = await self._generate_solution_concepts(need, state["session_id"])
                state["solution_concepts"].extend(solutions)
                
            except Exception as e:
                logger.error(f"Error generating solutions for need {need.get('id')}: {str(e)}")
        
        # Technical feasibility assessment
        for solution in state["solution_concepts"]:
            try:
                feasibility = await self._assess_technical_feasibility(solution)
                solution["technical_feasibility"] = feasibility
                
            except Exception as e:
                logger.error(f"Error assessing feasibility: {str(e)}")
        
        # Multi-agent debate on solutions
        if len(state["solution_concepts"]) > 0:
            debate_summary = await self._simulate_agent_debate(
                state["solution_concepts"],
                "solution_evaluation"
            )
            
            state["agent_messages"].append(
                AIMessage(content=f"Solution debate completed: {debate_summary}")
            )
        
        # Update progress
        state["phase_progress"]["invent"] = min(
            0.2 + (len(state["solution_concepts"]) * 0.15),
            1.0
        )
        
        return state
    
    async def _evaluate_invent_phase(self, state: WorkflowState) -> WorkflowState:
        """Evaluate the INVENT phase progress and quality"""
        
        logger.info(f"Evaluating INVENT phase for session: {state['session_id']}")
        
        solutions = state["solution_concepts"]
        evaluation_criteria = {
            "solution_quantity": len(solutions) >= 2,
            "technical_feasibility": self._assess_solutions_feasibility(solutions),
            "innovation_level": self._assess_innovation_level(solutions),
            "market_fit": self._assess_market_fit(solutions),
            "business_viability": self._assess_business_viability(solutions)
        }
        
        readiness_score = sum(evaluation_criteria.values()) / len(evaluation_criteria)
        
        evaluation_summary = {
            "phase": "invent",
            "readiness_score": readiness_score,
            "criteria": evaluation_criteria,
            "recommendations": self._generate_invent_recommendations(evaluation_criteria),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        state["decision_gates"].append(evaluation_summary)
        
        return state
    
    async def _invent_decision_gate(self, state: WorkflowState) -> WorkflowState:
        """Decision gate for INVENT phase"""
        
        latest_evaluation = state["decision_gates"][-1] if state["decision_gates"] else {}
        readiness_score = latest_evaluation.get("readiness_score", 0.0)
        iteration_count = state["iteration_count"]
        max_iterations = state["max_iterations"]
        
        if readiness_score >= 0.7:
            state["next_action"] = "proceed_to_implement"
        elif readiness_score < 0.4:
            state["next_action"] = "back_to_identify"
        elif iteration_count < max_iterations:
            state["next_action"] = "continue_invent"
        else:
            state["next_action"] = "end_session"
        
        return state
    
    def _invent_gate_condition(self, state: WorkflowState) -> str:
        """Condition function for INVENT phase decision gate"""
        return state.get("next_action", "end_session")
    
    async def _execute_implement_phase(self, state: WorkflowState) -> WorkflowState:
        """Execute the IMPLEMENT phase - business strategy and go-to-market"""
        
        logger.info(f"Executing IMPLEMENT phase for session: {state['session_id']}")
        
        state["current_phase"] = InnovationPhase.IMPLEMENT
        state["iteration_count"] += 1
        
        # Select top solutions for implementation planning
        top_solutions = sorted(
            state["solution_concepts"],
            key=lambda x: x.get("overall_score", 0),
            reverse=True
        )[:3]
        
        for solution in top_solutions:
            try:
                # Create comprehensive implementation plan
                impl_plan = await self._create_implementation_plan(solution, state["session_id"])
                state["implementation_plans"].append(impl_plan)
                
            except Exception as e:
                logger.error(f"Error creating implementation plan: {str(e)}")
        
        # Update progress
        state["phase_progress"]["implement"] = min(
            0.2 + (len(state["implementation_plans"]) * 0.25),
            1.0
        )
        
        return state
    
    async def _evaluate_implement_phase(self, state: WorkflowState) -> WorkflowState:
        """Evaluate the IMPLEMENT phase progress and quality"""
        
        logger.info(f"Evaluating IMPLEMENT phase for session: {state['session_id']}")
        
        plans = state["implementation_plans"]
        evaluation_criteria = {
            "plan_completeness": self._assess_plan_completeness(plans),
            "regulatory_readiness": self._assess_regulatory_readiness(plans),
            "commercial_viability": self._assess_commercial_viability(plans),
            "risk_assessment": self._assess_risk_management(plans),
            "timeline_feasibility": self._assess_timeline_feasibility(plans)
        }
        
        readiness_score = sum(evaluation_criteria.values()) / len(evaluation_criteria)
        
        evaluation_summary = {
            "phase": "implement",
            "readiness_score": readiness_score,
            "criteria": evaluation_criteria,
            "recommendations": self._generate_implement_recommendations(evaluation_criteria),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        state["decision_gates"].append(evaluation_summary)
        
        return state
    
    async def _final_decision(self, state: WorkflowState) -> WorkflowState:
        """Final go/no-go decision for the innovation"""
        
        latest_evaluation = state["decision_gates"][-1] if state["decision_gates"] else {}
        readiness_score = latest_evaluation.get("readiness_score", 0.0)
        
        if readiness_score >= 0.8:
            state["next_action"] = "complete_session"
            decision = "GO"
        elif readiness_score >= 0.6:
            state["next_action"] = "continue_implement"
            decision = "CONDITIONAL_GO"
        elif readiness_score >= 0.4:
            state["next_action"] = "back_to_invent"
            decision = "PIVOT"
        else:
            state["next_action"] = "complete_session"
            decision = "NO_GO"
        
        state["final_decision"] = {
            "decision": decision,
            "rationale": f"Based on readiness score of {readiness_score:.2f}",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return state
    
    def _final_decision_condition(self, state: WorkflowState) -> str:
        """Condition function for final decision"""
        return state.get("next_action", "complete_session")
    
    async def _generate_reports(self, state: WorkflowState) -> WorkflowState:
        """Generate final reports and visualizations"""
        
        logger.info(f"Generating reports for session: {state['session_id']}")
        
        # Generate comprehensive session report
        report = {
            "session_id": state["session_id"],
            "completion_time": datetime.utcnow().isoformat(),
            "phase_progress": state["phase_progress"],
            "identified_needs": len(state["identified_needs"]),
            "solution_concepts": len(state["solution_concepts"]),
            "implementation_plans": len(state["implementation_plans"]),
            "decision_gates": state["decision_gates"],
            "final_decision": state.get("final_decision"),
            "iterations": state["iteration_count"]
        }
        
        # Generate visualizations
        try:
            workflow_diagram = await self.mermaid_service.generate_diagram(
                state["session_id"],
                "phase_workflow",
                state["current_phase"]
            )
            report["workflow_diagram"] = workflow_diagram.dict()
            
        except Exception as e:
            logger.error(f"Error generating workflow diagram: {str(e)}")
        
        state["final_report"] = report
        
        state["agent_messages"].append(
            AIMessage(content=f"Innovation session completed. Final report generated.")
        )
        
        return state
    
    # Helper methods for assessment and generation
    async def _extract_needs_from_research(self, research_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract needs from market research data"""
        # Simplified implementation - would use more sophisticated NLP
        needs = []
        if research_data and "content" in research_data:
            # Extract key phrases that indicate needs
            content = research_data["content"]
            need_indicators = ["unmet need", "challenge", "problem", "gap", "limitation"]
            
            for indicator in need_indicators:
                if indicator in content.lower():
                    needs.append({
                        "id": f"need_{len(needs) + 1}",
                        "title": f"Market Need - {indicator.title()}",
                        "description": f"Identified from market research: {indicator}",
                        "source": "market_research",
                        "priority_score": 0.7,
                        "evidence_strength": "medium"
                    })
        
        return needs[:3]  # Limit to top 3
    
    async def _extract_needs_from_clinical(self, clinical_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract needs from clinical evidence"""
        needs = []
        for i, doc in enumerate(clinical_data[:2]):  # Limit processing
            needs.append({
                "id": f"clinical_need_{i + 1}",
                "title": f"Clinical Need {i + 1}",
                "description": f"Identified from clinical evidence: {doc.get('title', 'Unknown')}",
                "source": "clinical_evidence",
                "priority_score": 0.8,
                "evidence_strength": "high"
            })
        
        return needs
    
    async def _simulate_agent_debate(self, items: List[Dict[str, Any]], debate_type: str) -> str:
        """Simulate multi-agent debate (simplified)"""
        # In full implementation, would orchestrate actual agent interactions
        return f"Multi-agent debate on {debate_type} completed with {len(items)} items. Consensus reached on prioritization."
    
    async def _generate_solution_concepts(self, need: Dict[str, Any], session_id: str) -> List[Dict[str, Any]]:
        """Generate solution concepts for a specific need"""
        # Simplified solution generation
        solutions = []
        for i in range(2):  # Generate 2 solutions per need
            solutions.append({
                "id": f"solution_{need['id']}_{i + 1}",
                "title": f"Solution for {need['title']} - Approach {i + 1}",
                "description": f"Innovative solution addressing {need['description']}",
                "need_id": need["id"],
                "innovation_level": 0.7,
                "technical_complexity": 0.6,
                "market_potential": 0.8,
                "overall_score": 0.7
            })
        
        return solutions
    
    async def _assess_technical_feasibility(self, solution: Dict[str, Any]) -> Dict[str, Any]:
        """Assess technical feasibility of a solution"""
        return {
            "feasibility_score": 0.75,
            "development_time": "12-18 months",
            "technical_risks": ["Integration complexity", "Scalability challenges"],
            "required_expertise": ["Software development", "Medical device design"],
            "estimated_cost": "500K-1M USD"
        }
    
    async def _create_implementation_plan(self, solution: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Create comprehensive implementation plan"""
        return {
            "solution_id": solution["id"],
            "business_model": "B2B SaaS with hardware component",
            "go_to_market": "Direct sales to hospitals",
            "regulatory_pathway": "FDA 510(k) clearance",
            "timeline": "24 months to market",
            "funding_required": "2-5M USD",
            "key_milestones": [
                "Prototype development (6 months)",
                "Clinical validation (12 months)",
                "Regulatory submission (18 months)",
                "Market launch (24 months)"
            ],
            "risk_factors": ["Regulatory delays", "Market competition", "Technology adoption"]
        }
    
    # Assessment helper methods
    def _assess_needs_quality(self, needs: List[Dict[str, Any]]) -> float:
        """Assess quality of identified needs"""
        if not needs:
            return 0.0
        
        quality_scores = []
        for need in needs:
            score = 0.0
            if need.get("description") and len(need["description"]) > 50:
                score += 0.3
            if need.get("evidence_strength") in ["high", "medium"]:
                score += 0.4
            if need.get("priority_score", 0) > 0.5:
                score += 0.3
            quality_scores.append(score)
        
        return sum(quality_scores) / len(quality_scores)
    
    def _assess_stakeholder_coverage(self, needs: List[Dict[str, Any]]) -> float:
        """Assess stakeholder coverage in needs"""
        # Simplified assessment
        return 0.7 if len(needs) >= 3 else 0.4
    
    def _assess_evidence_support(self, needs: List[Dict[str, Any]]) -> float:
        """Assess evidence support for needs"""
        if not needs:
            return 0.0
        
        evidence_count = sum(1 for need in needs if need.get("evidence_strength") == "high")
        return min(evidence_count / len(needs), 1.0)
    
    def _assess_market_validation(self, needs: List[Dict[str, Any]]) -> float:
        """Assess market validation of needs"""
        market_needs = [need for need in needs if need.get("source") == "market_research"]
        return 0.8 if market_needs else 0.3
    
    def _assess_solutions_feasibility(self, solutions: List[Dict[str, Any]]) -> float:
        """Assess overall feasibility of solutions"""
        if not solutions:
            return 0.0
        
        feasibility_scores = [s.get("technical_complexity", 0.5) for s in solutions]
        return 1.0 - (sum(feasibility_scores) / len(feasibility_scores))  # Lower complexity = higher feasibility
    
    def _assess_innovation_level(self, solutions: List[Dict[str, Any]]) -> float:
        """Assess innovation level of solutions"""
        if not solutions:
            return 0.0
        
        innovation_scores = [s.get("innovation_level", 0.5) for s in solutions]
        return sum(innovation_scores) / len(innovation_scores)
    
    def _assess_market_fit(self, solutions: List[Dict[str, Any]]) -> float:
        """Assess market fit of solutions"""
        if not solutions:
            return 0.0
        
        market_scores = [s.get("market_potential", 0.5) for s in solutions]
        return sum(market_scores) / len(market_scores)
    
    def _assess_business_viability(self, solutions: List[Dict[str, Any]]) -> float:
        """Assess business viability of solutions"""
        if not solutions:
            return 0.0
        
        viability_scores = [s.get("overall_score", 0.5) for s in solutions]
        return sum(viability_scores) / len(viability_scores)
    
    def _assess_plan_completeness(self, plans: List[Dict[str, Any]]) -> float:
        """Assess completeness of implementation plans"""
        if not plans:
            return 0.0
        
        required_elements = ["business_model", "go_to_market", "regulatory_pathway", "timeline", "funding_required"]
        completeness_scores = []
        
        for plan in plans:
            score = sum(1 for element in required_elements if element in plan) / len(required_elements)
            completeness_scores.append(score)
        
        return sum(completeness_scores) / len(completeness_scores)
    
    def _assess_regulatory_readiness(self, plans: List[Dict[str, Any]]) -> float:
        """Assess regulatory readiness"""
        regulatory_plans = [p for p in plans if "regulatory_pathway" in p]
        return 0.8 if regulatory_plans else 0.3
    
    def _assess_commercial_viability(self, plans: List[Dict[str, Any]]) -> float:
        """Assess commercial viability"""
        commercial_plans = [p for p in plans if "business_model" in p and "go_to_market" in p]
        return 0.75 if commercial_plans else 0.4
    
    def _assess_risk_management(self, plans: List[Dict[str, Any]]) -> float:
        """Assess risk management in plans"""
        risk_plans = [p for p in plans if "risk_factors" in p]
        return 0.7 if risk_plans else 0.3
    
    def _assess_timeline_feasibility(self, plans: List[Dict[str, Any]]) -> float:
        """Assess timeline feasibility"""
        timeline_plans = [p for p in plans if "timeline" in p and "key_milestones" in p]
        return 0.8 if timeline_plans else 0.4
    
    def _generate_identify_recommendations(self, criteria: Dict[str, Any]) -> List[str]:
        """Generate recommendations for IDENTIFY phase"""
        recommendations = []
        
        if not criteria.get("needs_quantity"):
            recommendations.append("Gather more diverse needs through additional research")
        if not criteria.get("evidence_support"):
            recommendations.append("Strengthen evidence base with clinical studies")
        if not criteria.get("stakeholder_coverage"):
            recommendations.append("Expand stakeholder interviews and feedback")
        
        return recommendations or ["Continue to INVENT phase"]
    
    def _generate_invent_recommendations(self, criteria: Dict[str, Any]) -> List[str]:
        """Generate recommendations for INVENT phase"""
        recommendations = []
        
        if not criteria.get("technical_feasibility"):
            recommendations.append("Conduct deeper technical analysis")
        if not criteria.get("innovation_level"):
            recommendations.append("Explore more innovative approaches")
        if not criteria.get("business_viability"):
            recommendations.append("Refine business model and value proposition")
        
        return recommendations or ["Continue to IMPLEMENT phase"]
    
    def _generate_implement_recommendations(self, criteria: Dict[str, Any]) -> List[str]:
        """Generate recommendations for IMPLEMENT phase"""
        recommendations = []
        
        if not criteria.get("regulatory_readiness"):
            recommendations.append("Develop comprehensive regulatory strategy")
        if not criteria.get("commercial_viability"):
            recommendations.append("Strengthen commercial and business planning")
        if not criteria.get("risk_assessment"):
            recommendations.append("Conduct thorough risk analysis and mitigation planning")
        
        return recommendations or ["Ready for final decision"]

    async def run_workflow(
        self,
        session_id: str,
        initial_data: Dict[str, Any],
        max_iterations: int = 10
    ) -> Dict[str, Any]:
        """Run the complete workflow for an innovation session"""
        
        # Initialize state
        initial_state = WorkflowState(
            session_id=session_id,
            current_phase=InnovationPhase.IDENTIFY,
            session_data=initial_data,
            identified_needs=[],
            solution_concepts=[],
            implementation_plans=[],
            stakeholder_feedback=[],
            agent_messages=[],
            phase_progress={},
            decision_gates=[],
            next_action=None,
            iteration_count=0,
            max_iterations=max_iterations
        )
        
        try:
            # Execute the workflow
            final_state = await self.workflow.ainvoke(initial_state)
            
            return {
                "session_id": session_id,
                "success": True,
                "final_state": final_state,
                "final_report": final_state.get("final_report"),
                "phase_progress": final_state.get("phase_progress"),
                "decision_gates": final_state.get("decision_gates"),
                "final_decision": final_state.get("final_decision")
            }
            
        except Exception as e:
            logger.error(f"Workflow execution error: {str(e)}")
            return {
                "session_id": session_id,
                "success": False,
                "error": str(e),
                "partial_state": initial_state
            }
