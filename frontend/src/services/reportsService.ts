import { apiRequest, API_ENDPOINTS } from './api'

export interface ReportGenerationRequest {
  report_type: 'innovation_summary' | 'business_strategy' | 'technical_analysis' | 'market_research' | 'financial_projection' | 'regulatory_roadmap'
  target_audience: 'investors' | 'technical_team' | 'regulatory_authorities' | 'executive_summary'
  include_sections: string[]
  format_preferences: {
    include_charts: boolean
    include_concept_maps: boolean
    include_agent_debates: boolean
    detail_level: 'comprehensive' | 'summary' | 'executive'
  }
}

export interface GeneratedReport {
  report_id: string
  title: string
  report_type: string
  status: 'generating' | 'completed' | 'failed'
  generated_at: string
  metadata: {
    page_count: number
    word_count: number
    charts_included: number
    concept_maps_included: number
  }
  sections: ReportSection[]
  download_urls: {
    pdf: string
    docx: string
    html: string
  }
  sharing_url: string
}

export interface ReportSection {
  section_id: string
  title: string
  page_range: string
  key_insights: string[]
}

export interface ReportAnnotation {
  section_id: string
  annotation: {
    type: 'comment' | 'highlight' | 'note'
    content: string
    author: string
    position: {
      page: number
      paragraph: number
    }
  }
}

export interface ReportListItem {
  report_id: string
  title: string
  report_type: string
  status: string
  created_at: string
  updated_at: string
  author: string
}

export const reportsService = {
  // Generate a new report
  async generateReport(
    sessionId: string,
    request: ReportGenerationRequest
  ): Promise<{ report_id: string; status: string; estimated_completion: string }> {
    return apiRequest.post(
      API_ENDPOINTS.generateReport(sessionId),
      request
    )
  },

  // Get generated report details
  async getReport(
    sessionId: string,
    reportId: string
  ): Promise<GeneratedReport> {
    return apiRequest.get<GeneratedReport>(
      API_ENDPOINTS.getReport(sessionId, reportId)
    )
  },

  // List all reports for a session
  async listReports(
    sessionId: string,
    filters?: {
      status?: string
      type?: string
      limit?: number
    }
  ): Promise<ReportListItem[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const url = `${API_ENDPOINTS.listReports(sessionId)}?${params.toString()}`
    return apiRequest.get<ReportListItem[]>(url)
  },

  // Update report content
  async updateReport(
    sessionId: string,
    reportId: string,
    updates: {
      sections_to_update: string[]
      updated_data: Record<string, any>
      regenerate_charts?: boolean
    }
  ): Promise<GeneratedReport> {
    return apiRequest.put<GeneratedReport>(
      API_ENDPOINTS.updateReport(sessionId, reportId),
      updates
    )
  },

  // Add annotation to report
  async addAnnotation(
    sessionId: string,
    reportId: string,
    annotation: ReportAnnotation
  ): Promise<{ annotation_id: string; message: string }> {
    return apiRequest.post(
      API_ENDPOINTS.addReportAnnotation(sessionId, reportId),
      annotation
    )
  },

  // Export report for collaboration
  async exportForCollaboration(
    sessionId: string,
    reportId: string,
    format: 'collaborative',
    platform: 'sharepoint' | 'google_docs' | 'notion' | 'confluence'
  ): Promise<Blob> {
    const response = await fetch(
      `${API_ENDPOINTS.exportReportCollaborative(sessionId, reportId)}?format=${format}&platform=${platform}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to export report for collaboration')
    }

    return response.blob()
  },

  // Download report
  async downloadReport(
    downloadUrl: string,
    format: 'pdf' | 'docx' | 'html'
  ): Promise<Blob> {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download ${format} report`)
    }

    return response.blob()
  },
}

export default reportsService
