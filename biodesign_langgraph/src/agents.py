from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from .prompts import AGENT_ROLES, POSITION_TMPL, CRITIQUE_TMPL, REVISE_VOTE_TMPL, DELPHI_TMPL

def get_llm(model_name: str = "gpt-4.1-mini", temperature: float = 0.3):
    return ChatOpenAI(model=model_name, temperature=temperature)

def call_position(llm, role: str, need_text: str) -> str:
    prompt = ChatPromptTemplate.from_template(POSITION_TMPL.format(need=need_text, role=role))
    return (prompt | llm).invoke({}).content

def call_critique(llm, role: str, need_text: str, concepts_digest: str) -> str:
    prompt = ChatPromptTemplate.from_template(CRITIQUE_TMPL.format(
        need=need_text, role=role, concepts_digest=concepts_digest
    ))
    return (prompt | llm).invoke({}).content

def call_revise_vote(llm, role: str, need_text: str, concepts_and_critiques: str) -> str:
    prompt = ChatPromptTemplate.from_template(REVISE_VOTE_TMPL.format(
        need=need_text, role=role, concepts_and_critiques=concepts_and_critiques
    ))
    return (prompt | llm).invoke({}).content

def call_delphi(llm, need_text: str, disputed: List[str]) -> str:
    prompt = ChatPromptTemplate.from_template(DELPHI_TMPL.format(
        need=need_text, disputed_criteria=", ".join(disputed)
    ))
    return (prompt | llm).invoke({}).content 