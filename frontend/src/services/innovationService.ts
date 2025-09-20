import { apiRequest, API_ENDPOINTS } from './api'
import {
  InnovationSession,
  CreateSessionRequest,
  Phase,
  NeedItem,
  SolutionConcept,
  ImplementationPlan,
  PhaseProgress,
  DocumentUpload,
  MultimodalContent,
  DocumentQueryRequest,
  DocumentQueryResult,
  SessionAnalytics,
} from '@/types'

export const innovationService = {
  // Session management
  async createSession(data: CreateSessionRequest): Promise<InnovationSession> {
    return apiRequest.post<InnovationSession>(API_ENDPOINTS.sessions, data)
  },

  async getSession(sessionId: string): Promise<InnovationSession> {
    return apiRequest.get<InnovationSession>(API_ENDPOINTS.session(sessionId))
  },

  async getSessions(userId?: string, limit?: number): Promise<InnovationSession[]> {
    const params: Record<string, any> = {}
    if (userId) params.user_id = userId
    if (limit) params.limit = limit
    
    return apiRequest.get<InnovationSession[]>(API_ENDPOINTS.sessions, params)
  },

  async deleteSession(sessionId: string): Promise<void> {
    return apiRequest.delete(API_ENDPOINTS.session(sessionId))
  },

  // Document management
  async uploadDocuments(
    sessionId: string,
    phase: Phase,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<{ message: string; documents: DocumentUpload[] }> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return apiRequest.upload(
      API_ENDPOINTS.uploadDocuments(sessionId, phase),
      formData,
      onProgress
    )
  },

  async uploadMultimodalContent(
    sessionId: string,
    files: File[],
    analysisType: string,
    context?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ 
    message: string
    documents: DocumentUpload[]
    multimodal_content: MultimodalContent[]
  }> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('analysis_type', analysisType)
    if (context) formData.append('context', context)

    return apiRequest.upload(
      API_ENDPOINTS.uploadMultimodal(sessionId),
      formData,
      onProgress
    )
  },

  async analyzeVisualContent(
    sessionId: string,
    contentIds: string[],
    analysisRequest: string,
    includeAgentPerspectives = true
  ): Promise<any> {
    return apiRequest.post(API_ENDPOINTS.analyzeVisual(sessionId), {
      content_ids: contentIds,
      analysis_request: analysisRequest,
      include_agent_perspectives: includeAgentPerspectives,
    })
  },

  async queryDocuments(
    sessionId: string,
    query: DocumentQueryRequest
  ): Promise<{ query: string; results: DocumentQueryResult[]; total_results: number }> {
    return apiRequest.post(API_ENDPOINTS.queryDocuments(sessionId), query)
  },

  // Phase management
  async startPhase(
    sessionId: string,
    phase: Phase,
    contextData?: any
  ): Promise<{ message: string; session_id: string; phase: Phase; status: string }> {
    // Backend expects StartPhaseRequest with session_id and phase as required fields
    return apiRequest.post(API_ENDPOINTS.startPhase(sessionId, phase), {
      session_id: sessionId,
      phase,
      context_data: contextData || {},
      uploaded_documents: [],
    })
  },

  async getPhaseProgress(sessionId: string, phase: Phase): Promise<PhaseProgress> {
    return apiRequest.get<PhaseProgress>(API_ENDPOINTS.phaseProgress(sessionId, phase))
  },

  async getPhaseResults(sessionId: string, phase: Phase): Promise<any[]> {
    switch (phase) {
      case 'identify':
        return apiRequest.get<NeedItem[]>(API_ENDPOINTS.phaseResults(sessionId, phase))
      case 'invent':
        return apiRequest.get<SolutionConcept[]>(API_ENDPOINTS.phaseResults(sessionId, phase))
      case 'implement':
        return apiRequest.get<ImplementationPlan[]>(API_ENDPOINTS.phaseResults(sessionId, phase))
      default:
        return apiRequest.get<any[]>(API_ENDPOINTS.phaseResults(sessionId, phase))
    }
  },

  async transitionPhase(
    sessionId: string,
    targetPhase: Phase,
    force = false
  ): Promise<{ message: string; previous_phase: Phase; new_phase: Phase }> {
    return apiRequest.post(
      `${API_ENDPOINTS.transitionPhase(sessionId, targetPhase)}?force=${force}`
    )
  },

  // Analytics and reporting
  async getSessionAnalytics(sessionId: string): Promise<SessionAnalytics> {
    return apiRequest.get<SessionAnalytics>(API_ENDPOINTS.sessionAnalytics(sessionId))
  },

  async exportSession(
    sessionId: string,
    format = 'pdf',
    includeDebates = true
  ): Promise<Blob> {
    const response = await fetch(
      `${API_ENDPOINTS.exportSession(sessionId)}?format=${format}&include_debates=${includeDebates}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to export session')
    }

    return response.blob()
  },
}

export default innovationService
