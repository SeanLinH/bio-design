from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from src.agents.need_finder import NeedItem

# 定義評估結果結構
class NeedEvaluation(BaseModel):
    need_title: str = Field(description="被評估的需求標題")
    feasibility_score: float = Field(description="可行性分數 (0-10)", ge=0, le=10)
    impact_score: float = Field(description="影響力分數 (0-10)", ge=0, le=10)
    innovation_score: float = Field(description="創新性分數 (0-10)", ge=0, le=10)
    resource_score: float = Field(description="資源需求分數 (0-10，10表示資源需求低)", ge=0, le=10)
    overall_score: float = Field(description="總體分數 (0-10)", ge=0, le=10)
    strengths: List[str] = Field(description="優勢清單")
    weaknesses: List[str] = Field(description="劣勢清單")
    recommendations: List[str] = Field(description="改進建議清單")

# 定義整體評估輸出結構
class NeedsEvaluationOutput(BaseModel):
    evaluations: List[NeedEvaluation] = Field(description="所有需求的評估結果")
    summary: str = Field(description="整體評估總結")
    top_priority_needs: List[str] = Field(description="前三優先需求的標題")

class NeedEvaluator:
    def __init__(self, model: str = "gpt-4.1-mini", temperature: float = 0.3):
        """
        初始化需求評估器
        
        Args:
            model: 使用的 LLM 模型
            temperature: 模型創造性參數
        """
        self.llm = ChatOpenAI(model=model, temperature=temperature)
        self.parser = PydanticOutputParser(pydantic_object=NeedsEvaluationOutput)
    
    def evaluate_needs(self, needs: List[NeedItem]) -> NeedsEvaluationOutput:
        """
        評估需求列表
        
        Args:
            needs: 需求項目列表
            
        Returns:
            NeedsEvaluationOutput: 評估結果
        """
        if not needs:
            return NeedsEvaluationOutput(
                evaluations=[],
                summary="沒有需求項目需要評估",
                top_priority_needs=[]
            )
        
        # 構建評估 prompt
        evaluation_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一位專業的醫療創新項目評估專家，具備豐富的醫療技術、市場分析和項目管理經驗。
            請對提供的醫療需求項目進行全面評估。
            
            評估維度說明：
            1. 可行性分數 (feasibility_score): 評估技術實現的可能性和現實性
            2. 影響力分數 (impact_score): 評估對醫療系統和患者的潛在影響
            3. 創新性分數 (innovation_score): 評估解決方案的創新程度和差異化
            4. 資源需求分數 (resource_score): 評估所需資源的合理性 (10分表示資源需求很低)
            5. 總體分數 (overall_score): 綜合考慮所有因素的整體評估
            
            評估原則：
            - 所有分數範圍為 0-10 分
            - 考慮醫療行業的特殊性和監管要求
            - 關注實際可操作性和商業價值
            - 提供具體、可行的改進建議
            
            {format_instructions}
            """),
            ("human", """請評估以下醫療需求項目：

{needs_content}

請為每個需求項目提供詳細的評估，包括各維度分數、優劣勢分析和改進建議。
同時提供整體總結和優先順序排序。""")
        ])
        
        # 格式化需求內容
        needs_content = self._format_needs_for_evaluation(needs)
        
        # 格式化 prompt
        formatted_prompt = evaluation_prompt.partial(
            format_instructions=self.parser.get_format_instructions()
        )
        
        # 執行評估
        chain = formatted_prompt | self.llm | self.parser
        
        try:
            result = chain.invoke({
                "needs_content": needs_content
            })
            return result
        except Exception as e:
            print(f"評估過程發生錯誤: {e}")
            # 提供默認評估結果
            return self._create_default_evaluation(needs)
    
    def _format_needs_for_evaluation(self, needs: List[NeedItem]) -> str:
        """格式化需求項目為評估用的文本"""
        formatted_content = []
        for i, need in enumerate(needs, 1):
            content = f"""
需求 {i}: {need['need']}
摘要: {need['summary']}
醫療觀點: {need['medical_insights']}
技術觀點: {need['tech_insights']}
實施策略: {need['strategy']}
---
"""
            formatted_content.append(content)
        
        return "\n".join(formatted_content)
    
    def _create_default_evaluation(self, needs: List[NeedItem]) -> NeedsEvaluationOutput:
        """創建默認評估結果（當評估失敗時使用）"""
        evaluations = []
        for need in needs:
            evaluation = NeedEvaluation(
                need_title=need.need,
                feasibility_score=5.0,
                impact_score=5.0,
                innovation_score=5.0,
                resource_score=5.0,
                overall_score=5.0,
                strengths=["需要進一步分析"],
                weaknesses=["評估過程失敗"],
                recommendations=["重新執行評估"]
            )
            evaluations.append(evaluation)
        
        return NeedsEvaluationOutput(
            evaluations=evaluations,
            summary="評估過程遇到問題，請檢查輸入數據或重新執行評估",
            top_priority_needs=[need.need for need in needs[:3]]
        )
    
    def print_evaluation_results(self, evaluation: NeedsEvaluationOutput):
        """美化輸出評估結果"""
        print("\n" + "="*80)
        print("🏥 醫療需求項目評估報告")
        print("="*80)
        
        # 輸出每個需求的評估
        for i, eval_result in enumerate(evaluation.evaluations, 1):
            print(f"\n📋 需求 {i}: {eval_result.need_title}")
            print("-" * 60)
            print(f"📊 評估分數:")
            print(f"   • 可行性: {eval_result.feasibility_score:.1f}/10")
            print(f"   • 影響力: {eval_result.impact_score:.1f}/10")
            print(f"   • 創新性: {eval_result.innovation_score:.1f}/10")
            print(f"   • 資源效率: {eval_result.resource_score:.1f}/10")
            print(f"   • 總體評分: {eval_result.overall_score:.1f}/10")
            
            print(f"\n✅ 優勢:")
            for strength in eval_result.strengths:
                print(f"   • {strength}")
            
            print(f"\n⚠️ 劣勢:")
            for weakness in eval_result.weaknesses:
                print(f"   • {weakness}")
            
            print(f"\n💡 改進建議:")
            for recommendation in eval_result.recommendations:
                print(f"   • {recommendation}")
            print()
        
        # 輸出總結
        print("="*80)
        print("📝 整體評估總結")
        print("="*80)
        print(evaluation.summary)
        
        if evaluation.top_priority_needs:
            print(f"\n🎯 優先處理建議:")
            for i, priority_need in enumerate(evaluation.top_priority_needs, 1):
                print(f"   {i}. {priority_need}")

# 便利函數
def evaluate_needs_list(needs: List[NeedItem], verbose: bool = True) -> NeedsEvaluationOutput:
    """
    評估需求列表的便利函數
    
    Args:
        needs: 需求項目列表
        verbose: 是否輸出詳細結果
        
    Returns:
        評估結果
    """
    evaluator = NeedEvaluator()
    result = evaluator.evaluate_needs(needs)
    
    if verbose:
        evaluator.print_evaluation_results(result)
    
    return result

# 測試函數
def test_evaluator():
    """測試評估器功能"""
    # 創建測試需求
    test_needs = [
        NeedItem(
            need="智能病床管理系統",
            summary="開發智能病床分配和監控系統，提高病床使用效率",
            medical_insights="可以減少病患等待時間，改善醫療品質",
            tech_insights="使用IoT感測器和AI算法進行即時監控",
            strategy="分階段實施，先在急診科試點"
        ),
        NeedItem(
            need="遠程醫療諮詢平台",
            summary="建立安全的遠程醫療諮詢系統",
            medical_insights="擴大醫療覆蓋範圍，特別是偏遠地區",
            tech_insights="需要高安全性的視訊通話和電子病歷整合",
            strategy="與現有醫院系統整合，確保數據安全"
        )
    ]
    
    # 執行評估
    result = evaluate_needs_list(test_needs)
    return result

if __name__ == "__main__":
    # 執行測試
    test_result = test_evaluator()


