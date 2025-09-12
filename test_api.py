"""
自動化測試腳本 - 測試生物設計三階段創新系統
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any

class BiodesignAPITester:
    """生物設計 API 自動化測試器"""
    
    def __init__(self, base_url: str = "http://127.0.0.1:8002"):
        self.base_url = base_url
        self.session_id = None
        
    async def test_health_endpoints(self):
        """測試健康檢查端點"""
        print("🔍 測試健康檢查端點...")
        
        async with httpx.AsyncClient() as client:
            # 測試根端點
            try:
                response = await client.get(f"{self.base_url}/")
                print(f"✅ 根端點: {response.status_code} - {response.json()}")
            except Exception as e:
                print(f"❌ 根端點錯誤: {e}")
            
            # 測試健康檢查
            try:
                response = await client.get(f"{self.base_url}/health")
                print(f"✅ 健康檢查: {response.status_code} - {response.json()}")
            except Exception as e:
                print(f"❌ 健康檢查錯誤: {e}")
                
            # 測試 API 健康檢查
            try:
                response = await client.get(f"{self.base_url}/api/v1/health")
                print(f"✅ API 健康檢查: {response.status_code} - {response.json()}")
            except Exception as e:
                print(f"❌ API 健康檢查錯誤: {e}")
    
    async def test_agents_endpoints(self):
        """測試智能代理端點"""
        print("\n🤖 測試智能代理端點...")
        
        async with httpx.AsyncClient() as client:
            # 測試代理列表
            try:
                response = await client.get(f"{self.base_url}/api/v1/agents/")
                print(f"✅ 代理列表: {response.status_code}")
                agents_data = response.json()
                print(f"   發現 {len(agents_data.get('agents', []))} 個代理")
                for agent in agents_data.get('agents', [])[:3]:  # 只顯示前3個
                    print(f"   - {agent['name']}: {agent['description']}")
            except Exception as e:
                print(f"❌ 代理列表錯誤: {e}")
            
            # 測試特定代理詳情
            try:
                response = await client.get(f"{self.base_url}/api/v1/agents/medical_expert")
                print(f"✅ 醫療專家代理詳情: {response.status_code}")
            except Exception as e:
                print(f"❌ 醫療專家代理詳情錯誤: {e}")
    
    async def test_innovation_session_lifecycle(self):
        """測試創新會話生命週期"""
        print("\n🚀 測試創新會話生命週期...")
        
        async with httpx.AsyncClient() as client:
            # 1. 創建新會話
            try:
                session_data = {
                    "title": "智能血糖監測系統",
                    "description": "為糖尿病患者開發非侵入式連續血糖監測設備",
                    "metadata": {
                        "target_population": "糖尿病患者",
                        "technology_focus": "生物感測器"
                    }
                }
                
                response = await client.post(
                    f"{self.base_url}/api/v1/innovation/sessions",
                    json=session_data
                )
                print(f"✅ 創建會話: {response.status_code}")
                session_info = response.json()
                self.session_id = session_info["session_id"]
                print(f"   會話 ID: {self.session_id}")
                print(f"   當前階段: {session_info['current_phase']}")
                
            except Exception as e:
                print(f"❌ 創建會話錯誤: {e}")
                return
            
            # 2. 獲取會話詳情
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/innovation/sessions/{self.session_id}"
                )
                print(f"✅ 獲取會話詳情: {response.status_code}")
                session_details = response.json()
                print(f"   會話狀態: {session_details['status']}")
                print(f"   階段進度: {session_details.get('phase_progress', {})}")
                
            except Exception as e:
                print(f"❌ 獲取會話詳情錯誤: {e}")
            
            # 3. 測試階段執行 - IDENTIFY
            try:
                identify_input = {
                    "research_query": "糖尿病血糖監測 非侵入式技術 市場需求",
                    "constraints": {
                        "budget": "2M USD",
                        "timeline": "24 months"
                    }
                }
                
                response = await client.post(
                    f"{self.base_url}/api/v1/innovation/sessions/{self.session_id}/phases/identify",
                    json=identify_input
                )
                print(f"✅ IDENTIFY 階段執行: {response.status_code}")
                identify_result = response.json()
                print(f"   識別需求數量: {len(identify_result.get('identified_needs', []))}")
                
            except Exception as e:
                print(f"❌ IDENTIFY 階段執行錯誤: {e}")
            
            # 4. 獲取會話進度
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/innovation/sessions/{self.session_id}/progress"
                )
                print(f"✅ 獲取會話進度: {response.status_code}")
                progress = response.json()
                print(f"   當前階段: {progress['current_phase']}")
                print(f"   階段進度: {progress.get('phase_progress', {})}")
                
            except Exception as e:
                print(f"❌ 獲取會話進度錯誤: {e}")
    
    async def test_diagram_generation(self):
        """測試圖表生成功能"""
        print("\n📊 測試圖表生成功能...")
        
        if not self.session_id:
            print("❌ 需要先創建會話")
            return
        
        async with httpx.AsyncClient() as client:
            # 1. 獲取可用圖表類型
            try:
                response = await client.get(f"{self.base_url}/api/v1/innovation/diagrams/types")
                print(f"✅ 獲取圖表類型: {response.status_code}")
                diagram_types = response.json()
                print(f"   可用圖表類型: {len(diagram_types)}")
                for dtype in diagram_types[:3]:  # 只顯示前3個
                    print(f"   - {dtype['name']}: {dtype['description']}")
                    
            except Exception as e:
                print(f"❌ 獲取圖表類型錯誤: {e}")
            
            # 2. 生成工作流程圖
            try:
                diagram_request = {
                    "diagram_type": "phase_workflow",
                    "customization": {
                        "theme": "neutral",
                        "title": "智能血糖監測系統開發流程"
                    }
                }
                
                response = await client.post(
                    f"{self.base_url}/api/v1/innovation/sessions/{self.session_id}/diagrams",
                    json=diagram_request
                )
                print(f"✅ 生成工作流程圖: {response.status_code}")
                diagram_data = response.json()
                print(f"   圖表 ID: {diagram_data.get('diagram_id')}")
                print(f"   圖表標題: {diagram_data.get('diagram_title')}")
                
            except Exception as e:
                print(f"❌ 生成工作流程圖錯誤: {e}")
    
    async def test_document_upload(self):
        """測試文檔上傳功能"""
        print("\n📄 測試文檔上傳功能...")
        
        if not self.session_id:
            print("❌ 需要先創建會話")
            return
        
        # 創建測試文檔內容
        test_document = """
        糖尿病血糖監測市場分析報告
        
        1. 市場概況
        全球糖尿病患者超過4億人，其中需要定期監測血糖的患者約佔70%。
        目前主流的指血檢測方式存在疼痛、不便等問題。
        
        2. 技術發展趨勢
        - 非侵入式血糖監測技術
        - 連續血糖監測 (CGM)
        - 智能穿戴設備整合
        - 人工智能數據分析
        
        3. 市場需求分析
        - 減少疼痛和不便
        - 提高監測頻率
        - 改善患者依從性
        - 降低長期醫療成本
        
        4. 競爭對手分析
        - 雅培 FreeStyle Libre
        - Dexcom G6/G7
        - 美敦力 Guardian
        
        5. 技術挑戰
        - 非侵入式技術準確性
        - 設備小型化
        - 電池續航
        - 成本控制
        """
        
        async with httpx.AsyncClient() as client:
            try:
                # 模擬文檔上傳
                files = {
                    "file": ("market_analysis.txt", test_document.encode(), "text/plain")
                }
                
                response = await client.post(
                    f"{self.base_url}/api/v1/innovation/sessions/{self.session_id}/documents",
                    files=files
                )
                print(f"✅ 文檔上傳: {response.status_code}")
                upload_result = response.json()
                print(f"   文檔 ID: {upload_result.get('document_id')}")
                print(f"   處理狀態: {upload_result.get('processing_status')}")
                
            except Exception as e:
                print(f"❌ 文檔上傳錯誤: {e}")
    
    async def test_complete_workflow(self):
        """測試完整工作流程"""
        print("\n🔄 測試完整工作流程...")
        
        if not self.session_id:
            print("❌ 需要先創建會話")
            return
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                workflow_input = {
                    "research_query": "糖尿病非侵入式血糖監測技術創新",
                    "constraints": {
                        "budget": "3M USD",
                        "timeline": "36 months",
                        "target_market": "北美和歐洲"
                    },
                    "technology_preferences": [
                        "光學感測",
                        "電化學感測",
                        "生物感測器"
                    ]
                }
                
                print("   啟動完整工作流程...")
                response = await client.post(
                    f"{self.base_url}/api/v1/innovation/sessions/{self.session_id}/workflow/run",
                    json=workflow_input
                )
                print(f"✅ 完整工作流程: {response.status_code}")
                workflow_result = response.json()
                
                if workflow_result.get("success"):
                    print("   ✅ 工作流程執行成功")
                    final_report = workflow_result.get("final_report", {})
                    print(f"   最終決策: {final_report.get('final_decision', {}).get('decision', 'N/A')}")
                    print(f"   總迭代次數: {final_report.get('iterations', 'N/A')}")
                else:
                    print(f"   ❌ 工作流程執行失敗: {workflow_result.get('error')}")
                
            except Exception as e:
                print(f"❌ 完整工作流程錯誤: {e}")
    
    async def test_session_list(self):
        """測試會話列表功能"""
        print("\n📋 測試會話列表功能...")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/api/v1/innovation/sessions")
                print(f"✅ 會話列表: {response.status_code}")
                sessions = response.json()
                print(f"   總會話數量: {len(sessions)}")
                
                for session in sessions[:3]:  # 只顯示前3個
                    print(f"   - {session['title']} ({session['status']})")
                    
            except Exception as e:
                print(f"❌ 會話列表錯誤: {e}")
    
    async def run_comprehensive_test(self):
        """執行綜合測試"""
        print("🧪 開始生物設計三階段創新系統綜合測試")
        print("=" * 60)
        
        # 測試順序
        await self.test_health_endpoints()
        await self.test_agents_endpoints()
        await self.test_innovation_session_lifecycle()
        await self.test_document_upload()
        await self.test_diagram_generation()
        # await self.test_complete_workflow()  # 這個測試時間較長，可選
        await self.test_session_list()
        
        print("\n" + "=" * 60)
        print("🎉 綜合測試完成")
        if self.session_id:
            print(f"📝 測試會話 ID: {self.session_id}")

async def main():
    """主測試函數"""
    
    # 等待服務器啟動
    print("⏳ 等待服務器啟動...")
    await asyncio.sleep(3)
    
    # 檢查服務器是否可用
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://127.0.0.1:8002/health", timeout=5.0)
            if response.status_code == 200:
                print("✅ 服務器已就緒")
            else:
                print(f"❌ 服務器響應異常: {response.status_code}")
                return
    except Exception as e:
        print(f"❌ 無法連接到服務器: {e}")
        print("請確保服務器正在運行: uv run uvicorn app.main:app --reload --port 8002")
        return
    
    # 運行測試
    tester = BiodesignAPITester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())
