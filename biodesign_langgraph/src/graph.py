from typing import List, Dict, Any
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage
from .types import NeedItem, Concept, ConceptScore, DebateOutput
from .prompts import AGENT_ROLES
from .agents import get_llm, call_position, call_critique, call_revise_vote, call_delphi
from .scoring import parse_revise_vote_json, aggregate_scores, weighted_total, sensitivity_note, find_disputed_criteria, ScoreItem, ConceptScore

class DebateState(dict):
    """in-memory 狀態；不落DB"""
    pass

class BiodesignDebate:
    def __init__(self, model_name: str = "gpt-4.1-mini", temperature: float = 0.3, rounds: int = 3, use_delphi: bool = True):
        self.llm = get_llm(model_name, temperature)
        self.rounds = rounds
        self.use_delphi = use_delphi
        self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(DebateState)
        builder.add_node("position", self._position_round)
        builder.add_node("critique", self._critique_round)
        builder.add_node("revise_vote", self._revise_vote_round)
        builder.add_node("aggregate", self._aggregate_node)
        builder.add_edge(START, "position")
        builder.add_edge("position", "critique")
        builder.add_edge("critique", "revise_vote")
        builder.add_edge("revise_vote", "aggregate")
        builder.add_edge("aggregate", END)
        return builder.compile()

    # --------- Nodes ---------
    def _position_round(self, state: DebateState) -> DebateState:
        need_text: str = state["need_text"]
        concepts: List[Concept] = []
        for role, sys in AGENT_ROLES:
            txt = call_position(self.llm, role, need_text)
            # 解析：簡單規則，抓每個「- 標題」開頭；也可改為結構化輸出
            for block in [b.strip() for b in txt.split("\n- ") if b.strip()]:
                # 取第一行為標題，後續為說明
                lines = block.splitlines()
                title = lines[0].strip("•- ")
                desc = " ".join(lines[1:])[:600]
                if title:
                    concepts.append(Concept(title=title, description=desc, source_agent=role))
        return {**state, "concepts": concepts}

    def _critique_round(self, state: DebateState) -> DebateState:
        need_text: str = state["need_text"]
        concepts: List[Concept] = state["concepts"]
        digest = "\n".join([f"- {c.title}: {c.description[:120]}" for c in concepts[:10]])  # 避免過長
        critiques: Dict[str, List[str]] = {c.title: [] for c in concepts}
        for role, _ in AGENT_ROLES:
            txt = call_critique(self.llm, role, need_text, digest)
            # 粗略切條列
            for line in [l.strip("-• ").strip() for l in txt.splitlines() if l.strip()]:
                # 直接掛到全部概念；若要更精細，可建立「針對某標題的批評」抽取
                for c in concepts:
                    if line and line not in critiques[c.title]:
                        critiques[c.title].append(line)
        return {**state, "critiques": critiques}

    def _revise_vote_round(self, state: DebateState) -> DebateState:
        need_text = state["need_text"]
        concepts: List[Concept] = state["concepts"]
        critiques: Dict[str, List[str]] = state["critiques"]
        summary = "\n".join([f"- {c.title}: 批評重點={'; '.join(critiques.get(c.title, [])[:3])}" for c in concepts])

        all_votes = []
        for role, _ in AGENT_ROLES:
            payload = call_revise_vote(self.llm, role, need_text, summary)
            parsed = parse_revise_vote_json(payload)
            all_votes.extend(parsed)

        store = aggregate_scores(all_votes)    # concept_title -> [ScoreItem...]

        # 可選 Delphi 收斂
        if self.use_delphi:
            disputed = find_disputed_criteria(store, sd_threshold=1.0)
            if disputed:
                delphi_payload = call_delphi(self.llm, need_text, disputed)
                delphi_votes = parse_revise_vote_json(delphi_payload)
                dv = aggregate_scores(delphi_votes)
                for title, add_scores in dv.items():
                    store.setdefault(title, []).extend(add_scores)

        # 計總分
        totals = {title: weighted_total(items) for title, items in store.items()}
        ranking = [k for k, _ in sorted(totals.items(), key=lambda x: x[1], reverse=True)]

        # 回組 ConceptScore
        concept_scores = []
        for title, items in store.items():
            concept_scores.append(ConceptScore(concept_title=title, by_criterion=items, total=totals[title]))

        # 概念修訂（示意：在此不做二次生成；若要真正修訂，可再呼叫一次 LLM）
        return {**state, "scores": concept_scores, "ranking": ranking, "revised_concepts": concepts}

    def _aggregate_node(self, state: DebateState) -> DebateState:
        top_n = state.get("top_n", 3)
        ranking: List[str] = state["ranking"]
        scores: List[ConceptScore] = state["scores"]
        note = sensitivity_note({s.concept_title: s.total for s in scores})
        # 決策摘要（用 LLM 生成人類可讀的下一步）
        from langchain_core.prompts import ChatPromptTemplate
        from .prompts import DECISION_TMPL
        topn = min(top_n, len(ranking)) or 1
        prompt = ChatPromptTemplate.from_template(DECISION_TMPL.format(top_n=topn))
        need_text = state["need_text"]
        ctx = f"Need: {need_text}\n排名：{ranking[:topn]}\n分數：{[(s.concept_title, s.total) for s in scores]}"
        decision = (prompt | self.llm).invoke({"input": ctx}).content

        out = {
            "proposed_concepts": state["concepts"],
            "critiques": state["critiques"],
            "revised_concepts": state["revised_concepts"],
            "scores": scores,
            "ranking": ranking,
            "sensitivity_note": note,
            "decision_summary": decision,
        }
        return {**state, "output": out}

    # --------- 執行介面 ---------
    def run(self, need: NeedItem, top_n: int = 3) -> DebateOutput:
        init = DebateState(need_text=need.need, top_n=top_n)
        result = self.graph.invoke(init)
        return DebateOutput(**result["output"]) 