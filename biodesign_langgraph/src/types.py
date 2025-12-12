from typing import List, Dict, Literal, Optional, TypedDict
from pydantic import BaseModel, Field

# 你原本的 NeedItem 如果已有，可直接沿用
class NeedItem(BaseModel):
    need: str
    summary: str = ""
    medical_insights: str = ""
    tech_insights: str = ""
    strategy: str = ""

# 評分面向（可依你的流程再擴充/調整）
CriteriaCode = Literal[
    "CLINICAL_VALUE","TECH_FEAS","UX","REG_PATH",
    "MARKET","FINANCE","IP_FTO","PAYER"
]

CRITERIA_WEIGHTS: Dict[CriteriaCode, float] = {
    "CLINICAL_VALUE": 0.22,
    "TECH_FEAS":      0.18,
    "UX":             0.12,
    "REG_PATH":       0.15,
    "MARKET":         0.12,
    "FINANCE":        0.08,
    "IP_FTO":         0.08,
    "PAYER":          0.05,
}

class Concept(BaseModel):
    title: str
    description: str
    source_agent: str

class ScoreItem(BaseModel):
    criterion: CriteriaCode
    score: float = Field(ge=0, le=5)
    rationale: str

class ConceptScore(BaseModel):
    concept_title: str
    by_criterion: List[ScoreItem]
    total: float
    notes: str = ""

class DebateOutput(BaseModel):
    proposed_concepts: List[Concept]
    critiques: Dict[str, List[str]]       # concept_title -> list of critiques
    revised_concepts: List[Concept]
    scores: List[ConceptScore]
    ranking: List[str]                    # ordered concept_title
    sensitivity_note: str                 # 簡易敏感度說明
    decision_summary: str                 # 決策與下一步 