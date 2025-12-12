import json, statistics
from typing import List, Dict, Tuple
from .types import CriteriaCode, CRITERIA_WEIGHTS, ConceptScore, ScoreItem

def parse_revise_vote_json(payload: str) -> List[dict]:
    # 容錯：去除代碼區塊或雜訊
    try:
        start = payload.find("[")
        end = payload.rfind("]")
        return json.loads(payload[start:end+1])
    except Exception:
        return []

def aggregate_scores(items: List[dict]) -> Dict[str, List[ScoreItem]]:
    # concept_title -> [ScoreItem...]
    store: Dict[str, List[ScoreItem]] = {}
    for itm in items:
        title = itm.get("concept_title","")
        scores = itm.get("scores",[])
        out = []
        for s in scores:
            try:
                out.append(ScoreItem(criterion=s["criterion"], score=float(s["score"]), rationale=s.get("rationale","")))
            except Exception:
                continue
        if title:
            store.setdefault(title, []).extend(out)
    return store

def weighted_total(score_items: List[ScoreItem]) -> float:
    # 取相同面向的平均後加權
    by_crit: Dict[CriteriaCode, List[float]] = {}
    for s in score_items:
        if s.criterion in CRITERIA_WEIGHTS:
            by_crit.setdefault(s.criterion, []).append(s.score)
    total = 0.0
    for crit, vals in by_crit.items():
        avg = sum(vals)/len(vals)
        total += avg * CRITERIA_WEIGHTS[crit]
    return round(total, 4)

def sensitivity_note(concept_totals: Dict[str, float]) -> str:
    # 簡易說明：報告最高分與次高分差值
    if len(concept_totals) < 2:
        return "僅單一概念，無敏感度比較。"
    top2 = sorted(concept_totals.items(), key=lambda x: x[1], reverse=True)[:2]
    diff = round(top2[0][1] - top2[1][1], 4)
    return f"Top-1 與 Top-2 總分差：{diff}（>0.12 時排序較穩定）。"

def find_disputed_criteria(store: Dict[str, List[ScoreItem]], sd_threshold: float = 1.0) -> List[str]:
    # 以標準差衡量分歧
    per_crit: Dict[CriteriaCode, List[float]] = {}
    for items in store.values():
        for s in items:
            per_crit.setdefault(s.criterion, []).append(s.score)
    disputed = []
    for crit, vals in per_crit.items():
        if len(vals) >= 3:
            try:
                if statistics.stdev(vals) >= sd_threshold:
                    disputed.append(crit)
            except statistics.StatisticsError:
                pass
    return disputed 