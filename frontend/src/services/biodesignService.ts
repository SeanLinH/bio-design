import { apiClient } from './api'

export interface ReflectionRequest {
  query: string
  max_rounds?: number
}

export interface ReflectionResponse {
  session_id: string
  status: string
  message: string
}

export interface ReflectionResult {
  session_id: string
  status: string
  original_query: string
  discussion_rounds: number
  medical_insights: string[]
  engineering_insights: string[]
  parsed_needs: Record<string, any>
  final_summary: string
  full_conversation: string[]
  created_at: string
  completed_at?: string
}

export interface EvaluationResult {
  session_id: string
  status: string
  evaluations: Record<string, any>[]
  summary: string
  top_priority_needs: string[]
  created_at: string
}

export interface PrioritizationResult {
  session_id: string
  status: string
  prioritized_needs: Record<string, any>[]
  ranking_criteria: Record<string, string>
  recommendations: string[]
  created_at: string
}

export const biodesignService = {
  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health')
    return response.data
  },

  // Get API info
  async getApiInfo(): Promise<any> {
    const response = await apiClient.get('/api/v1/ready')
    return response.data
  },

  // List agents
  async getAgents(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/agents/')
    return response.data.agents || response.data
  },

  // List sessions
  async listSessions(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/innovation/sessions')
    return response.data
  },

  // Start debate (for testing)
  async startDebate(request: {
    topic: string
    max_rounds: number
  }): Promise<{ session_id: string }> {
    const response = await apiClient.post('/api/v1/debate/start', {
      topic: request.topic,
      max_rounds: request.max_rounds,
      enable_document_context: false
    })
    return response.data
  },

  // Get debate result
  async getDebateResult(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/debate/${sessionId}/status`)
    return response.data
  },

  // Submit reflection query (original biodesign functionality)
  async submitReflectionQuery(request: ReflectionRequest): Promise<ReflectionResponse> {
    // Map to debate functionality for now
    const debateRequest = {
      topic: request.query,
      max_rounds: request.max_rounds || 3
    }
    const result = await this.startDebate(debateRequest)
    return {
      session_id: result.session_id,
      status: 'started',
      message: 'Analysis started successfully'
    }
  },

  // Submit reflection query with realtime updates
  async submitReflectionQueryRealtime(request: ReflectionRequest): Promise<ReflectionResponse> {
    return await this.submitReflectionQuery(request)
  },

  async getReflectionResult(sessionId: string): Promise<ReflectionResult> {
    const response = await apiClient.get(`/api/v1/debate/${sessionId}/status`)
    return response.data
  },

  async evaluateNeeds(sessionId: string, evaluationCriteria?: Record<string, any>): Promise<EvaluationResult> {
    const response = await apiClient.post(`/api/v1/evaluation/${sessionId}`, {
      evaluation_criteria: evaluationCriteria || {}
    })
    return response.data
  },

  async prioritizeNeeds(sessionId: string, criteria?: Record<string, any>): Promise<PrioritizationResult> {
    const response = await apiClient.post(`/api/v1/evaluation/${sessionId}/prioritize`, {
      prioritization_criteria: criteria || {}
    })
    return response.data
  },

  async getEvaluationResult(sessionId: string): Promise<EvaluationResult> {
    const response = await apiClient.get(`/api/v1/evaluation/${sessionId}`)
    return response.data
  },

  async getPrioritizationResult(sessionId: string): Promise<PrioritizationResult> {
    const response = await apiClient.get(`/api/v1/evaluation/${sessionId}/prioritization`)
    return response.data
  },

  async exportResults(sessionId: string, format: 'json' | 'pdf' | 'csv' = 'json'): Promise<any> {
    const response = await apiClient.get(`/api/v1/evaluation/${sessionId}/export`, {
      params: { format }
    })
    return response.data
  },

  async getSessionHistory(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/innovation/sessions')
    return response.data
  },

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/innovation/sessions/${sessionId}`)
  },

  async getSessionStatus(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/debate/${sessionId}/status`)
    return response.data
  },

  // Create real-time stream for session updates
  createReflectionStream(sessionId: string): EventSource {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return new EventSource(`${baseUrl}/api/v1/ws/stream/${sessionId}`)
  }
}

export default biodesignService
