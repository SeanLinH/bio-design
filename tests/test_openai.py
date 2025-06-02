#!/usr/bin/env python3
"""
Test OpenAI connection and functionality
"""

import os
import sys
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

def test_openai_connection():
    """Test OpenAI API connection"""
    print("🔍 測試 OpenAI 連接...")
    
    # Check if API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY 環境變量未設置")
        print("請設置您的 OpenAI API 密鑰：")
        print("export OPENAI_API_KEY='your-api-key-here'")
        return False
    
    try:
        # Initialize ChatOpenAI
        llm = ChatOpenAI(
            model="gpt-4.1-mini", 
            temperature=0.7
        )
        
        # Test with a simple message
        test_message = HumanMessage(content="Hello, this is a test message. Please respond with 'Connection successful!'")
        response = llm.invoke([test_message])
        
        print("✅ OpenAI 連接成功!")
        print(f"🤖 模型: gpt-4.1-mini")
        print(f"📝 測試回應: {response.content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI 連接失敗: {str(e)}")
        if "invalid_api_key" in str(e).lower():
            print("🔑 API 密鑰無效，請檢查您的 OPENAI_API_KEY")
        elif "quota" in str(e).lower():
            print("💰 API 配額已用完，請檢查您的 OpenAI 帳戶")
        return False

def test_medical_reflection():
    """Test medical reflection with OpenAI"""
    print("\n🏥 測試醫療反思系統...")
    
    try:
        from src.agents.need_finder import run_reflection_sync
        
        # Test query
        test_query = "醫院急診室經常人滿為患，等待時間過長，如何改善？"
        
        print(f"📝 測試查詢: {test_query}")
        print("⏳ 正在處理...")
        
        result = run_reflection_sync(test_query, max_rounds=2)
        
        print("✅ 醫療反思系統測試成功!")
        print(f"💭 討論輪數: {result['discussion_rounds']}")
        print(f"🏥 醫療洞察數量: {len(result['medical_insights'])}")
        print(f"⚙️ 工程洞察數量: {len(result['engineering_insights'])}")
        print(f"📋 識別需求數量: {len(result['parsed_needs'].get('needs', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ 醫療反思系統測試失敗: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 OpenAI 功能測試開始")
    print("=" * 50)
    
    # Test OpenAI connection
    connection_ok = test_openai_connection()
    
    if connection_ok:
        # Test medical reflection system
        test_medical_reflection()
    else:
        print("\n❌ 無法繼續測試，請先解決 OpenAI 連接問題")
    
    print("\n" + "=" * 50)
    print("🏁 測試完成")
