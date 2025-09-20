import axios, { AxiosResponse, AxiosError } from 'axios'
import { ApiError } from '@/types'

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config: any) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    const cfg: any = response.config as any
    if (import.meta.env.DEV && cfg.metadata) {
      const endTime = new Date()
      const duration = endTime.getTime() - cfg.metadata.startTime.getTime()
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    }
    
    return response
  },
  (error: AxiosError<ApiError>) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          break
        case 403:
          // Forbidden
          console.error('Access forbidden:', data?.detail || 'Insufficient permissions')
          break
        case 404:
          // Not found
          console.error('Resource not found:', data?.detail || 'Endpoint not found')
          break
        case 422:
          // Validation error
          console.error('Validation error:', data?.detail || 'Invalid request data')
          break
        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded:', data?.detail || 'Too many requests')
          break
        case 500:
          // Server error
          console.error('Server error:', data?.detail || 'Internal server error')
          break
        default:
          console.error('API Error:', data?.detail || `HTTP ${status}`)
      }
      
      // Return structured error
      return Promise.reject({
        status,
        message: data?.detail || `HTTP ${status} Error`,
        code: data?.error_code,
        ...data
      })
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message)
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR'
      })
    } else {
      // Request setup error
      console.error('Request error:', error.message)
      return Promise.reject({
        status: 0,
        message: 'Request configuration error',
        code: 'REQUEST_ERROR'
      })
    }
  }
)

// Utility functions for common request patterns
export const apiRequest = {
  get: <T>(url: string, params?: Record<string, any>): Promise<T> => 
    apiClient.get(url, { params }).then(response => response.data),
    
  post: <T>(url: string, data?: any): Promise<T> => 
    apiClient.post(url, data).then(response => response.data),
    
  put: <T>(url: string, data?: any): Promise<T> => 
    apiClient.put(url, data).then(response => response.data),
    
  patch: <T>(url: string, data?: any): Promise<T> => 
    apiClient.patch(url, data).then(response => response.data),
    
  delete: <T>(url: string): Promise<T> => 
    apiClient.delete(url).then(response => response.data),
    
  // Special method for file uploads
  upload: <T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> => 
    apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }).then(response => response.data),
}

// WebSocket connection utility
export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second

  connect(key: string, url: string, options?: {
    onMessage?: (data: any) => void
    onOpen?: () => void
    onClose?: () => void
    onError?: (error: Event) => void
    autoReconnect?: boolean
  }): WebSocket {
    const fullUrl = url.startsWith('ws') ? url : `${this.getWebSocketUrl()}${url}`
    const ws = new WebSocket(fullUrl)
    
    ws.onopen = () => {
      console.log(`WebSocket connected: ${key}`)
      this.reconnectAttempts.delete(key)
      options?.onOpen?.()
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        options?.onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onclose = () => {
      console.log(`WebSocket disconnected: ${key}`)
      this.connections.delete(key)
      options?.onClose?.()
      
      // Auto-reconnect logic
      if (options?.autoReconnect !== false) {
        this.scheduleReconnect(key, url, options)
      }
    }
    
    ws.onerror = (error) => {
      console.error(`WebSocket error for ${key}:`, error)
      options?.onError?.(error)
    }
    
    this.connections.set(key, ws)
    return ws
  }
  
  private scheduleReconnect(key: string, url: string, options?: any) {
    const attempts = this.reconnectAttempts.get(key) || 0
    
    if (attempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, attempts) // Exponential backoff
      
      setTimeout(() => {
        console.log(`Reconnecting WebSocket ${key} (attempt ${attempts + 1})`)
        this.reconnectAttempts.set(key, attempts + 1)
        this.connect(key, url, options)
      }, delay)
    } else {
      console.error(`Max reconnection attempts reached for WebSocket: ${key}`)
    }
  }
  
  send(key: string, data: any): boolean {
    const ws = this.connections.get(key)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
      return true
    }
    return false
  }
  
  disconnect(key: string): void {
    const ws = this.connections.get(key)
    if (ws) {
      ws.close()
      this.connections.delete(key)
      this.reconnectAttempts.delete(key)
    }
  }
  
  disconnectAll(): void {
    this.connections.forEach((ws) => {
      ws.close()
    })
    this.connections.clear()
    this.reconnectAttempts.clear()
  }
  
  private getWebSocketUrl(): string {
    const apiUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'
    return apiUrl
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager()

// API endpoints configuration
export const API_ENDPOINTS = {
  // Health check
  health: '/health',
  
  // Innovation sessions
  sessions: '/api/v1/innovation/sessions',
  session: (id: string) => `/api/v1/innovation/sessions/${id}`,
  
  // Document upload
  uploadDocuments: (sessionId: string, phase: string) => 
    `/api/v1/innovation/sessions/${sessionId}/${phase}/upload-documents`,
  uploadMultimodal: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/multimodal/upload`,
  analyzeVisual: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/multimodal/analyze`,
  queryDocuments: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/documents/query`,
  
  // Phase operations
  startPhase: (sessionId: string, phase: string) => 
    `/api/v1/innovation/sessions/${sessionId}/${phase}/start`,
  phaseProgress: (sessionId: string, phase: string) => 
    `/api/v1/innovation/sessions/${sessionId}/${phase}/progress`,
  phaseResults: (sessionId: string, phase: string) => 
    `/api/v1/innovation/sessions/${sessionId}/${phase}/results`,
  transitionPhase: (sessionId: string, targetPhase: string) => 
    `/api/v1/innovation/sessions/${sessionId}/transition/${targetPhase}`,
  
  // Debate system
  startDebate: '/api/v1/debate/start',
  sessionDebate: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/debate/start`,
  debateStatus: (sessionId: string) => `/api/v1/debate/${sessionId}/status`,
  debateArguments: (sessionId: string) => `/api/v1/debate/${sessionId}/arguments`,
  debateConsensus: (sessionId: string) => `/api/v1/debate/${sessionId}/consensus`,
  debateResults: (sessionId: string, debateId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/results`,
  stopDebate: (sessionId: string) => `/api/v1/debate/${sessionId}/stop`,
  exportDebate: (sessionId: string) => `/api/v1/debate/${sessionId}/export`,
  
  // Concept maps
  generateConceptMap: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/concept-maps/generate`,
  getConceptMap: (sessionId: string, mapId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/concept-maps/${mapId}`,
  startCollaborativeEdit: (mapId: string) => 
    `/api/v1/concept-maps/${mapId}/edit/start`,
  getMapSuggestions: (mapId: string) => 
    `/api/v1/concept-maps/${mapId}/suggestions`,
  applyMapSuggestions: (mapId: string) => 
    `/api/v1/concept-maps/${mapId}/apply-suggestions`,
  exportConceptMap: (mapId: string) => 
    `/api/v1/concept-maps/${mapId}/export`,
  
  // Business strategy analysis
  generateBusinessStrategy: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/business-strategy/analyze`,
  getBusinessStrategy: (sessionId: string, analysisId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/business-strategy/analysis/${analysisId}`,
  updateBusinessStrategy: (sessionId: string, analysisId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/business-strategy/analysis/${analysisId}`,
  
  // Reports system
  generateReport: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/reports/generate`,
  getReport: (sessionId: string, reportId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/reports/${reportId}`,
  listReports: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/reports`,
  updateReport: (sessionId: string, reportId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/reports/${reportId}`,
  addReportAnnotation: (sessionId: string, reportId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/reports/${reportId}/annotations`,
  exportReportCollaborative: (sessionId: string, reportId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/reports/${reportId}/export`,
  
  // Dashboard and analytics
  dashboardOverview: '/api/v1/dashboard/overview',
  innovationPerformance: '/api/v1/analytics/innovation-performance',
  teamCollaboration: (sessionId: string) => 
    `/api/v1/analytics/team-collaboration/${sessionId}`,
  agentPerformance: '/api/v1/analytics/agent-performance',
  
  // Knowledge management
  createKnowledgeEntry: '/api/v1/knowledge/entries',
  searchKnowledge: '/api/v1/knowledge/search',
  getRecommendations: '/api/v1/knowledge/recommendations',
  
  // Agents
  agents: '/api/v1/agents',
  agent: (id: string) => `/api/v1/agents/${id}`,
  agentStatus: (agentId: string, sessionId: string) => 
    `/api/v1/agents/${agentId}/status?session_id=${sessionId}`,
  
  // Analytics
  sessionAnalytics: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/analytics`,
  exportSession: (sessionId: string) => 
    `/api/v1/innovation/sessions/${sessionId}/export`,
  
  // Evaluation
  evaluation: (sessionId: string) => `/api/v1/evaluation/${sessionId}`,
  consensusMetrics: (sessionId: string) => 
    `/api/v1/evaluation/${sessionId}/consensus`,
  riskAnalysis: (sessionId: string) => 
    `/api/v1/evaluation/${sessionId}/risks`,
} as const

// WebSocket endpoints
export const WS_ENDPOINTS = {
  innovation: (sessionId: string) => `/api/v1/ws/innovation/${sessionId}`,
  debate: (sessionId: string) => `/api/v1/ws/debate/${sessionId}`,
  conceptMap: (mapId: string) => `/api/v1/ws/concept-maps/${mapId}/progress`,
  collaborate: (mapId: string) => `/api/v1/ws/concept-maps/${mapId}/collaborate`,
} as const

export default apiClient
