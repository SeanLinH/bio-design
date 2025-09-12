"""
簡單的 AP    base_url = "http://127.0.0.1:8005" 測試腳本
"""

import requests
import json
import time

def test_basic_endpoints():
    """測試基本端點"""
    base_url = "http://127.0.0.1:8002"
    
    print("🧪 開始基本 API 測試")
    print("=" * 50)
    
    # 1. 測試根端點
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ 根端點: {response.status_code}")
        print(f"   響應: {response.json()}")
    except Exception as e:
        print(f"❌ 根端點錯誤: {e}")
    
    # 2. 測試健康檢查
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ 健康檢查: {response.status_code}")
        print(f"   響應: {response.json()}")
    except Exception as e:
        print(f"❌ 健康檢查錯誤: {e}")
    
    # 3. 測試 API 健康檢查
    try:
        response = requests.get(f"{base_url}/api/v1/health", timeout=5)
        print(f"✅ API 健康檢查: {response.status_code}")
        print(f"   響應: {response.json()}")
    except Exception as e:
        print(f"❌ API 健康檢查錯誤: {e}")
    
    # 4. 測試代理列表
    try:
        response = requests.get(f"{base_url}/api/v1/agents/", timeout=5)
        print(f"✅ 代理列表: {response.status_code}")
        agents_data = response.json()
        print(f"   發現 {len(agents_data.get('agents', []))} 個代理")
        for agent in agents_data.get('agents', [])[:3]:
            print(f"   - {agent['name']}")
    except Exception as e:
        print(f"❌ 代理列表錯誤: {e}")
    
    # 5. 測試創新會話創建
    try:
        session_data = {
            "title": "測試會話",
            "description": "這是一個測試會話",
            "metadata": {"test": True}
        }
        
        response = requests.post(
            f"{base_url}/api/v1/innovation/sessions",
            json=session_data,
            timeout=10
        )
        print(f"✅ 創建會話: {response.status_code}")
        if response.status_code == 200:
            session_info = response.json()
            session_id = session_info["session_id"]
            print(f"   會話 ID: {session_id}")
            
            # 6. 測試獲取會話詳情
            try:
                response = requests.get(
                    f"{base_url}/api/v1/innovation/sessions/{session_id}",
                    timeout=5
                )
                print(f"✅ 獲取會話詳情: {response.status_code}")
                session_details = response.json()
                print(f"   會話狀態: {session_details['status']}")
            except Exception as e:
                print(f"❌ 獲取會話詳情錯誤: {e}")
                
    except Exception as e:
        print(f"❌ 創建會話錯誤: {e}")
    
    # 7. 測試圖表類型
    try:
        response = requests.get(f"{base_url}/api/v1/innovation/diagrams/types", timeout=5)
        print(f"✅ 圖表類型: {response.status_code}")
        diagram_types = response.json()
        print(f"   可用圖表類型: {len(diagram_types)}")
        for dtype in diagram_types[:2]:
            print(f"   - {dtype['name']}")
    except Exception as e:
        print(f"❌ 圖表類型錯誤: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 基本測試完成")

if __name__ == "__main__":
    # 等待服務器準備就緒
    print("⏳ 等待服務器啟動...")
    time.sleep(2)
    
    test_basic_endpoints()
