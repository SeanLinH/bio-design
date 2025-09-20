#!/usr/bin/env python3
"""
Test multimodal upload and retrieval with debugging
"""

import requests
import io
from PIL import Image

def create_test_image():
    # 創建一個簡單的測試圖像
    img = Image.new('RGB', (100, 100), color='blue')
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG')
    img_buffer.seek(0)
    return img_buffer

def test_upload_and_retrieve():
    print("=== Testing Upload and Retrieve ===")
    
    # 創建新會話
    session_response = requests.post('http://localhost:8000/api/v1/innovation/sessions', 
        json={
            'title': 'Debug Test Session',
            'description': 'Testing multimodal debug',
            'user_id': 'debug_user'
        }
    )
    
    if session_response.status_code != 200:
        print(f"Failed to create session: {session_response.text}")
        return
    
    session_id = session_response.json()['id']
    print(f"Created session: {session_id}")
    
    # 上傳測試圖像
    test_image = create_test_image()
    files = {
        'files': ('debug_test.jpg', test_image, 'image/jpeg')
    }
    data = {
        'analysis_type': 'medical_imaging',
        'context': 'Debug test image'
    }
    
    upload_response = requests.post(
        f'http://localhost:8000/api/v1/innovation/sessions/{session_id}/multimodal/upload',
        files=files,
        data=data
    )
    
    print(f"Upload status: {upload_response.status_code}")
    if upload_response.status_code == 200:
        upload_data = upload_response.json()
        print(f"Upload response: {upload_data}")
        
        # 立即檢查內容庫
        library_response = requests.get(f'http://localhost:8000/api/v1/innovation/sessions/{session_id}/multimodal/content')
        print(f"Library status: {library_response.status_code}")
        if library_response.status_code == 200:
            library_data = library_response.json()
            print(f"Library response: {library_data}")
        else:
            print(f"Library error: {library_response.text}")
    else:
        print(f"Upload error: {upload_response.text}")

if __name__ == "__main__":
    test_upload_and_retrieve()
