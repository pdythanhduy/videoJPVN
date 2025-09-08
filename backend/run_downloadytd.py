#!/usr/bin/env python3
"""
Script để chạy downloadytd.py với các tùy chọn
"""

import sys
import os
from pathlib import Path

# Thêm thư mục hiện tại vào Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    print("🎬 YouTube Downloader + Whisper Subtitle Generator")
    print("=" * 50)
    
    # Import và chạy downloadytd
    try:
        import downloadytd
        downloadytd.main()
    except ImportError as e:
        print(f"❌ Lỗi import: {e}")
        print("Đảm bảo file downloadytd.py có trong cùng thư mục")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
