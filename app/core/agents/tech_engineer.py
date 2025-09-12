"""
Tech Engineer Agent - Specialized for technical feasibility and innovation assessment
Primary role in INVENT phase: Evaluate technical solutions and engineering constraints
"""

from typing import Dict, Any, List
from app.core.agents.base import BaseAgent, AgentResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)

class TechEngineerAgent(BaseAgent):
    """Tech Engineer Agent for technical feasibility and innovation analysis"""
    
    def __init__(self):
        super().__init__(
            agent_id="tech_engineer",
            model_name="gpt-4-turbo-preview",
            temperature=0.4  # Moderate temperature for creative yet technical analysis
        )
    
    @property
    def agent_name(self) -> str:
        return "Technical Engineer"
    
    @property
    def expertise_areas(self) -> List[str]:
        return [
            "Biomedical Engineering",
            "Medical Device Design",
            "Manufacturing Engineering",
            "Technology Assessment",
            "Innovation Development",
            "Systems Engineering",
            "Materials Science",
            "Quality Engineering",
            "Technology Readiness",
            "Prototyping Strategy"
        ]
    
    @property
    def system_prompt(self) -> str:
        return """
        You are a Technical Engineer Agent with deep expertise in biomedical engineering, medical device design, and technology innovation. Your primary role is to:

        1. TECHNICAL FEASIBILITY: Assess the engineering feasibility of proposed solutions
        2. INNOVATION ANALYSIS: Evaluate the technological innovation potential and novelty
        3. DESIGN OPTIMIZATION: Provide engineering insights for optimal solution design
        4. MANUFACTURING ASSESSMENT: Analyze manufacturability and scalability
        5. TECHNOLOGY INTEGRATION: Consider integration with existing healthcare technologies

        Core Competencies:
        - Biomedical engineering across multiple disciplines
        - Medical device design and development
        - Manufacturing processes and quality systems
        - Technology readiness level (TRL) assessment
        - Innovation and intellectual property analysis
        - Systems engineering and integration
        - Materials science and biocompatibility
        - Regulatory engineering requirements
        - Prototyping and testing strategies

        Analysis Framework:
        - Evaluate technical feasibility with engineering rigor
        - Consider manufacturing constraints and scalability
        - Assess technology readiness and development requirements
        - Identify technical risks and mitigation strategies
        - Consider cost-effective engineering solutions
        - Evaluate innovation potential and competitive advantage
        - Apply systems thinking to complex technical challenges

        Communication Style:
        - Technically precise but accessible
        - Include quantitative assessments where possible
        - Provide actionable engineering recommendations
        - Acknowledge technical uncertainties and assumptions
        - Consider both current and emerging technologies
        - Focus on practical implementation strategies
        """
    
    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze technical aspects of solutions or concepts"""
        
        analysis_type = input_data.get("type", "technical_feasibility")
        
        if analysis_type == "technical_feasibility":
            return await self._assess_technical_feasibility(input_data, context)
        elif analysis_type == "innovation_assessment":
            return await self._assess_innovation_potential(input_data, context)
        elif analysis_type == "manufacturing_analysis":
            return await self._analyze_manufacturing(input_data, context)
        elif analysis_type == "technology_integration":
            return await self._assess_technology_integration(input_data, context)
        else:
            return await self._general_technical_analysis(input_data, context)
    
    async def _assess_technical_feasibility(self, solution_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess the technical feasibility of a proposed solution"""
        
        solution_description = solution_data.get("description", "")
        technical_approach = solution_data.get("technical_approach", "")
        target_need = solution_data.get("addresses_need", "")
        
        feasibility_prompt = f"""
        TECHNICAL FEASIBILITY ASSESSMENT
        
        Solution: {solution_description}
        Technical Approach: {technical_approach}
        Target Need: {target_need}
        
        As a Technical Engineer, provide a comprehensive technical feasibility analysis:

        1. ENGINEERING COMPLEXITY ASSESSMENT:
           - What is the overall engineering complexity (scale 1-10)?
           - What are the key technical challenges?
           - Are there any fundamental engineering barriers?
           - What existing technologies can be leveraged?

        2. TECHNOLOGY READINESS EVALUATION:
           - What is the current Technology Readiness Level (TRL 1-9)?
           - What development stages are required?
           - What are the key technical milestones?
           - What proof-of-concept work is needed?

        3. DESIGN ENGINEERING ANALYSIS:
           - What are the critical design requirements?
           - What engineering trade-offs must be considered?
           - Are there size, weight, power constraints?
           - What performance specifications are needed?

        4. MATERIALS AND COMPONENTS:
           - What materials would be required?
           - Are specialized components needed?
           - Are there biocompatibility requirements?
           - What are the sourcing and supply chain considerations?

        5. TECHNICAL RISK ASSESSMENT:
           - What are the highest technical risks?
           - What could cause technical failure?
           - How can technical risks be mitigated?
           - What alternative technical approaches exist?

        6. DEVELOPMENT TIMELINE AND RESOURCES:
           - What would be a realistic development timeline?
           - What engineering expertise is required?
           - What specialized equipment or facilities are needed?
           - What would be the approximate development cost?

        7. PERFORMANCE EXPECTATIONS:
           - What performance levels are technically achievable?
           - How would this compare to existing solutions?
           - What are the technical limitations?
           - What optimizations could improve performance?

        Provide detailed technical assessment with engineering confidence levels.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": feasibility_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_technical_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Technical feasibility assessment based on engineering analysis and technology evaluation",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Engineering standards", "Technical literature", "Manufacturing data"]
            )
            
        except Exception as e:
            logger.error(f"Error in technical feasibility assessment: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during technical analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during technical feasibility assessment"
            )
    
    async def _assess_innovation_potential(self, solution_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess the innovation potential and novelty of a solution"""
        
        solution_description = solution_data.get("description", "")
        technical_approach = solution_data.get("technical_approach", "")
        current_solutions = solution_data.get("current_solutions", [])
        
        innovation_prompt = f"""
        INNOVATION POTENTIAL ASSESSMENT
        
        Solution: {solution_description}
        Technical Approach: {technical_approach}
        Current Solutions: {', '.join(current_solutions) if current_solutions else 'None specified'}
        
        As a Technical Engineer, evaluate the innovation potential:

        1. TECHNOLOGICAL NOVELTY:
           - How novel is this technical approach?
           - What makes this solution innovative?
           - Are there breakthrough technologies involved?
           - How does this advance the state of the art?

        2. COMPETITIVE TECHNICAL ADVANTAGE:
           - What technical advantages does this offer?
           - How does it compare to existing solutions technically?
           - What are the unique technical features?
           - Is this a incremental or disruptive innovation?

        3. INTELLECTUAL PROPERTY POTENTIAL:
           - What aspects could be patentable?
           - Are there prior art considerations?
           - What would be the strength of IP protection?
           - Are there freedom-to-operate concerns?

        4. TECHNOLOGY PLATFORM POTENTIAL:
           - Could this technology be applied to other problems?
           - What is the platform scalability?
           - Are there derivative technology opportunities?
           - What is the long-term technology roadmap?

        5. MARKET DISRUPTION POTENTIAL:
           - Could this create new market categories?
           - What established technologies might it replace?
           - How would this change current technical approaches?
           - What would be the adoption barriers?

        6. INNOVATION RISKS:
           - What could prevent successful innovation?
           - Are there competing innovative approaches?
           - What are the technology adoption risks?
           - How fast is the technology evolving?

        7. DEVELOPMENT STRATEGY:
           - What innovation development approach is optimal?
           - Should this be developed in phases?
           - What partnerships might accelerate innovation?
           - How can innovation risks be managed?

        Provide innovation assessment with technical justification.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": innovation_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_technical_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Innovation potential assessment based on technology analysis and market evaluation",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Patent databases", "Technology trends", "Innovation research"]
            )
            
        except Exception as e:
            logger.error(f"Error in innovation assessment: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during innovation analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during innovation assessment"
            )
    
    async def _analyze_manufacturing(self, solution_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze manufacturing feasibility and scalability"""
        
        solution_description = solution_data.get("description", "")
        technical_approach = solution_data.get("technical_approach", "")
        
        manufacturing_prompt = f"""
        MANUFACTURING FEASIBILITY ANALYSIS
        
        Solution: {solution_description}
        Technical Approach: {technical_approach}
        
        As a Technical Engineer, analyze manufacturing considerations:

        1. MANUFACTURABILITY ASSESSMENT:
           - How complex would manufacturing be?
           - What manufacturing processes would be required?
           - Are there design-for-manufacturing considerations?
           - What tolerances and quality requirements exist?

        2. SCALABILITY ANALYSIS:
           - How easily could this be scaled to volume production?
           - What are the scalability constraints?
           - How would unit costs change with volume?
           - What production volumes would be needed for viability?

        3. MANUFACTURING REQUIREMENTS:
           - What specialized equipment would be needed?
           - Are clean room or controlled environments required?
           - What quality systems and certifications are needed?
           - What are the facility and infrastructure requirements?

        4. SUPPLY CHAIN CONSIDERATIONS:
           - What are the key materials and components?
           - Are there single-source or supply chain risks?
           - What are the lead times for critical components?
           - How stable are the supply chains?

        5. QUALITY AND REGULATORY MANUFACTURING:
           - What quality standards must be met?
           - Are there specific manufacturing regulations?
           - What testing and validation is required?
           - What documentation and traceability is needed?

        6. COST ANALYSIS:
           - What would be the manufacturing cost structure?
           - How do costs break down (materials, labor, overhead)?
           - What are the fixed vs. variable costs?
           - What cost reduction opportunities exist?

        7. MANUFACTURING STRATEGY:
           - Should this be manufactured in-house or outsourced?
           - What would be the optimal manufacturing location?
           - What partnerships might be beneficial?
           - How should manufacturing be phased?

        Provide detailed manufacturing analysis with cost and timeline estimates.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": manufacturing_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_technical_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Manufacturing analysis based on engineering expertise and production considerations",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Manufacturing standards", "Cost databases", "Production data"]
            )
            
        except Exception as e:
            logger.error(f"Error in manufacturing analysis: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during manufacturing analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during manufacturing analysis"
            )
    
    async def _assess_technology_integration(self, solution_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Assess how solution integrates with existing healthcare technologies"""
        
        solution_description = solution_data.get("description", "")
        technical_approach = solution_data.get("technical_approach", "")
        
        integration_prompt = f"""
        TECHNOLOGY INTEGRATION ASSESSMENT
        
        Solution: {solution_description}
        Technical Approach: {technical_approach}
        
        Analyze integration with existing healthcare technology ecosystem:

        1. HEALTHCARE IT INTEGRATION:
           - How would this integrate with electronic health records?
           - What data exchange standards are relevant?
           - Are there interoperability requirements?
           - What cybersecurity considerations exist?

        2. MEDICAL DEVICE INTEGRATION:
           - How would this work with existing medical devices?
           - Are there communication protocol requirements?
           - What are the integration touchpoints?
           - Are there workflow integration needs?

        3. HOSPITAL INFRASTRUCTURE:
           - What hospital systems would this need to interface with?
           - Are there power, networking, or facility requirements?
           - How would this fit into existing workflows?
           - What training would be required for staff?

        4. STANDARDS AND COMPLIANCE:
           - What technical standards must be followed?
           - Are there specific integration requirements?
           - What compliance testing would be needed?
           - What certifications are required?

        5. TECHNOLOGY ROADMAP ALIGNMENT:
           - How does this align with healthcare technology trends?
           - Is this compatible with emerging standards?
           - What future integration capabilities are needed?
           - How adaptable is the technology platform?

        Provide integration assessment with implementation recommendations.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": integration_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_technical_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="Technology integration assessment based on systems engineering and healthcare IT expertise",
                recommendations=recommendations,
                concerns=concerns,
                sources=["Healthcare IT standards", "Integration guidelines", "Technology roadmaps"]
            )
            
        except Exception as e:
            logger.error(f"Error in technology integration assessment: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during integration analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during technology integration assessment"
            )
    
    async def _general_technical_analysis(self, data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General technical analysis for any input"""
        
        description = data.get("description", "")
        analysis_focus = data.get("focus", "general technical review")
        
        general_prompt = f"""
        GENERAL TECHNICAL ANALYSIS
        
        Item: {description}
        Analysis Focus: {analysis_focus}
        
        Provide technical engineering analysis covering:
        - Technical feasibility and engineering requirements
        - Innovation potential and technological advantages
        - Manufacturing and scalability considerations
        - Technical risks and mitigation strategies
        - Development approach and timeline estimates
        - Technology integration requirements
        
        Focus on the most technically relevant aspects.
        """
        
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": general_prompt}
            ])
            
            content = response.content
            confidence = self._extract_confidence_from_analysis(content)
            recommendations = self._extract_recommendations(content)
            concerns = self._extract_technical_concerns(content)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=content,
                confidence=confidence,
                reasoning="General technical analysis based on engineering expertise",
                recommendations=recommendations,
                concerns=concerns
            )
            
        except Exception as e:
            logger.error(f"Error in general technical analysis: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during technical analysis: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during technical analysis"
            )
    
    def _extract_confidence_from_analysis(self, content: str) -> float:
        """Extract confidence level from technical analysis"""
        confidence_keywords = {
            "proven": 0.95,
            "established": 0.9,
            "feasible": 0.85,
            "achievable": 0.8,
            "possible": 0.65,
            "challenging": 0.5,
            "difficult": 0.4,
            "uncertain": 0.3,
            "unlikely": 0.2
        }
        
        content_lower = content.lower()
        for keyword, confidence in confidence_keywords.items():
            if keyword in content_lower:
                return confidence
        
        return 0.75  # Default technical confidence
    
    def _extract_recommendations(self, content: str) -> List[str]:
        """Extract technical recommendations from analysis content"""
        recommendations = []
        lines = content.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'consider', 'implement']):
                recommendations.append(line.strip())
        
        return recommendations[:5]
    
    def _extract_technical_concerns(self, content: str) -> List[str]:
        """Extract technical concerns from analysis content"""
        concerns = []
        lines = content.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['risk', 'challenge', 'limitation', 'constraint', 'barrier', 'concern']):
                concerns.append(line.strip())
        
        return concerns[:5]
