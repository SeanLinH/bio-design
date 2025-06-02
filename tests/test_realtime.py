#!/usr/bin/env python3
"""
測試實時反思系統
"""

import asyncio
import time
from agents.need_finder_realtime import MedicalReflectionSystemWithRealtime

def status_callback(event_type: str, agent: str, data: dict):
    """狀態回調函數"""
    timestamp = time.strftime("%H:%M:%S")
    agent_name = data.get('agent_name', agent)
    
    print(f"[{timestamp}] {event_type} - {agent_name}")
    
    if event_type == "thinking_started":
        print(f"  💭 {data.get('message', 'Thinking...')}")
    elif event_type == "thinking_completed":
        print(f"  ✅ 完成 (第 {data.get('round', '?')} 輪)")
        if data.get('response'):
            print(f"  💬 回應: {data['response'][:100]}...")
    elif event_type == "collecting_started":
        print(f"  📊 {data.get('message', 'Collecting...')}")
    elif event_type == "collecting_completed":
        print(f"  ✅ 收集完成，識別出 {data.get('needs_count', 0)} 個需求")
    elif event_type == "reflection_started":
        print(f"  🚀 {data.get('message', 'Starting...')} (最大 {data.get('max_rounds', 0)} 輪)")
    elif event_type == "reflection_completed":
        print(f"  🎉 {data.get('message', 'Completed')} ({data.get('discussion_rounds', 0)} 輪, {data.get('needs_count', 0)} 需求)")
    
    print()

def test_realtime_reflection():
    """測試實時反思系統"""
    print("🏥 測試醫療需求實時反思系統")
    print("=" * 50)
    
    # 初始化系統
    system = MedicalReflectionSystemWithRealtime(
        max_discussion_rounds=2,  # 短測試
        status_callback=status_callback
    )
    
    # 測試查詢
    query = "醫院急診科經常人滿為患，病患等待時間過長，醫護人員工作壓力大，如何改善這個問題？"
    
    print(f"📝 查詢: {query}")
    print("=" * 50)
    
    # 執行分析
    start_time = time.time()
    result = system.run_reflection_sync_stream(query)
    end_time = time.time()
    
    print("=" * 50)
    print("📊 最終結果")
    print("=" * 50)
    print(f"⏱️  總耗時: {end_time - start_time:.2f} 秒")
    print(f"🔄 討論輪數: {result['discussion_rounds']}")
    print(f"🏥 醫療洞察: {len(result['medical_insights'])}")
    print(f"⚙️  工程洞察: {len(result['engineering_insights'])}")
    print(f"🎯 識別需求: {len(result['parsed_needs'].get('needs', []))}")
    
    print("\n📋 需求清單:")
    for i, need in enumerate(result['parsed_needs'].get('needs', []), 1):
        print(f"\n{i}. {need.get('need', 'Unknown')}")
        print(f"   📝 摘要: {need.get('summary', 'N/A')}")
        print(f"   🏥 醫療觀點: {need.get('medical_insights', 'N/A')[:100]}...")
        print(f"   ⚙️  技術觀點: {need.get('tech_insights', 'N/A')[:100]}...")

if __name__ == "__main__":
    test_realtime_reflection()
