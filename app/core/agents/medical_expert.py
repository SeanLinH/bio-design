"""
Medical Expert Agent - Specialized for clinical validation and evidence-based analysis
Primary role in IDENTIFY phase: Validate clinical needs and assess medical significance
"""

from typing import Dict, Any, List
from app.core.agents.base import BaseAgent, AgentResponse
from app.models.innovation import NeedItem, NeedEvaluation
from app.utils.logging import get_logger

logger = get_logger(__name__)

class MedicalExpertAgent(BaseAgent):
    """Medical Expert Agent for clinical validation and medical analysis"""
    
    def __init__(self):
        super().__init__(
            agent_id="medical_expert",
            model_name="gpt-4-turbo-preview",
            temperature=0.3  # Lower temperature for more consistent medical analysis
        )
    
    @property
    def agent_name(self) -> str:
        return "Medical Expert"
    
    @property
    def expertise_areas(self) -> List[str]:
        return [
            "Clinical Medicine",
            "Patient Safety",
            "Evidence-Based Medicine",
            "Clinical Guidelines",
            "Medical Device Safety",
            "Therapeutic Efficacy",
            "Clinical Trial Design",
            "Regulatory Standards"
        ]
    
    @property
    def system_prompt(self) -> str:
        return """
        You are a Medical Expert Agent with deep expertise in clinical medicine, patient safety, and evidence-based healthcare. Your primary role is to:

        1. CLINICAL VALIDATION: Assess the clinical significance and validity of identified medical needs
        2. EVIDENCE ANALYSIS: Evaluate supporting clinical evidence and research
        3. SAFETY ASSESSMENT: Identify potential safety concerns and risk factors
        4. PATIENT IMPACT: Analyze how solutions would affect patient outcomes and quality of life
        5. REGULATORY INSIGHT: Consider medical device regulations and clinical approval pathways

        Core Competencies:
        - Clinical medicine across multiple specialties
        - Evidence-based medicine and research methodology
        - Patient safety and risk assessment
        - Medical device regulations (FDA, CE marking)
        - Clinical trial design and biostatistics
        - Healthcare delivery systems
        - Medical ethics and patient advocacy

        Analysis Framework:
        - Always prioritize patient safety and clinical efficacy
        - Base recommendations on peer-reviewed evidence
        - Consider diverse patient populations and health equity
        - Assess both intended and unintended clinical consequences
        - Evaluate feasibility within healthcare systems
        - Consider cost-effectiveness from clinical perspective

        Communication Style:
        - Precise and evidence-based
        - Acknowledge uncertainty and confidence levels
        - Cite relevant clinical guidelines and research
        - Highlight critical safety considerations
        - Provide actionable clinical insights
        """
    
    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze medical needs or solutions from clinical perspective"""
        
        analysis_type = input_data.get("type", "need_validation")
        
        if analysis_type == "need_validation":
            return await self._validate_medical_need(input_data, context)
        elif analysis_type == "solution_assessment":
            return await self._assess_medical_solution(input_data, context)
        elif analysis_type == "safety_analysis":
            return await self._conduct_safety_analysis(input_data, context)
        else:
            return await self._general_medical_analysis(input_data, context)
    
    async def _validate_medical_need(self, need_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Validate the clinical significance of an identified medical need"""
        
        need_description = need_data.get("description", "")
        patient_population = need_data.get("patient_population", "")
        current_solutions = need_data.get("current_solutions", [])
        
        validation_prompt = f"""
        MEDICAL NEED VALIDATION ANALYSIS
        
        Need Description: {need_description}
        Target Patient Population: {patient_population}
        Current Solutions: {', '.join(current_solutions) if current_solutions else 'None specified'}
        
        As a Medical Expert, provide a comprehensive clinical validation of this medical need:

        1. CLINICAL SIGNIFICANCE ASSESSMENT:
           - Is this a genuine unmet medical need?
           - What is the clinical burden on patients?
           - How does this impact patient outcomes and quality of life?
           - What evidence supports the existence of this need?

        2. PATIENT POPULATION ANALYSIS:
           - How well-defined is the target population?
           - What are the demographic and clinical characteristics?
           - Are there subpopulations with different needs?
           - What is the estimated prevalence/incidence?

        3. CURRENT STANDARD OF CARE EVALUATION:
           - What are the current treatment options?
           - What are the limitations of existing solutions?
           - Are there emerging therapies in development?
           - What gaps exist in the care pathway?

        4. CLINICAL IMPACT ASSESSMENT:
           - What would be the clinical benefit of addressing this need?
           - How would it change patient outcomes?
           - What are the potential risks of not addressing this need?

        5. EVIDENCE REQUIREMENTS:
           - What clinical evidence would be needed to validate solutions?
           - What study designs would be appropriate?
           - What endpoints should be measured?

        6. REGULATORY CONSIDERATIONS:
           - What regulatory pathway would likely apply?
           - What are the key safety and efficacy requirements?
           - Are there specific clinical guidelines to consider?

        Provide your assessment with confidence levels and clinical reasoning.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": validation_prompt}
            ])
            
            # Parse confidence and extract key insights
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Clinical validation based on medical expertise and evidence-based analysis",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Clinical guidelines", "Medical literature", "Patient safety data"]
            )
            
        except Exception as e:
            logger.error(f"Error in medical need validation: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during medical analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during medical validation"
            )
    
    async def _assess_medical_solution(self, solution_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess a proposed solution from medical/clinical perspective"""
        
        solution_description = solution_data.get("description", "")
        target_need = solution_data.get("addresses_need", "")
        approach = solution_data.get("technical_approach", "")
        
        assessment_prompt = f"""
        MEDICAL SOLUTION ASSESSMENT
        
        Proposed Solution: {solution_description}
        Addresses Need: {target_need}
        Technical Approach: {approach}
        
        As a Medical Expert, evaluate this solution from clinical and patient safety perspectives:

        1. CLINICAL EFFICACY POTENTIAL:
           - How likely is this solution to address the medical need effectively?
           - What clinical outcomes would you expect?
           - How does this compare to current standard of care?

        2. PATIENT SAFETY ANALYSIS:
           - What are the potential safety risks?
           - Are there contraindications or vulnerable populations?
           - What safety monitoring would be required?
           - How can risks be mitigated?

        3. CLINICAL INTEGRATION ASSESSMENT:
           - How would this integrate into existing care pathways?
           - What training would healthcare providers need?
           - Are there workflow implications?
           - What infrastructure requirements exist?

        4. PATIENT ACCEPTANCE FACTORS:
           - How would patients likely respond to this solution?
           - Are there usability or accessibility concerns?
           - What patient education would be needed?

        5. CLINICAL EVIDENCE REQUIREMENTS:
           - What clinical studies would be needed for validation?
           - What are the key efficacy and safety endpoints?
           - How long would clinical development take?
           - What would be the regulatory pathway?

        6. HEALTHCARE ECONOMICS:
           - How would this impact healthcare costs?
           - What is the clinical value proposition?
           - Would this be cost-effective from a healthcare perspective?

        Provide detailed medical assessment with specific recommendations.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": assessment_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Medical solution assessment based on clinical expertise and safety analysis",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Clinical practice guidelines", "Safety databases", "Medical literature"]
            )
            
        except Exception as e:
            logger.error(f"Error in medical solution assessment: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during medical solution assessment: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during medical assessment"
            )
    
    async def _conduct_safety_analysis(self, data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Conduct detailed safety analysis for medical innovation"""
        
        item_description = data.get("description", "")
        patient_population = data.get("patient_population", "")
        
        safety_prompt = f"""
        COMPREHENSIVE MEDICAL SAFETY ANALYSIS
        
        Item: {item_description}
        Patient Population: {patient_population}
        
        Conduct a thorough safety analysis covering:

        1. DIRECT SAFETY RISKS:
           - Immediate safety hazards
           - Device-related complications
           - Interaction risks
           - Failure mode analysis

        2. PATIENT POPULATION VULNERABILITIES:
           - Age-specific considerations
           - Comorbidity interactions
           - Contraindications
           - Special populations (pregnancy, pediatric, elderly)

        3. LONG-TERM SAFETY CONSIDERATIONS:
           - Chronic exposure effects
           - Long-term complications
           - Device longevity issues
           - Follow-up requirements

        4. SAFETY MONITORING REQUIREMENTS:
           - Biomarkers to monitor
           - Imaging requirements
           - Clinical assessments needed
           - Frequency of monitoring

        5. RISK MITIGATION STRATEGIES:
           - Design safety features
           - Clinical protocols
           - Patient screening criteria
           - Emergency procedures

        6. REGULATORY SAFETY REQUIREMENTS:
           - Pre-market safety data needed
           - Post-market surveillance
           - Adverse event reporting
           - Risk management plans

        Provide detailed safety assessment with risk levels and mitigation strategies.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": safety_prompt}
            ])
            
            content = response.content
            confidence = 0.9  # High confidence in safety analysis
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Comprehensive safety analysis based on medical expertise and risk assessment",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Safety databases", "Adverse event reports", "Clinical safety guidelines"]
            )
            
        except Exception as e:
            logger.error(f"Error in safety analysis: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during safety analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during safety analysis"
            )
    
    async def _general_medical_analysis(self, data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General medical analysis for any input"""
        
        description = data.get("description", "")
        analysis_focus = data.get("focus", "general medical review")
        
        general_prompt = f"""
        GENERAL MEDICAL ANALYSIS
        
        Item: {description}
        Analysis Focus: {analysis_focus}
        
        Provide medical expert analysis covering relevant clinical aspects:
        - Clinical relevance and significance
        - Patient impact considerations
        - Safety and risk factors
        - Medical evidence requirements
        - Clinical implementation considerations
        - Regulatory and approval pathway insights
        
        Focus your analysis on the most medically relevant aspects.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": general_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="General medical analysis based on clinical expertise",
                recommendations=recommendations,
                concerns=concerns
            )
            
        except Exception as e:
            logger.error(f"Error in general medical analysis: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during medical analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during medical analysis"
            )
    
    def _extract_confidence_from_analysis(self, content: str) -> float:
        """Extract confidence level from analysis content"""
        # Simple heuristic - in real implementation, would use more sophisticated NLP
        confidence_keywords = {
            "certain": 0.95,
            "confident": 0.9,
            "likely": 0.8,
            "probable": 0.75,
            "possible": 0.6,
            "uncertain": 0.4,
            "unclear": 0.3
        }
        
        content_lower = content.lower()
        for keyword, confidence in confidence_keywords.items():
            if keyword in content_lower:
                return confidence
        
        return 0.7  # Default confidence
    
    def _extract_recommendations(self, content: str) -> List[str]:
        """Extract recommendations from analysis content"""
        # Simple extraction - in real implementation, would use more sophisticated NLP
        recommendations = []
        lines = content.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'advise']):
                recommendations.append(line.strip())
        
        return recommendations[:5]  # Limit to top 5
    
    def _extract_concerns(self, content: str) -> List[str]:
        """Extract concerns from analysis content"""
        # Simple extraction - in real implementation, would use more sophisticated NLP
        concerns = []
        lines = content.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['concern', 'risk', 'danger', 'warning', 'caution']):
                concerns.append(line.strip())
        
        return concerns[:5]  # Limit to top 5
