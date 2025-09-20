"""
Three-phase design thinking data models for biodesign innovation
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from uuid import UUID

class InnovationPhase(str, Enum):
    """Three phases of design thinking innovation process"""
    IDENTIFY = "identify"  # Problem definition & need discovery
    INVENT = "invent"     # Solution ideation & development  
    IMPLEMENT = "implement"  # Business strategy & go-to-market

class PhaseStatus(str, Enum):
    """Status of each phase"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REQUIRES_REVISION = "requires_revision"

class NeedPriority(str, Enum):
    """Priority levels for identified needs"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class SolutionType(str, Enum):
    """Types of solution approaches"""
    PRODUCT = "product"
    SERVICE = "service"
    SUBSCRIPTION = "subscription"
    RENTAL = "rental"
    HYBRID = "hybrid"

class SessionStatus(str, Enum):
    """Status of innovation session"""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DecisionType(str, Enum):
    """Types of phase transition decisions"""
    CONTINUE_PHASE = "continue_phase"
    PROCEED_TO_NEXT = "proceed_to_next"
    RETURN_TO_PREVIOUS = "return_to_previous"
    END_SESSION = "end_session"

# ================== IDENTIFY Phase Models ==================

class StakeholderPerspective(BaseModel):
    """Stakeholder viewpoint on a need"""
    stakeholder_type: str = Field(..., description="Type of stakeholder (patient, clinician, payer, etc.)")
    concerns: List[str] = Field(default=[], description="Primary concerns from this stakeholder")
    priorities: List[str] = Field(default=[], description="Top priorities for this stakeholder")
    impact_assessment: Dict[str, float] = Field(default={}, description="Impact scores for different aspects")
    quotes: List[str] = Field(default=[], description="Supporting quotes or evidence")

class NeedEvaluation(BaseModel):
    """Comprehensive evaluation of an identified need"""
    market_size_score: float = Field(..., ge=0, le=10, description="Size of addressable market (0-10)")
    clinical_significance_score: float = Field(..., ge=0, le=10, description="Clinical importance (0-10)")
    technical_feasibility_score: float = Field(..., ge=0, le=10, description="Technical feasibility (0-10)")
    regulatory_complexity_score: float = Field(..., ge=0, le=10, description="Regulatory complexity (0-10, lower is better)")
    patient_impact_score: float = Field(..., ge=0, le=10, description="Patient quality of life impact (0-10)")
    overall_score: float = Field(..., ge=0, le=10, description="Weighted overall score")
    confidence_interval: Dict[str, float] = Field(default={}, description="Confidence levels for each score")

class NeedItem(BaseModel):
    """Individual unmet medical need identified in IDENTIFY phase"""
    id: str = Field(..., description="Unique identifier for the need")
    title: str = Field(..., min_length=5, max_length=200, description="Concise need title")
    description: str = Field(..., min_length=20, description="Detailed description of the unmet need")
    priority: NeedPriority = Field(default=NeedPriority.MEDIUM)
    
    # Clinical context
    clinical_area: List[str] = Field(default=[], description="Medical specialties/areas involved")
    patient_population: str = Field(..., description="Target patient population")
    current_solutions: List[str] = Field(default=[], description="Existing solutions and their limitations")
    
    # Market context
    market_size_estimate: Optional[str] = Field(None, description="Estimated market size")
    geographic_scope: List[str] = Field(default=[], description="Geographic markets affected")
    
    # Stakeholder input
    stakeholder_perspectives: List[StakeholderPerspective] = Field(default=[])
    evidence_sources: List[str] = Field(default=[], description="Supporting research, interviews, data")
    
    # AI evaluation
    ai_evaluation: Optional[NeedEvaluation] = Field(None)
    agent_consensus: Optional[float] = Field(None, ge=0, le=1, description="Agent consensus level on this need")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ================== INVENT Phase Models ==================

class TechnicalFeasibility(BaseModel):
    """Technical feasibility assessment for a solution"""
    engineering_complexity: float = Field(..., ge=0, le=10, description="Engineering complexity (0-10)")
    manufacturing_feasibility: float = Field(..., ge=0, le=10, description="Manufacturing feasibility (0-10)")
    technology_readiness_level: int = Field(..., ge=1, le=9, description="TRL level (1-9)")
    required_innovations: List[str] = Field(default=[], description="Key innovations needed")
    risk_factors: List[str] = Field(default=[], description="Technical risk factors")
    development_timeline: Optional[str] = Field(None, description="Estimated development timeline")
    resource_requirements: Dict[str, Any] = Field(default={}, description="Required resources and expertise")

class BusinessModel(BaseModel):
    """Business model analysis for a solution"""
    model_type: SolutionType = Field(..., description="Primary business model type")
    value_proposition: str = Field(..., description="Core value proposition")
    target_customers: List[str] = Field(default=[], description="Primary customer segments")
    revenue_streams: List[str] = Field(default=[], description="Revenue generation methods")
    cost_structure: Dict[str, Any] = Field(default={}, description="Major cost components")
    competitive_advantage: List[str] = Field(default=[], description="Competitive differentiators")
    pricing_strategy: Optional[str] = Field(None, description="Pricing approach")
    go_to_market_strategy: Optional[str] = Field(None, description="Market entry strategy")

class SolutionConcept(BaseModel):
    """Solution concept developed in INVENT phase"""
    id: str = Field(..., description="Unique identifier for the solution")
    title: str = Field(..., min_length=5, max_length=200, description="Solution concept title")
    description: str = Field(..., min_length=50, description="Detailed solution description")
    addresses_need_id: str = Field(..., description="ID of the need this solution addresses")
    
    # Technical details
    solution_type: SolutionType = Field(..., description="Type of solution")
    key_features: List[str] = Field(default=[], description="Core features and capabilities")
    technical_approach: str = Field(..., description="High-level technical approach")
    
    # Assessments
    technical_feasibility: Optional[TechnicalFeasibility] = Field(None)
    business_model: Optional[BusinessModel] = Field(None)
    
    # Innovation metrics
    innovation_potential: float = Field(..., ge=0, le=10, description="Innovation potential score (0-10)")
    market_disruption_potential: float = Field(..., ge=0, le=10, description="Market disruption potential (0-10)")
    
    # Risk assessment
    technical_risks: List[str] = Field(default=[], description="Technical development risks")
    market_risks: List[str] = Field(default=[], description="Market adoption risks")
    regulatory_risks: List[str] = Field(default=[], description="Regulatory approval risks")
    
    # Agent evaluation
    agent_consensus: Optional[float] = Field(None, ge=0, le=1, description="Agent consensus level on this solution")
    debate_summary: Optional[str] = Field(None, description="Summary of agent debate about this solution")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ================== IMPLEMENT Phase Models ==================

class RegulatoryPathway(BaseModel):
    """Regulatory pathway and requirements"""
    primary_pathway: str = Field(..., description="Primary regulatory pathway (510k, PMA, etc.)")
    estimated_timeline: str = Field(..., description="Estimated approval timeline")
    key_milestones: List[str] = Field(default=[], description="Critical regulatory milestones")
    required_studies: List[str] = Field(default=[], description="Required clinical/preclinical studies")
    regulatory_risks: List[str] = Field(default=[], description="Regulatory approval risks")
    estimated_cost: Optional[str] = Field(None, description="Estimated regulatory cost")

class GoToMarketStrategy(BaseModel):
    """Comprehensive go-to-market strategy"""
    target_markets: List[str] = Field(default=[], description="Priority geographic markets")
    market_entry_strategy: str = Field(..., description="Market entry approach")
    distribution_channels: List[str] = Field(default=[], description="Distribution strategy")
    pricing_model: str = Field(..., description="Pricing strategy")
    sales_strategy: str = Field(..., description="Sales approach")
    marketing_strategy: str = Field(..., description="Marketing and promotion strategy")
    partnerships: List[str] = Field(default=[], description="Strategic partnerships needed")

class FinancialProjections(BaseModel):
    """Financial projections and business case"""
    development_cost: Dict[str, float] = Field(default={}, description="Development cost breakdown")
    revenue_projections: Dict[str, float] = Field(default={}, description="5-year revenue projections")
    market_penetration: Dict[str, float] = Field(default={}, description="Market penetration assumptions")
    break_even_timeline: Optional[str] = Field(None, description="Estimated break-even point")
    funding_requirements: Dict[str, float] = Field(default={}, description="Investment requirements by stage")
    roi_projections: Optional[float] = Field(None, description="Expected return on investment")
    sensitivity_analysis: Dict[str, Any] = Field(default={}, description="Sensitivity to key assumptions")

class ImplementationPlan(BaseModel):
    """Complete implementation and commercialization plan"""
    id: str = Field(..., description="Unique identifier for the implementation plan")
    solution_id: str = Field(..., description="ID of the solution being implemented")
    
    # Regulatory strategy
    regulatory_pathway: Optional[RegulatoryPathway] = Field(None)
    
    # Market strategy
    go_to_market: Optional[GoToMarketStrategy] = Field(None)
    
    # Financial planning
    financial_projections: Optional[FinancialProjections] = Field(None)
    
    # Timeline and milestones
    implementation_timeline: Dict[str, Any] = Field(default={}, description="Detailed project timeline")
    key_milestones: List[str] = Field(default=[], description="Critical success milestones")
    success_metrics: List[str] = Field(default=[], description="KPIs for measuring success")
    
    # Risk mitigation
    risk_mitigation_strategies: List[str] = Field(default=[], description="Risk mitigation approaches")
    contingency_plans: List[str] = Field(default=[], description="Backup plans for key risks")
    
    # Decision support
    recommendation: str = Field(..., description="Proceed/Pivot/Stop recommendation")
    justification: str = Field(..., description="Detailed justification for recommendation")
    
    # Agent evaluation
    agent_consensus: Optional[float] = Field(None, ge=0, le=1, description="Agent consensus level on this plan")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Overall confidence in the plan")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ================== Session Management Models ==================

class PhaseTransitionCriteria(BaseModel):
    """Criteria for transitioning between phases"""
    minimum_items: int = Field(..., description="Minimum number of items needed to proceed")
    minimum_consensus: float = Field(..., ge=0, le=1, description="Minimum agent consensus required")
    required_validations: List[str] = Field(default=[], description="Required validation checkpoints")
    user_approval_required: bool = Field(default=True, description="Whether user must approve transition")

class PhaseResult(BaseModel):
    """Results from completing a phase"""
    phase: InnovationPhase = Field(..., description="Which phase these results are from")
    status: PhaseStatus = Field(..., description="Completion status of the phase")
    
    # Phase-specific results
    identified_needs: List[NeedItem] = Field(default=[], description="Needs identified in IDENTIFY phase")
    solution_concepts: List[SolutionConcept] = Field(default=[], description="Solutions from INVENT phase")
    implementation_plans: List[ImplementationPlan] = Field(default=[], description="Plans from IMPLEMENT phase")
    
    # Quality metrics
    agent_consensus: float = Field(..., ge=0, le=1, description="Overall agent consensus for this phase")
    completeness_score: float = Field(..., ge=0, le=1, description="How complete is this phase")
    quality_score: float = Field(..., ge=0, le=1, description="Quality of outputs from this phase")
    
    # Transition readiness
    ready_for_next_phase: bool = Field(default=False, description="Whether ready to proceed to next phase")
    transition_blockers: List[str] = Field(default=[], description="Issues preventing phase transition")
    
    completed_at: Optional[datetime] = Field(None)

class InnovationSession(BaseModel):
    """Complete three-phase innovation session"""
    id: str = Field(..., description="Unique session identifier")
    title: str = Field(..., min_length=5, max_length=200, description="Session title")
    description: Optional[str] = Field(None, description="Session description and context")
    
    # Session state
    current_phase: InnovationPhase = Field(default=InnovationPhase.IDENTIFY)
    session_status: str = Field(default="active", description="Overall session status")
    
    # Phase management
    phase_results: Dict[str, PhaseResult] = Field(default={}, description="Results from each completed phase")
    transition_criteria: Dict[str, PhaseTransitionCriteria] = Field(default={}, description="Criteria for phase transitions")
    
    # User and metadata
    user_id: Optional[str] = Field(None, description="User who owns this session")
    collaboration_mode: bool = Field(default=False, description="Whether multiple users can collaborate")
    tags: List[str] = Field(default=[], description="Session tags for organization")
    
    # Progress tracking
    overall_progress: float = Field(default=0.0, ge=0, le=1, description="Overall session progress (0-1)")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion date")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(None)

# ================== API Request/Response Models ==================

class StartPhaseRequest(BaseModel):
    """Request to start a specific phase"""
    session_id: str = Field(..., description="Innovation session ID")
    phase: InnovationPhase = Field(..., description="Phase to start")
    context_data: Dict[str, Any] = Field(default={}, description="Additional context for the phase")
    uploaded_documents: List[str] = Field(default=[], description="Document IDs to use as context")

class PhaseProgressUpdate(BaseModel):
    """Real-time update on phase progress"""
    session_id: str = Field(..., description="Session ID")
    phase: InnovationPhase = Field(..., description="Current phase")
    progress_percentage: float = Field(..., ge=0, le=100, description="Completion percentage")
    current_activity: str = Field(..., description="What the system is currently doing")
    active_agents: List[str] = Field(default=[], description="Which agents are currently active")
    interim_results: Dict[str, Any] = Field(default={}, description="Preliminary results")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentDebateUpdate(BaseModel):
    """Real-time update from agent debates"""
    session_id: str = Field(..., description="Session ID")
    phase: InnovationPhase = Field(..., description="Phase where debate is happening")
    agent_id: str = Field(..., description="ID of the agent making the contribution")
    message_type: str = Field(..., description="Type of message (argument, question, synthesis)")
    content: str = Field(..., description="Agent's contribution")
    confidence: float = Field(..., ge=0, le=1, description="Agent's confidence in their statement")
    references: List[str] = Field(default=[], description="Sources cited by the agent")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DocumentUploadResponse(BaseModel):
    """Response from document upload for RAG"""
    document_id: str = Field(..., description="Unique document identifier")
    filename: str = Field(..., description="Original filename")
    file_size: int = Field(..., description="File size in bytes")
    document_type: str = Field(..., description="Detected document type")
    processing_status: str = Field(..., description="Processing status")
    chunk_count: Optional[int] = Field(None, description="Number of text chunks created")
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)

class MermaidDiagramRequest(BaseModel):
    """Request to generate a Mermaid diagram"""
    session_id: str = Field(..., description="Session ID")
    diagram_type: str = Field(..., description="Type of diagram (flowchart, concept_map, etc.)")
    phase: Optional[InnovationPhase] = Field(None, description="Phase to generate diagram for")
    data_source: str = Field(..., description="What data to use for the diagram")
    customization: Dict[str, Any] = Field(default={}, description="Diagram customization options")

class MermaidDiagramResponse(BaseModel):
    """Response with generated Mermaid diagram"""
    diagram_id: str = Field(..., description="Unique diagram identifier")
    mermaid_code: str = Field(..., description="Generated Mermaid diagram code")
    svg_data: Optional[str] = Field(None, description="Rendered SVG data")
    png_data: Optional[str] = Field(None, description="Rendered PNG data (base64)")
    diagram_title: str = Field(..., description="Title of the diagram")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class CreateInnovationSessionRequest(BaseModel):
    """Request model for creating a new innovation session"""
    title: str = Field(..., description="Session title", min_length=10, max_length=200)
    description: Optional[str] = Field(None, description="Session description", max_length=1000)
    user_id: Optional[str] = Field(None, description="User ID for session ownership")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional session metadata")

class PhaseTransitionDecision(BaseModel):
    """Decision for transitioning between phases"""
    decision_type: DecisionType = Field(..., description="Type of decision made")
    rationale: str = Field(..., description="Reasoning behind the decision")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence in the decision")
    evaluation_criteria: Dict[str, float] = Field(..., description="Scores for different evaluation criteria")
    recommendations: List[str] = Field(default=[], description="Recommendations for next steps")
    decision_timestamp: datetime = Field(default_factory=datetime.utcnow)

class DecisionGate(BaseModel):
    """Gate for evaluating phase completion and transition"""
    phase: InnovationPhase = Field(..., description="Phase being evaluated")
    gate_criteria: Dict[str, float] = Field(..., description="Evaluation criteria and scores")
    minimum_threshold: float = Field(..., description="Minimum score required to pass gate")
    actual_score: float = Field(..., description="Actual score achieved")
    passed: bool = Field(..., description="Whether gate was passed")
    feedback: List[str] = Field(default=[], description="Feedback from gate evaluation")
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)

# ================== Request/Response Models ==================

class InnovationRequest(BaseModel):
    """Request model for starting innovation workflow"""
    title: str = Field(..., min_length=5, max_length=200, description="Innovation project title")
    problem_statement: str = Field(..., min_length=20, description="Clear problem statement or opportunity")
    context: Optional[str] = Field(None, description="Additional context or background information")
    objectives: List[str] = Field(default=[], description="Key objectives to achieve")
    constraints: List[str] = Field(default=[], description="Known constraints or limitations")
    stakeholders: List[str] = Field(default=[], description="Key stakeholders involved")
    starting_phase: Optional[InnovationPhase] = Field(default=InnovationPhase.IDENTIFY, description="Starting phase")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional metadata")

class InnovationResponse(BaseModel):
    """Response model for innovation workflow results"""
    session_id: str = Field(..., description="Unique session identifier")
    title: str = Field(..., description="Innovation project title")
    status: SessionStatus = Field(..., description="Current session status")
    current_phase: InnovationPhase = Field(..., description="Current phase")
    phases_completed: List[InnovationPhase] = Field(default=[], description="Completed phases")
    
    # Phase results
    identified_needs: List[NeedItem] = Field(default=[], description="Needs from IDENTIFY phase")
    solution_concepts: List[SolutionConcept] = Field(default=[], description="Solutions from INVENT phase")
    implementation_plan: Optional[ImplementationPlan] = Field(None, description="Plan from IMPLEMENT phase")
    
    # Session metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    
    # AI insights
    ai_recommendations: List[str] = Field(default=[], description="AI-generated recommendations")
    consensus_scores: Dict[str, float] = Field(default={}, description="Agent consensus scores")
    confidence_metrics: Dict[str, float] = Field(default={}, description="Confidence in results")
