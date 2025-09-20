import { apiRequest, API_ENDPOINTS } from './api'

export interface DashboardOverview {
  user_summary: {
    active_sessions: number
    completed_sessions: number
    total_innovations: number
  }
  recent_activity: ActivityItem[]
  performance_metrics: {
    average_session_duration: string
    consensus_achievement_rate: number
    innovation_success_rate: number
  }
  upcoming_milestones: Milestone[]
}

export interface ActivityItem {
  session_id: string
  activity_type: string
  phase: string
  timestamp: string
}

export interface Milestone {
  session_id: string
  milestone: string
  estimated_date: string
}

export interface InnovationPerformanceMetrics {
  timeframe: string
  data_points: number
  metrics: {
    innovation_success_rate: MetricData
    session_efficiency: EfficiencyData
    decision_quality: QualityData
  }
  insights: Insight[]
}

export interface MetricData {
  current_value: number
  trend: 'increasing' | 'decreasing' | 'stable'
  historical_data: HistoricalDataPoint[]
}

export interface EfficiencyData {
  average_duration: string
  trend: 'improving' | 'declining' | 'stable'
  benchmark_comparison: string
}

export interface QualityData {
  consensus_strength: number
  evidence_base_score: number
  stakeholder_alignment: number
}

export interface HistoricalDataPoint {
  date: string
  value: number
}

export interface Insight {
  type: 'trend' | 'recommendation' | 'alert'
  description: string
  confidence?: number
  evidence?: string
}

export interface TeamCollaborationAnalytics {
  session_id: string
  collaboration_metrics: {
    total_participants: number
    participation_distribution: ParticipationData[]
    communication_patterns: CommunicationPattern[]
    decision_making_efficiency: number
  }
  team_dynamics: {
    consensus_building_time: string
    conflict_resolution_rate: number
    knowledge_sharing_index: number
  }
}

export interface ParticipationData {
  participant_id: string
  participation_rate: number
  contribution_quality: number
  expertise_areas: string[]
}

export interface CommunicationPattern {
  pattern_type: string
  frequency: number
  effectiveness_score: number
}

export interface AgentPerformanceAnalytics {
  agent_id: string
  timeframe: string
  performance_metrics: {
    participation_rate: number
    argument_quality_score: number
    evidence_citation_count: number
    consensus_contribution: number
  }
  expertise_areas: ExpertiseArea[]
  collaboration_patterns: {
    most_frequent_interactions: string[]
    conflict_frequency: number
    agreement_rate: number
  }
}

export interface ExpertiseArea {
  domain: string
  confidence_score: number
  contribution_count: number
}

export interface KnowledgeEntry {
  entry_id: string
  title: string
  content: string
  tags: string[]
  source_session: string
  knowledge_type: 'best_practice' | 'lesson_learned' | 'methodology' | 'regulation'
  created_at: string
  relevance_score?: number
}

export interface KnowledgeSearchRequest {
  query: string
  filters: {
    tags?: string[]
    knowledge_type?: string[]
    date_range?: {
      start: string
      end: string
    }
  }
  limit?: number
}

export interface KnowledgeRecommendation {
  type: 'similar_project' | 'expert_contact' | 'best_practice' | 'regulation'
  title: string
  relevance_score: number
  key_learnings?: string[]
  expert?: string
  expertise?: string
  availability?: string
}

export const analyticsService = {
  // Dashboard overview
  async getDashboardOverview(
    userId?: string,
    timeRange = '30d'
  ): Promise<DashboardOverview> {
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    params.append('time_range', timeRange)
    
    return apiRequest.get<DashboardOverview>(
      `${API_ENDPOINTS.dashboardOverview}?${params.toString()}`
    )
  },

  // Innovation performance analytics
  async getInnovationPerformance(
    timeframe = '6m',
    metrics = 'success_rate,efficiency,quality'
  ): Promise<InnovationPerformanceMetrics> {
    const params = new URLSearchParams()
    params.append('timeframe', timeframe)
    params.append('metrics', metrics)
    
    return apiRequest.get<InnovationPerformanceMetrics>(
      `${API_ENDPOINTS.innovationPerformance}?${params.toString()}`
    )
  },

  // Team collaboration analytics
  async getTeamCollaboration(
    sessionId: string
  ): Promise<TeamCollaborationAnalytics> {
    return apiRequest.get<TeamCollaborationAnalytics>(
      API_ENDPOINTS.teamCollaboration(sessionId)
    )
  },

  // Agent performance analytics
  async getAgentPerformance(
    agentId?: string,
    timeframe = '3m'
  ): Promise<AgentPerformanceAnalytics> {
    const params = new URLSearchParams()
    if (agentId) params.append('agent_id', agentId)
    params.append('timeframe', timeframe)
    
    return apiRequest.get<AgentPerformanceAnalytics>(
      `${API_ENDPOINTS.agentPerformance}?${params.toString()}`
    )
  },
}

export const knowledgeService = {
  // Create knowledge base entry
  async createKnowledgeEntry(
    entry: Omit<KnowledgeEntry, 'entry_id' | 'created_at' | 'relevance_score'>
  ): Promise<KnowledgeEntry> {
    return apiRequest.post<KnowledgeEntry>(
      API_ENDPOINTS.createKnowledgeEntry,
      entry
    )
  },

  // Search knowledge base
  async searchKnowledge(
    searchRequest: KnowledgeSearchRequest
  ): Promise<KnowledgeEntry[]> {
    return apiRequest.post<KnowledgeEntry[]>(
      API_ENDPOINTS.searchKnowledge,
      searchRequest
    )
  },

  // Get intelligent recommendations
  async getRecommendations(
    sessionId: string,
    phase?: 'identify' | 'invent' | 'implement'
  ): Promise<{ recommendations: KnowledgeRecommendation[] }> {
    const params = new URLSearchParams()
    params.append('session_id', sessionId)
    if (phase) params.append('phase', phase)
    
    return apiRequest.get<{ recommendations: KnowledgeRecommendation[] }>(
      `${API_ENDPOINTS.getRecommendations}?${params.toString()}`
    )
  },
}

export { analyticsService as default }
