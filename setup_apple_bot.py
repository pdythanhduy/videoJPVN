#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
setup_apple_bot.py
------------------
Script thiết lập môi trường cho Apple Store Bot
- Cài đặt dependencies
- Tải ChromeDriver
- Hướng dẫn sử dụng
"""

import subprocess
import sys
import os
from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

def install_requirements():
    """Cài đặt các thư viện cần thiết"""
    print("📦 Đang cài đặt dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements_apple_bot.txt"])
        print("✅ Cài đặt dependencies thành công!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi cài đặt dependencies: {e}")
        return False

def setup_chromedriver():
    """Thiết lập ChromeDriver"""
    print("🔧 Đang thiết lập ChromeDriver...")
    try:
        # Tải ChromeDriver tự động
        driver_path = ChromeDriverManager().install()
        print(f"✅ ChromeDriver đã được tải: {driver_path}")
        
        # Test ChromeDriver
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=options)
        driver.get("https://www.google.com")
        driver.quit()
        
        print("✅ ChromeDriver hoạt động bình thường!")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi thiết lập ChromeDriver: {e}")
        return False

def create_config_file():
    """Tạo file cấu hình mẫu"""
    config_content = '''# Apple Store Bot Configuration
# Chỉnh sửa các giá trị dưới đây theo nhu cầu

PRODUCT_URL = "https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro"
MODEL = "iPhone 16 Pro 256GB Natural Titanium"
STORAGE = "256GB"
COLOR = "Natural Titanium"
TARGET_DATE = "2025-09-12"
TARGET_TIME = "21:00"

# Các tùy chọn khác
HEADLESS_MODE = False  # True để chạy ẩn trình duyệt
AUTO_LOGIN = True      # True để tự động đăng nhập bằng cookies
'''
    
    with open("config.py", "w", encoding="utf-8") as f:
        f.write(config_content)
    
    print("📝 Đã tạo file config.py")

def print_usage_instructions():
    """In hướng dẫn sử dụng"""
    instructions = """
🍎 HƯỚNG DẪN SỬ DỤNG APPLE STORE BOT
=====================================

1. CHUẨN BỊ:
   - Cài đặt Google Chrome
   - Đăng nhập Apple ID trên Chrome trước
   - Chạy script này để thiết lập môi trường

2. CẤU HÌNH:
   - Chỉnh sửa file auto_buy_apple.py
   - Thay đổi PRODUCT_CONFIG theo nhu cầu:
     * target_date: Ngày chạy (YYYY-MM-DD)
     * target_time: Giờ chạy (HH:MM)
     * model: Model iPhone muốn mua

3. CHẠY SCRIPT:
   python auto_buy_apple.py

4. LƯU Ý:
   - Script sẽ dừng ở bước xác nhận đơn hàng
   - Cần hoàn tất thanh toán thủ công
   - Kiểm tra log trong file apple_buy_log.txt

5. TROUBLESHOOTING:
   - Nếu lỗi ChromeDriver: Chạy lại setup_apple_bot.py
   - Nếu lỗi timeout: Tăng thời gian chờ trong script
   - Nếu không tìm thấy element: Kiểm tra Apple có thay đổi giao diện

⚠️  CẢNH BÁO:
   - Script chỉ dành cho mục đích học tập
   - Tuân thủ Terms of Service của Apple
   - Sử dụng có trách nhiệm
"""
    print(instructions)

def main():
    """Hàm main"""
    print("🍎 Apple Store Bot Setup")
    print("=" * 30)
    
    # Cài đặt dependencies
    if not install_requirements():
        return
    
    # Thiết lập ChromeDriver
    if not setup_chromedriver():
        return
    
    # Tạo file cấu hình
    create_config_file()
    
    # In hướng dẫn
    print_usage_instructions()
    
    print("\n✅ Thiết lập hoàn tất!")
    print("🚀 Bây giờ bạn có thể chạy: python auto_buy_apple.py")

if __name__ == "__main__":
    main()
