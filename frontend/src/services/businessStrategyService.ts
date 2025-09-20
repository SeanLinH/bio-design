import { apiRequest, API_ENDPOINTS } from './api'

export interface BusinessStrategyRequest {
  analysis_type: 'comprehensive' | 'porter_five_forces' | 'business_model_canvas' | 'pricing_strategy' | 'go_to_market'
  market_context: {
    target_market: string
    market_size: string
    growth_rate: string
    key_competitors: string[]
  }
  solution_context: {
    solution_id: string
    technology_readiness: number
    regulatory_pathway: string
  }
}

export interface BusinessStrategyAnalysis {
  analysis_id: string
  analysis_type: string
  generated_at: string
  business_strategy: {
    executive_summary: string
    porter_five_forces?: {
      competitive_rivalry: ForceAnalysis
      supplier_power: ForceAnalysis
      buyer_power: ForceAnalysis
      threat_of_substitutes: ForceAnalysis
      barriers_to_entry: ForceAnalysis
    }
    business_models: BusinessModel[]
    pricing_strategy: PricingStrategy
    go_to_market: GoToMarketStrategy
    risk_assessment: RiskAssessment
  }
  financial_projections: FinancialProjections
}

export interface ForceAnalysis {
  intensity: 'low' | 'medium' | 'high'
  score: number
  factors: string[]
}

export interface BusinessModel {
  model_type: string
  description: string
  revenue_streams: RevenueStream[]
  target_customers: string[]
  value_proposition: string
}

export interface RevenueStream {
  type: string
  description: string
  projected_revenue: string
}

export interface PricingStrategy {
  pricing_model: string
  device_price_range: string
  subscription_price_range: string
  competitive_positioning: string
}

export interface GoToMarketStrategy {
  primary_channels: string[]
  customer_acquisition_strategy: string
  market_entry_sequence: string[]
}

export interface RiskAssessment {
  high_risks: string[]
  medium_risks: string[]
  mitigation_strategies: string[]
}

export interface FinancialProjections {
  revenue_forecast: Record<string, string>
  market_penetration: Record<string, string>
}

export const businessStrategyService = {
  // Generate business strategy analysis
  async generateAnalysis(
    sessionId: string,
    request: BusinessStrategyRequest
  ): Promise<BusinessStrategyAnalysis> {
    return apiRequest.post<BusinessStrategyAnalysis>(
      API_ENDPOINTS.generateBusinessStrategy(sessionId),
      request
    )
  },

  // Get existing business strategy analysis
  async getAnalysis(
    sessionId: string,
    analysisId: string
  ): Promise<BusinessStrategyAnalysis> {
    return apiRequest.get<BusinessStrategyAnalysis>(
      API_ENDPOINTS.getBusinessStrategy(sessionId, analysisId)
    )
  },

  // Update business strategy parameters
  async updateAnalysis(
    sessionId: string,
    analysisId: string,
    updates: Partial<BusinessStrategyRequest>
  ): Promise<BusinessStrategyAnalysis> {
    return apiRequest.put<BusinessStrategyAnalysis>(
      API_ENDPOINTS.updateBusinessStrategy(sessionId, analysisId),
      updates
    )
  },
}

export default businessStrategyService
