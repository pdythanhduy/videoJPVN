#!/usr/bin/env python3
"""
Hệ thống tự động khởi động và giám sát backend
"""

import os
import sys
import time
import subprocess
import signal
import psutil
from pathlib import Path
import logging

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class BackendManager:
    def __init__(self):
        self.backend_process = None
        self.port = 8000
        self.max_restarts = 10
        self.restart_count = 0
        self.is_running = False
        
    def check_port_available(self):
        """Kiểm tra port có sẵn không"""
        try:
            import socket
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', self.port))
                return True
        except OSError:
            return False
    
    def kill_existing_processes(self):
        """Kill các process Python đang chạy trên port 8000"""
        try:
            for proc in psutil.process_iter(['pid', 'name', 'connections']):
                try:
                    if proc.info['name'] == 'python.exe':
                        for conn in proc.info['connections'] or []:
                            if conn.laddr.port == self.port:
                                logger.info(f"Killing existing process PID: {proc.info['pid']}")
                                proc.kill()
                                time.sleep(2)
                                break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        except Exception as e:
            logger.warning(f"Error killing processes: {e}")
    
    def start_backend(self):
        """Khởi động backend"""
        try:
            # Kill existing processes
            self.kill_existing_processes()
            
            # Đợi port được giải phóng
            for i in range(10):
                if self.check_port_available():
                    break
                logger.info(f"Waiting for port {self.port} to be available... ({i+1}/10)")
                time.sleep(1)
            
            # Khởi động backend
            logger.info("Starting backend...")
            self.backend_process = subprocess.Popen(
                [sys.executable, "main_simple.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Đợi backend khởi động
            for i in range(30):  # 30 giây timeout
                if not self.check_port_available():
                    logger.info(f"Backend started successfully on port {self.port}")
                    self.is_running = True
                    self.restart_count = 0
                    return True
                time.sleep(1)
            
            logger.error("Backend failed to start within 30 seconds")
            return False
            
        except Exception as e:
            logger.error(f"Error starting backend: {e}")
            return False
    
    def check_backend_health(self):
        """Kiểm tra backend có hoạt động không"""
        try:
            import requests
            response = requests.get(f"http://localhost:{self.port}/api/health", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def monitor_backend(self):
        """Giám sát backend"""
        logger.info("Starting backend monitoring...")
        
        while True:
            try:
                if not self.is_running or self.backend_process.poll() is not None:
                    logger.warning("Backend process died, restarting...")
                    
                    if self.restart_count >= self.max_restarts:
                        logger.error(f"Max restarts ({self.max_restarts}) reached. Stopping.")
                        break
                    
                    self.restart_count += 1
                    logger.info(f"Restart attempt {self.restart_count}/{self.max_restarts}")
                    
                    if self.start_backend():
                        logger.info("Backend restarted successfully")
                    else:
                        logger.error("Failed to restart backend")
                        time.sleep(10)  # Đợi 10 giây trước khi thử lại
                
                # Kiểm tra health mỗi 30 giây
                time.sleep(30)
                if not self.check_backend_health():
                    logger.warning("Backend health check failed")
                    self.is_running = False
                
            except KeyboardInterrupt:
                logger.info("Received interrupt signal, stopping...")
                break
            except Exception as e:
                logger.error(f"Error in monitoring: {e}")
                time.sleep(5)
        
        self.stop_backend()
    
    def stop_backend(self):
        """Dừng backend"""
        logger.info("Stopping backend...")
        self.is_running = False
        
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            except Exception as e:
                logger.error(f"Error stopping backend: {e}")
        
        # Kill remaining processes
        self.kill_existing_processes()
        logger.info("Backend stopped")

def main():
    print("🚀 Auto Backend Manager")
    print("=" * 50)
    
    manager = BackendManager()
    
    # Xử lý signal
    def signal_handler(sig, frame):
        print("\n🛑 Đang dừng hệ thống...")
        manager.stop_backend()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Khởi động backend
        if manager.start_backend():
            print("✅ Backend đã khởi động thành công!")
            print(f"🌐 URL: http://localhost:{manager.port}")
            print("📚 API docs: http://localhost:8000/docs")
            print("⏹️  Nhấn Ctrl+C để dừng")
            print("🔄 Tự động restart khi lỗi")
            
            # Bắt đầu giám sát
            manager.monitor_backend()
        else:
            print("❌ Không thể khởi động backend")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        manager.stop_backend()
        sys.exit(1)

if __name__ == "__main__":
    main()
