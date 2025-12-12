#!/usr/bin/env python3
"""
簡化版本的Biodesign辯論系統範例
"""

import os
from dotenv import load_dotenv
from src.types import NeedItem
from src.agents import get_llm, call_position, call_critique, call_revise_vote

def main():
    """主函數"""
    print("🏥 Biodesign 多專家辯論系統 - 簡化版本")
    print("=" * 60)
    
    # 創建測試需求
    need = NeedItem(
        need="在血液透析過程中預防透析中低血壓：提供床邊早期預警與處置建議，降低併發症與護理負擔。",
        summary="針對 HD 病人常見的低血壓事件，期望及早偵測與介入。",
        medical_insights="需平衡偵測準確度與臨床可用性；避免警報疲勞。",
        tech_insights="可考慮多模態監測（血壓趨勢、超濾率、導電度、體液評估）。",
        strategy="先行模擬與回溯性驗證，再前瞻觀察試驗。"
    )
    
    print(f"📋 需求: {need.need}")
    print(f"📝 摘要: {need.summary}")
    print()
    
    # 初始化LLM
    print("🤖 初始化AI專家...")
    llm = get_llm()
    print("✅ AI專家初始化完成")
    print()
    
    # 第一輪：Position Round
    print("🔄 第一輪：專家提出概念 (Position Round)")
    print("-" * 40)
    
    concepts = []
    expert_roles = ["clinical", "engineering", "human_factors", "regulatory", "market_finance", "ip", "patient_payer"]
    
    for role in expert_roles:
        print(f"\n👨‍⚕️ {role.upper()} 專家正在思考...")
        try:
            response = call_position(llm, role, need.need)
            print(f"✅ {role} 專家回應:")
            print(response[:300] + "..." if len(response) > 300 else response)
            
            # 簡單解析概念
            lines = response.split('\n')
            for line in lines:
                if line.strip().startswith('-') and '標題' in line:
                    concept_title = line.split('：')[1].strip() if '：' in line else line.strip()
                    concepts.append(concept_title)
                    break
        except Exception as e:
            print(f"❌ {role} 專家回應失敗: {e}")
    
    print(f"\n📊 總共收集到 {len(concepts)} 個概念")
    for i, concept in enumerate(concepts, 1):
        print(f"  {i}. {concept}")
    
    # 第二輪：Critique Round
    print("\n🔄 第二輪：專家相互批評 (Critique Round)")
    print("-" * 40)
    
    concepts_digest = "\n".join([f"- {concept}" for concept in concepts[:3]])  # 取前3個概念
    
    for role in expert_roles[:3]:  # 只測試前3個專家
        print(f"\n👨‍⚕️ {role.upper()} 專家正在批評...")
        try:
            response = call_critique(llm, role, need.need, concepts_digest)
            print(f"✅ {role} 專家批評:")
            print(response[:200] + "..." if len(response) > 200 else response)
        except Exception as e:
            print(f"❌ {role} 專家批評失敗: {e}")
    
    print("\n🎉 簡化版本演示完成！")
    print("\n💡 這個系統展示了：")
    print("  1. 7個AI專家代理的協作")
    print("  2. 結構化的辯論流程")
    print("  3. 專業的醫療器械評估")
    print("  4. 基於LangGraph的工作流架構")

if __name__ == "__main__":
    main() 