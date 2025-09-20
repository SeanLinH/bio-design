"""
Bio-Design Multi-Agent API Usage Examples
示範如何使用LangGraph多智能體系統API
"""

import httpx
import asyncio
import json
from typing import Dict, Any

# API配置
API_BASE_URL = "http://localhost:8000"  # 假設API運行在本地8000端口

async def example_multi_agent_debate():
    """示範多智能體辯論功能"""
    
    print("🎯 示範多智能體辯論功能")
    print("=" * 40)
    
    # 辯論主題：改善老年人用藥依從性
    debate_request = {
        "topic": """
        醫療挑戰：改善患有多種慢性疾病的老年患者的用藥依從性
        
        背景：
        - 許多老年患者有複雜的用藥方案
        - 依從性差導致住院和併發症
        - 現有的藥盒和提醒系統效果有限
        - 需要解決根本原因的創新方案
        
        問題：什麼樣的創新方法能顯著改善這一人群的用藥依從性？
        """,
        "phase": "identify",
        "active_agents": ["medical_expert", "business_analyst", "patient_advocate"],
        "max_rounds": 3,
        "consensus_threshold": 0.8
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # 發起辯論
            response = await client.post(
                f"{API_BASE_URL}/api/v1/multi-agent/debate/start",
                json=debate_request
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 辯論成功完成！")
                print(f"📊 狀態: {result['data']['status']}")
                print(f"🤝 達成共識: {result['data'].get('consensus_reached', 'N/A')}")
                print(f"💬 收集的論據: {len(result['data'].get('arguments', []))}")
                
                return result['data']
            else:
                print(f"❌ 辯論失敗: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 請求失敗: {str(e)}")
            return None

async def example_biodesign_workflow():
    """示範生物設計工作流程"""
    
    print("\n🏥 示範生物設計工作流程")
    print("=" * 40)
    
    # 創新請求
    innovation_request = {
        "title": "智慧用藥依從性系統",
        "problem_statement": "患有多種慢性疾病的老年患者在用藥依從性方面存在困難，導致健康結果不佳和醫療成本增加。",
        "context": "老年護理環境，患者每天服用5種以上藥物",
        "objectives": [
            "將用藥依從性提高50%",
            "減少用藥錯誤和漏服",
            "提升患者生活品質",
            "降低醫療利用率和成本"
        ],
        "constraints": [
            "必須易於老年患者使用",
            "應與現有醫療系統整合",
            "成本效益適合廣泛部署"
        ],
        "stakeholders": [
            "老年患者和照護者",
            "醫療提供者",
            "藥劑師",
            "醫療系統",
            "保險提供者"
        ],
        "starting_phase": "identify"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # 啟動工作流程
            response = await client.post(
                f"{API_BASE_URL}/api/v1/multi-agent/workflow/biodesign/start",
                json=innovation_request
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 工作流程成功完成！")
                print(f"📊 狀態: {result['data']['status']}")
                print(f"🔄 完成階段: {', '.join(result['data']['phases_completed'])}")
                
                # 顯示結果
                results = result['data']['results']
                print(f"\n🎯 IDENTIFY階段 - 需求 ({len(results.get('identified_needs', []))}個):")
                for i, need in enumerate(results.get('identified_needs', [])[:3], 1):
                    print(f"   {i}. {need.get('need_description', 'N/A')}")
                
                print(f"\n💡 INVENT階段 - 解決方案 ({len(results.get('invented_solutions', []))}個):")
                for i, solution in enumerate(results.get('invented_solutions', [])[:2], 1):
                    print(f"   {i}. {solution.get('solution_description', 'N/A')}")
                
                return result['data']
            else:
                print(f"❌ 工作流程失敗: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 請求失敗: {str(e)}")
            return None

async def example_agent_analysis():
    """示範單一智能體分析"""
    
    print("\n👨‍⚕️ 示範單一智能體分析")
    print("=" * 40)
    
    # 分析請求
    analysis_request = {
        "type": "clinical_assessment",
        "description": "智慧用藥依從性系統",
        "clinical_context": "多種慢性疾病的老年護理",
        "focus_areas": ["安全性", "有效性", "可用性", "臨床整合"]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # 請求醫療專家分析
            response = await client.post(
                f"{API_BASE_URL}/api/v1/multi-agent/agent/medical_expert/analyze",
                json=analysis_request
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 醫療專家分析完成！")
                print(f"📊 信心度: {result['data']['confidence']}")
                print(f"💬 分析預覽: {result['data']['content'][:200]}...")
                print(f"💡 建議數量: {len(result['data']['recommendations'])}")
                print(f"⚠️  關注點數量: {len(result['data']['concerns'])}")
                
                return result['data']
            else:
                print(f"❌ 分析失敗: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 請求失敗: {str(e)}")
            return None

async def example_list_agents():
    """示範列出可用智能體"""
    
    print("\n🤖 示範列出可用智能體")
    print("=" * 40)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/api/v1/multi-agent/agents")
            
            if response.status_code == 200:
                result = response.json()
                agents = result['data']['agents']
                
                print(f"✅ 發現 {len(agents)} 個可用智能體:")
                for agent in agents:
                    print(f"   🔹 {agent['agent_name']} ({agent['agent_id']})")
                    print(f"      專業領域: {', '.join(agent['expertise_areas'][:3])}")
                    if len(agent['expertise_areas']) > 3:
                        print(f"      (+{len(agent['expertise_areas'])-3} 更多領域)")
                    print()
                
                return result['data']
            else:
                print(f"❌ 列出智能體失敗: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 請求失敗: {str(e)}")
            return None

async def example_health_check():
    """示範系統健康檢查"""
    
    print("\n❤️ 示範系統健康檢查")
    print("=" * 40)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/api/v1/multi-agent/health")
            
            if response.status_code == 200:
                result = response.json()
                health_data = result['data']
                
                print(f"✅ 系統狀態: {health_data['status']}")
                print(f"🤖 可用智能體: {health_data['agents_available']}")
                print(f"⚙️ 工作流程管理器: {health_data['workflow_manager']}")
                print(f"🕐 檢查時間: {health_data['timestamp']}")
                
                print("\n智能體狀態:")
                for agent_id, status in health_data['agent_status'].items():
                    status_emoji = "✅" if status == "healthy" else "❌"
                    print(f"   {status_emoji} {agent_id}: {status}")
                
                return result['data']
            else:
                print(f"❌ 健康檢查失敗: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 請求失敗: {str(e)}")
            return None

async def main():
    """主函數 - 運行所有示例"""
    
    print("🚀 生物設計多智能體API使用示例")
    print("=" * 60)
    print("展示LangGraph基礎多智能體協作功能")
    print("=" * 60)
    
    print("\n⚠️  注意: 這些示例需要API服務器運行在 http://localhost:8000")
    print("請先運行: uvicorn app.main:app --host 0.0.0.0 --port 8000")
    print("\n" + "=" * 60)
    
    # 運行各種示例
    await example_health_check()
    await example_list_agents()
    await example_agent_analysis()
    await example_multi_agent_debate()
    await example_biodesign_workflow()
    
    print("\n" + "=" * 60)
    print("🎉 所有API示例演示完成！")
    print("👍 多智能體系統已準備好進行生物設計創新工作")

def show_api_documentation():
    """顯示API文檔概述"""
    
    print("\n📚 API端點概述")
    print("=" * 30)
    
    endpoints = [
        ("POST", "/api/v1/multi-agent/debate/start", "啟動多智能體辯論"),
        ("GET", "/api/v1/multi-agent/debate/{session_id}/status", "獲取辯論狀態"),
        ("POST", "/api/v1/multi-agent/workflow/biodesign/start", "啟動生物設計工作流程"),
        ("GET", "/api/v1/multi-agent/workflow/{workflow_id}/status", "獲取工作流程狀態"),
        ("POST", "/api/v1/multi-agent/agent/{agent_id}/analyze", "單一智能體分析"),
        ("GET", "/api/v1/multi-agent/agents", "列出可用智能體"),
        ("POST", "/api/v1/multi-agent/consensus/evaluate", "評估共識水平"),
        ("POST", "/api/v1/multi-agent/synthesis/generate", "生成綜合分析"),
        ("GET", "/api/v1/multi-agent/health", "系統健康檢查")
    ]
    
    for method, endpoint, description in endpoints:
        print(f"  {method:6} {endpoint:50} - {description}")
    
    print(f"\n📖 詳細API文檔: {API_BASE_URL}/docs")
    print(f"🔧 API Schema: {API_BASE_URL}/openapi.json")

if __name__ == "__main__":
    # 顯示API文檔
    show_api_documentation()
    
    # 運行示例（注意：需要API服務器運行）
    print(f"\n🔄 要運行實際API測試，請確保服務器在 {API_BASE_URL} 運行")
    print("然後取消註釋下面的行:")
    print("# asyncio.run(main())")
