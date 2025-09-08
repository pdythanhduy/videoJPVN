#!/usr/bin/env python3
"""
Script để chạy backend server
"""
import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Tạo thư mục temp nếu chưa có
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)
    
    # Chạy server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
