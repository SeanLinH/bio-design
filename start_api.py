#!/usr/bin/env python3
"""
Startup script for Bio-Design API server
"""

import uvicorn
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🧬 Starting Bio-Design API Server...")
    print("📊 API Documentation will be available at: http://localhost:8000/docs")
    print("🔄 Alternative docs at: http://localhost:8000/redoc")
    print("🏠 API root: http://localhost:8000/")
    print("\n" + "="*50)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
