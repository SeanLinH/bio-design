#!/usr/bin/env python3
"""
Example client for testing the Bio-Design API
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_api():
    """Test the Bio-Design API endpoints"""
    
    print("🧬 Bio-Design API Client Test")
    print("="*40)
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test design endpoint
    print("\n2. Testing design creation...")
    design_data = {
        "sequence": "ATGCGTACGTAGCTAG",
        "design_type": "dna",
        "parameters": {
            "gc_content_target": 0.5,
            "temperature": 37
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/design", json=design_data)
        print(f"✅ Design creation: {response.status_code}")
        design_result = response.json()
        print(f"   Design ID: {design_result.get('design_id')}")
        print(f"   Properties: {design_result.get('properties')}")
    except Exception as e:
        print(f"❌ Design creation failed: {e}")
    
    # Test analysis endpoint
    print("\n3. Testing sequence analysis...")
    analysis_data = {
        "sequence": "MKTVRQERLKSIVRILERSKEPVSGAQLAEELSVSRQVIVQDIAYLRSLGYNIVATPRGYVLAGG",
        "analysis_type": "protein_function"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/analyze", json=analysis_data)
        print(f"✅ Analysis: {response.status_code}")
        analysis_result = response.json()
        print(f"   Analysis ID: {analysis_result.get('analysis_id')}")
        print(f"   Results: {json.dumps(analysis_result.get('results', {}), indent=2)}")
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
    
    # Test optimization endpoint
    print("\n4. Testing sequence optimization...")
    optimize_data = {
        "sequence": "ATGAAACGTCGTGCT",
        "target_properties": {
            "stability": 0.9,
            "expression": 0.8,
            "gc_content": 0.6
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/optimize", json=optimize_data)
        print(f"✅ Optimization: {response.status_code}")
        opt_result = response.json()
        print(f"   Optimization ID: {opt_result.get('optimization_id')}")
    except Exception as e:
        print(f"❌ Optimization failed: {e}")
    
    # Test chat endpoint
    print("\n5. Testing chat with agent...")
    chat_data = {
        "message": "How can I optimize a protein for thermostability?",
        "context": "Working with enzyme design"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=chat_data)
        print(f"✅ Chat: {response.status_code}")
        chat_result = response.json()
        print(f"   Response: {chat_result.get('response', {}).get('message')}")
    except Exception as e:
        print(f"❌ Chat failed: {e}")
    
    # Test listing endpoints
    print("\n6. Testing list endpoints...")
    try:
        designs_response = requests.get(f"{BASE_URL}/designs")
        analyses_response = requests.get(f"{BASE_URL}/analyses")
        
        print(f"✅ List designs: {designs_response.status_code}")
        print(f"   Total designs: {designs_response.json().get('total', 0)}")
        
        print(f"✅ List analyses: {analyses_response.status_code}")
        print(f"   Total analyses: {analyses_response.json().get('total', 0)}")
    except Exception as e:
        print(f"❌ List endpoints failed: {e}")
    
    print("\n" + "="*40)
    print("🎉 API test completed!")

if __name__ == "__main__":
    print("Make sure the API server is running with: python start_api.py")
    print("Then press Enter to continue with the test...")
    input()
    test_api()
