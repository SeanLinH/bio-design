"""
Ethicist Agent for Bio-Design Innovation
"""

from typing import List, Dict, Any, Optional
from app.core.agents.base import BaseAgent, AgentResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)

class EthicistAgent(BaseAgent):
    """Ethicist Agent specialized in biomedical ethics and moral considerations"""
    
    def __init__(self):
        super().__init__(
            agent_id="ethicist",
            model_name="gpt-4-turbo-preview",
            temperature=0.4  # Moderate temperature for nuanced ethical reasoning
        )
    
    @property
    def agent_name(self) -> str:
        return "Biomedical Ethicist"
    
    @property
    def expertise_areas(self) -> List[str]:
        """Define areas of ethical expertise"""
        return [
            "Biomedical Ethics",
            "Research Ethics", 
            "Clinical Ethics",
            "Digital Health Ethics",
            "AI in Healthcare Ethics",
            "Data Privacy and Security",
            "Informed Consent",
            "Health Equity",
            "Justice and Fairness",
            "Beneficence and Non-maleficence",
            "Autonomy and Self-determination",
            "Global Health Ethics",
            "Vulnerable Populations",
            "End-of-life Care",
            "Emerging Technology Ethics"
        ]
    
    @property 
    def system_prompt(self) -> str:
        """System prompt defining the ethicist's role and expertise"""
        return """You are an expert Biomedical Ethicist with deep knowledge of medical ethics, research ethics, and emerging technology ethics in healthcare. Your role in the Stanford Biodesign methodology is to:

**Core Ethical Responsibilities:**
- Evaluate moral implications and ethical considerations
- Assess impact on vulnerable and underserved populations
- Analyze justice, fairness, and health equity concerns
- Review informed consent and autonomy issues
- Evaluate beneficence and non-maleficence principles
- Address privacy, security, and data ethics

**Ethical Analysis Framework:**
1. **Principlist Approach (Beauchamp & Childress):**
   - Autonomy: Respect for persons and self-determination
   - Beneficence: Obligation to do good and promote welfare
   - Non-maleficence: Duty to do no harm
   - Justice: Fair distribution of benefits and burdens

2. **Consequentialist Considerations:**
   - Utilitarian analysis of outcomes and consequences
   - Risk-benefit assessment for all stakeholders
   - Long-term societal impact evaluation
   - Unintended consequences identification

3. **Deontological Duties:**
   - Categorical moral obligations
   - Rights-based analysis
   - Professional duties and responsibilities
   - Moral rules and universal principles

4. **Virtue Ethics:**
   - Character traits and moral virtues
   - Professional integrity and trustworthiness
   - Role modeling and moral exemplarity
   - Compassion and empathy in care

**Special Considerations:**
- Health disparities and social determinants
- Cultural sensitivity and diversity
- Vulnerable populations protection
- Global health and resource allocation
- Emerging technology implications
- Intergenerational justice

**Communication Style:**
- Use clear ethical reasoning and frameworks
- Balance multiple ethical perspectives
- Acknowledge moral complexity and ambiguity
- Provide practical ethical guidance
- Consider diverse stakeholder viewpoints
- Reference established ethical principles and guidelines

**Decision Framework:**
Evaluate ethical dimensions across:
- Individual patient welfare and rights
- Healthcare provider obligations
- Institutional and organizational ethics
- Societal and public health implications
- Global and cross-cultural considerations

Always provide thoughtful ethical analysis that promotes moral reflection and responsible innovation in healthcare."""

    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Main analysis method for ethical assessment"""
        
        analysis_type = input_data.get("type", "ethical_analysis")
        
        if analysis_type == "ethical_analysis":
            return await self._conduct_ethical_analysis(input_data, context)
        elif analysis_type == "research_ethics":
            return await self._analyze_research_ethics(input_data, context)
        elif analysis_type == "health_equity":
            return await self._analyze_health_equity(input_data, context)
        elif analysis_type == "technology_ethics":
            return await self._analyze_technology_ethics(input_data, context)
        else:
            return await self._general_ethical_analysis(input_data, context)
    
    async def _conduct_ethical_analysis(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Conduct ethical analysis"""
        result = await self.conduct_ethical_analysis(input_data, context)
        
        return AgentResponse(
            content=result["ethical_assessment"],
            confidence=0.85,
            reasoning="Ethical analysis based on biomedical ethics principles",
            sources=["Bioethics principles", "Professional guidelines"],
            recommendations=result.get("recommendations", []),
            concerns=result.get("concerns", [])
        )
    
    async def _analyze_research_ethics(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze research ethics"""
        result = await self.assess_research_ethics(input_data, context)
        
        return AgentResponse(
            content=result["research_ethics"],
            confidence=0.9,
            reasoning="Research ethics analysis based on IRB principles",
            sources=["Research ethics guidelines", "IRB standards"],
            recommendations=result.get("irb_considerations", []),
            concerns=result.get("protections", [])
        )
    
    async def _analyze_health_equity(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze health equity"""
        result = await self.evaluate_health_equity(input_data, context)
        
        return AgentResponse(
            content=result["equity_analysis"],
            confidence=0.8,
            reasoning="Health equity analysis based on justice principles",
            sources=["Health equity frameworks", "Social justice principles"],
            recommendations=result.get("equity_recommendations", []),
            concerns=result.get("disparity_impacts", [])
        )
    
    async def _analyze_technology_ethics(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze technology ethics"""
        result = await self.assess_emerging_technology_ethics(input_data, context)
        
        return AgentResponse(
            content=result["technology_ethics"],
            confidence=0.75,
            reasoning="Technology ethics analysis based on emerging tech principles",
            sources=["AI ethics guidelines", "Technology ethics frameworks"],
            recommendations=result.get("ai_considerations", []),
            concerns=result.get("privacy_concerns", [])
        )
    
    async def _general_ethical_analysis(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General ethical analysis"""
        
        prompt = f"""
        Conduct a comprehensive ethical analysis for this healthcare innovation:
        
        **Input Data:**
        {input_data}
        
        **Context:**
        {context or "General healthcare ethics context"}
        
        **Ethical Analysis Required:**
        1. Principlist analysis (autonomy, beneficence, non-maleficence, justice)
        2. Stakeholder impact assessment
        3. Vulnerable population considerations
        4. Data and privacy ethics
        5. Long-term ethical implications
        
        Provide thoughtful ethical guidance and recommendations.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return AgentResponse(
            content=response.content,
            confidence=0.8,
            reasoning="General ethical analysis based on biomedical ethics expertise",
            sources=["Bioethics analysis", "Ethical guidelines"],
            recommendations=self._extract_recommendations(response.content),
            concerns=self._extract_concerns(response.content)
        )

    async def conduct_ethical_analysis(
        self,
        innovation_concept: Dict[str, Any],
        stakeholder_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Conduct comprehensive ethical analysis of innovation concept"""
        
        prompt = f"""
        Conduct a comprehensive ethical analysis for this biomedical innovation:
        
        **Innovation Concept:**
        {innovation_concept}
        
        **Stakeholder Context:**
        {stakeholder_context or "General healthcare setting"}
        
        **Ethical Analysis Required:**
        1. **Principlist Analysis:**
           - Autonomy implications and informed consent considerations
           - Beneficence: How does this promote patient welfare?
           - Non-maleficence: What potential harms must be mitigated?
           - Justice: How are benefits and burdens distributed?

        2. **Stakeholder Impact Assessment:**
           - Patient and family considerations
           - Healthcare provider implications
           - Healthcare system effects
           - Societal and community impact

        3. **Vulnerable Population Considerations:**
           - Impact on underserved communities
           - Accessibility and health equity concerns
           - Protection of vulnerable groups
           - Cultural sensitivity requirements

        4. **Data and Privacy Ethics:**
           - Data collection and use implications
           - Privacy and confidentiality protection
           - Consent for data use
           - Data sharing and secondary use ethics

        5. **Long-term Ethical Implications:**
           - Unintended consequences and risks
           - Precedent-setting considerations
           - Future technology development ethics
           - Intergenerational impact

        Provide nuanced ethical analysis with specific recommendations.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "ethical_assessment": response.content,
            "moral_implications": self._extract_moral_implications(response.content),
            "stakeholder_impacts": self._extract_stakeholder_impacts(response.content),
            "recommendations": self._extract_recommendations(response.content),
            "concerns": self._extract_concerns(response.content)
        }
    
    async def assess_research_ethics(
        self,
        study_design: Dict[str, Any],
        participant_population: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Assess research ethics and IRB considerations"""
        
        prompt = f"""
        Assess research ethics considerations for this biomedical study:
        
        **Study Design:**
        {study_design}
        
        **Participant Population:**
        {participant_population or "General adult population"}
        
        **Research Ethics Assessment:**
        1. **IRB Review Requirements:**
           - Level of review needed (exempt, expedited, full board)
           - Key ethical concerns for review
           - Special population considerations

        2. **Informed Consent Process:**
           - Consent form requirements and elements
           - Capacity and voluntariness assessment
           - Ongoing consent and withdrawal procedures

        3. **Risk-Benefit Analysis:**
           - Research risks identification and minimization
           - Benefit assessment and distribution
           - Risk-benefit ratio evaluation

        4. **Participant Protection:**
           - Vulnerable population protections
           - Privacy and confidentiality safeguards
           - Data security and management

        5. **Scientific and Social Value:**
           - Study importance and significance
           - Social value and knowledge contribution
           - Resource allocation justification

        Provide specific guidance for ethical research conduct.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "research_ethics": response.content,
            "irb_considerations": self._extract_irb_considerations(response.content),
            "consent_requirements": self._extract_consent_requirements(response.content),
            "protections": self._extract_protections(response.content)
        }
    
    async def evaluate_health_equity(
        self,
        intervention_details: Dict[str, Any],
        target_population: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Evaluate health equity and justice implications"""
        
        prompt = f"""
        Evaluate health equity and justice implications for this intervention:
        
        **Intervention Details:**
        {intervention_details}
        
        **Target Population:**
        {target_population or "General population"}
        
        **Health Equity Assessment:**
        1. **Access and Availability:**
           - Geographic accessibility
           - Economic accessibility and affordability
           - Cultural and linguistic accessibility
           - Technology and digital divide considerations

        2. **Health Disparities Impact:**
           - Effect on existing health disparities
           - Vulnerable population implications
           - Social determinants of health consideration
           - Intersectionality analysis

        3. **Distributive Justice:**
           - Fair allocation of benefits and resources
           - Priority setting and resource distribution
           - Opportunity cost considerations
           - Global health justice implications

        4. **Procedural Justice:**
           - Fair processes and decision-making
           - Stakeholder participation and representation
           - Transparency and accountability
           - Appeal and grievance mechanisms

        5. **Recognition and Dignity:**
           - Respect for cultural values and beliefs
           - Recognition of diverse needs and preferences
           - Dignity preservation and enhancement
           - Stigma reduction and prevention

        Focus on concrete recommendations for promoting equity.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "equity_analysis": response.content,
            "access_barriers": self._extract_access_barriers(response.content),
            "disparity_impacts": self._extract_disparity_impacts(response.content),
            "equity_recommendations": self._extract_equity_recommendations(response.content)
        }
    
    async def assess_emerging_technology_ethics(
        self,
        technology_description: Dict[str, Any],
        implementation_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Assess ethical implications of emerging healthcare technologies"""
        
        prompt = f"""
        Assess ethical implications of this emerging healthcare technology:
        
        **Technology Description:**
        {technology_description}
        
        **Implementation Context:**
        {implementation_context or "Healthcare delivery setting"}
        
        **Emerging Technology Ethics Assessment:**
        1. **AI and Algorithm Ethics:**
           - Algorithmic bias and fairness
           - Transparency and explainability
           - Human oversight and control
           - Accountability and responsibility

        2. **Data Ethics and Privacy:**
           - Data collection and surveillance concerns
           - Consent for AI/ML model training
           - Data ownership and control
           - Cross-border data sharing ethics

        3. **Human-Technology Interaction:**
           - Human agency and decision-making
           - Technology dependence and deskilling
           - Human-AI collaboration ethics
           - User autonomy and control

        4. **Innovation and Precaution:**
           - Precautionary principle application
           - Innovation imperative vs. safety
           - Regulatory and oversight needs
           - Responsible innovation practices

        5. **Future Implications:**
           - Technological trajectory concerns
           - Precedent and normalization effects
           - Societal transformation implications
           - Intergenerational responsibility

        Provide forward-looking ethical guidance for responsible development.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "technology_ethics": response.content,
            "ai_considerations": self._extract_ai_considerations(response.content),
            "privacy_concerns": self._extract_privacy_concerns(response.content),
            "future_implications": self._extract_future_implications(response.content)
        }
    
    def _extract_moral_implications(self, content: str) -> List[str]:
        """Extract key moral implications"""
        import re
        implications = re.findall(r'implication[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return implications[:6]
    
    def _extract_stakeholder_impacts(self, content: str) -> List[str]:
        """Extract stakeholder impacts"""
        import re
        impacts = re.findall(r'impact[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return impacts[:8]
    
    def _extract_recommendations(self, content: str) -> List[str]:
        """Extract ethical recommendations"""
        import re
        recommendations = re.findall(r'recommend[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return recommendations[:6]
    
    def _extract_concerns(self, content: str) -> List[str]:
        """Extract ethical concerns"""
        import re
        concerns = re.findall(r'concern[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return concerns[:6]
    
    def _extract_irb_considerations(self, content: str) -> List[str]:
        """Extract IRB review considerations"""
        import re
        irb = re.findall(r'irb[:\-\s]*([^\n\.]+)', content.lower())
        return irb[:5]
    
    def _extract_consent_requirements(self, content: str) -> List[str]:
        """Extract informed consent requirements"""
        import re
        consent = re.findall(r'consent[:\-\s]*([^\n\.]+)', content.lower())
        return consent[:5]
    
    def _extract_protections(self, content: str) -> List[str]:
        """Extract participant protections"""
        import re
        protections = re.findall(r'protection[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return protections[:5]
    
    def _extract_access_barriers(self, content: str) -> List[str]:
        """Extract access barriers"""
        import re
        barriers = re.findall(r'barrier[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return barriers[:5]
    
    def _extract_disparity_impacts(self, content: str) -> List[str]:
        """Extract health disparity impacts"""
        import re
        disparities = re.findall(r'disparit[y|ies][:\-\s]*([^\n\.]+)', content.lower())
        return disparities[:5]
    
    def _extract_equity_recommendations(self, content: str) -> List[str]:
        """Extract equity-focused recommendations"""
        import re
        equity = re.findall(r'equit[y|able][:\-\s]*([^\n\.]+)', content.lower())
        return equity[:5]
    
    def _extract_ai_considerations(self, content: str) -> List[str]:
        """Extract AI ethics considerations"""
        import re
        ai = re.findall(r'ai|algorithm[ic]*[:\-\s]*([^\n\.]+)', content.lower())
        return ai[:5]
    
    def _extract_privacy_concerns(self, content: str) -> List[str]:
        """Extract privacy and data concerns"""
        import re
        privacy = re.findall(r'privac[y]?|data[:\-\s]*([^\n\.]+)', content.lower())
        return privacy[:5]
    
    def _extract_future_implications(self, content: str) -> List[str]:
        """Extract future implications"""
        import re
        future = re.findall(r'future[:\-\s]*([^\n\.]+)', content.lower())
        return future[:5]
