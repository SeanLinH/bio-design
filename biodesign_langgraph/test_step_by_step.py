#!/usr/bin/env python3
"""
逐步測試腳本 - 調試LangGraph工作流
"""

import os
from dotenv import load_dotenv

def test_position_node():
    """測試position節點"""
    print("🔍 測試position節點...")
    try:
        from src.agents import get_llm, call_position
        
        llm = get_llm()
        need_text = "測試醫療需求：改善患者用藥依從性"
        
        print("✅ LLM初始化成功")
        print(f"需求文本: {need_text}")
        
        # 測試單個專家
        print("\n測試臨床專家...")
        response = call_position(llm, "clinical", need_text)
        print(f"臨床專家回應: {response[:200]}...")
        
        return True
    except Exception as e:
        print(f"❌ position節點測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_critique_node():
    """測試critique節點"""
    print("\n🔍 測試critique節點...")
    try:
        from src.agents import get_llm, call_critique
        
        llm = get_llm()
        need_text = "測試醫療需求：改善患者用藥依從性"
        concepts_digest = "- 智能提醒系統: 定時提醒患者服藥\n- 藥物追蹤器: 記錄服藥情況"
        
        print("✅ LLM初始化成功")
        print(f"需求文本: {need_text}")
        print(f"概念摘要: {concepts_digest}")
        
        # 測試單個專家
        print("\n測試工程專家...")
        response = call_critique(llm, "engineering", need_text, concepts_digest)
        print(f"工程專家回應: {response[:200]}...")
        
        return True
    except Exception as e:
        print(f"❌ critique節點測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_graph():
    """測試簡單的圖形"""
    print("\n🔍 測試簡單圖形...")
    try:
        from langgraph.graph import StateGraph, START, END
        
        # 創建簡單圖形
        builder = StateGraph(dict)
        
        def simple_node(state):
            print("✅ 簡單節點執行成功")
            return {"message": "Hello from simple node"}
        
        builder.add_node("simple", simple_node)
        builder.add_edge(START, "simple")
        builder.add_edge("simple", END)
        
        graph = builder.compile()
        print("✅ 圖形編譯成功")
        
        # 執行圖形
        result = graph.invoke({})
        print(f"✅ 圖形執行成功: {result}")
        
        return True
    except Exception as e:
        print(f"❌ 簡單圖形測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主測試流程"""
    print("🧪 Biodesign 系統逐步測試")
    print("=" * 50)
    
    tests = [
        ("Position節點", test_position_node),
        ("Critique節點", test_critique_node),
        ("簡單圖形", test_simple_graph)
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