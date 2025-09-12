"""
Perplexity API Service for real-time market intelligence and web search
"""

import os
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from datetime import datetime

from app.utils.logging import get_logger

logger = get_logger(__name__)

class PerplexityService:
    """Service for integrating with Perplexity API for real-time market research"""
    
    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        if not self.api_key:
            logger.warning("Perplexity API key not found. Real-time search will be unavailable.")
    
    async def search_market_intelligence(
        self,
        query: str,
        context: Optional[str] = None,
        focus_areas: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Search for market intelligence using Perplexity API"""
        
        if not self.api_key:
            return self._mock_search_response(query)
        
        try:
            # Enhance query with biomedical context
            enhanced_query = self._enhance_query_for_biomedical(query, context, focus_areas)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "llama-3.1-sonar-large-128k-online",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a biomedical market research expert. Provide comprehensive, up-to-date market intelligence with specific data, trends, and actionable insights. Always cite your sources."
                            },
                            {
                                "role": "user", 
                                "content": enhanced_query
                            }
                        ],
                        "max_tokens": 1500,
                        "temperature": 0.3,
                        "stream": False
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return self._format_search_response(result, query)
                else:
                    logger.error(f"Perplexity API error: {response.status_code} - {response.text}")
                    return self._mock_search_response(query, error=f"API Error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error in Perplexity search: {str(e)}")
            return self._mock_search_response(query, error=str(e))
    
    async def get_competitor_analysis(
        self,
        solution_concept: str,
        market_segment: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get competitor analysis for a solution concept"""
        
        query = f"""
        Competitor analysis for biomedical innovation: {solution_concept}
        {f"Market segment: {market_segment}" if market_segment else ""}
        
        Please provide:
        1. Direct competitors and their market positions
        2. Indirect competitors and alternative solutions
        3. Market share data where available
        4. Competitive advantages and weaknesses
        5. Recent competitive developments
        6. Market positioning opportunities
        """
        
        return await self.search_market_intelligence(
            query=query,
            focus_areas=["competitors", "market_share", "positioning"]
        )
    
    async def get_regulatory_landscape(
        self,
        solution_type: str,
        target_markets: List[str] = None
    ) -> Dict[str, Any]:
        """Get current regulatory landscape information"""
        
        markets = target_markets or ["United States", "European Union"]
        query = f"""
        Current regulatory landscape for {solution_type} in {', '.join(markets)}:
        
        Please provide:
        1. Current regulatory requirements and pathways
        2. Recent regulatory changes or updates
        3. Approval timelines and processes
        4. Regulatory challenges and considerations
        5. Upcoming regulatory changes
        6. Regulatory best practices
        """
        
        return await self.search_market_intelligence(
            query=query,
            focus_areas=["regulation", "approval", "compliance"]
        )
    
    async def get_market_trends(
        self,
        clinical_area: str,
        time_horizon: str = "2024-2025"
    ) -> Dict[str, Any]:
        """Get current market trends in a clinical area"""
        
        query = f"""
        Healthcare market trends in {clinical_area} for {time_horizon}:
        
        Please provide:
        1. Emerging trends and market developments
        2. Technology adoption patterns
        3. Investment and funding trends
        4. Clinical practice changes
        5. Patient demand patterns
        6. Market growth projections
        7. Key market drivers and barriers
        """
        
        return await self.search_market_intelligence(
            query=query,
            focus_areas=["trends", "adoption", "growth", "investment"]
        )
    
    async def get_funding_landscape(
        self,
        solution_stage: str,
        funding_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get information about funding landscape for biomedical innovations"""
        
        query = f"""
        Funding landscape for {solution_stage} biomedical innovations in 2024-2025:
        {f"Focus on {funding_type} funding" if funding_type else ""}
        
        Please provide:
        1. Active investors and funding sources
        2. Recent funding rounds and valuations
        3. Funding trends and patterns
        4. Investment criteria and preferences
        5. Grant opportunities and programs
        6. Funding success factors
        """
        
        return await self.search_market_intelligence(
            query=query,
            focus_areas=["funding", "investment", "grants", "investors"]
        )
    
    async def validate_market_size(
        self,
        target_condition: str,
        geographic_scope: str = "global"
    ) -> Dict[str, Any]:
        """Validate market size estimates for a target condition"""
        
        query = f"""
        Market size analysis for {target_condition} ({geographic_scope} market):
        
        Please provide:
        1. Current market size and value
        2. Patient population and prevalence data
        3. Market growth rates and projections
        4. Key market segments and sub-markets
        5. Economic burden and cost data
        6. Market access and reimbursement landscape
        """
        
        return await self.search_market_intelligence(
            query=query,
            focus_areas=["market_size", "prevalence", "economics", "reimbursement"]
        )
    
    def _enhance_query_for_biomedical(
        self,
        query: str,
        context: Optional[str] = None,
        focus_areas: Optional[List[str]] = None
    ) -> str:
        """Enhance query with biomedical and market research context"""
        
        enhanced = f"Biomedical market research query: {query}\n"
        
        if context:
            enhanced += f"\nContext: {context}\n"
        
        if focus_areas:
            enhanced += f"\nFocus areas: {', '.join(focus_areas)}\n"
        
        enhanced += """
        Please provide comprehensive, current information with:
        - Specific data and statistics where available
        - Recent developments (2023-2025)
        - Source citations and references
        - Actionable insights for biomedical innovation
        - Market quantification where possible
        """
        
        return enhanced
    
    def _format_search_response(self, api_response: Dict[str, Any], original_query: str) -> Dict[str, Any]:
        """Format Perplexity API response into structured format"""
        
        try:
            content = api_response.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            return {
                "query": original_query,
                "content": content,
                "sources": self._extract_sources(content),
                "key_insights": self._extract_key_insights(content),
                "data_points": self._extract_data_points(content),
                "search_timestamp": datetime.utcnow().isoformat(),
                "confidence": "high",  # Perplexity provides real-time data
                "source": "perplexity_api"
            }
            
        except Exception as e:
            logger.error(f"Error formatting Perplexity response: {str(e)}")
            return self._mock_search_response(original_query, error="Response formatting error")
    
    def _extract_sources(self, content: str) -> List[str]:
        """Extract source citations from Perplexity response"""
        # Simple extraction - in real implementation would use more sophisticated parsing
        sources = []
        lines = content.split('\n')
        for line in lines:
            if '[' in line and ']' in line:
                # Extract text between brackets as potential sources
                import re
                source_matches = re.findall(r'\[([^\]]+)\]', line)
                sources.extend(source_matches)
        
        return sources[:10]  # Limit to top 10 sources
    
    def _extract_key_insights(self, content: str) -> List[str]:
        """Extract key insights from response content"""
        insights = []
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line and (line.startswith('•') or line.startswith('-') or line.startswith('*')):
                insights.append(line.lstrip('•-* '))
            elif line and any(keyword in line.lower() for keyword in ['key', 'important', 'significant', 'trend']):
                insights.append(line)
        
        return insights[:8]  # Limit to top 8 insights
    
    def _extract_data_points(self, content: str) -> List[Dict[str, Any]]:
        """Extract quantitative data points from response"""
        data_points = []
        lines = content.split('\n')
        
        for line in lines:
            # Look for patterns like "$X billion", "X%", "X million patients"
            import re
            
            # Financial figures
            money_matches = re.findall(r'\$([0-9.]+)\s*(billion|million|thousand)?', line, re.IGNORECASE)
            for amount, scale in money_matches:
                data_points.append({
                    "type": "financial",
                    "value": float(amount),
                    "scale": scale or "dollars",
                    "context": line.strip()
                })
            
            # Percentages
            percent_matches = re.findall(r'([0-9.]+)%', line)
            for percent in percent_matches:
                data_points.append({
                    "type": "percentage", 
                    "value": float(percent),
                    "context": line.strip()
                })
        
        return data_points[:5]  # Limit to top 5 data points
    
    def _mock_search_response(self, query: str, error: Optional[str] = None) -> Dict[str, Any]:
        """Return mock response when API is unavailable"""
        
        return {
            "query": query,
            "content": f"Mock response for: {query}\n\nNote: Perplexity API unavailable. This would normally provide real-time market intelligence.",
            "sources": ["Mock data source"],
            "key_insights": [
                "Real-time market data would be available with Perplexity API",
                "Market research would include current trends and developments",
                "Competitive analysis would be based on latest information"
            ],
            "data_points": [],
            "search_timestamp": datetime.utcnow().isoformat(),
            "confidence": "low",
            "source": "mock_data",
            "error": error
        }
    
    async def batch_search(self, queries: List[str]) -> List[Dict[str, Any]]:
        """Perform multiple searches in batch"""
        
        tasks = [self.search_market_intelligence(query) for query in queries]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        formatted_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                formatted_results.append(self._mock_search_response(queries[i], error=str(result)))
            else:
                formatted_results.append(result)
        
        return formatted_results
