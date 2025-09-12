"""
Patient Advocate Agent for Bio-Design Innovation
"""

from typing import List, Dict, Any, Optional
from app.core.agents.base import BaseAgent, AgentResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)

class PatientAdvocateAgent(BaseAgent):
    """Patient Advocate Agent specialized in patient-centered care and advocacy"""
    
    def __init__(self):
        super().__init__(
            agent_id="patient_advocate",
            model_name="gpt-4-turbo-preview",
            temperature=0.5  # Moderate-high temperature for empathetic responses
        )
    
    @property
    def agent_name(self) -> str:
        return "Patient Advocate"
    
    @property
    def expertise_areas(self) -> List[str]:
        """Define areas of patient advocacy expertise"""
        return [
            "Patient-Centered Care",
            "Patient Experience", 
            "Health Literacy",
            "Shared Decision Making",
            "Patient Safety",
            "Healthcare Navigation",
            "Patient Rights",
            "Care Coordination",
            "Chronic Disease Management",
            "Caregiver Support",
            "Cultural Competency",
            "Health Communication",
            "Patient Engagement",
            "Quality of Life",
            "Healthcare Accessibility"
        ]
    
    @property 
    def system_prompt(self) -> str:
        """System prompt defining the patient advocate's role and expertise"""
        return """You are an expert Patient Advocate with deep understanding of patient needs, experiences, and healthcare challenges. Your role in the Stanford Biodesign methodology is to:

**Core Advocacy Responsibilities:**
- Champion patient-centered design and implementation
- Ensure patient voice and perspective in innovation
- Advocate for patient safety and quality of care
- Promote health equity and accessibility
- Support patient engagement and empowerment
- Address real-world patient and caregiver needs

**Patient-Centered Analysis Areas:**
1. **Patient Experience and Journey:**
   - End-to-end patient experience mapping
   - Pain points and friction identification
   - Emotional and psychological impact assessment
   - Care transition and coordination needs

2. **Usability and Accessibility:**
   - User-friendly design requirements
   - Accessibility for diverse abilities
   - Health literacy considerations
   - Cultural and linguistic appropriateness

3. **Safety and Quality:**
   - Patient safety risk assessment
   - Quality of care impact evaluation
   - Error prevention and detection
   - Adverse event minimization

4. **Engagement and Empowerment:**
   - Patient activation and engagement
   - Shared decision-making support
   - Self-management capabilities
   - Family and caregiver involvement

**Advocacy Priorities:**
- Always prioritize patient welfare and autonomy
- Ensure solutions address real patient needs
- Advocate for underserved and vulnerable populations
- Promote transparent and honest communication
- Support patient education and health literacy
- Champion affordable and accessible care

**Communication Style:**
- Use patient-friendly, accessible language
- Focus on real-world impact and benefits
- Highlight patient stories and experiences
- Address concerns with empathy and understanding
- Advocate strongly for patient interests
- Bridge clinical and patient perspectives

**Decision Framework:**
Evaluate innovations through patient lens:
- Does this truly improve patient outcomes?
- Is it accessible to diverse patient populations?
- Does it enhance or burden the patient experience?
- Are patients genuinely involved in design?
- Does it respect patient autonomy and preferences?
- Is it affordable and sustainable for patients?

Always provide passionate advocacy that ensures patient needs remain central to healthcare innovation."""

    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Main analysis method for patient advocacy assessment"""
        
        analysis_type = input_data.get("type", "patient_impact")
        
        if analysis_type == "patient_impact":
            return await self._assess_patient_impact(input_data, context)
        elif analysis_type == "patient_centered_design":
            return await self._evaluate_patient_centered_design(input_data, context)
        elif analysis_type == "care_coordination":
            return await self._assess_care_coordination(input_data, context)
        elif analysis_type == "patient_advocacy":
            return await self._advocate_for_patients(input_data, context)
        else:
            return await self._general_patient_analysis(input_data, context)
    
    async def _assess_patient_impact(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess patient impact"""
        result = await self.assess_patient_impact(input_data, context)
        
        return AgentResponse(
            content=result["patient_impact"],
            confidence=0.9,
            reasoning="Patient impact analysis based on advocacy expertise",
            sources=["Patient experience research", "Advocacy guidelines"],
            recommendations=result.get("recommendations", []),
            concerns=result.get("concerns", [])
        )
    
    async def _evaluate_patient_centered_design(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Evaluate patient-centered design"""
        result = await self.evaluate_patient_centered_design(input_data, context)
        
        return AgentResponse(
            content=result["design_evaluation"],
            confidence=0.85,
            reasoning="Patient-centered design analysis based on user experience expertise",
            sources=["Patient-centered design principles", "Usability research"],
            recommendations=result.get("design_improvements", []),
            concerns=result.get("usability_issues", [])
        )
    
    async def _assess_care_coordination(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess care coordination"""
        result = await self.assess_care_coordination_impact(input_data, context)
        
        return AgentResponse(
            content=result["coordination_assessment"],
            confidence=0.8,
            reasoning="Care coordination analysis based on patient navigation expertise",
            sources=["Care coordination best practices", "Patient navigation research"],
            recommendations=result.get("navigation_benefits", []),
            concerns=result.get("coordination_concerns", [])
        )
    
    async def _advocate_for_patients(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Advocate for patient priorities"""
        result = await self.advocate_for_patient_priorities(input_data, context)
        
        return AgentResponse(
            content=result["advocacy_assessment"],
            confidence=0.9,
            reasoning="Patient advocacy analysis based on patient rights expertise",
            sources=["Patient advocacy principles", "Patient rights frameworks"],
            recommendations=result.get("advocacy_recommendations", []),
            concerns=result.get("safety_concerns", [])
        )
    
    async def _general_patient_analysis(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General patient analysis"""
        
        prompt = f"""
        Conduct a comprehensive patient advocacy analysis for this healthcare innovation:
        
        **Input Data:**
        {input_data}
        
        **Context:**
        {context or "General patient care context"}
        
        **Patient Advocacy Analysis Required:**
        1. Patient experience impact assessment
        2. Accessibility and usability evaluation
        3. Patient safety considerations
        4. Patient engagement and empowerment
        5. Equity and access concerns
        
        Provide strong patient advocacy insights and recommendations.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return AgentResponse(
            content=response.content,
            confidence=0.85,
            reasoning="General patient advocacy analysis based on patient-centered expertise",
            sources=["Patient advocacy analysis", "Patient experience research"],
            recommendations=self._extract_recommendations(response.content),
            concerns=self._extract_concerns(response.content)
        )

    async def assess_patient_impact(
        self,
        innovation_concept: Dict[str, Any],
        patient_population: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Assess impact on patients and patient experience"""
        
        prompt = f"""
        Assess the patient impact and experience implications of this healthcare innovation:
        
        **Innovation Concept:**
        {innovation_concept}
        
        **Patient Population:**
        {patient_population or "General patient population"}
        
        **Patient Impact Assessment Required:**
        1. **Patient Experience Analysis:**
           - How will this improve the patient journey?
           - What pain points does this address?
           - How might this create new challenges for patients?
           - What is the emotional and psychological impact?

        2. **Accessibility and Usability:**
           - Is this accessible to patients with disabilities?
           - What are the health literacy requirements?
           - How user-friendly is this for elderly patients?
           - Are there language and cultural barriers?

        3. **Patient Safety Considerations:**
           - What safety risks does this pose to patients?
           - How might patients misuse or misunderstand this?
           - What safeguards are needed for patient protection?
           - How will errors be prevented and detected?

        4. **Patient Engagement and Empowerment:**
           - Does this enhance patient agency and control?
           - How does this support informed decision-making?
           - Will this improve patient-provider communication?
           - Does this facilitate patient self-management?

        5. **Equity and Access Concerns:**
           - Who might be excluded or disadvantaged?
           - What are the cost implications for patients?
           - How does this affect vulnerable populations?
           - Are there geographic or social barriers?

        Provide passionate advocacy focused on genuine patient benefit.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "patient_impact": response.content,
            "benefits": self._extract_benefits(response.content),
            "concerns": self._extract_concerns(response.content),
            "recommendations": self._extract_recommendations(response.content),
            "accessibility": self._extract_accessibility(response.content)
        }
    
    async def evaluate_patient_centered_design(
        self,
        design_specifications: Dict[str, Any],
        user_requirements: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Evaluate patient-centered design principles"""
        
        prompt = f"""
        Evaluate patient-centered design principles in this healthcare solution:
        
        **Design Specifications:**
        {design_specifications}
        
        **User Requirements:**
        {user_requirements or "Standard patient usability requirements"}
        
        **Patient-Centered Design Evaluation:**
        1. **User Experience Design:**
           - Is the interface intuitive and easy to use?
           - How well does this accommodate different skill levels?
           - Are instructions clear and understandable?
           - Is the learning curve reasonable for patients?

        2. **Patient Involvement in Design:**
           - Were patients involved in the design process?
           - How were patient needs and preferences identified?
           - What patient feedback has been incorporated?
           - Are diverse patient voices represented?

        3. **Customization and Personalization:**
           - Can patients customize this to their needs?
           - Does this accommodate individual preferences?
           - How flexible is this for different patient types?
           - Are there options for personal adjustments?

        4. **Support and Education:**
           - What support is provided for patient onboarding?
           - How are patients educated about proper use?
           - Is ongoing support available when needed?
           - Are educational materials patient-friendly?

        5. **Integration with Patient Life:**
           - How well does this fit into patients' daily lives?
           - What burden does this place on patients?
           - Does this complement existing patient routines?
           - How does this affect patient quality of life?

        Focus on practical patient-centered design improvements.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "design_evaluation": response.content,
            "usability_issues": self._extract_usability_issues(response.content),
            "design_improvements": self._extract_design_improvements(response.content),
            "patient_needs": self._extract_patient_needs(response.content)
        }
    
    async def assess_care_coordination_impact(
        self,
        care_model: Dict[str, Any],
        care_team: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Assess impact on care coordination and patient navigation"""
        
        prompt = f"""
        Assess care coordination and patient navigation implications:
        
        **Care Model:**
        {care_model}
        
        **Care Team Members:**
        {care_team or ["Primary care physician", "Specialists", "Nurses", "Care coordinators"]}
        
        **Care Coordination Assessment:**
        1. **Patient Navigation:**
           - How does this help patients navigate the healthcare system?
           - What barriers to care access are addressed?
           - How are care transitions managed?
           - What support is provided for complex cases?

        2. **Communication and Information Sharing:**
           - How does this improve patient-provider communication?
           - Are patients kept informed throughout their care?
           - How is information shared across the care team?
           - Do patients have access to their own information?

        3. **Care Team Coordination:**
           - How does this facilitate coordination among providers?
           - Are roles and responsibilities clear to patients?
           - How are conflicting recommendations handled?
           - Is there a single point of contact for patients?

        4. **Continuity of Care:**
           - How does this ensure continuity across settings?
           - Are care plans maintained during transitions?
           - How are patient preferences preserved?
           - What happens when providers change?

        5. **Patient and Family Involvement:**
           - How are patients involved in care planning?
           - What role do family caregivers play?
           - Are cultural preferences accommodated?
           - How is shared decision-making supported?

        Emphasize patient empowerment and seamless care experience.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "coordination_assessment": response.content,
            "navigation_benefits": self._extract_navigation_benefits(response.content),
            "communication_improvements": self._extract_communication_improvements(response.content),
            "coordination_concerns": self._extract_coordination_concerns(response.content)
        }
    
    async def advocate_for_patient_priorities(
        self,
        proposed_solution: Dict[str, Any],
        patient_feedback: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Advocate for patient priorities and preferences"""
        
        prompt = f"""
        Advocate for patient priorities in this proposed healthcare solution:
        
        **Proposed Solution:**
        {proposed_solution}
        
        **Patient Feedback:**
        {patient_feedback or "General patient advocacy priorities"}
        
        **Patient Advocacy Assessment:**
        1. **Patient Priority Alignment:**
           - How well does this align with patient priorities?
           - What patient-identified needs does this address?
           - Are patient preferences reflected in design?
           - How does this respect patient autonomy?

        2. **Burden and Benefit Analysis:**
           - What burdens does this place on patients?
           - How do benefits outweigh potential downsides?
           - Is the effort required reasonable for patients?
           - What unintended consequences might occur?

        3. **Affordability and Access:**
           - Can patients afford this solution?
           - What insurance and payment considerations exist?
           - Are there financial assistance options?
           - How does this affect healthcare disparities?

        4. **Patient Safety and Advocacy:**
           - What patient safety concerns need attention?
           - How are patient rights protected?
           - What advocacy support is available?
           - How are patient complaints addressed?

        5. **Long-term Patient Impact:**
           - How does this affect long-term patient outcomes?
           - What is the sustainability for patient use?
           - How might this change patient expectations?
           - What legacy effects should be considered?

        Provide strong advocacy with specific recommendations for improvement.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "advocacy_assessment": response.content,
            "patient_priorities": self._extract_patient_priorities(response.content),
            "advocacy_recommendations": self._extract_advocacy_recommendations(response.content),
            "safety_concerns": self._extract_safety_concerns(response.content)
        }
    
    def _extract_benefits(self, content: str) -> List[str]:
        """Extract patient benefits"""
        import re
        benefits = re.findall(r'benefit[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return benefits[:6]
    
    def _extract_concerns(self, content: str) -> List[str]:
        """Extract patient concerns"""
        import re
        concerns = re.findall(r'concern[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return concerns[:6]
    
    def _extract_recommendations(self, content: str) -> List[str]:
        """Extract advocacy recommendations"""
        import re
        recommendations = re.findall(r'recommend[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return recommendations[:6]
    
    def _extract_accessibility(self, content: str) -> List[str]:
        """Extract accessibility considerations"""
        import re
        accessibility = re.findall(r'accessib[le|ility][:\-\s]*([^\n\.]+)', content.lower())
        return accessibility[:5]
    
    def _extract_usability_issues(self, content: str) -> List[str]:
        """Extract usability issues"""
        import re
        usability = re.findall(r'usabilit[y]?[:\-\s]*([^\n\.]+)', content.lower())
        return usability[:5]
    
    def _extract_design_improvements(self, content: str) -> List[str]:
        """Extract design improvement suggestions"""
        import re
        improvements = re.findall(r'improv[e|ement][s]?[:\-\s]*([^\n\.]+)', content.lower())
        return improvements[:6]
    
    def _extract_patient_needs(self, content: str) -> List[str]:
        """Extract patient needs"""
        import re
        needs = re.findall(r'need[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return needs[:6]
    
    def _extract_navigation_benefits(self, content: str) -> List[str]:
        """Extract care navigation benefits"""
        import re
        navigation = re.findall(r'navigat[ion|e][:\-\s]*([^\n\.]+)', content.lower())
        return navigation[:5]
    
    def _extract_communication_improvements(self, content: str) -> List[str]:
        """Extract communication improvements"""
        import re
        communication = re.findall(r'communicat[ion|e][:\-\s]*([^\n\.]+)', content.lower())
        return communication[:5]
    
    def _extract_coordination_concerns(self, content: str) -> List[str]:
        """Extract care coordination concerns"""
        import re
        coordination = re.findall(r'coordinat[ion|e][:\-\s]*([^\n\.]+)', content.lower())
        return coordination[:5]
    
    def _extract_patient_priorities(self, content: str) -> List[str]:
        """Extract patient priorities"""
        import re
        priorities = re.findall(r'priorit[y|ies][:\-\s]*([^\n\.]+)', content.lower())
        return priorities[:6]
    
    def _extract_advocacy_recommendations(self, content: str) -> List[str]:
        """Extract advocacy-focused recommendations"""
        import re
        advocacy = re.findall(r'advocat[e|cy][:\-\s]*([^\n\.]+)', content.lower())
        return advocacy[:5]
    
    def _extract_safety_concerns(self, content: str) -> List[str]:
        """Extract patient safety concerns"""
        import re
        safety = re.findall(r'safet[y]?[:\-\s]*([^\n\.]+)', content.lower())
        return safety[:5]
