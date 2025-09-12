"""
Regulatory Agent for Bio-Design Innovation
"""

from typing import List, Dict, Any, Optional
from app.core.agents.base import BaseAgent, AgentResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)

class RegulatoryAgent(BaseAgent):
    """Regulatory Agent specialized in medical device regulations and compliance"""
    
    def __init__(self):
        super().__init__(
            agent_id="regulatory_agent",
            model_name="gpt-4-turbo-preview",
            temperature=0.2  # Low temperature for regulatory precision
        )
    
    @property
    def agent_name(self) -> str:
        return "Regulatory Affairs Specialist"
    
    @property
    def expertise_areas(self) -> List[str]:
        """Define areas of regulatory expertise"""
        return [
            "FDA Regulations",
            "CE Marking",
            "ISO Standards", 
            "Medical Device Classification",
            "Clinical Trial Design",
            "Quality Management Systems",
            "Risk Management",
            "Post-Market Surveillance",
            "Regulatory Strategy",
            "Global Harmonization",
            "510(k) Submissions",
            "PMA Applications",
            "De Novo Pathways",
            "Software as Medical Device",
            "Combination Products"
        ]
    
    @property 
    def system_prompt(self) -> str:
        """System prompt defining the regulatory specialist's role and expertise"""
        return """You are an expert Regulatory Affairs Specialist with deep knowledge of global medical device regulations, FDA pathways, and international standards. Your role in the Stanford Biodesign methodology is to:

**Core Regulatory Responsibilities:**
- Assess regulatory pathway and classification requirements
- Evaluate compliance with applicable standards and regulations
- Design regulatory strategy and submission pathways
- Identify clinical evidence requirements
- Assess quality management system needs
- Evaluate post-market obligations

**Regulatory Analysis Areas:**
1. **Device Classification & Pathway:**
   - FDA device classification (Class I, II, III)
   - Regulatory pathway determination (510(k), PMA, De Novo)
   - Predicate device identification
   - International regulatory requirements (CE, Health Canada, etc.)

2. **Standards & Compliance:**
   - ISO 13485 Quality Management Systems
   - ISO 14971 Risk Management
   - IEC 62304 Medical Device Software
   - Biocompatibility testing (ISO 10993)
   - Electromagnetic compatibility (IEC 60601)

3. **Clinical Evidence:**
   - Clinical evaluation requirements
   - Clinical trial design and protocols
   - Literature review and equivalence studies
   - Post-market clinical follow-up (PMCF)

4. **Quality & Risk Management:**
   - Design controls and documentation
   - Risk analysis and mitigation strategies
   - Validation and verification requirements
   - Change control procedures

**Communication Style:**
- Use precise regulatory terminology
- Reference specific regulations and standards
- Provide clear compliance requirements
- Highlight regulatory risks and timelines
- Focus on evidence-based submissions
- Consider global regulatory harmonization

**Decision Framework:**
Consider regulatory feasibility across:
- Classification complexity and predicate availability
- Clinical evidence burden and timeline
- Quality system implementation requirements
- International market access strategies
- Post-market surveillance obligations

Always provide actionable regulatory guidance that ensures compliant product development and successful market authorization."""

    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Main analysis method for regulatory assessment"""
        
        analysis_type = input_data.get("type", "regulatory_pathway")
        
        if analysis_type == "regulatory_pathway":
            return await self._analyze_regulatory_pathway(input_data, context)
        elif analysis_type == "regulatory_strategy":
            return await self._analyze_regulatory_strategy(input_data, context)
        elif analysis_type == "clinical_requirements":
            return await self._analyze_clinical_requirements(input_data, context)
        elif analysis_type == "standards_compliance":
            return await self._analyze_standards_compliance(input_data, context)
        else:
            return await self._general_regulatory_analysis(input_data, context)
    
    async def _analyze_regulatory_pathway(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze regulatory pathway"""
        result = await self.assess_regulatory_pathway(input_data, context)
        
        return AgentResponse(
            content=result["analysis"],
            confidence=0.9,
            reasoning="Regulatory pathway analysis based on FDA expertise",
            sources=["FDA regulations", "Regulatory guidance"],
            recommendations=result.get("requirements", []),
            concerns=result.get("risks", [])
        )
    
    async def _analyze_regulatory_strategy(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze regulatory strategy"""
        result = await self.develop_regulatory_strategy(input_data, context)
        
        return AgentResponse(
            content=result["strategy"],
            confidence=0.85,
            reasoning="Regulatory strategy based on compliance expertise",
            sources=["Regulatory strategy", "Submission pathways"],
            recommendations=result.get("milestones", []),
            concerns=result.get("costs", [])
        )
    
    async def _analyze_clinical_requirements(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze clinical requirements"""
        result = await self.assess_clinical_requirements(input_data, context)
        
        return AgentResponse(
            content=result["clinical_plan"],
            confidence=0.8,
            reasoning="Clinical evidence analysis based on regulatory expertise",
            sources=["Clinical guidelines", "FDA guidance"],
            recommendations=result.get("requirements", []),
            concerns=result.get("alternatives", [])
        )
    
    async def _analyze_standards_compliance(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze standards compliance"""
        result = await self.evaluate_standards_compliance(input_data, context)
        
        return AgentResponse(
            content=result["compliance_plan"],
            confidence=0.85,
            reasoning="Standards compliance analysis based on regulatory expertise",
            sources=["ISO standards", "IEC standards"],
            recommendations=result.get("standards", []),
            concerns=result.get("gaps", [])
        )
    
    async def _general_regulatory_analysis(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General regulatory analysis"""
        
        prompt = f"""
        Conduct a comprehensive regulatory analysis for this medical device:
        
        **Input Data:**
        {input_data}
        
        **Context:**
        {context or "General medical device regulatory context"}
        
        **Regulatory Analysis Required:**
        1. Device classification assessment
        2. Regulatory pathway determination
        3. Clinical evidence requirements
        4. Key compliance obligations
        5. Regulatory risks and mitigation strategies
        
        Provide specific regulatory guidance and recommendations.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return AgentResponse(
            content=response.content,
            confidence=0.8,
            reasoning="General regulatory analysis based on compliance expertise",
            sources=["Regulatory analysis", "FDA guidance"],
            recommendations=self._extract_requirements(response.content),
            concerns=self._extract_risks(response.content)
        )

    async def assess_regulatory_pathway(
        self,
        device_concept: Dict[str, Any],
        target_markets: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Assess regulatory pathway for a medical device concept"""
        
        prompt = f"""
        Conduct a comprehensive regulatory pathway assessment for this medical device:
        
        **Device Concept:**
        {device_concept}
        
        **Target Markets:**
        {target_markets or ["United States (FDA)", "European Union (CE)"]}
        
        **Regulatory Assessment Required:**
        1. FDA device classification (Class I/II/III) with rationale
        2. Most appropriate regulatory pathway (510(k), PMA, De Novo)
        3. Predicate device identification and comparison
        4. Key regulatory standards and requirements
        5. Clinical evidence requirements
        6. Timeline and milestone estimates
        7. International regulatory considerations
        8. Regulatory risks and mitigation strategies
        
        Provide specific pathway recommendations with supporting rationale.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "classification": self._extract_classification(response.content),
            "pathway": self._extract_pathway(response.content),
            "analysis": response.content,
            "requirements": self._extract_requirements(response.content),
            "timeline": self._extract_timeline(response.content),
            "risks": self._extract_risks(response.content)
        }
    
    async def develop_regulatory_strategy(
        self,
        product_details: Dict[str, Any],
        business_objectives: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Develop comprehensive regulatory strategy"""
        
        prompt = f"""
        Develop a comprehensive regulatory strategy for this medical device:
        
        **Product Details:**
        {product_details}
        
        **Business Objectives:**
        {business_objectives or "Maximize market access with efficient timeline"}
        
        **Regulatory Strategy Components:**
        1. Global regulatory strategy and sequencing
        2. Pre-submission and FDA interaction strategy
        3. Clinical development and evidence generation plan
        4. Quality management system implementation
        5. Risk management and design control strategy
        6. Regulatory submission timeline and milestones
        7. Post-market surveillance and compliance plan
        8. Regulatory cost estimates and resource requirements
        
        Focus on efficient and cost-effective regulatory approach.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "strategy": response.content,
            "milestones": self._extract_milestones(response.content),
            "interactions": self._extract_interactions(response.content),
            "costs": self._extract_costs(response.content)
        }
    
    async def assess_clinical_requirements(
        self,
        device_profile: Dict[str, Any],
        regulatory_pathway: Optional[str] = None
    ) -> Dict[str, Any]:
        """Assess clinical evidence requirements"""
        
        prompt = f"""
        Assess clinical evidence requirements for this medical device:
        
        **Device Profile:**
        {device_profile}
        
        **Regulatory Pathway:**
        {regulatory_pathway or "To be determined"}
        
        **Clinical Assessment Required:**
        1. Clinical evidence necessity determination
        2. Clinical trial design recommendations
        3. Endpoints and outcome measures
        4. Sample size and statistical considerations
        5. Comparator and control group strategy
        6. Regulatory submission requirements
        7. Post-market clinical obligations
        8. Alternative evidence strategies (literature, real-world data)
        
        Provide evidence-based clinical development recommendations.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "clinical_plan": response.content,
            "requirements": self._extract_clinical_requirements(response.content),
            "endpoints": self._extract_endpoints(response.content),
            "alternatives": self._extract_alternatives(response.content)
        }
    
    async def evaluate_standards_compliance(
        self,
        device_specifications: Dict[str, Any],
        intended_use: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluate compliance with applicable standards"""
        
        prompt = f"""
        Evaluate standards compliance requirements for this medical device:
        
        **Device Specifications:**
        {device_specifications}
        
        **Intended Use:**
        {intended_use or "To be defined"}
        
        **Standards Compliance Evaluation:**
        1. Applicable ISO and IEC standards identification
        2. FDA recognition status of standards
        3. Testing and validation requirements
        4. Documentation and evidence needs
        5. Third-party testing considerations
        6. Compliance timeline and costs
        7. International harmonization opportunities
        8. Gap analysis and remediation plans
        
        Provide comprehensive standards compliance roadmap.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "compliance_plan": response.content,
            "standards": self._extract_standards(response.content),
            "testing": self._extract_testing(response.content),
            "gaps": self._extract_gaps(response.content)
        }
    
    def _extract_classification(self, content: str) -> str:
        """Extract FDA device classification"""
        import re
        class_match = re.search(r'class\s*(i{1,3}|[123])', content.lower())
        return class_match.group(0).upper() if class_match else "Classification not determined"
    
    def _extract_pathway(self, content: str) -> str:
        """Extract regulatory pathway recommendation"""
        import re
        pathway_match = re.search(r'(510\(k\)|pma|de novo|exempt)', content.lower())
        return pathway_match.group(0).upper() if pathway_match else "Pathway not determined"
    
    def _extract_requirements(self, content: str) -> List[str]:
        """Extract regulatory requirements"""
        import re
        requirements = re.findall(r'requirement[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return requirements[:8]
    
    def _extract_timeline(self, content: str) -> str:
        """Extract regulatory timeline estimate"""
        import re
        timeline_match = re.search(r'timeline[:\-\s]*([^\n\.]+)', content.lower())
        return timeline_match.group(1) if timeline_match else "Timeline not specified"
    
    def _extract_risks(self, content: str) -> List[str]:
        """Extract regulatory risks"""
        import re
        risks = re.findall(r'risk[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return risks[:6]
    
    def _extract_milestones(self, content: str) -> List[str]:
        """Extract regulatory milestones"""
        import re
        milestones = re.findall(r'milestone[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return milestones[:8]
    
    def _extract_interactions(self, content: str) -> List[str]:
        """Extract regulatory interactions"""
        import re
        interactions = re.findall(r'interaction[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return interactions[:5]
    
    def _extract_costs(self, content: str) -> List[str]:
        """Extract regulatory cost estimates"""
        import re
        costs = re.findall(r'cost[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return costs[:6]
    
    def _extract_clinical_requirements(self, content: str) -> List[str]:
        """Extract clinical evidence requirements"""
        import re
        clinical = re.findall(r'clinical[:\-\s]*([^\n\.]+)', content.lower())
        return clinical[:6]
    
    def _extract_endpoints(self, content: str) -> List[str]:
        """Extract clinical endpoints"""
        import re
        endpoints = re.findall(r'endpoint[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return endpoints[:5]
    
    def _extract_alternatives(self, content: str) -> List[str]:
        """Extract alternative evidence strategies"""
        import re
        alternatives = re.findall(r'alternative[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return alternatives[:5]
    
    def _extract_standards(self, content: str) -> List[str]:
        """Extract applicable standards"""
        import re
        standards = re.findall(r'iso|iec|astm|aami|fda[:\-\s]*([^\n\.]+)', content.lower())
        return standards[:8]
    
    def _extract_testing(self, content: str) -> List[str]:
        """Extract testing requirements"""
        import re
        testing = re.findall(r'test[ing]*[:\-\s]*([^\n\.]+)', content.lower())
        return testing[:6]
    
    def _extract_gaps(self, content: str) -> List[str]:
        """Extract compliance gaps"""
        import re
        gaps = re.findall(r'gap[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return gaps[:5]
