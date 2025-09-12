"""
Base agent class for specialized biodesign innovation agents
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
import os
from app.utils.logging import get_logger

logger = get_logger(__name__)

class AgentResponse(BaseModel):
    """Structured response from an agent"""
    agent_id: str
    content: str
    confidence: float  # 0.0 to 1.0
    reasoning: str
    sources: List[str] = []
    recommendations: List[str] = []
    concerns: List[str] = []

class BaseAgent(ABC):
    """Base class for all specialized biodesign agents"""
    
    def __init__(
        self, 
        agent_id: str,
        model_name: str = "gpt-4-turbo-preview",
        temperature: float = 0.7
    ):
        self.agent_id = agent_id
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.conversation_history: List[Dict[str, Any]] = []
        
    @property
    @abstractmethod
    def agent_name(self) -> str:
        """Human-readable name of the agent"""
        pass
        
    @property
    @abstractmethod
    def expertise_areas(self) -> List[str]:
        """List of expertise areas for this agent"""
        pass
        
    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """System prompt that defines the agent's role and behavior"""
        pass
        
    @abstractmethod
    async def analyze(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResponse:
        """Main analysis method - must be implemented by each agent"""
        pass
        
    async def debate_response(
        self, 
        topic: str, 
        other_agent_arguments: List[Dict[str, Any]], 
        position: str = "neutral"
    ) -> AgentResponse:
        """Generate a response during multi-agent debate"""
        
        # Prepare debate context
        debate_context = f"""
        DEBATE TOPIC: {topic}
        YOUR POSITION: {position}
        
        OTHER AGENTS' ARGUMENTS:
        """
        
        for i, arg in enumerate(other_agent_arguments):
            debate_context += f"\n{i+1}. {arg.get('agent_name', 'Unknown Agent')}: {arg.get('content', '')}"
            
        # Create debate prompt
        debate_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=f"""
            {debate_context}
            
            As a {self.agent_name}, provide your perspective on this topic. Consider the arguments made by other agents and respond with:
            1. Your analysis of the topic from your expertise area
            2. Your assessment of other agents' arguments
            3. Your recommendations or concerns
            4. Supporting evidence or reasoning
            
            Be constructive but don't hesitate to challenge arguments if you disagree based on your expertise.
            """)
        ])
        
        try:
            response = await self.llm.ainvoke(debate_prompt.format_messages())
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=response.content,
                confidence=0.8,  # Default confidence, can be adjusted per agent
                reasoning=f"Analysis based on {self.agent_name} expertise in {', '.join(self.expertise_areas)}",
                recommendations=[],  # Would extract from content in real implementation
                concerns=[]  # Would extract from content in real implementation
            )
            
        except Exception as e:
            logger.error(f"Error in debate response for {self.agent_id}: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error generating response: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during analysis"
            )
    
    async def cross_examine(self, target_argument: Dict[str, Any]) -> AgentResponse:
        """Cross-examine another agent's argument"""
        
        cross_exam_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=f"""
            As a {self.agent_name}, critically examine this argument:
            
            AGENT: {target_argument.get('agent_name', 'Unknown')}
            ARGUMENT: {target_argument.get('content', '')}
            CONFIDENCE: {target_argument.get('confidence', 'Unknown')}
            
            From your expertise in {', '.join(self.expertise_areas)}, identify:
            1. Any flaws or gaps in the reasoning
            2. Missing considerations from your domain
            3. Potential risks or concerns not addressed
            4. Questions that need clarification
            5. Alternative perspectives to consider
            
            Be thorough but fair in your examination.
            """)
        ])
        
        try:
            response = await self.llm.ainvoke(cross_exam_prompt.format_messages())
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=response.content,
                confidence=0.9,  # High confidence in critical analysis
                reasoning=f"Cross-examination from {self.agent_name} perspective",
                concerns=[]  # Would extract specific concerns from content
            )
            
        except Exception as e:
            logger.error(f"Error in cross-examination for {self.agent_id}: {str(e)}")
            return AgentResponse(
                agent_id=self.agent_id,
                content=f"Error during cross-examination: {str(e)}",
                confidence=0.0,
                reasoning="Error occurred during cross-examination"
            )
    
    def update_conversation_history(self, message: Dict[str, Any]):
        """Update agent's conversation history"""
        self.conversation_history.append({
            "timestamp": message.get("timestamp"),
            "type": message.get("type", "message"),
            "content": message.get("content", ""),
            "source": message.get("source", "user")
        })
        
        # Keep only last 20 messages to manage memory
        if len(self.conversation_history) > 20:
            self.conversation_history = self.conversation_history[-20:]
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information for API responses"""
        return {
            "agent_id": self.agent_id,
            "name": self.agent_name,
            "expertise_areas": self.expertise_areas,
            "conversation_count": len(self.conversation_history)
        }
