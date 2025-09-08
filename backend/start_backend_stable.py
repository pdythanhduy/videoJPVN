#!/usr/bin/env python3
"""
Backend khởi động ổn định với error handling
"""

import sys
import os
import signal
import time
from pathlib import Path

def signal_handler(sig, frame):
    print('\n🛑 Đang dừng backend...')
    sys.exit(0)

def main():
    print("🚀 Khởi động Backend ổn định...")
    
    # Xử lý signal để dừng gracefully
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Import và chạy main_simple
        from main_simple import app
        import uvicorn
        
        print("✅ Backend đã sẵn sàng!")
        print("🌐 Truy cập: http://localhost:8000")
        print("📚 API docs: http://localhost:8000/docs")
        print("⏹️  Nhấn Ctrl+C để dừng")
        
        # Chạy với cấu hình ổn định
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=False,  # Tắt reload để ổn định hơn
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        print("\n⏹️  Backend đã dừng")
    except Exception as e:
        print(f"❌ Lỗi khởi động backend: {e}")
        print("🔄 Thử khởi động lại...")
        time.sleep(2)
        main()  # Restart

if __name__ == "__main__":
    main()
