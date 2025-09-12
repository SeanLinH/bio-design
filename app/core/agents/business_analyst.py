"""
Business Analyst Agent for Bio-Design Innovation
"""

from typing import List, Dict, Any, Optional
from app.core.agents.base import BaseAgent, AgentResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)

class BusinessAnalystAgent(BaseAgent):
    """Business Analyst Agent specialized in market analysis and commercial viability"""
    
    def __init__(self):
        super().__init__(
            agent_id="business_analyst",
            model_name="gpt-4-turbo-preview",
            temperature=0.3  # Lower temperature for analytical precision
        )
    
    @property
    def agent_name(self) -> str:
        return "Business Analyst"
    
    @property
    def expertise_areas(self) -> List[str]:
        """Define areas of business analysis expertise"""
        return [
            "Market Analysis",
            "Business Model Development", 
            "Financial Modeling",
            "Competitive Intelligence",
            "Value Proposition Design",
            "Go-to-Market Strategy",
            "Revenue Models",
            "Investment Analysis",
            "Risk Assessment",
            "Stakeholder Analysis",
            "Healthcare Economics",
            "Reimbursement Strategy",
            "Partnership Development",
            "Commercial Strategy",
            "Business Case Development"
        ]
    
    @property 
    def system_prompt(self) -> str:
        """System prompt defining the business analyst's role and expertise"""
        return """You are an expert Business Analyst specializing in healthcare innovation and medical device commercialization. Your role in the Stanford Biodesign methodology is to:

**Core Business Responsibilities:**
- Evaluate commercial viability and market potential
- Analyze competitive landscape and positioning
- Develop business models and revenue strategies
- Assess financial requirements and projections
- Identify key stakeholders and partnerships
- Design go-to-market strategies

**Business Analysis Areas:**
1. **Market Assessment:**
   - Market size and growth potential (TAM, SAM, SOM)
   - Customer segmentation and targeting
   - Market dynamics and trends
   - Competitive analysis and positioning

2. **Financial Analysis:**
   - Revenue model development
   - Cost structure analysis
   - Investment requirements and funding strategy
   - Financial projections and ROI calculations
   - Pricing strategy and reimbursement considerations

3. **Strategic Planning:**
   - Business model canvas development
   - Value proposition design
   - Partnership and distribution strategies
   - Risk assessment and mitigation
   - Scalability and growth planning

4. **Commercial Feasibility:**
   - Go-to-market strategy design
   - Sales and marketing approach
   - Customer acquisition strategy
   - Regulatory and reimbursement pathways
   - Implementation timeline and milestones

**Communication Style:**
- Use data-driven business insights
- Provide quantitative market analysis
- Focus on commercial viability metrics
- Highlight revenue and profitability potential
- Address market risks and opportunities
- Reference industry benchmarks and best practices

**Decision Framework:**
Consider viability across multiple dimensions:
- Market opportunity size and accessibility
- Competitive advantage and differentiation
- Financial attractiveness and sustainability
- Implementation feasibility and timeline
- Strategic alignment with healthcare trends

Always provide actionable business insights that support commercial success and sustainable growth."""

    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Main analysis method for business assessment"""
        
        analysis_type = input_data.get("type", "market_analysis")
        
        if analysis_type == "market_analysis":
            return await self._analyze_market_opportunity(input_data, context)
        elif analysis_type == "business_model":
            return await self._analyze_business_model(input_data, context)
        elif analysis_type == "financial_analysis":
            return await self._assess_financial_viability(input_data, context)
        elif analysis_type == "go_to_market":
            return await self._analyze_go_to_market(input_data, context)
        else:
            return await self._general_business_analysis(input_data, context)
    
    async def _analyze_market_opportunity(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze market opportunity"""
        result = await self.analyze_market_opportunity(input_data, context)
        
        return AgentResponse(
            content=result["analysis"],
            confidence=0.8,
            reasoning="Market analysis based on business expertise",
            sources=["Market research", "Industry analysis"],
            recommendations=result.get("recommendations", []),
            concerns=result.get("risks", [])
        )
    
    async def _analyze_business_model(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze business model"""
        result = await self.develop_business_model(input_data, context)
        
        return AgentResponse(
            content=result["business_model"],
            confidence=0.85,
            reasoning="Business model analysis based on commercial expertise",
            sources=["Business strategy frameworks", "Industry best practices"],
            recommendations=result.get("revenue_streams", []),
            concerns=result.get("cost_structure", [])
        )
    
    async def _assess_financial_viability(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess financial viability"""
        result = await self.assess_financial_viability(input_data, context)
        
        return AgentResponse(
            content=result["financial_model"],
            confidence=0.75,
            reasoning="Financial analysis based on business modeling expertise",
            sources=["Financial modeling", "Investment analysis"],
            recommendations=result.get("revenue_projections", []),
            concerns=result.get("investment_needs", [])
        )
    
    async def _analyze_go_to_market(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze go-to-market strategy"""
        result = await self.design_go_to_market_strategy(input_data, context)
        
        return AgentResponse(
            content=result["gtm_strategy"],
            confidence=0.8,
            reasoning="Go-to-market strategy based on commercial expertise",
            sources=["Marketing strategy", "Sales methodology"],
            recommendations=result.get("customer_acquisition", []),
            concerns=result.get("marketing_channels", [])
        )
    
    async def _general_business_analysis(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General business analysis"""
        
        prompt = f"""
        Conduct a comprehensive business analysis for this healthcare innovation:
        
        **Input Data:**
        {input_data}
        
        **Context:**
        {context or "General healthcare business context"}
        
        **Business Analysis Required:**
        1. Commercial viability assessment
        2. Market opportunity evaluation
        3. Competitive landscape analysis
        4. Revenue model recommendations
        5. Key business risks and mitigation strategies
        
        Provide actionable business insights and recommendations.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return AgentResponse(
            content=response.content,
            confidence=0.8,
            reasoning="General business analysis based on commercial expertise",
            sources=["Business analysis", "Market research"],
            recommendations=self._extract_recommendations(response.content),
            concerns=self._extract_risks(response.content)
        )

    async def analyze_market_opportunity(
        self,
        innovation_concept: Dict[str, Any],
        target_market: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze market opportunity for an innovation concept"""
        
        prompt = f"""
        Conduct a comprehensive market opportunity analysis for this biomedical innovation:
        
        **Innovation Concept:**
        {innovation_concept}
        
        **Target Market Information:**
        {target_market or "To be determined"}
        
        **Market Analysis Required:**
        1. Total Addressable Market (TAM) estimation
        2. Serviceable Addressable Market (SAM) analysis
        3. Serviceable Obtainable Market (SOM) projection
        4. Market growth trends and drivers
        5. Customer segmentation and personas
        6. Competitive landscape assessment
        7. Market barriers and entry challenges
        8. Revenue potential and timeline
        
        Provide specific market sizing with data sources and assumptions.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "market_size": self._extract_market_size(response.content),
            "analysis": response.content,
            "opportunities": self._extract_opportunities(response.content),
            "risks": self._extract_risks(response.content),
            "recommendations": self._extract_recommendations(response.content)
        }
    
    async def develop_business_model(
        self,
        value_proposition: Dict[str, Any],
        market_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Develop comprehensive business model"""
        
        prompt = f"""
        Develop a comprehensive business model for this healthcare innovation:
        
        **Value Proposition:**
        {value_proposition}
        
        **Market Context:**
        {market_context or "General healthcare market"}
        
        **Business Model Components Required:**
        1. Value proposition canvas
        2. Revenue model and pricing strategy
        3. Customer segments and relationships
        4. Key partnerships and alliances
        5. Cost structure and key resources
        6. Distribution channels and sales strategy
        7. Competitive advantage and differentiation
        8. Financial projections and milestones
        
        Focus on sustainable and scalable business model design.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "business_model": response.content,
            "revenue_streams": self._extract_revenue_streams(response.content),
            "key_partnerships": self._extract_partnerships(response.content),
            "cost_structure": self._extract_costs(response.content)
        }
    
    async def assess_financial_viability(
        self,
        business_model: Dict[str, Any],
        investment_requirements: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Assess financial viability and investment requirements"""
        
        prompt = f"""
        Assess the financial viability of this healthcare business model:
        
        **Business Model:**
        {business_model}
        
        **Investment Requirements:**
        {investment_requirements or "To be determined"}
        
        **Financial Analysis Required:**
        1. Revenue projections (5-year forecast)
        2. Cost structure and break-even analysis
        3. Investment requirements by phase
        4. Cash flow projections
        5. Profitability timeline
        6. ROI and IRR calculations
        7. Funding strategy and milestones
        8. Sensitivity analysis and scenarios
        
        Provide realistic financial models with key assumptions.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "financial_model": response.content,
            "revenue_projections": self._extract_revenue_projections(response.content),
            "investment_needs": self._extract_investment_needs(response.content),
            "profitability_timeline": self._extract_profitability(response.content)
        }
    
    async def design_go_to_market_strategy(
        self,
        product_concept: Dict[str, Any],
        target_customers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Design comprehensive go-to-market strategy"""
        
        prompt = f"""
        Design a comprehensive go-to-market strategy for this healthcare innovation:
        
        **Product Concept:**
        {product_concept}
        
        **Target Customers:**
        {target_customers or "To be defined"}
        
        **Go-to-Market Strategy Required:**
        1. Customer acquisition strategy
        2. Sales and marketing approach
        3. Distribution channel strategy
        4. Pricing and positioning strategy
        5. Partnership and alliance strategy
        6. Launch timeline and milestones
        7. Success metrics and KPIs
        8. Risk mitigation strategies
        
        Focus on practical implementation and measurable outcomes.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "gtm_strategy": response.content,
            "customer_acquisition": self._extract_customer_acquisition(response.content),
            "marketing_channels": self._extract_marketing_channels(response.content),
            "success_metrics": self._extract_success_metrics(response.content)
        }
    
    def _extract_market_size(self, content: str) -> Dict[str, str]:
        """Extract market size estimates"""
        import re
        tam_match = re.search(r'TAM[:\-\s]*([^\n\.]+)', content, re.IGNORECASE)
        sam_match = re.search(r'SAM[:\-\s]*([^\n\.]+)', content, re.IGNORECASE)
        som_match = re.search(r'SOM[:\-\s]*([^\n\.]+)', content, re.IGNORECASE)
        
        return {
            "TAM": tam_match.group(1) if tam_match else "Not specified",
            "SAM": sam_match.group(1) if sam_match else "Not specified", 
            "SOM": som_match.group(1) if som_match else "Not specified"
        }
    
    def _extract_opportunities(self, content: str) -> List[str]:
        """Extract market opportunities"""
        import re
        opportunities = re.findall(r'opportunit[y|ies][:\-\s]*([^\n\.]+)', content.lower())
        return opportunities[:5]
    
    def _extract_risks(self, content: str) -> List[str]:
        """Extract business risks"""
        import re
        risks = re.findall(r'risk[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return risks[:5]
    
    def _extract_recommendations(self, content: str) -> List[str]:
        """Extract business recommendations"""
        import re
        recommendations = re.findall(r'recommend[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return recommendations[:5]
    
    def _extract_revenue_streams(self, content: str) -> List[str]:
        """Extract revenue stream models"""
        import re
        revenue = re.findall(r'revenue[:\-\s]*([^\n\.]+)', content.lower())
        return revenue[:5]
    
    def _extract_partnerships(self, content: str) -> List[str]:
        """Extract key partnership opportunities"""
        import re
        partnerships = re.findall(r'partner[s|ship]*[:\-\s]*([^\n\.]+)', content.lower())
        return partnerships[:5]
    
    def _extract_costs(self, content: str) -> List[str]:
        """Extract cost structure elements"""
        import re
        costs = re.findall(r'cost[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return costs[:6]
    
    def _extract_revenue_projections(self, content: str) -> List[str]:
        """Extract revenue projection details"""
        import re
        projections = re.findall(r'projection[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return projections[:5]
    
    def _extract_investment_needs(self, content: str) -> List[str]:
        """Extract investment requirement details"""
        import re
        investment = re.findall(r'investment[:\-\s]*([^\n\.]+)', content.lower())
        return investment[:5]
    
    def _extract_profitability(self, content: str) -> str:
        """Extract profitability timeline"""
        import re
        profit_match = re.search(r'profitabilit[y]*[:\-\s]*([^\n\.]+)', content.lower())
        return profit_match.group(1) if profit_match else "Timeline not specified"
    
    def _extract_customer_acquisition(self, content: str) -> List[str]:
        """Extract customer acquisition strategies"""
        import re
        acquisition = re.findall(r'acquisition[:\-\s]*([^\n\.]+)', content.lower())
        return acquisition[:5]
    
    def _extract_marketing_channels(self, content: str) -> List[str]:
        """Extract marketing channel strategies"""
        import re
        channels = re.findall(r'channel[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return channels[:5]
    
    def _extract_success_metrics(self, content: str) -> List[str]:
        """Extract success metrics and KPIs"""
        import re
        metrics = re.findall(r'metric[s]?[:\-\s]*([^\n\.]+)', content.lower())
        kpis = re.findall(r'kpi[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return (metrics + kpis)[:6]
