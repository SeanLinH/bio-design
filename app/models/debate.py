"""
Debate-related data models
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID

class DebateStatus(str, Enum):
    """Debate session status"""
    STARTING = "starting"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"

class DebatePhase(str, Enum):
    """Debate phases"""
    OPENING = "opening"
    ADVERSARIAL = "adversarial"
    CROSS_EXAMINATION = "cross_examination"
    CONSENSUS_BUILDING = "consensus_building"
    FINAL_SYNTHESIS = "final_synthesis"

class AgentPosition(str, Enum):
    """Agent positions in debate"""
    FOR = "for"
    AGAINST = "against"
    NEUTRAL = "neutral"

class DebateConfig(BaseModel):
    """Debate configuration settings"""
    max_rounds: int = Field(default=10, ge=1, le=20)
    consensus_threshold: float = Field(default=0.8, ge=0.5, le=1.0)
    timeout_seconds: int = Field(default=1800, ge=300, le=7200)  # 5 min to 2 hours
    enable_devils_advocate: bool = Field(default=True)
    allow_position_changes: bool = Field(default=True)
    real_time_updates: bool = Field(default=True)

class DebateRequest(BaseModel):
    """Request to start a new debate"""
    topic: str = Field(..., min_length=10, max_length=1000)
    description: Optional[str] = Field(None, max_length=2000)
    agents: List[str] = Field(default=[
        "medical_expert", "tech_engineer", "business_analyst",
        "regulatory_agent", "ethicist", "patient_advocate", "devils_advocate"
    ])
    config: DebateConfig = Field(default_factory=DebateConfig)
    user_id: Optional[str] = Field(None)
    tags: List[str] = Field(default=[])

class DebateArgument(BaseModel):
    """Single argument made by an agent"""
    id: str
    agent_id: str
    position: AgentPosition
    content: str
    evidence: List[str] = Field(default=[])
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    round_number: int
    timestamp: datetime
    references: List[str] = Field(default=[])
    responding_to: Optional[str] = Field(None)  # ID of argument being responded to

class ConsensusMetrics(BaseModel):
    """Consensus measurement data"""
    level: float = Field(..., ge=0.0, le=1.0)
    areas: List[str] = Field(default=[])  # Areas of agreement
    disputes: List[str] = Field(default=[])  # Remaining disagreements
    agent_positions: Dict[str, Dict[str, Any]] = Field(default={})
    evolution: List[Dict[str, Any]] = Field(default=[])  # How consensus evolved

class DebateResponse(BaseModel):
    """Response from debate operations"""
    session_id: str
    status: DebateStatus
    message: str
    created_at: datetime
    estimated_completion: Optional[datetime] = Field(None)

class DebateSession(BaseModel):
    """Complete debate session data"""
    id: str
    topic: str
    description: Optional[str] = Field(None)
    status: DebateStatus
    phase: DebatePhase
    config: DebateConfig
    participants: List[str]
    arguments: List[DebateArgument] = Field(default=[])
    consensus_metrics: Optional[ConsensusMetrics] = Field(None)
    current_round: int = Field(default=0)
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = Field(None)
    user_id: Optional[str] = Field(None)
    tags: List[str] = Field(default=[])

class DebateUpdate(BaseModel):
    """Real-time debate update message"""
    session_id: str
    type: str  # "agent_message", "consensus_update", "phase_change", etc.
    data: Dict[str, Any]
    timestamp: datetime
