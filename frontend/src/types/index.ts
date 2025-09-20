// Core type definitions based on API documentation
import { ReactNode } from 'react'

export type Phase = 'identify' | 'invent' | 'implement'
export type SessionStatus = 'active' | 'paused' | 'completed' | 'failed' | 'cancelled'
export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'requires_revision'
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type RiskLevel = 'low' | 'medium' | 'high'
export type SolutionType = 'product' | 'service' | 'subscription' | 'rental' | 'hybrid'
export type BusinessModel = 'product' | 'service' | 'subscription' | 'rental' | 'hybrid'

// Agent types
export type AgentId = 
  | 'medical_expert'
  | 'tech_engineer'
  | 'business_analyst'
  | 'regulatory_agent'
  | 'ethicist'
  | 'patient_advocate'
  | 'devils_advocate'

export type AgentPosition = 'for' | 'against' | 'neutral' | 'strongly_for' | 'strongly_against' | 'conditional_support'

export interface Agent {
  agent_id: AgentId
  name: string
  role: string
  expertise: string[]
  perspective: string
  multimodal_capabilities: {
    image_analysis: boolean
    medical_imaging: boolean
    design_interpretation: boolean
    patent_analysis: boolean
  }
  decision_weights: {
    technical_feasibility: number
    market_potential: number
    regulatory_compliance: number
    ethical_considerations: number
  }
}

// Innovation Session types
export interface InnovationSession {
  session_id: string
  title: string
  description?: string
  user_id?: string
  current_phase: Phase
  status: SessionStatus
  created_at: string
  updated_at: string
  phase_results: {
    identify: PhaseResult
    invent: PhaseResult
    implement: PhaseResult
  }
}

export interface PhaseResult {
  status: PhaseStatus
  results?: any[]
  duration_minutes?: number
  documents_used?: string[]
}

export interface CreateSessionRequest {
  title: string
  description?: string
  user_id?: string
}

// Document and Upload types
export interface DocumentUpload {
  document_id: string
  filename: string
  file_type: string
  file_size_bytes: number
  chunk_count: number
  upload_time: string
  processing_status: 'processing' | 'completed' | 'failed'
}

export interface MultimodalContent {
  content_id: string
  filename: string
  file_type: string
  analysis_type: 'medical_imaging' | 'design_analysis' | 'patent_research' | 'concept_mapping'
  processing_status: 'processing' | 'completed' | 'failed'
  extracted_concepts: string[]
  visual_analysis: {
    key_findings: string[]
    technical_assessment: string
    clinical_significance: string
    confidence_score: number
  }
  agent_interpretations: {
    medical_expert?: string
    tech_engineer?: string
    business_analyst?: string
  }
  extracted_requirements: string[]
  related_documents: string[]
}

export interface DocumentQueryRequest {
  query: string
  phase: Phase
  top_k?: number
}

export interface DocumentQueryResult {
  content: string
  source: string
  relevance_score: number
  chunk_id: string
}

// Phase-specific data types

// IDENTIFY Phase
export interface IdentifyContextData {
  target_population?: string
  clinical_setting?: string
  focus_areas?: string[]
}

export interface NeedItem {
  need_id: string
  title: string
  description: string
  priority: Priority
  evidence: string[]
  stakeholders: string[]
  market_size?: string
  technical_feasibility: number
  agent_consensus: number
  supporting_documents: string[]
}

// INVENT Phase
export interface InventContextData {
  selected_needs: string[]
  technology_preferences?: string[]
  constraints?: string[]
}

export interface SolutionConcept {
  solution_id: string
  title: string
  description: string
  solution_type: SolutionType
  technical_approach: string
  key_features: string[]
  development_timeline?: string
  estimated_cost?: string
  regulatory_pathway?: string
  risk_assessment: {
    technical_risk: RiskLevel
    regulatory_risk: RiskLevel
    market_risk: RiskLevel
  }
  agent_scores: {
    technical_feasibility: number
    market_potential: number
    regulatory_compliance: number
  }
}

// IMPLEMENT Phase
export interface ImplementContextData {
  selected_solutions: string[]
  business_model_preferences?: string[]
  target_markets?: string[]
}

export interface RevenueStream {
  type: string
  description: string
  projected_revenue: string
}

export interface ImplementationPlan {
  implementation_id: string
  business_model: BusinessModel
  revenue_streams: RevenueStream[]
  go_to_market_strategy: {
    phase_1: string
    phase_2: string
    phase_3: string
  }
  competitive_analysis: {
    key_competitors: string[]
    competitive_advantage: string
  }
  financial_projections: {
    year_1: { revenue: string; costs: string }
    year_3: { revenue: string; costs: string }
    break_even: string
  }
  risk_mitigation: string[]
}

// Debate System types
export interface DebateSession {
  session_id: string
  status: 'starting' | 'in_progress' | 'completed' | 'failed' | 'stopped'
  topic?: string
  description?: string
  agents: AgentId[]
  created_at: string
}

export interface DebateConfig {
  max_rounds?: number
  consensus_threshold?: number
  timeout_seconds?: number
  enable_devils_advocate?: boolean
  allow_position_changes?: boolean
  real_time_updates?: boolean
  enable_document_context?: boolean
}

export interface DebateArgument {
  argument_id: string
  agent_id: AgentId
  round: number
  position: AgentPosition
  content: string
  confidence: number
  timestamp: string
  references?: string[]
}

export interface DebateConsensus {
  consensus_reached: boolean
  consensus_score: number
  final_recommendations: {
    recommendation: string
    supporting_agents: AgentId[]
    confidence_score: number
    rationale: string
  }[]
  agent_positions: Record<AgentId, {
    final_position: AgentPosition
    key_arguments: string[]
  }>
}

export interface StartDebateRequest {
  topic: string
  description?: string
  agents: AgentId[]
  config?: DebateConfig
  phase?: Phase
  context?: Record<string, any>
}

// Progress and Status types
export interface PhaseProgress {
  phase: Phase
  status: PhaseStatus
  progress_percentage: number
  current_step: string
  estimated_completion?: string
  steps_completed: string[]
  steps_remaining: string[]
}

export interface DebateProgress {
  debate_id: string
  status: string
  rounds_completed: number
  max_rounds: number
  consensus_score: number
  active_agents: AgentId[]
  last_activity: string
}

// Concept Map types
export type MapType = 
  | 'need_landscape'
  | 'solution_architecture'
  | 'stakeholder_analysis'
  | 'business_model_canvas'
  | 'regulatory_pathway'
  | 'risk_assessment_tree'

export interface ConceptMapNode {
  id: string
  label: string
  type: 'need' | 'solution' | 'stakeholder' | 'technology' | 'constraint'
  priority?: Priority
  attributes?: Record<string, any>
}

export interface ConceptMapEdge {
  source: string
  target: string
  relationship: 'affects' | 'depends_on' | 'enables' | 'constrains' | 'supports'
  strength?: number
}

export interface ConceptMap {
  map_id: string
  map_type: MapType
  phase: Phase
  status: 'processing' | 'completed' | 'failed'
  creation_timestamp: string
  formats: {
    mermaid_code: string
    svg_url: string
    png_url: string
    pdf_url: string
    interactive_url: string
    d3_json: {
      nodes: ConceptMapNode[]
      edges: ConceptMapEdge[]
    }
  }
  metadata: {
    elements_count: number
    complexity_score: number
    agent_contributions: Record<AgentId, string[]>
    data_sources_used: string[]
    auto_improvements_applied: string[]
  }
  editing_capabilities: {
    collaborative_editing_url: string
    version_history_url: string
    comment_system_enabled: boolean
  }
}

// Analytics types
export interface SessionAnalytics {
  session_summary: {
    total_duration_hours: number
    phases_completed: Phase[]
    documents_uploaded: number
    debates_conducted: number
    consensus_scores: Record<Phase, number>
  }
  agent_participation: Record<AgentId, {
    arguments: number
    avg_confidence: number
  }>
  document_utilization: {
    total_chunks_referenced: number
    most_referenced_document: string
  }
}

// WebSocket Message types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export interface InnovationProgressMessage extends WebSocketMessage {
  type: 'phase_progress' | 'phase_completed' | 'phase_started'
  data: {
    session_id: string
    phase: Phase
    progress: number
    current_step: string
    timestamp: string
  }
}

export interface DebateUpdateMessage extends WebSocketMessage {
  type: 'new_argument' | 'consensus_reached' | 'round_completed' | 'debate_ended'
  data: {
    debate_id: string
    agent_id?: AgentId
    round?: number
    position?: AgentPosition
    content?: string
    confidence?: number
    consensus_score?: number
  }
}

// Error types
export interface ApiError {
  detail: string
  error_code?: string
  [key: string]: any
}

// Common utility types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

// Form types for React Hook Form
export interface CreateSessionFormData {
  title: string
  description?: string
}

export interface UploadDocumentsFormData {
  files: FileList
  analysis_type?: string
  context?: string
}

export interface StartPhaseFormData {
  context_data: Record<string, any>
  uploaded_documents?: string[]
}

// UI State types
export interface AppState {
  currentSession: InnovationSession | null
  currentPhase: Phase
  isLoading: boolean
  error: string | null
  agents: Agent[]
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Component Props types
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

export interface PhaseIndicatorProps extends BaseComponentProps {
  phase: Phase
  status: PhaseStatus
  showProgress?: boolean
  progress?: number
}

export interface AgentBadgeProps extends BaseComponentProps {
  agent: Agent | AgentId
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export interface DebateMessageProps extends BaseComponentProps {
  argument: DebateArgument
  agent: Agent
  isLatest?: boolean
  onReply?: () => void
}

// Route types
export interface RouteParams {
  sessionId: string
}
