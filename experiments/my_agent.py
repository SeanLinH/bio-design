from typing import List, Literal, Sequence, TypedDict
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI  # 你可以替換成其他 LLM 提供商
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command
import asyncio
from IPython.display import Image, display
from PIL import Image as PILImage



# 定義狀態結構
class ReflectionState(TypedDict):
    messages: List[BaseMessage]
    medical_insights: List[str]
    engineering_insights: List[str]
    discussion_round: int
    max_rounds: int
    final_summary: str

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)

class MedicalReflectionSystem:
    def __init__(self, max_discussion_rounds: int = 3):
        self.max_rounds = max_discussion_rounds
        self.graph = self._build_graph()
    
    def _build_graph(self):
        """建立 LangGraph 工作流程"""
        builder = StateGraph(ReflectionState)
        
        # 添加節點
        builder.add_node("medical_staff_agent", self.medical_staff_node)
        builder.add_node("engineer_agent", self.engineer_node)
        builder.add_node("collector", self.collector_node)
        
        # 設定起始點
        builder.add_edge(START, "medical_staff_agent")
        
        # 添加條件邊
        builder.add_conditional_edges(
            "medical_staff_agent",
            self._should_continue_discussion,
            {
                "medical": "medical_staff_agent",
                "engineer_agent": "engineer_agent",
                "collector": "collector",
                "end": END
            }
        )
        
        builder.add_conditional_edges(
            "engineer_agent", 
            self._should_continue_discussion,
            {
                "medical": "medical_staff_agent",
                "engineer_agent": "engineer_agent",
                "collector": "collector",
                "end": END
            }
        )
        
        builder.add_edge("collector", END)

        
        return builder.compile()
    
    def medical_staff_node(self, state: ReflectionState) -> ReflectionState:
        """醫療專家 Agent"""
        medical_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一位資深的醫療專家，專精於醫療系統管理和資源配置。
            你正在與工程師討論醫療資源壅塞的問題。請從醫療專業角度分析問題，
            並提出具體的醫療需求和解決方案。
            
            討論規則：
            1. 專注於醫療流程、人力配置、設備管理等醫療專業領域
            2. 與工程師進行建設性對話，互相補充觀點
            3. 提出具體可行的醫療改善建議
            4. 回應要簡潔明確，重點突出"""),
            MessagesPlaceholder(variable_name="messages")
        ])
        
        chain = medical_prompt | llm
        response = chain.invoke({"messages": state["messages"]})
        print("medical: ",response.content)
        
        # 更新狀態
        new_messages = state["messages"] + [response]
        medical_insights = state["medical_insights"] + [response.content]
        
        return {
            **state,
            "messages": new_messages,
            "medical_insights": medical_insights,
            "discussion_round": state["discussion_round"] + 1
        }
    
    def engineer_node(self, state: ReflectionState) -> ReflectionState:
        """工程師 Agent"""
        engineer_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一位資深的系統工程師，專精於醫療資訊系統、流程優化和技術解決方案。
            你正在與醫療專家討論醫療資源壅塞的問題。請從技術和系統角度分析問題，
            並提出具體的技術需求和解決方案。
            
            討論規則：
            1. 專注於系統架構、數據分析、自動化流程等技術領域
            2. 與醫療專家進行建設性對話，理解醫療需求並提供技術支援
            3. 提出具體可行的技術改善建議
            4. 回應要簡潔明確，重點突出"""),
            MessagesPlaceholder(variable_name="messages")
        ])
        
        chain = engineer_prompt | llm
        response = chain.invoke({"messages": state["messages"]})
        print("engineer: ",response.content)
        # 更新狀態
        new_messages = state["messages"] + [response]
        engineering_insights = state["engineering_insights"] + [response.content]
        
        return {
            **state,
            "messages": new_messages,
            "engineering_insights": engineering_insights,
            "discussion_round": state["discussion_round"] + 1
        }
    
    def collector_node(self, state: ReflectionState) -> ReflectionState:
        """收集者 Agent - 統整各方需求"""
        collector_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一位專案協調者，負責統整醫療專家和工程師的討論結果。
            請分析整個對話過程，提取關鍵洞察，並產生綜合性的解決方案建議。
            
            任務：
            1. 總結醫療專家提出的關鍵需求和建議
            2. 總結工程師提出的技術解決方案和建議  
            3. 整合雙方觀點，提出綜合性的改善策略
            4. 識別潛在的實施挑戰和解決方法
            5. 提供優先順序建議
            
            輸出格式：
            ## 醫療需求總結
            ## 技術解決方案總結  
            ## 綜合改善策略
            ## 實施建議與優先順序"""),
            ("human", f"""
            醫療專家洞察：
            {chr(10).join(state['medical_insights'])}
            
            工程師洞察：
            {chr(10).join(state['engineering_insights'])}
            
            完整對話記錄：
            {chr(10).join([msg.content for msg in state['messages'] if isinstance(msg, (AIMessage, HumanMessage))])}
            
            請提供綜合分析和建議。
            """)
        ])
        
        chain = collector_prompt | llm
        response = chain.invoke({})
        print("collector: ",response.content)
        
        return {
            **state,
            "messages": state["messages"] + [response],
            "final_summary": response.content
        }
    
    def _should_continue_discussion(self, state: ReflectionState) -> str:
        """決定是否繼續討論"""
        current_round = state.get("discussion_round", 0)
        max_rounds = state.get("max_rounds", self.max_rounds)
        
        if current_round >= max_rounds:
            return "collector"
        
        # 檢查最後一條訊息來決定下一個 agent
        last_message = state["messages"][-1] if state["messages"] else None
        
        if last_message:
            # 根據最後一條訊息的來源決定下一個 agent
            if isinstance(last_message, AIMessage):
                if "醫療" in last_message.content or "medical" in str(type(last_message)).lower():
                    return "engineer_agent"
                else:
                    return "medical"
            else:
                # 如果是人類訊息，預設從醫療專家開始
                return "medical"
        
        return "medical"  # 預設從醫療專家開始
    
    async def run_reflection(self, user_query: str) -> dict:
        """執行完整的 reflection 流程"""
        initial_state = {
            "messages": [HumanMessage(content=user_query)],
            "medical_insights": [],
            "engineering_insights": [],
            "discussion_round": 0,
            "max_rounds": self.max_rounds,
            "final_summary": ""
        }
        
        # 執行工作流程
        result = await self.graph.ainvoke(initial_state)
        
        return {
            "original_query": user_query,
            "discussion_rounds": result["discussion_round"],
            "medical_insights": result["medical_insights"],
            "engineering_insights": result["engineering_insights"],
            "final_summary": result["final_summary"],
            "full_conversation": [msg.content for msg in result["messages"]]
        }

# 使用範例
async def main():
    # 初始化系統
    reflection_system = MedicalReflectionSystem(max_discussion_rounds=3)
    
    # 使用者查詢
    user_query = "為什麼醫療資源會壅塞？有什麼解決方案嗎？"
    
    print("🏥 啟動醫療資源壅塞分析系統...")
    print(f"📝 使用者問題：{user_query}")
    print("=" * 60)
    
    # 執行 reflection 流程
    result = await reflection_system.run_reflection(user_query)
    
    # 輸出結果
    print("\n📊 **討論結果總覽**")
    print(f"討論輪數：{result['discussion_rounds']}")
    print(f"醫療洞察數量：{len(result['medical_insights'])}")
    print(f"工程洞察數量：{len(result['engineering_insights'])}")
    
    print("\n🏥 **醫療專家洞察**")
    for i, insight in enumerate(result['medical_insights'], 1):
        print(f"{i}. {insight[:200]}...")
    
    print("\n⚙️ **工程師洞察**")  
    for i, insight in enumerate(result['engineering_insights'], 1):
        print(f"{i}. {insight[:200]}...")
    
    print("\n📋 **收集者綜合分析**")
    print(result['final_summary'])

# 同步版本的執行函數
def run_reflection_sync(user_query: str, max_rounds: int = 3) -> dict:
    """同步版本的 reflection 執行"""
    reflection_system = MedicalReflectionSystem(max_discussion_rounds=max_rounds)
    
    initial_state = {
        "messages": [HumanMessage(content=user_query)],
        "medical_insights": [],
        "engineering_insights": [],
        "discussion_round": 0,
        "max_rounds": max_rounds,
        "final_summary": ""
    }
    
    # 同步執行
    result = reflection_system.graph.invoke(initial_state)
    
    return {
        "original_query": user_query,
        "discussion_rounds": result["discussion_round"],
        "medical_insights": result["medical_insights"],
        "engineering_insights": result["engineering_insights"],
        "final_summary": result["final_summary"],
        "full_conversation": [msg.content for msg in result["messages"]]
    }

if __name__ == "__main__":
    # 異步執行
    asyncio.run(main())
    
    # 或者使用同步版本
    # result = run_reflection_sync("為什麼醫療資源會壅塞？有什麼解決方案嗎？")
    # print(result['final_summary'])
