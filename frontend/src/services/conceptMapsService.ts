import { apiRequest, API_ENDPOINTS } from './api'

export interface ConceptMapGenerationRequest {
  map_type: 'need_landscape' | 'solution_architecture' | 'stakeholder_analysis' | 'business_model_canvas' | 'regulatory_pathway' | 'risk_assessment_tree'
  content_source: {
    phase: 'identify' | 'invent' | 'implement'
    include_agent_insights: boolean
    focus_areas: string[]
  }
  visualization_preferences: {
    layout: 'hierarchical' | 'radial' | 'force_directed'
    complexity_level: 'simplified' | 'detailed' | 'comprehensive'
    color_scheme: 'phase_based' | 'stakeholder_based' | 'priority_based'
  }
}

export interface ConceptMap {
  map_id: string
  map_type: string
  generated_at: string
  mermaid_code: string
  metadata: {
    nodes_count: number
    relationships_count: number
    complexity_score: number
  }
  interactive_elements: InteractiveElement[]
  export_urls: {
    svg: string
    png: string
    pdf: string
  }
}

export interface InteractiveElement {
  node_id: string
  tooltip: string
  drill_down_url?: string
}

export interface CollaborativeEditSession {
  edit_session_id: string
  websocket_url: string
  expires_at: string
  active_collaborators: Collaborator[]
}

export interface Collaborator {
  user_id: string
  role: 'editor' | 'viewer' | 'commenter'
  joined_at: string
}

export interface MapSuggestion {
  suggestion_id: string
  type: 'layout_optimization' | 'content_enhancement' | 'visual_improvement'
  description: string
  impact: 'low' | 'medium' | 'high'
  implementation: {
    action: string
    affected_nodes?: string[]
    suggested_nodes?: Array<{
      label: string
      type: string
    }>
  }
}

export interface MapOptimizationSuggestions {
  map_id: string
  suggestions: MapSuggestion[]
  overall_score: number
  improvement_potential: number
}

export const conceptMapsService = {
  // Generate new concept map
  async generateMap(
    sessionId: string,
    request: ConceptMapGenerationRequest
  ): Promise<{ task_id: string; estimated_completion: string; progress_webhook: string }> {
    return apiRequest.post(
      API_ENDPOINTS.generateConceptMap(sessionId),
      request
    )
  },

  // Get generated concept map
  async getMap(
    sessionId: string,
    mapId: string
  ): Promise<ConceptMap> {
    return apiRequest.get<ConceptMap>(
      API_ENDPOINTS.getConceptMap(sessionId, mapId)
    )
  },

  // Start collaborative editing session
  async startCollaborativeEdit(
    mapId: string,
    userId: string,
    permissions: 'full' | 'comment_only' | 'view_only',
    duration?: string
  ): Promise<CollaborativeEditSession> {
    return apiRequest.post<CollaborativeEditSession>(
      API_ENDPOINTS.startCollaborativeEdit(mapId),
      {
        user_id: userId,
        edit_permissions: permissions,
        session_duration: duration || 'PT1H'
      }
    )
  },

  // Get optimization suggestions
  async getOptimizationSuggestions(
    mapId: string
  ): Promise<MapOptimizationSuggestions> {
    return apiRequest.get<MapOptimizationSuggestions>(
      API_ENDPOINTS.getMapSuggestions(mapId)
    )
  },

  // Apply optimization suggestions
  async applyOptimizationSuggestions(
    mapId: string,
    suggestionIds: string[],
    createBackup = true,
    applyMode: 'preview' | 'apply' = 'apply'
  ): Promise<ConceptMap> {
    return apiRequest.post<ConceptMap>(
      API_ENDPOINTS.applyMapSuggestions(mapId),
      {
        suggestion_ids: suggestionIds,
        create_backup: createBackup,
        apply_mode: applyMode
      }
    )
  },

  // Export concept map
  async exportMap(
    mapId: string,
    format: 'svg' | 'png' | 'pdf' | 'presentation' | 'interactive_html' | 'mermaid' | 'json' | 'cytoscape',
    options?: {
      resolution?: string
      include_notes?: boolean
    }
  ): Promise<Blob> {
    const params = new URLSearchParams({ format })
    if (options?.resolution) params.append('resolution', options.resolution)
    if (options?.include_notes) params.append('include_notes', 'true')
    
    const response = await fetch(
      `${API_ENDPOINTS.exportConceptMap(mapId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to export concept map in ${format} format`)
    }

    return response.blob()
  },

  // Send collaborative editing command via WebSocket
  sendEditCommand(
    websocket: WebSocket,
    command: {
      action: 'add_node' | 'remove_node' | 'update_node' | 'add_edge' | 'remove_edge'
      user_id: string
      data: any
    }
  ): void {
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(command))
    } else {
      throw new Error('WebSocket connection is not open')
    }
  },
}

export default conceptMapsService
