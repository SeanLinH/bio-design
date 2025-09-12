"""
Debate management service
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
from uuid import uuid4

from app.models.debate import (
    DebateSession, DebateStatus, DebatePhase, DebateConfig,
    DebateArgument, ConsensusMetrics
)
from app.utils.logging import get_logger

logger = get_logger(__name__)

class DebateService:
    """Service for managing debate sessions"""
    
    def __init__(self):
        # In a real implementation, this would use a database
        self._active_sessions: Dict[str, DebateSession] = {}
        
    async def start_debate(
        self,
        session_id: str,
        topic: str,
        agents: List[str],
        config: DebateConfig,
        description: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> DebateSession:
        """Start a new debate session"""
        try:
            session = DebateSession(
                id=session_id,
                topic=topic,
                description=description,
                status=DebateStatus.STARTING,
                phase=DebatePhase.OPENING,
                config=config,
                participants=agents,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                user_id=user_id
            )
            
            self._active_sessions[session_id] = session
            
            # Start the actual debate process
            asyncio.create_task(self._run_debate(session_id))
            
            logger.info(f"Started debate session {session_id} with topic: {topic}")
            return session
            
        except Exception as e:
            logger.error(f"Failed to start debate session: {str(e)}")
            raise

    async def get_debate_status(self, session_id: str) -> Optional[DebateStatus]:
        """Get the current status of a debate session"""
        session = self._active_sessions.get(session_id)
        return session.status if session else None
    
    async def get_debate_arguments(
        self,
        session_id: str,
        round_number: Optional[int] = None,
        agent_id: Optional[str] = None
    ) -> List[DebateArgument]:
        """Get arguments from a debate session"""
        session = self._active_sessions.get(session_id)
        if not session:
            return []
        
        arguments = session.arguments
        
        if round_number is not None:
            arguments = [arg for arg in arguments if arg.round_number == round_number]
        
        if agent_id is not None:
            arguments = [arg for arg in arguments if arg.agent_id == agent_id]
        
        return arguments
    
    async def get_consensus_level(self, session_id: str) -> Optional[ConsensusMetrics]:
        """Get the current consensus level of a debate"""
        session = self._active_sessions.get(session_id)
        return session.consensus_metrics if session else None
    
    async def stop_debate(self, session_id: str) -> bool:
        """Stop a running debate session"""
        session = self._active_sessions.get(session_id)
        if not session:
            return False
        
        session.status = DebateStatus.STOPPED
        session.updated_at = datetime.utcnow()
        
        logger.info(f"Stopped debate session {session_id}")
        return True
    
    async def export_debate_results(self, session_id: str, format: str = "json") -> Optional[Dict[str, Any]]:
        """Export complete debate results"""
        session = self._active_sessions.get(session_id)
        if not session:
            return None
        
        # Convert session to exportable format
        export_data = {
            "session": session.dict(),
            "summary": {
                "total_arguments": len(session.arguments),
                "consensus_reached": session.consensus_metrics.level if session.consensus_metrics else 0.0,
                "duration_minutes": 0,  # Calculate based on created_at and completed_at
                "participating_agents": session.participants
            }
        }
        
        return export_data
    
    async def _run_debate(self, session_id: str):
        """Internal method to run the actual debate process"""
        try:
            session = self._active_sessions[session_id]
            session.status = DebateStatus.ACTIVE
            
            # This is a simplified simulation
            # In a real implementation, this would orchestrate the actual agent debates
            for round_num in range(1, session.config.max_rounds + 1):
                session.current_round = round_num
                
                # Simulate agent arguments
                for agent_id in session.participants:
                    argument = DebateArgument(
                        id=str(uuid4()),
                        agent_id=agent_id,
                        position="for",  # This would be determined by the debate logic
                        content=f"Argument from {agent_id} in round {round_num}",
                        confidence_score=0.8,
                        round_number=round_num,
                        timestamp=datetime.utcnow()
                    )
                    session.arguments.append(argument)
                
                # Simulate some processing time
                await asyncio.sleep(2)
                
                # Update consensus (simplified)
                consensus_level = min(0.5 + (round_num * 0.1), 1.0)
                session.consensus_metrics = ConsensusMetrics(
                    level=consensus_level,
                    areas=["Technical feasibility", "Market potential"],
                    disputes=["Implementation timeline"] if consensus_level < 0.9 else []
                )
                
                # Check if consensus reached
                if consensus_level >= session.config.consensus_threshold:
                    break
            
            session.status = DebateStatus.COMPLETED
            session.completed_at = datetime.utcnow()
            session.updated_at = datetime.utcnow()
            
            logger.info(f"Completed debate session {session_id}")
            
        except Exception as e:
            logger.error(f"Error in debate session {session_id}: {str(e)}")
            session = self._active_sessions.get(session_id)
            if session:
                session.status = DebateStatus.FAILED
                session.updated_at = datetime.utcnow()
