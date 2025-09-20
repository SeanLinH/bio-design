import { apiRequest, API_ENDPOINTS } from './api'
import { Agent, AgentId } from '@/types'

export const agentService = {
  // Get all available agents
  async getAgents(): Promise<Agent[]> {
    return apiRequest.get<Agent[]>(API_ENDPOINTS.agents)
  },

  // Get specific agent details
  async getAgent(agentId: AgentId): Promise<Agent> {
    return apiRequest.get<Agent>(API_ENDPOINTS.agent(agentId))
  },

  // Get agent status in a specific session
  async getAgentStatus(
    agentId: AgentId,
    sessionId: string
  ): Promise<{
    agent_id: AgentId
    status: 'active' | 'idle' | 'processing' | 'error'
    current_task?: string
    last_activity?: string
    session_id: string
  }> {
    return apiRequest.get(API_ENDPOINTS.agentStatus(agentId, sessionId))
  },

  // Utility function to get agent display information
  getAgentDisplayInfo(agentId: AgentId): {
    name: string
    color: string
    icon: string
    description: string
  } {
    const agentInfo = {
      medical_expert: {
        name: 'Medical Expert',
        color: '#ec4899', // pink
        icon: '🩺',
        description: 'Clinical expertise and healthcare workflow knowledge',
      },
      tech_engineer: {
        name: 'Tech Engineer',
        color: '#8b5cf6', // purple
        icon: '⚙️',
        description: 'Technical feasibility and engineering perspectives',
      },
      business_analyst: {
        name: 'Business Analyst',
        color: '#06b6d4', // cyan
        icon: '📊',
        description: 'Market analysis and business model evaluation',
      },
      regulatory_agent: {
        name: 'Regulatory Agent',
        color: '#84cc16', // lime
        icon: '📋',
        description: 'FDA/regulatory compliance and approval pathways',
      },
      ethicist: {
        name: 'Ethicist',
        color: '#f59e0b', // amber
        icon: '⚖️',
        description: 'Ethical implications and patient safety considerations',
      },
      patient_advocate: {
        name: 'Patient Advocate',
        color: '#ef4444', // red
        icon: '🤝',
        description: 'Patient experience and accessibility concerns',
      },
      devils_advocate: {
        name: "Devil's Advocate",
        color: '#6b7280', // gray
        icon: '🎭',
        description: 'Critical thinking and risk identification',
      },
    }

    return agentInfo[agentId] || {
      name: agentId,
      color: '#6b7280',
      icon: '🤖',
      description: 'AI Agent',
    }
  },

  // Get agent capabilities for multimodal content
  getAgentCapabilities(agentId: AgentId): {
    canAnalyzeImages: boolean
    canAnalyzeMedicalImaging: boolean
    canInterpretDesigns: boolean
    canAnalyzePatents: boolean
    specializations: string[]
  } {
    const capabilities = {
      medical_expert: {
        canAnalyzeImages: true,
        canAnalyzeMedicalImaging: true,
        canInterpretDesigns: false,
        canAnalyzePatents: true,
        specializations: ['clinical_validation', 'medical_imaging', 'patient_safety'],
      },
      tech_engineer: {
        canAnalyzeImages: true,
        canAnalyzeMedicalImaging: false,
        canInterpretDesigns: true,
        canAnalyzePatents: true,
        specializations: ['technical_feasibility', 'engineering_design', 'manufacturing'],
      },
      business_analyst: {
        canAnalyzeImages: false,
        canAnalyzeMedicalImaging: false,
        canInterpretDesigns: false,
        canAnalyzePatents: true,
        specializations: ['market_analysis', 'business_models', 'competitive_intelligence'],
      },
      regulatory_agent: {
        canAnalyzeImages: false,
        canAnalyzeMedicalImaging: true,
        canInterpretDesigns: false,
        canAnalyzePatents: true,
        specializations: ['regulatory_compliance', 'fda_pathways', 'clinical_trials'],
      },
      ethicist: {
        canAnalyzeImages: false,
        canAnalyzeMedicalImaging: false,
        canInterpretDesigns: false,
        canAnalyzePatents: false,
        specializations: ['ethical_analysis', 'patient_rights', 'data_privacy'],
      },
      patient_advocate: {
        canAnalyzeImages: false,
        canAnalyzeMedicalImaging: false,
        canInterpretDesigns: true,
        canAnalyzePatents: false,
        specializations: ['user_experience', 'accessibility', 'patient_needs'],
      },
      devils_advocate: {
        canAnalyzeImages: true,
        canAnalyzeMedicalImaging: true,
        canInterpretDesigns: true,
        canAnalyzePatents: true,
        specializations: ['risk_assessment', 'critical_analysis', 'failure_modes'],
      },
    }

    return capabilities[agentId] || {
      canAnalyzeImages: false,
      canAnalyzeMedicalImaging: false,
      canInterpretDesigns: false,
      canAnalyzePatents: false,
      specializations: [],
    }
  },

  // Get recommended agents for specific tasks
  getRecommendedAgents(task: string, phase?: string): AgentId[] {
    const recommendations: Record<string, AgentId[]> = {
      // General phase recommendations
      identify: ['medical_expert', 'patient_advocate', 'business_analyst', 'devils_advocate'],
      invent: ['tech_engineer', 'medical_expert', 'regulatory_agent', 'devils_advocate'],
      implement: ['business_analyst', 'regulatory_agent', 'tech_engineer', 'devils_advocate'],

      // Specific task recommendations
      medical_imaging_analysis: ['medical_expert', 'tech_engineer', 'devils_advocate'],
      technical_feasibility: ['tech_engineer', 'medical_expert', 'devils_advocate'],
      regulatory_compliance: ['regulatory_agent', 'medical_expert', 'ethicist'],
      market_analysis: ['business_analyst', 'patient_advocate', 'devils_advocate'],
      ethical_review: ['ethicist', 'patient_advocate', 'medical_expert'],
      risk_assessment: ['devils_advocate', 'regulatory_agent', 'medical_expert'],
      user_experience: ['patient_advocate', 'medical_expert', 'tech_engineer'],
      business_model: ['business_analyst', 'regulatory_agent', 'devils_advocate'],
      patent_analysis: ['tech_engineer', 'business_analyst', 'regulatory_agent'],
      clinical_validation: ['medical_expert', 'regulatory_agent', 'ethicist'],
    }

    // Get recommendations based on phase first, then task
    if (phase && recommendations[phase]) {
      return recommendations[phase]
    }

    return recommendations[task] || ['medical_expert', 'tech_engineer', 'business_analyst', 'devils_advocate']
  },

  // Format agent name for display
  formatAgentName(agentId: AgentId): string {
    return this.getAgentDisplayInfo(agentId).name
  },

  // Get agent CSS classes for styling
  getAgentClasses(agentId: AgentId): {
    badgeClass: string
    textClass: string
    bgClass: string
    borderClass: string
  } {
    const classMap = {
      medical_expert: {
        badgeClass: 'agent-medical',
        textClass: 'text-pink-700',
        bgClass: 'bg-pink-100',
        borderClass: 'border-pink-200',
      },
      tech_engineer: {
        badgeClass: 'agent-technical',
        textClass: 'text-purple-700',
        bgClass: 'bg-purple-100',
        borderClass: 'border-purple-200',
      },
      business_analyst: {
        badgeClass: 'agent-business',
        textClass: 'text-cyan-700',
        bgClass: 'bg-cyan-100',
        borderClass: 'border-cyan-200',
      },
      regulatory_agent: {
        badgeClass: 'agent-regulatory',
        textClass: 'text-lime-700',
        bgClass: 'bg-lime-100',
        borderClass: 'border-lime-200',
      },
      ethicist: {
        badgeClass: 'agent-ethical',
        textClass: 'text-amber-700',
        bgClass: 'bg-amber-100',
        borderClass: 'border-amber-200',
      },
      patient_advocate: {
        badgeClass: 'agent-patient',
        textClass: 'text-red-700',
        bgClass: 'bg-red-100',
        borderClass: 'border-red-200',
      },
      devils_advocate: {
        badgeClass: 'agent-advocate',
        textClass: 'text-gray-700',
        bgClass: 'bg-gray-100',
        borderClass: 'border-gray-200',
      },
    }

    return classMap[agentId] || {
      badgeClass: 'agent-advocate',
      textClass: 'text-gray-700',
      bgClass: 'bg-gray-100',
      borderClass: 'border-gray-200',
    }
  },
}

export default agentService
