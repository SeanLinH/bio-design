#!/usr/bin/env python3
"""
Test script for multimodal API endpoints
"""

import requests
import json

def test_multimodal_api():
    session_id = '3aa104ab-a938-47f5-9a4b-381165b6b827'
    content_id = 'd18315c1-827a-469b-b1d5-cba5812e7457'
    
    print("=== Testing Multimodal API ===")
    
    # 測試獲取內容庫（現在應該有內容）
    print("\n1. Testing content library...")
    library_response = requests.get(f'http://localhost:8000/api/v1/innovation/sessions/{session_id}/multimodal/content')
    print(f'Library response: {library_response.status_code}')
    
    if library_response.status_code == 200:
        library_data = library_response.json()
        print(f'Total content items: {library_data["total_count"]}')
        print(f'Content items in response: {len(library_data["multimodal_content"])}')
    else:
        print(f'Library error: {library_response.text}')
    
    # 測試獲取具體內容詳情
    print("\n2. Testing content details...")
    details_response = requests.get(f'http://localhost:8000/api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}')
    print(f'Details response: {details_response.status_code}')
    
    if details_response.status_code == 200:
        details_data = details_response.json()
        print(f'Content filename: {details_data["filename"]}')
        print(f'Processing status: {details_data["processing_status"]}')
        print(f'Analysis type: {details_data["analysis_type"]}')
        print(f'File size: {details_data["file_size"]}')
        if details_data.get('visual_analysis'):
            print(f'Visual analysis available: {bool(details_data["visual_analysis"])}')
            print(f'Key findings: {len(details_data["visual_analysis"]["key_findings"])}')
    else:
        print(f'Details error: {details_response.text}')
    
    # 測試視覺內容分析
    print("\n3. Testing visual content analysis...")
    analysis_request = {
        "content_ids": [content_id],
        "analysis_request": "Analyze this medical image for potential diagnostic features",
        "include_agent_perspectives": True
    }
    
    analysis_response = requests.post(
        f'http://localhost:8000/api/v1/innovation/sessions/{session_id}/multimodal/analyze',
        json=analysis_request
    )
    print(f'Analysis response: {analysis_response.status_code}')
    
    if analysis_response.status_code == 200:
        analysis_data = analysis_response.json()
        print(f'Analysis ID: {analysis_data["analysis_id"]}')
        print(f'Analysis confidence: {analysis_data["visual_analysis"]["confidence_score"]}')
        print(f'Key findings: {analysis_data["visual_analysis"]["key_findings"]}')
    else:
        print(f'Analysis error: {analysis_response.text}')
    
    # 測試添加標註
    print("\n4. Testing annotation addition...")
    annotation_request = {
        "coordinates": {"x": 50, "y": 50, "width": 20, "height": 20},
        "annotation_type": "user_highlight",
        "note": "Test annotation for diagnostic region",
        "tags": ["test", "diagnostic"]
    }
    
    annotation_response = requests.post(
        f'http://localhost:8000/api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}/annotations?user_id=test_user',
        json=annotation_request
    )
    print(f'Annotation response: {annotation_response.status_code}')
    
    if annotation_response.status_code == 200:
        annotation_data = annotation_response.json()
        print(f'Annotation ID: {annotation_data["annotation_id"]}')
        print(f'Annotation note: {annotation_data["note"]}')
    else:
        print(f'Annotation error: {annotation_response.text}')

if __name__ == "__main__":
    test_multimodal_api()
