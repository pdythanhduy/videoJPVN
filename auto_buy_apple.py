#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
auto_buy_apple.py
-----------------
Script tự động mua iPhone trên Apple Store Online (Nhật Bản)
- Sử dụng Selenium để điều khiển Chrome
- Tự động chạy vào thời gian đã định
- Dừng lại ở bước xác nhận đơn hàng
"""

import time
import schedule
import logging
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json
import os

# =====================
# CẤU HÌNH SẢN PHẨM
# =====================
PRODUCT_CONFIG = {
    "url": "https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro",
    "model": "iPhone 16 Pro 256GB Natural Titanium",
    "storage": "256GB",
    "color": "Natural Titanium",
    "target_time": "21:00",  # Giờ chạy (24h format)
    "target_date": "2025-09-12"  # Ngày chạy
}

# =====================
# CẤU HÌNH SELENIUM
# =====================
CHROME_OPTIONS = [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-blink-features=AutomationControlled",
    "--disable-extensions",
    "--disable-plugins",
    "--disable-images",  # Tăng tốc độ load
    "--disable-javascript",  # Chỉ bật khi cần
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

# =====================
# THIẾT LẬP LOGGING
# =====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('apple_buy_log.txt', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AppleStoreBot:
    def __init__(self):
        self.driver = None
        self.wait = None
        
    def setup_driver(self):
        """Thiết lập Chrome driver với các tùy chọn tối ưu"""
        try:
            logger.info("🔧 Đang thiết lập Chrome driver...")
            
            chrome_options = Options()
            for option in CHROME_OPTIONS:
                chrome_options.add_argument(option)
            
            # Ẩn automation indicators
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Tạo driver
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Thiết lập wait
            self.wait = WebDriverWait(self.driver, 20)
            
            logger.info("✅ Chrome driver đã sẵn sàng")
            return True
            
        except Exception as e:
            logger.error(f"❌ Lỗi thiết lập driver: {e}")
            return False
    
    def load_cookies(self):
        """Load cookies đã lưu (nếu có) để đăng nhập sẵn"""
        try:
            if os.path.exists('apple_cookies.json'):
                logger.info("🍪 Đang load cookies đã lưu...")
                with open('apple_cookies.json', 'r', encoding='utf-8') as f:
                    cookies = json.load(f)
                
                # Truy cập domain trước khi add cookies
                self.driver.get("https://www.apple.com/jp/")
                time.sleep(2)
                
                for cookie in cookies:
                    try:
                        self.driver.add_cookie(cookie)
                    except Exception as e:
                        logger.warning(f"Không thể add cookie: {e}")
                
                logger.info("✅ Cookies đã được load")
                return True
            else:
                logger.warning("⚠️ Không tìm thấy file cookies. Cần đăng nhập thủ công.")
                return False
                
        except Exception as e:
            logger.error(f"❌ Lỗi load cookies: {e}")
            return False
    
    def save_cookies(self):
        """Lưu cookies hiện tại để dùng lần sau"""
        try:
            cookies = self.driver.get_cookies()
            with open('apple_cookies.json', 'w', encoding='utf-8') as f:
                json.dump(cookies, f, ensure_ascii=False, indent=2)
            logger.info("💾 Cookies đã được lưu")
        except Exception as e:
            logger.error(f"❌ Lỗi lưu cookies: {e}")
    
    def navigate_to_product(self):
        """Điều hướng đến trang sản phẩm"""
        try:
            logger.info(f"🌐 Đang mở trang sản phẩm: {PRODUCT_CONFIG['url']}")
            self.driver.get(PRODUCT_CONFIG['url'])
            time.sleep(3)
            
            # Kiểm tra trang đã load
            if "iPhone 16 Pro" in self.driver.title:
                logger.info("✅ Đã vào trang sản phẩm thành công")
                return True
            else:
                logger.error("❌ Không vào được trang sản phẩm")
                return False
                
        except Exception as e:
            logger.error(f"❌ Lỗi điều hướng: {e}")
            return False
    
    def select_model(self):
        """Chọn model iPhone theo cấu hình"""
        try:
            logger.info(f"📱 Đang chọn model: {PRODUCT_CONFIG['model']}")
            
            # Chờ trang load hoàn toàn
            time.sleep(5)
            
            # Tìm và click chọn màu Natural Titanium
            color_selector = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-autom='color-Natural Titanium']"))
            )
            color_selector.click()
            logger.info("🎨 Đã chọn màu Natural Titanium")
            time.sleep(2)
            
            # Tìm và click chọn dung lượng 256GB
            storage_selector = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-autom='storage-256GB']"))
            )
            storage_selector.click()
            logger.info("💾 Đã chọn dung lượng 256GB")
            time.sleep(2)
            
            # Kiểm tra giá hiển thị
            try:
                price_element = self.driver.find_element(By.CSS_SELECTOR, "[data-autom='price']")
                price = price_element.text
                logger.info(f"💰 Giá sản phẩm: {price}")
            except:
                logger.warning("⚠️ Không tìm thấy giá sản phẩm")
            
            return True
            
        except TimeoutException:
            logger.error("❌ Timeout khi chọn model - có thể trang chưa load xong")
            return False
        except NoSuchElementException:
            logger.error("❌ Không tìm thấy element chọn model")
            return False
        except Exception as e:
            logger.error(f"❌ Lỗi chọn model: {e}")
            return False
    
    def add_to_cart(self):
        """Thêm sản phẩm vào giỏ hàng"""
        try:
            logger.info("🛒 Đang thêm sản phẩm vào giỏ hàng...")
            
            # Tìm và click nút "Add to Bag"
            add_to_bag_btn = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-autom='add-to-cart']"))
            )
            add_to_bag_btn.click()
            logger.info("✅ Đã click Add to Bag")
            time.sleep(3)
            
            # Kiểm tra có popup xác nhận không
            try:
                # Tìm nút "Add to Bag" trong popup nếu có
                popup_add_btn = self.driver.find_element(By.CSS_SELECTOR, "[data-autom='add-to-cart']")
                if popup_add_btn.is_displayed():
                    popup_add_btn.click()
                    logger.info("✅ Đã xác nhận thêm vào giỏ hàng")
                    time.sleep(2)
            except:
                pass
            
            # Kiểm tra sản phẩm đã được thêm
            try:
                cart_count = self.driver.find_element(By.CSS_SELECTOR, "[data-autom='cart-count']")
                if cart_count.text.strip():
                    logger.info(f"🛒 Số lượng trong giỏ: {cart_count.text}")
                else:
                    logger.info("🛒 Sản phẩm đã được thêm vào giỏ hàng")
            except:
                logger.info("🛒 Sản phẩm đã được thêm vào giỏ hàng")
            
            return True
            
        except TimeoutException:
            logger.error("❌ Timeout khi thêm vào giỏ hàng")
            return False
        except Exception as e:
            logger.error(f"❌ Lỗi thêm vào giỏ hàng: {e}")
            return False
    
    def proceed_to_checkout(self):
        """Điều hướng đến trang checkout"""
        try:
            logger.info("💳 Đang điều hướng đến trang checkout...")
            
            # Tìm và click nút "Review Bag" hoặc "Checkout"
            checkout_btn = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-autom='review-bag'], [data-autom='checkout']"))
            )
            checkout_btn.click()
            logger.info("✅ Đã click vào checkout")
            time.sleep(5)
            
            # Kiểm tra đã vào trang checkout
            if "checkout" in self.driver.current_url.lower() or "bag" in self.driver.current_url.lower():
                logger.info("✅ Đã vào trang checkout thành công")
                return True
            else:
                logger.warning("⚠️ Có thể chưa vào đúng trang checkout")
                return True  # Vẫn tiếp tục
                
        except TimeoutException:
            logger.error("❌ Timeout khi điều hướng checkout")
            return False
        except Exception as e:
            logger.error(f"❌ Lỗi điều hướng checkout: {e}")
            return False
    
    def run_purchase_flow(self):
        """Chạy toàn bộ quy trình mua hàng"""
        try:
            logger.info("🚀 Bắt đầu quy trình mua iPhone...")
            
            # Thiết lập driver
            if not self.setup_driver():
                return False
            
            # Load cookies (nếu có)
            self.load_cookies()
            
            # Điều hướng đến sản phẩm
            if not self.navigate_to_product():
                return False
            
            # Chọn model
            if not self.select_model():
                return False
            
            # Thêm vào giỏ hàng
            if not self.add_to_cart():
                return False
            
            # Đi đến checkout
            if not self.proceed_to_checkout():
                return False
            
            # Lưu cookies cho lần sau
            self.save_cookies()
            
            logger.info("🎉 Hoàn thành! Đã dừng ở bước xác nhận đơn hàng.")
            logger.info("👆 Vui lòng kiểm tra và hoàn tất thanh toán thủ công.")
            
            # Giữ trình duyệt mở để người dùng kiểm tra
            input("Nhấn Enter để đóng trình duyệt...")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Lỗi trong quy trình mua hàng: {e}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("🔚 Đã đóng trình duyệt")

def check_target_time():
    """Kiểm tra xem đã đến giờ chạy chưa"""
    now = datetime.now()
    target_date = datetime.strptime(PRODUCT_CONFIG['target_date'], "%Y-%m-%d")
    target_time = datetime.strptime(PRODUCT_CONFIG['target_time'], "%H:%M").time()
    
    # Tạo datetime target
    target_datetime = datetime.combine(target_date, target_time)
    
    if now >= target_datetime:
        return True
    else:
        remaining = target_datetime - now
        logger.info(f"⏰ Còn {remaining} nữa mới đến giờ chạy")
        return False

def scheduled_job():
    """Job được lên lịch chạy"""
    logger.info("⏰ Đã đến giờ chạy script!")
    
    bot = AppleStoreBot()
    success = bot.run_purchase_flow()
    
    if success:
        logger.info("✅ Script hoàn thành thành công!")
    else:
        logger.error("❌ Script gặp lỗi!")

def main():
    """Hàm main"""
    logger.info("🍎 Apple Store Auto Buy Script")
    logger.info(f"📅 Ngày chạy: {PRODUCT_CONFIG['target_date']}")
    logger.info(f"⏰ Giờ chạy: {PRODUCT_CONFIG['target_time']}")
    logger.info(f"📱 Sản phẩm: {PRODUCT_CONFIG['model']}")
    
    # Kiểm tra thời gian hiện tại
    if check_target_time():
        logger.info("🚀 Chạy ngay lập tức!")
        scheduled_job()
    else:
        # Lên lịch chạy
        target_time = f"{PRODUCT_CONFIG['target_date']} {PRODUCT_CONFIG['target_time']}"
        schedule.every().day.at(PRODUCT_CONFIG['target_time']).do(scheduled_job)
        
        logger.info(f"⏰ Đã lên lịch chạy vào {target_time}")
        logger.info("🔄 Script đang chạy... (Ctrl+C để dừng)")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("🛑 Script đã được dừng bởi người dùng")

if __name__ == "__main__":
    main()
