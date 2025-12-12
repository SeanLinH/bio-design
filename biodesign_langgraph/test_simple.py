#!/usr/bin/env python3
"""
簡單測試腳本 - 逐步測試系統功能
"""

import os
from dotenv import load_dotenv

def test_env():
    """測試環境變量"""
    print("🔧 測試環境變量...")
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    model_name = os.getenv("MODEL_NAME")
    
    print(f"API密鑰: {api_key[:20]}..." if api_key else "❌ 未找到API密鑰")
    print(f"模型名稱: {model_name}")
    
    return api_key is not None

def test_imports():
    """測試模組導入"""
    print("\n📦 測試模組導入...")
    try:
        from src.types import NeedItem
        from src.agents import get_llm
        print("✅ 基本模組導入成功")
        return True
    except Exception as e:
        print(f"❌ 模組導入失敗: {e}")
        return False

def test_llm():
    """測試LLM連接"""
    print("\n🤖 測試LLM連接...")
    try:
        from src.agents import get_llm
        
        llm = get_llm()
        print("✅ LLM初始化成功")
        
        # 簡單測試
        response = llm.invoke("Hello, 請回覆'測試成功'")
        print(f"✅ LLM回應測試: {response.content}")
        return True
    except Exception as e:
        print(f"❌ LLM測試失敗: {e}")
        return False

def test_basic_flow():
    """測試基本流程"""
    print("\n🔄 測試基本流程...")
    try:
        from src.types import NeedItem
        from src.agents import call_position
        
        # 創建測試需求
        need = NeedItem(
            need="測試醫療需求：改善患者用藥依從性",
            summary="簡單測試需求"
        )
        
        print("✅ 需求創建成功")
        print(f"需求內容: {need.need}")
        return True
    except Exception as e:
        print(f"❌ 基本流程測試失敗: {e}")
        return False

def main():
    """主測試流程"""
    print("🧪 Biodesign 系統簡單測試")
    print("=" * 50)
    
    tests = [
        ("環境變量", test_env),
        ("模組導入", test_imports),
        ("LLM連接", test_llm),
        ("基本流程", test_basic_flow)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} 測試異常: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 測試結果總結:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n總計: {passed}/{len(results)} 測試通過")
    
    if passed == len(results):
        print("🎉 所有測試通過！系統準備就緒。")
    else:
        print("⚠️  部分測試失敗，請檢查相關問題。")

if __name__ == "__main__":
    main() 