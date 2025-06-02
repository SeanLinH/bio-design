#!/usr/bin/env python3
"""
Test script for the Medical Reflection System API
"""

import requests
import time
import json
from typing import Dict, Any

API_BASE_URL = "http://localhost:8000"

def test_api():
    """Test the complete API workflow"""
    print("🏥 Testing Medical Reflection System API")
    print("=" * 50)
    
    # 1. Submit a reflection query
    print("\n1. Submitting reflection query...")
    query = "An older patient with multiple chronic diseases faces problems with poor medication adherence, lack of real-time monitoring, and personalized support during home care and outpatient follow-ups"
    
    response = requests.post(f"{API_BASE_URL}/api/reflection", json={
        "query": query,
        "max_rounds": 3
    })
    
    if response.status_code != 200:
        print(f"❌ Failed to submit query: {response.status_code}")
        print(response.text)
        return
    
    data = response.json()
    session_id = data["session_id"]
    print(f"✅ Query submitted successfully! Session ID: {session_id}")
    print(f"Status: {data['status']}")
    
    # 2. Poll for reflection results
    print("\n2. Waiting for reflection results...")
    max_attempts = 30  # 5 minutes max
    attempt = 0
    
    while attempt < max_attempts:
        response = requests.get(f"{API_BASE_URL}/api/reflection/{session_id}")
        
        if response.status_code != 200:
            print(f"❌ Failed to get reflection result: {response.status_code}")
            break
        
        data = response.json()
        status = data["status"]
        
        print(f"Attempt {attempt + 1}: Status = {status}")
        
        if status == "completed":
            print("✅ Reflection completed!")
            print(f"Discussion rounds: {data['discussion_rounds']}")
            print(f"Medical insights: {len(data['medical_insights'])}")
            print(f"Engineering insights: {len(data['engineering_insights'])}")
            print(f"Parsed needs: {len(data['parsed_needs'].get('needs', []))}")
            break
        elif status == "error":
            print("❌ Reflection failed!")
            return
        
        time.sleep(10)  # Wait 10 seconds before next check
        attempt += 1
    
    if attempt >= max_attempts:
        print("❌ Timeout waiting for reflection to complete")
        return
    
    # 3. Get evaluation results
    print("\n3. Getting evaluation results...")
    response = requests.get(f"{API_BASE_URL}/api/evaluation/{session_id}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Evaluation results retrieved!")
        print(f"Number of evaluations: {len(data['evaluations'])}")
        print(f"Top priority needs: {', '.join(data['top_priority_needs'])}")
        
        # Print evaluation summary
        print("\n📊 Evaluation Summary:")
        for i, evaluation in enumerate(data['evaluations'], 1):
            print(f"  {i}. {evaluation['need_title']}")
            print(f"     Overall Score: {evaluation['overall_score']:.1f}/10")
            print(f"     Feasibility: {evaluation['feasibility_score']:.1f}/10")
            print(f"     Impact: {evaluation['impact_score']:.1f}/10")
    else:
        print(f"❌ Failed to get evaluation results: {response.status_code}")
        print(response.text)
    
    # 4. Get prioritization results
    print("\n4. Getting prioritization results...")
    response = requests.get(f"{API_BASE_URL}/api/prioritization/{session_id}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Prioritization results retrieved!")
        
        print("\n🎯 Prioritized Needs:")
        for need in data['prioritized_needs']:
            print(f"  Rank {need['rank']}: {need['need_title']}")
            print(f"    Priority Level: {need['priority_level']}")
            print(f"    Overall Score: {need['overall_score']:.1f}/10")
        
        print("\n💡 Recommendations:")
        for rec in data['recommendations']:
            print(f"  • {rec}")
    else:
        print(f"❌ Failed to get prioritization results: {response.status_code}")
        print(response.text)
    
    print("\n✅ API testing completed!")

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    response = requests.get(f"{API_BASE_URL}/health")
    
    if response.status_code == 200:
        print("✅ Health check passed!")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ Health check failed: {response.status_code}")

def test_root_endpoint():
    """Test the API info endpoint"""
    print("🔍 Testing API info endpoint...")
    response = requests.get(f"{API_BASE_URL}/api")
    
    if response.status_code == 200:
        print("✅ API info endpoint working!")
        data = response.json()
        print(f"API: {data['message']}")
        print(f"Version: {data['version']}")
    else:
        print(f"❌ API info endpoint failed: {response.status_code}")

if __name__ == "__main__":
    # First test basic endpoints
    test_root_endpoint()
    test_health_check()
    
    # Then test the full workflow
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the server is running:")
        print("   python run_api.py")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
