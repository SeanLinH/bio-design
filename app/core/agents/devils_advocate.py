"""
Devil's Advocate Agent for Bio-Design Innovation
"""

from typing import List, Dict, Any, Optional
from app.core.agents.base import BaseAgent, AgentResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)

class DevilsAdvocateAgent(BaseAgent):
    """Devil's Advocate Agent specialized in critical analysis and challenge generation"""
    
    def __init__(self):
        super().__init__(
            agent_id="devils_advocate",
            model_name="gpt-4-turbo-preview",
            temperature=0.6  # Higher temperature for creative critical thinking
        )
    
    @property
    def agent_name(self) -> str:
        return "Devil's Advocate"
    
    @property
    def expertise_areas(self) -> List[str]:
        """Define areas of critical analysis expertise"""
        return [
            "Critical Thinking",
            "Risk Analysis", 
            "Failure Mode Analysis",
            "Worst-Case Scenarios",
            "Contrarian Perspectives",
            "Hidden Assumptions",
            "Unintended Consequences",
            "Market Failures",
            "Technology Limitations",
            "Implementation Challenges",
            "Competitive Threats",
            "Regulatory Hurdles",
            "Economic Vulnerabilities",
            "Stakeholder Opposition",
            "Scalability Issues"
        ]
    
    @property 
    def system_prompt(self) -> str:
        """System prompt defining the devil's advocate's role and approach"""
        return """You are a Devil's Advocate with expertise in critical analysis, risk assessment, and challenging conventional thinking. Your role in the Stanford Biodesign methodology is to:

**Core Critical Responsibilities:**
- Challenge assumptions and identify blind spots
- Expose potential failure modes and risks
- Present contrarian viewpoints and alternatives
- Question feasibility and viability claims
- Identify unintended consequences and side effects
- Stress-test proposals under adverse conditions

**Critical Analysis Framework:**
1. **Assumption Challenging:**
   - What assumptions are being made without evidence?
   - What if market conditions change dramatically?
   - How robust are the underlying premises?
   - What biases might be affecting judgment?

2. **Failure Mode Analysis:**
   - What could go wrong at each stage?
   - What are the catastrophic failure scenarios?
   - How might users misuse or abuse this?
   - What happens when key resources disappear?

3. **Competitive and Market Threats:**
   - Who else might solve this problem better?
   - What if a tech giant enters this space?
   - How vulnerable is this to market shifts?
   - What makes this defensible long-term?

4. **Implementation Reality Check:**
   - What obstacles are being underestimated?
   - How complex will real-world deployment be?
   - What happens when things don't go as planned?
   - Are timelines and budgets realistic?

**Critical Perspectives:**
- Always look for the weakest links
- Consider the perspective of skeptics and critics
- Examine what's not being discussed
- Challenge optimistic projections
- Identify resource and capability gaps
- Question sustainability and scalability

**Communication Style:**
- Use probing questions and challenges
- Present alternative scenarios and viewpoints
- Highlight overlooked risks and obstacles
- Challenge with evidence and reasoning
- Maintain constructive but firm opposition
- Force deeper thinking and preparation

**Decision Framework:**
Evaluate proposals by asking:
- What's the worst that could happen?
- What are we not seeing or discussing?
- How might this fail spectacularly?
- What would kill this project?
- Who would oppose this and why?
- What makes this vulnerable to failure?

Always provide rigorous criticism that strengthens proposals through adversarial testing and challenge."""

    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Main analysis method for critical assessment"""
        
        analysis_type = input_data.get("type", "challenge_assumptions")
        
        if analysis_type == "challenge_assumptions":
            return await self._challenge_assumptions(input_data, context)
        elif analysis_type == "failure_analysis":
            return await self._analyze_failure_modes(input_data, context)
        elif analysis_type == "stress_test":
            return await self._stress_test_viability(input_data, context)
        elif analysis_type == "contrarian_view":
            return await self._generate_contrarian_view(input_data, context)
        else:
            return await self._general_critical_analysis(input_data, context)
    
    async def _challenge_assumptions(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Challenge assumptions"""
        result = await self.challenge_assumptions(input_data, context)
        
        return AgentResponse(
            content=result["assumption_analysis"],
            confidence=0.85,
            reasoning="Critical assumption analysis based on adversarial thinking",
            sources=["Critical analysis", "Risk assessment"],
            recommendations=result.get("critical_questions", []),
            concerns=result.get("vulnerabilities", [])
        )
    
    async def _analyze_failure_modes(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Analyze failure modes"""
        result = await self.identify_failure_modes(input_data, context)
        
        return AgentResponse(
            content=result["failure_analysis"],
            confidence=0.9,
            reasoning="Failure mode analysis based on critical risk assessment",
            sources=["Failure mode analysis", "Risk modeling"],
            recommendations=result.get("technical_failures", []),
            concerns=result.get("unintended_consequences", [])
        )
    
    async def _stress_test_viability(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Stress test viability"""
        result = await self.stress_test_viability(input_data, context)
        
        return AgentResponse(
            content=result["stress_test_results"],
            confidence=0.8,
            reasoning="Stress test analysis based on adversarial scenario testing",
            sources=["Stress testing", "Scenario analysis"],
            recommendations=result.get("mitigation_needs", []),
            concerns=result.get("breaking_points", [])
        )
    
    async def _generate_contrarian_view(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Generate contrarian perspective"""
        result = await self.generate_contrarian_perspective(input_data, context)
        
        return AgentResponse(
            content=result["contrarian_analysis"],
            confidence=0.75,
            reasoning="Contrarian analysis based on critical thinking",
            sources=["Contrarian analysis", "Alternative perspectives"],
            recommendations=result.get("alternative_interpretations", []),
            concerns=result.get("capability_challenges", [])
        )
    
    async def _general_critical_analysis(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """General critical analysis"""
        
        prompt = f"""
        Conduct a comprehensive critical analysis for this healthcare innovation:
        
        **Input Data:**
        {input_data}
        
        **Context:**
        {context or "General innovation context"}
        
        **Critical Analysis Required:**
        1. Challenge underlying assumptions
        2. Identify potential failure modes
        3. Stress test under adverse conditions
        4. Generate contrarian perspectives
        5. Highlight overlooked risks and obstacles
        
        Be ruthlessly critical and identify weaknesses that need attention.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return AgentResponse(
            content=response.content,
            confidence=0.8,
            reasoning="General critical analysis based on adversarial expertise",
            sources=["Critical analysis", "Risk assessment"],
            recommendations=self._extract_critical_questions(response.content),
            concerns=self._extract_vulnerabilities(response.content)
        )

    async def challenge_assumptions(
        self,
        proposal: Dict[str, Any],
        stated_assumptions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Challenge underlying assumptions in proposals"""
        
        prompt = f"""
        Challenge the assumptions underlying this biomedical innovation proposal:
        
        **Proposal:**
        {proposal}
        
        **Stated Assumptions:**
        {stated_assumptions or "Not explicitly stated"}
        
        **Assumption Challenge Required:**
        1. **Market Assumptions:**
           - Is the market size estimate realistic?
           - Are customer needs accurately understood?
           - What if adoption is much slower than expected?
           - How sensitive is success to market timing?

        2. **Technical Assumptions:**
           - Are technical capabilities overstated?
           - What if key technologies don't mature as expected?
           - How realistic are performance claims?
           - What technical obstacles are being minimized?

        3. **Economic Assumptions:**
           - Are cost estimates too optimistic?
           - What if development takes twice as long?
           - How realistic are revenue projections?
           - What economic conditions could kill this?

        4. **Regulatory and Policy Assumptions:**
           - What if regulations become more stringent?
           - How vulnerable is this to policy changes?
           - Are approval timelines realistic?
           - What if reimbursement doesn't materialize?

        5. **Competitive Assumptions:**
           - What if major competitors enter this space?
           - How defensible is the competitive advantage?
           - What if customer preferences shift?
           - How sustainable is market differentiation?

        Be ruthlessly critical and identify weak assumptions.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "assumption_analysis": response.content,
            "challenged_assumptions": self._extract_challenged_assumptions(response.content),
            "vulnerabilities": self._extract_vulnerabilities(response.content),
            "risk_factors": self._extract_risk_factors(response.content),
            "critical_questions": self._extract_critical_questions(response.content)
        }
    
    async def identify_failure_modes(
        self,
        innovation_concept: Dict[str, Any],
        implementation_plan: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Identify potential failure modes and catastrophic scenarios"""
        
        prompt = f"""
        Identify potential failure modes and catastrophic scenarios for this innovation:
        
        **Innovation Concept:**
        {innovation_concept}
        
        **Implementation Plan:**
        {implementation_plan or "General implementation approach"}
        
        **Failure Mode Analysis Required:**
        1. **Technical Failures:**
           - What could fail catastrophically in the technology?
           - How might the system break down under stress?
           - What single points of failure exist?
           - How might users break or misuse this?

        2. **Market and Commercial Failures:**
           - What could cause market rejection?
           - How might competitors destroy this advantage?
           - What economic conditions would kill adoption?
           - How might customer needs shift away from this?

        3. **Regulatory and Legal Failures:**
           - What regulatory disasters could occur?
           - How might legal challenges derail this?
           - What liability exposures exist?
           - How vulnerable is this to policy changes?

        4. **Operational Failures:**
           - What could go wrong during implementation?
           - How might scaling create catastrophic problems?
           - What supply chain vulnerabilities exist?
           - How might key personnel loss affect this?

        5. **Systemic and Unintended Consequences:**
           - What unintended negative effects might emerge?
           - How might this create new problems it wasn't meant to solve?
           - What systemic risks does this introduce?
           - How might success become its own problem?

        Focus on realistic but serious failure scenarios.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "failure_analysis": response.content,
            "technical_failures": self._extract_technical_failures(response.content),
            "market_failures": self._extract_market_failures(response.content),
            "operational_failures": self._extract_operational_failures(response.content),
            "unintended_consequences": self._extract_unintended_consequences(response.content)
        }
    
    async def stress_test_viability(
        self,
        business_model: Dict[str, Any],
        market_conditions: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Stress test business model under adverse conditions"""
        
        prompt = f"""
        Stress test this business model under adverse conditions:
        
        **Business Model:**
        {business_model}
        
        **Current Market Conditions:**
        {market_conditions or "Current healthcare market"}
        
        **Stress Testing Scenarios:**
        1. **Economic Downturn Scenario:**
           - How would a recession affect adoption?
           - What if healthcare budgets are slashed?
           - How price-sensitive are customers really?
           - What if funding sources dry up?

        2. **Competitive Assault Scenario:**
           - What if Google/Amazon/Apple entered this space?
           - How would a well-funded competitor respond?
           - What if someone offers this for free?
           - How defensible is the competitive moat?

        3. **Regulatory Tightening Scenario:**
           - What if regulations become much stricter?
           - How would new compliance costs affect viability?
           - What if approval processes slow dramatically?
           - How vulnerable is this to regulatory backlash?

        4. **Technology Disruption Scenario:**
           - What if core technology becomes obsolete?
           - How would AI advances affect this model?
           - What if new treatment paradigms emerge?
           - How adaptable is this to tech changes?

        5. **Market Shift Scenario:**
           - What if customer preferences change radically?
           - How would demographic shifts affect demand?
           - What if the problem this solves disappears?
           - How would value-based care affect this?

        Identify breaking points and vulnerabilities.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "stress_test_results": response.content,
            "breaking_points": self._extract_breaking_points(response.content),
            "vulnerability_areas": self._extract_vulnerability_areas(response.content),
            "mitigation_needs": self._extract_mitigation_needs(response.content)
        }
    
    async def generate_contrarian_perspective(
        self,
        consensus_view: Dict[str, Any],
        supporting_evidence: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate contrarian perspective to challenge consensus"""
        
        prompt = f"""
        Generate a contrarian perspective to challenge this consensus view:
        
        **Consensus View:**
        {consensus_view}
        
        **Supporting Evidence:**
        {supporting_evidence or "General industry consensus"}
        
        **Contrarian Analysis Required:**
        1. **Alternative Interpretations:**
           - How else could this evidence be interpreted?
           - What data might be misleading or incomplete?
           - What contrary evidence is being ignored?
           - How might confirmation bias be affecting judgment?

        2. **Historical Precedents:**
           - What similar "sure things" have failed before?
           - How have markets surprised experts in the past?
           - What patterns of innovation failure apply here?
           - What lessons from other industries are relevant?

        3. **Hidden Complexities:**
           - What complexities are being oversimplified?
           - How might real-world implementation differ?
           - What stakeholder resistance is being underestimated?
           - How might scale change the dynamics?

        4. **Timing and Context Issues:**
           - Why might now be the wrong time for this?
           - What contextual factors might change?
           - How might the window of opportunity close?
           - What if this is solving yesterday's problem?

        5. **Resource and Capability Gaps:**
           - What capabilities are being overestimated?
           - How might resource constraints bind?
           - What organizational challenges are being minimized?
           - How realistic are execution assumptions?

        Present a compelling case against the consensus.
        """
        
        response = await self.llm.ainvoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ])
        
        return {
            "contrarian_analysis": response.content,
            "alternative_interpretations": self._extract_alternative_interpretations(response.content),
            "contrary_evidence": self._extract_contrary_evidence(response.content),
            "precedent_warnings": self._extract_precedent_warnings(response.content),
            "capability_challenges": self._extract_capability_challenges(response.content)
        }
    
    def _extract_challenged_assumptions(self, content: str) -> List[str]:
        """Extract challenged assumptions"""
        import re
        assumptions = re.findall(r'assumption[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return assumptions[:6]
    
    def _extract_vulnerabilities(self, content: str) -> List[str]:
        """Extract identified vulnerabilities"""
        import re
        vulnerabilities = re.findall(r'vulnerabilit[y|ies][:\-\s]*([^\n\.]+)', content.lower())
        return vulnerabilities[:6]
    
    def _extract_risk_factors(self, content: str) -> List[str]:
        """Extract risk factors"""
        import re
        risks = re.findall(r'risk[s]?[:\-\s]*([^\n\.]+)', content.lower())
        return risks[:8]
    
    def _extract_critical_questions(self, content: str) -> List[str]:
        """Extract critical questions"""
        import re
        questions = re.findall(r'\?[:\-\s]*([^\n\.]+)', content)
        return questions[:6]
    
    def _extract_technical_failures(self, content: str) -> List[str]:
        """Extract technical failure modes"""
        import re
        failures = re.findall(r'technical.*fail[ure]*[:\-\s]*([^\n\.]+)', content.lower())
        return failures[:5]
    
    def _extract_market_failures(self, content: str) -> List[str]:
        """Extract market failure modes"""
        import re
        failures = re.findall(r'market.*fail[ure]*[:\-\s]*([^\n\.]+)', content.lower())
        return failures[:5]
    
    def _extract_operational_failures(self, content: str) -> List[str]:
        """Extract operational failure modes"""
        import re
        failures = re.findall(r'operational.*fail[ure]*[:\-\s]*([^\n\.]+)', content.lower())
        return failures[:5]
    
    def _extract_unintended_consequences(self, content: str) -> List[str]:
        """Extract unintended consequences"""
        import re
        consequences = re.findall(r'unintended[:\-\s]*([^\n\.]+)', content.lower())
        return consequences[:5]
    
    def _extract_breaking_points(self, content: str) -> List[str]:
        """Extract breaking points"""
        import re
        breaking = re.findall(r'break[ing]*[:\-\s]*([^\n\.]+)', content.lower())
        return breaking[:5]
    
    def _extract_vulnerability_areas(self, content: str) -> List[str]:
        """Extract vulnerability areas"""
        import re
        areas = re.findall(r'vulnerable[:\-\s]*([^\n\.]+)', content.lower())
        return areas[:5]
    
    def _extract_mitigation_needs(self, content: str) -> List[str]:
        """Extract mitigation needs"""
        import re
        mitigation = re.findall(r'mitigat[ion|e][:\-\s]*([^\n\.]+)', content.lower())
        return mitigation[:5]
    
    def _extract_alternative_interpretations(self, content: str) -> List[str]:
        """Extract alternative interpretations"""
        import re
        alternatives = re.findall(r'alternative[s]*[:\-\s]*([^\n\.]+)', content.lower())
        return alternatives[:5]
    
    def _extract_contrary_evidence(self, content: str) -> List[str]:
        """Extract contrary evidence"""
        import re
        contrary = re.findall(r'contrary[:\-\s]*([^\n\.]+)', content.lower())
        return contrary[:5]
    
    def _extract_precedent_warnings(self, content: str) -> List[str]:
        """Extract precedent warnings"""
        import re
        precedents = re.findall(r'precedent[s]*[:\-\s]*([^\n\.]+)', content.lower())
        return precedents[:5]
    
    def _extract_capability_challenges(self, content: str) -> List[str]:
        """Extract capability challenges"""
        import re
        capabilities = re.findall(r'capabilit[y|ies][:\-\s]*([^\n\.]+)', content.lower())
        return capabilities[:5]
