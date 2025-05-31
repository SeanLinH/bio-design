from typing import List, Literal, Sequence, TypedDict, Dict, Any
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command
import asyncio
from IPython.display import Image, display
from PIL import Image as PILImage
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# 定義需求項目的結構
class NeedItem(BaseModel):
    need: str = Field(description="需求的名稱或標題")
    summary: str = Field(description="需求的簡要總結")
    medical_insights: str = Field(description="醫療專家的洞察和建議")
    tech_insights: str = Field(description="技術專家的洞察和解決方案")
    strategy: str = Field(description="綜合實施策略")

# 定義整體需求輸出結構
class NeedsOutput(BaseModel):
    needs: List[NeedItem] = Field(description="識別出的需求列表")

# 定義狀態結構
class ReflectionState(TypedDict):
    messages: List[BaseMessage]
    medical_insights: List[str]
    engineering_insights: List[str]
    discussion_round: int
    max_rounds: int
    final_summary: str

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

class MedicalReflectionSystem:
    def __init__(self, max_discussion_rounds: int = 3):
        self.max_rounds = max_discussion_rounds
        self.graph = self._build_graph()
        # 初始化 parser
        self.parser = PydanticOutputParser(pydantic_object=NeedsOutput)
    
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
        print("\n==========medical==========\n ",response.content)
        
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
        print("\n==========engineer==========\n ",response.content)
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
            請分析整個對話過程，提取關鍵洞察，並識別出具體的需求項目。
            
            任務：
            1. 從討論中識別出不同的需求項目（可能有多個）
            2. 為每個需求項目提供：
               - need: 需求的名稱或標題
               - summary: 該需求的簡要總結
               - medical_insights: 醫療專家對此需求的洞察和建議
               - tech_insights: 工程師對此需求的技術解決方案
               - strategy: 針對此需求的綜合實施策略
            3. 每個需求都應該是獨立且具體的
            4. 輸出格式必須是一個包含需求項目的列表
            
            {format_instructions}
            """),
            ("human", f"""
            醫療專家洞察：
            {chr(10).join(state['medical_insights'])}
            
            工程師洞察：
            {chr(10).join(state['engineering_insights'])}
            
            完整對話記錄：
            {chr(10).join([msg.content for msg in state['messages'] if isinstance(msg, (AIMessage, HumanMessage))])}
            
            請分析並識別出具體的需求項目，以列表格式輸出。
            """)
        ])
        
        # 格式化 prompt 包含 parser 指示
        formatted_prompt = collector_prompt.partial(
            format_instructions=self.parser.get_format_instructions()
        )
        
        chain = formatted_prompt | llm | self.parser
        
        try:
            response = chain.invoke({})
            print("\n==========collector==========\n", response)
            
            # 將解析後的結果轉換為字符串以便存儲
            parsed_output = response.model_dump()
            
        except Exception as e:
            print(f"解析錯誤: {e}")
            # 如果解析失敗，提供默認結構
            parsed_output = {
                "needs": [
                    {
                        "need": "解析失敗的需求",
                        "summary": "解析失敗，請檢查輸出格式",
                        "medical_insights": "無法解析醫療洞察",
                        "tech_insights": "無法解析技術洞察",
                        "strategy": "無法解析策略"
                    }
                ]
            }
        
        return {
            **state,
            "messages": state["messages"] + [AIMessage(content=str(parsed_output))],
            "final_summary": str(parsed_output)
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
        
        # 嘗試解析最終結果
        try:
            import ast
            parsed_needs = ast.literal_eval(result["final_summary"])
        except:
            parsed_needs = {"needs": []}
        
        return {
            "original_query": user_query,
            "discussion_rounds": result["discussion_round"],
            "medical_insights": result["medical_insights"],
            "engineering_insights": result["engineering_insights"],
            "parsed_needs": parsed_needs,
            "final_summary": result["final_summary"],
            "full_conversation": [msg.content for msg in result["messages"]]
        }

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
    
    # 嘗試解析最終結果
    try:
        import ast
        parsed_needs = ast.literal_eval(result["final_summary"])
    except:
        parsed_needs = {"needs": []}
    
    return {
        "original_query": user_query,
        "discussion_rounds": result["discussion_round"],
        "medical_insights": result["medical_insights"],
        "engineering_insights": result["engineering_insights"],
        "parsed_needs": parsed_needs,
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
    
    print("\n📋 **解析後的需求項目列表**")
    parsed_needs = result.get('parsed_needs', {}).get('needs', [])
    for i, need_info in enumerate(parsed_needs, 1):
        print(f"\n🎯 **需求項目 {i}**")
        print(f"🏷️ 需求名稱: {need_info.get('need', 'N/A')}")
        print(f"📝 摘要: {need_info.get('summary', 'N/A')}")
        print(f"🏥 醫療洞察: {need_info.get('medical_insights', 'N/A')[:150]}...")
        print(f"⚙️ 技術洞察: {need_info.get('tech_insights', 'N/A')[:150]}...")
        print(f"🎯 策略: {need_info.get('strategy', 'N/A')[:150]}...")

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
    
    # 嘗試解析最終結果
    try:
        import ast
        parsed_needs = ast.literal_eval(result["final_summary"])
    except:
        parsed_needs = {"needs": []}
    
    return {
        "original_query": user_query,
        "discussion_rounds": result["discussion_round"],
        "medical_insights": result["medical_insights"],
        "engineering_insights": result["engineering_insights"],
        "parsed_needs": parsed_needs,
        "final_summary": result["final_summary"],
        "full_conversation": [msg.content for msg in result["messages"]]
    }

if __name__ == "__main__":
    # 異步執行
    asyncio.run(main())
    
    # 或者使用同步版本
    result = run_reflection_sync("為什麼醫療資源會壅塞？有什麼解決方案嗎？")
    print(result['final_summary'])
