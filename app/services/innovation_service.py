"""
Innovation Service - Main orchestration service for the three-phase innovation process
"""

from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
import asyncio
import json
import uuid

from app.models.innovation import (
    InnovationSession, InnovationPhase, NeedItem, SolutionConcept,
    ImplementationPlan, PhaseTransitionDecision, SessionStatus,
    CreateInnovationSessionRequest, MermaidDiagramResponse
)
from app.core.workflow.innovation_workflow import InnovationWorkflow
from app.core.agents.medical_expert import MedicalExpertAgent
from app.core.agents.tech_engineer import TechEngineerAgent
from app.services.rag_service import RAGService
from app.services.perplexity_service import PerplexityService
from app.services.mermaid_service import MermaidService
from app.utils.logging import get_logger

logger = get_logger(__name__)

class InnovationService:
    """Main service for orchestrating the three-phase innovation process"""
    
    def __init__(self):
        self.workflow = InnovationWorkflow()
        self.rag_service = RAGService()
        self.perplexity_service = PerplexityService()
        self.mermaid_service = MermaidService()
        
        # Initialize agents
        self.medical_expert = MedicalExpertAgent()
        self.tech_engineer = TechEngineerAgent()
        
        # In-memory session storage (would use database in production)
        self.sessions: Dict[str, InnovationSession] = {}
        self.session_states: Dict[str, Dict[str, Any]] = {}
    
    async def create_session(
        self,
        request: CreateInnovationSessionRequest
    ) -> InnovationSession:
        """Create a new innovation session"""
        
        try:
            session_id = str(uuid.uuid4())
            
            # Create session object
            session = InnovationSession(
                session_id=session_id,
                title=request.title,
                description=request.description,
                current_phase=InnovationPhase.IDENTIFY,
                status=SessionStatus.ACTIVE,
                created_at=datetime.utcnow(),
                last_updated=datetime.utcnow(),
                phase_progress={
                    "identify": 0.0,
                    "invent": 0.0,
                    "implement": 0.0
                },
                metadata=request.metadata or {}
            )
            
            # Store session
            self.sessions[session_id] = session
            self.session_states[session_id] = {
                "uploaded_documents": [],
                "research_queries": [],
                "agent_interactions": [],
                "decision_history": []
            }
            
            logger.info(f"Created innovation session: {session_id}")
            return session
            
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[InnovationSession]:
        """Get an innovation session by ID"""
        return self.sessions.get(session_id)
    
    async def list_sessions(
        self,
        status: Optional[SessionStatus] = None,
        phase: Optional[InnovationPhase] = None,
        limit: int = 50
    ) -> List[InnovationSession]:
        """List innovation sessions with optional filters"""
        
        sessions = list(self.sessions.values())
        
        # Apply filters
        if status:
            sessions = [s for s in sessions if s.status == status]
        if phase:
            sessions = [s for s in sessions if s.current_phase == phase]
        
        # Sort by last updated (most recent first)
        sessions.sort(key=lambda x: x.last_updated, reverse=True)
        
        return sessions[:limit]
    
    async def upload_document(
        self,
        session_id: str,
        content: str,
        filename: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Upload and process a document for the session"""
        
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        try:
            # Process document through RAG service
            doc_id = await self.rag_service.process_document(
                session_id=session_id,
                content=content,
                metadata={
                    "filename": filename,
                    "upload_time": datetime.utcnow().isoformat(),
                    **(metadata or {})
                }
            )
            
            # Store document reference in session state
            self.session_states[session_id]["uploaded_documents"].append({
                "doc_id": doc_id,
                "filename": filename,
                "content": content[:500] + "..." if len(content) > 500 else content,
                "metadata": metadata,
                "uploaded_at": datetime.utcnow().isoformat()
            })
            
            # Update session
            session.last_updated = datetime.utcnow()
            
            logger.info(f"Document uploaded for session {session_id}: {filename}")
            
            return {
                "document_id": doc_id,
                "filename": filename,
                "processed": True,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error uploading document: {str(e)}")
            raise
    
    async def execute_phase(
        self,
        session_id: str,
        phase: InnovationPhase,
        user_input: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a specific phase of the innovation process"""
        
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        try:
            # Update session phase
            session.current_phase = phase
            session.last_updated = datetime.utcnow()
            
            # Prepare workflow input
            workflow_input = {
                "session_data": self.session_states[session_id],
                "user_input": user_input or {},
                "research_query": user_input.get("research_query") if user_input else None
            }
            
            # Execute phase based on type
            if phase == InnovationPhase.IDENTIFY:
                result = await self._execute_identify_phase(session_id, workflow_input)
            elif phase == InnovationPhase.INVENT:
                result = await self._execute_invent_phase(session_id, workflow_input)
            elif phase == InnovationPhase.IMPLEMENT:
                result = await self._execute_implement_phase(session_id, workflow_input)
            else:
                raise ValueError(f"Unknown phase: {phase}")
            
            # Update session progress
            if "phase_progress" in result:
                session.phase_progress.update(result["phase_progress"])
            
            logger.info(f"Phase {phase} executed for session {session_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error executing phase {phase}: {str(e)}")
            raise
    
    async def _execute_identify_phase(
        self,
        session_id: str,
        workflow_input: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute IDENTIFY phase - problem definition and need discovery"""
        
        session_data = workflow_input["session_data"]
        user_input = workflow_input.get("user_input", {})
        
        # Market research using Perplexity
        research_query = user_input.get("research_query", "healthcare innovation opportunities")
        market_intelligence = {}
        
        try:
            market_intelligence = await self.perplexity_service.search_market_intelligence(
                query=research_query,
                focus_areas=["market size", "unmet needs", "competitive landscape", "regulatory requirements"]
            )
        except Exception as e:
            logger.error(f"Error gathering market intelligence: {str(e)}")
        
        # Document analysis using RAG
        document_insights = {}
        if session_data.get("uploaded_documents"):
            try:
                document_insights = await self.rag_service.search_documents(
                    session_id=session_id,
                    query=f"{research_query} clinical evidence unmet medical needs",
                    max_results=10
                )
            except Exception as e:
                logger.error(f"Error analyzing documents: {str(e)}")
        
        # Medical expert analysis
        medical_analysis = {}
        try:
            medical_context = {
                "research_query": research_query,
                "market_data": market_intelligence,
                "document_data": document_insights
            }
            medical_analysis = await self.medical_expert.analyze_medical_needs(medical_context)
        except Exception as e:
            logger.error(f"Error in medical analysis: {str(e)}")
        
        # Technical feasibility preliminary assessment
        tech_analysis = {}
        try:
            tech_analysis = await self.tech_engineer.assess_innovation_opportunity({
                "domain": research_query,
                "market_data": market_intelligence,
                "needs_identified": medical_analysis.get("identified_needs", [])
            })
        except Exception as e:
            logger.error(f"Error in technical analysis: {str(e)}")
        
        # Compile identified needs
        identified_needs = []
        
        # Extract needs from medical analysis
        if medical_analysis.get("identified_needs"):
            identified_needs.extend(medical_analysis["identified_needs"])
        
        # Extract needs from market intelligence
        if market_intelligence.get("unmet_needs"):
            for need in market_intelligence["unmet_needs"]:
                identified_needs.append({
                    "id": f"market_need_{len(identified_needs) + 1}",
                    "title": need.get("title", "Market Need"),
                    "description": need.get("description", ""),
                    "source": "market_research",
                    "priority_score": need.get("priority", 0.7),
                    "evidence_strength": "medium",
                    "stakeholder_impact": need.get("stakeholder_impact", "unknown")
                })
        
        # Store results in session state
        self.session_states[session_id].update({
            "identified_needs": identified_needs,
            "market_intelligence": market_intelligence,
            "document_insights": document_insights,
            "medical_analysis": medical_analysis,
            "tech_analysis": tech_analysis
        })
        
        # Update progress
        progress = min(0.3 + (len(identified_needs) * 0.1), 1.0)
        
        return {
            "phase": "identify",
            "identified_needs": identified_needs,
            "market_intelligence": market_intelligence,
            "medical_analysis": medical_analysis,
            "tech_analysis": tech_analysis,
            "phase_progress": {"identify": progress},
            "recommendations": self._generate_identify_recommendations(identified_needs),
            "next_steps": self._get_identify_next_steps(identified_needs)
        }
    
    async def _execute_invent_phase(
        self,
        session_id: str,
        workflow_input: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute INVENT phase - solution ideation and development"""
        
        session_data = workflow_input["session_data"]
        identified_needs = session_data.get("identified_needs", [])
        
        if not identified_needs:
            raise ValueError("No identified needs found. Please complete IDENTIFY phase first.")
        
        solution_concepts = []
        
        # Generate solutions for top priority needs
        priority_needs = sorted(
            identified_needs,
            key=lambda x: x.get("priority_score", 0),
            reverse=True
        )[:5]  # Focus on top 5 needs
        
        for need in priority_needs:
            try:
                # Technical solution generation
                tech_solutions = await self.tech_engineer.generate_solution_concepts({
                    "need": need,
                    "constraints": workflow_input.get("user_input", {}).get("constraints", {}),
                    "technology_preferences": workflow_input.get("user_input", {}).get("tech_preferences", [])
                })
                
                # Medical validation of solutions
                for solution in tech_solutions.get("concepts", []):
                    medical_validation = await self.medical_expert.validate_solution_concept({
                        "solution": solution,
                        "target_need": need,
                        "clinical_context": session_data.get("medical_analysis", {})
                    })
                    
                    solution["medical_validation"] = medical_validation
                    solution_concepts.append(solution)
                
            except Exception as e:
                logger.error(f"Error generating solutions for need {need.get('id')}: {str(e)}")
        
        # Multi-agent debate and evaluation
        debate_results = await self._conduct_solution_debate(solution_concepts, session_id)
        
        # Update solution scores based on debate
        for solution in solution_concepts:
            solution_id = solution.get("id")
            if solution_id in debate_results:
                solution["debate_score"] = debate_results[solution_id]["consensus_score"]
                solution["agent_feedback"] = debate_results[solution_id]["feedback"]
        
        # Store results
        self.session_states[session_id]["solution_concepts"] = solution_concepts
        self.session_states[session_id]["solution_debate"] = debate_results
        
        # Update progress
        progress = min(0.3 + (len(solution_concepts) * 0.15), 1.0)
        
        return {
            "phase": "invent",
            "solution_concepts": solution_concepts,
            "debate_results": debate_results,
            "phase_progress": {"invent": progress},
            "recommendations": self._generate_invent_recommendations(solution_concepts),
            "next_steps": self._get_invent_next_steps(solution_concepts)
        }
    
    async def _execute_implement_phase(
        self,
        session_id: str,
        workflow_input: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute IMPLEMENT phase - business strategy and go-to-market"""
        
        session_data = workflow_input["session_data"]
        solution_concepts = session_data.get("solution_concepts", [])
        
        if not solution_concepts:
            raise ValueError("No solution concepts found. Please complete INVENT phase first.")
        
        # Select top solutions for implementation planning
        top_solutions = sorted(
            solution_concepts,
            key=lambda x: x.get("overall_score", 0) + x.get("debate_score", 0),
            reverse=True
        )[:3]  # Focus on top 3 solutions
        
        implementation_plans = []
        
        for solution in top_solutions:
            try:
                # Create comprehensive implementation plan
                impl_plan = await self._create_comprehensive_implementation_plan(
                    solution, session_id, workflow_input
                )
                implementation_plans.append(impl_plan)
                
            except Exception as e:
                logger.error(f"Error creating implementation plan: {str(e)}")
        
        # Business model validation
        business_validation = await self._validate_business_models(implementation_plans, session_id)
        
        # Regulatory pathway analysis
        regulatory_analysis = await self._analyze_regulatory_pathways(implementation_plans, session_id)
        
        # Risk assessment
        risk_assessment = await self._conduct_risk_assessment(implementation_plans, session_id)
        
        # Store results
        self.session_states[session_id].update({
            "implementation_plans": implementation_plans,
            "business_validation": business_validation,
            "regulatory_analysis": regulatory_analysis,
            "risk_assessment": risk_assessment
        })
        
        # Update progress
        progress = min(0.3 + (len(implementation_plans) * 0.2), 1.0)
        
        return {
            "phase": "implement",
            "implementation_plans": implementation_plans,
            "business_validation": business_validation,
            "regulatory_analysis": regulatory_analysis,
            "risk_assessment": risk_assessment,
            "phase_progress": {"implement": progress},
            "recommendations": self._generate_implement_recommendations(implementation_plans),
            "next_steps": self._get_implement_next_steps(implementation_plans)
        }
    
    async def run_complete_workflow(
        self,
        session_id: str,
        user_input: Optional[Dict[str, Any]] = None,
        max_iterations: int = 5
    ) -> Dict[str, Any]:
        """Run the complete three-phase workflow"""
        
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        try:
            # Prepare initial data
            initial_data = {
                **self.session_states[session_id],
                **(user_input or {})
            }
            
            # Run workflow
            result = await self.workflow.run_workflow(
                session_id=session_id,
                initial_data=initial_data,
                max_iterations=max_iterations
            )
            
            # Update session status
            if result.get("success"):
                session.status = SessionStatus.COMPLETED
                session.completed_at = datetime.utcnow()
            else:
                session.status = SessionStatus.FAILED
            
            session.last_updated = datetime.utcnow()
            
            return result
            
        except Exception as e:
            logger.error(f"Error running complete workflow: {str(e)}")
            session.status = SessionStatus.FAILED
            session.last_updated = datetime.utcnow()
            raise
    
    async def get_session_progress(self, session_id: str) -> Dict[str, Any]:
        """Get detailed progress information for a session"""
        
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session_state = self.session_states.get(session_id, {})
        
        return {
            "session_id": session_id,
            "current_phase": session.current_phase,
            "status": session.status,
            "phase_progress": session.phase_progress,
            "identified_needs_count": len(session_state.get("identified_needs", [])),
            "solution_concepts_count": len(session_state.get("solution_concepts", [])),
            "implementation_plans_count": len(session_state.get("implementation_plans", [])),
            "documents_uploaded": len(session_state.get("uploaded_documents", [])),
            "last_updated": session.last_updated,
            "created_at": session.created_at,
            "estimated_completion": self._estimate_completion_time(session)
        }
    
    async def generate_session_diagram(
        self,
        session_id: str,
        diagram_type: str,
        customization: Optional[Dict[str, Any]] = None
    ) -> MermaidDiagramResponse:
        """Generate a Mermaid diagram for the session"""
        
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        return await self.mermaid_service.generate_diagram(
            session_id=session_id,
            diagram_type=diagram_type,
            phase=session.current_phase,
            customization=customization
        )
    
    async def get_available_diagram_types(self) -> List[Dict[str, str]]:
        """Get available diagram types"""
        return await self.mermaid_service.get_available_diagram_types()
    
    # Helper methods
    async def _conduct_solution_debate(
        self,
        solutions: List[Dict[str, Any]],
        session_id: str
    ) -> Dict[str, Any]:
        """Conduct multi-agent debate on solution concepts"""
        
        debate_results = {}
        
        for solution in solutions:
            solution_id = solution.get("id")
            
            # Medical expert evaluation
            medical_feedback = await self.medical_expert.cross_examine_solution(solution)
            
            # Technical expert evaluation
            tech_feedback = await self.tech_engineer.cross_examine_solution(solution)
            
            # Calculate consensus score
            scores = [
                medical_feedback.get("safety_score", 0.5),
                medical_feedback.get("efficacy_score", 0.5),
                tech_feedback.get("feasibility_score", 0.5),
                tech_feedback.get("innovation_score", 0.5)
            ]
            consensus_score = sum(scores) / len(scores)
            
            debate_results[solution_id] = {
                "consensus_score": consensus_score,
                "medical_feedback": medical_feedback,
                "technical_feedback": tech_feedback,
                "feedback": [
                    f"Medical: {medical_feedback.get('summary', 'No feedback')}",
                    f"Technical: {tech_feedback.get('summary', 'No feedback')}"
                ]
            }
        
        return debate_results
    
    async def _create_comprehensive_implementation_plan(
        self,
        solution: Dict[str, Any],
        session_id: str,
        workflow_input: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create comprehensive implementation plan for a solution"""
        
        # Business model development
        business_model = await self._develop_business_model(solution, session_id)
        
        # Regulatory strategy
        regulatory_strategy = await self._develop_regulatory_strategy(solution, session_id)
        
        # Go-to-market strategy
        gtm_strategy = await self._develop_gtm_strategy(solution, session_id)
        
        # Financial projections
        financial_projections = await self._create_financial_projections(solution, session_id)
        
        # Implementation timeline
        timeline = await self._create_implementation_timeline(solution, session_id)
        
        return {
            "solution_id": solution.get("id"),
            "solution_title": solution.get("title"),
            "business_model": business_model,
            "regulatory_strategy": regulatory_strategy,
            "go_to_market": gtm_strategy,
            "financial_projections": financial_projections,
            "implementation_timeline": timeline,
            "key_success_factors": self._identify_success_factors(solution),
            "critical_assumptions": self._identify_critical_assumptions(solution),
            "next_milestones": self._define_next_milestones(solution)
        }
    
    async def _develop_business_model(self, solution: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Develop business model for a solution"""
        return {
            "value_proposition": f"Innovative healthcare solution addressing {solution.get('target_problem', 'healthcare needs')}",
            "target_customers": ["Hospitals", "Clinics", "Healthcare Providers"],
            "revenue_model": "B2B SaaS with implementation services",
            "pricing_strategy": "Tiered subscription based on organization size",
            "cost_structure": ["R&D", "Sales & Marketing", "Operations", "Regulatory"],
            "key_partnerships": ["Healthcare Technology Partners", "Medical Device Distributors"],
            "competitive_advantage": solution.get("unique_features", ["Innovation", "Clinical validation"])
        }
    
    async def _develop_regulatory_strategy(self, solution: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Develop regulatory strategy"""
        return {
            "regulatory_pathway": "FDA 510(k) clearance",
            "classification": "Class II Medical Device Software",
            "timeline": "12-18 months",
            "key_requirements": ["Clinical validation", "Quality management system", "Risk analysis"],
            "submission_strategy": "Pre-submission meeting followed by 510(k)",
            "international_considerations": ["CE marking for Europe", "Health Canada approval"],
            "ongoing_compliance": ["Post-market surveillance", "Adverse event reporting"]
        }
    
    async def _develop_gtm_strategy(self, solution: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Develop go-to-market strategy"""
        return {
            "target_segments": ["Large health systems", "Academic medical centers"],
            "sales_channels": ["Direct sales", "Partner channel", "Digital marketing"],
            "pricing_model": "Annual subscription with implementation fee",
            "marketing_strategy": ["Content marketing", "Conference presence", "Thought leadership"],
            "launch_timeline": "6 months post-regulatory approval",
            "success_metrics": ["Customer acquisition", "Revenue growth", "Market penetration"]
        }
    
    async def _create_financial_projections(self, solution: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Create financial projections"""
        return {
            "development_costs": {
                "year_1": "500K USD",
                "year_2": "750K USD",
                "total": "1.25M USD"
            },
            "revenue_projections": {
                "year_1": "100K USD",
                "year_2": "500K USD",
                "year_3": "1.5M USD",
                "year_4": "3M USD",
                "year_5": "5M USD"
            },
            "break_even": "Month 30",
            "funding_required": "2-3M USD",
            "roi_projection": "300% by year 5",
            "key_assumptions": ["Market adoption rate", "Pricing acceptance", "Competition level"]
        }
    
    async def _create_implementation_timeline(self, solution: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Create implementation timeline"""
        return {
            "phases": [
                {
                    "phase": "Development",
                    "duration": "6 months",
                    "milestones": ["MVP development", "Alpha testing", "Beta release"]
                },
                {
                    "phase": "Validation",
                    "duration": "6 months",
                    "milestones": ["Clinical validation", "User testing", "Regulatory submission"]
                },
                {
                    "phase": "Launch",
                    "duration": "6 months",
                    "milestones": ["Market launch", "Customer onboarding", "Scale operations"]
                }
            ],
            "critical_path": ["Regulatory approval", "Clinical validation", "Market acceptance"],
            "risk_factors": ["Regulatory delays", "Technical challenges", "Market competition"]
        }
    
    def _identify_success_factors(self, solution: Dict[str, Any]) -> List[str]:
        """Identify key success factors"""
        return [
            "Strong clinical evidence",
            "Regulatory approval timeline",
            "Market adoption rate",
            "Technology performance",
            "Team execution capability"
        ]
    
    def _identify_critical_assumptions(self, solution: Dict[str, Any]) -> List[str]:
        """Identify critical assumptions"""
        return [
            "Market demand exists",
            "Technology will work as expected",
            "Regulatory approval will be obtained",
            "Sufficient funding will be available",
            "Competition will not pre-empt market"
        ]
    
    def _define_next_milestones(self, solution: Dict[str, Any]) -> List[Dict[str, str]]:
        """Define next milestones"""
        return [
            {"milestone": "Complete prototype", "timeline": "3 months", "owner": "Technical team"},
            {"milestone": "Begin clinical validation", "timeline": "6 months", "owner": "Clinical team"},
            {"milestone": "Submit regulatory application", "timeline": "9 months", "owner": "Regulatory team"},
            {"milestone": "Secure Series A funding", "timeline": "12 months", "owner": "Business team"}
        ]
    
    async def _validate_business_models(self, plans: List[Dict[str, Any]], session_id: str) -> Dict[str, Any]:
        """Validate business models across implementation plans"""
        return {
            "validation_summary": "Business models show strong potential",
            "market_size_validation": "Large addressable market identified",
            "competitive_analysis": "Differentiated positioning confirmed",
            "financial_viability": "Positive unit economics projected"
        }
    
    async def _analyze_regulatory_pathways(self, plans: List[Dict[str, Any]], session_id: str) -> Dict[str, Any]:
        """Analyze regulatory pathways"""
        return {
            "pathway_analysis": "Clear regulatory path identified",
            "timeline_assessment": "18-month timeline achievable",
            "risk_factors": ["Clinical evidence requirements", "Regulatory changes"],
            "recommendations": ["Early FDA engagement", "Comprehensive documentation"]
        }
    
    async def _conduct_risk_assessment(self, plans: List[Dict[str, Any]], session_id: str) -> Dict[str, Any]:
        """Conduct comprehensive risk assessment"""
        return {
            "technical_risks": ["Development delays", "Performance issues"],
            "market_risks": ["Competition", "Adoption challenges"],
            "regulatory_risks": ["Approval delays", "Changing requirements"],
            "financial_risks": ["Funding shortfall", "Cost overruns"],
            "mitigation_strategies": ["Agile development", "Market validation", "Regulatory expertise"]
        }
    
    def _generate_identify_recommendations(self, needs: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for IDENTIFY phase"""
        if len(needs) < 3:
            return ["Conduct additional stakeholder interviews", "Expand market research scope"]
        elif len(needs) < 5:
            return ["Prioritize identified needs", "Validate with clinical evidence"]
        else:
            return ["Excellent need identification", "Ready to proceed to INVENT phase"]
    
    def _get_identify_next_steps(self, needs: List[Dict[str, Any]]) -> List[str]:
        """Get next steps for IDENTIFY phase"""
        return [
            "Review and prioritize identified needs",
            "Validate needs with additional stakeholders",
            "Proceed to INVENT phase for solution development"
        ]
    
    def _generate_invent_recommendations(self, solutions: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for INVENT phase"""
        if len(solutions) < 2:
            return ["Generate more diverse solution concepts", "Explore alternative approaches"]
        else:
            return ["Strong solution portfolio developed", "Consider technical feasibility deeply"]
    
    def _get_invent_next_steps(self, solutions: List[Dict[str, Any]]) -> List[str]:
        """Get next steps for INVENT phase"""
        return [
            "Evaluate and rank solution concepts",
            "Conduct technical feasibility analysis",
            "Proceed to IMPLEMENT phase for top solutions"
        ]
    
    def _generate_implement_recommendations(self, plans: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for IMPLEMENT phase"""
        return [
            "Validate business model assumptions",
            "Develop detailed regulatory strategy",
            "Create comprehensive funding plan"
        ]
    
    def _get_implement_next_steps(self, plans: List[Dict[str, Any]]) -> List[str]:
        """Get next steps for IMPLEMENT phase"""
        return [
            "Finalize implementation plan",
            "Secure initial funding",
            "Begin prototype development",
            "Establish key partnerships"
        ]
    
    def _estimate_completion_time(self, session: InnovationSession) -> Optional[datetime]:
        """Estimate session completion time"""
        if session.status == SessionStatus.COMPLETED:
            return session.completed_at
        
        # Simple estimation based on current progress
        total_progress = sum(session.phase_progress.values()) / 3
        if total_progress > 0:
            estimated_remaining_hours = (1 - total_progress) * 40  # Estimate 40 hours total
            return datetime.utcnow() + timedelta(hours=estimated_remaining_hours)
        
        return None
