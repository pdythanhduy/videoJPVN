# 🍎 Apple Store Auto Buy Bot

Script Python tự động mua iPhone trên Apple Store Online (Nhật Bản) với Selenium và lên lịch chạy.

## ✨ Tính năng

- 🤖 Tự động điều khiển trình duyệt Chrome
- ⏰ Chạy đúng thời gian đã định (21:00 ngày 12/9/2025)
- 🛒 Tự động chọn model, màu sắc, dung lượng
- 🍪 Hỗ trợ lưu/load cookies để đăng nhập sẵn
- 📝 Log chi tiết quá trình thực hiện
- ⚠️ Dừng ở bước xác nhận đơn hàng (an toàn)

## 🚀 Cài đặt nhanh

```bash
# 1. Clone hoặc tải các file
# 2. Chạy script thiết lập
python setup_apple_bot.py

# 3. Chạy bot
python auto_buy_apple.py
```

## 📋 Yêu cầu hệ thống

- Python 3.7+
- Google Chrome
- Kết nối internet ổn định
- Apple ID đã đăng nhập sẵn (tùy chọn)

## ⚙️ Cấu hình

Chỉnh sửa trong file `auto_buy_apple.py`:

```python
PRODUCT_CONFIG = {
    "url": "https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro",
    "model": "iPhone 16 Pro 256GB Natural Titanium",
    "storage": "256GB",
    "color": "Natural Titanium",
    "target_time": "21:00",  # Giờ chạy
    "target_date": "2025-09-12"  # Ngày chạy
}
```

## 📁 Cấu trúc file

```
├── auto_buy_apple.py      # Script chính
├── setup_apple_bot.py     # Script thiết lập
├── requirements_apple_bot.txt  # Dependencies
├── apple_cookies.json     # Cookies đã lưu (tự tạo)
├── apple_buy_log.txt      # Log file (tự tạo)
└── README_Apple_Bot.md    # Hướng dẫn này
```

## 🔧 Cách sử dụng

### 1. Thiết lập lần đầu

```bash
python setup_apple_bot.py
```

### 2. Đăng nhập Apple ID (tùy chọn)

- Mở Chrome
- Đăng nhập Apple ID trên apple.com
- Chạy script một lần để lưu cookies
- Lần sau sẽ tự động đăng nhập

### 3. Chạy bot

```bash
python auto_buy_apple.py
```

## 📊 Quy trình hoạt động

1. **⏰ Kiểm tra thời gian**: Chờ đến giờ đã định
2. **🌐 Mở trình duyệt**: Khởi động Chrome với tùy chọn tối ưu
3. **🍪 Load cookies**: Đăng nhập tự động (nếu có)
4. **📱 Chọn sản phẩm**: Tự động chọn model, màu, dung lượng
5. **🛒 Thêm vào giỏ**: Click "Add to Bag"
6. **💳 Checkout**: Điều hướng đến trang thanh toán
7. **⏸️ Dừng lại**: Chờ người dùng hoàn tất thủ công

## 🛠️ Tùy chỉnh nâng cao

### Thay đổi sản phẩm

```python
# iPhone 16 Pro Max 512GB Space Black
PRODUCT_CONFIG = {
    "url": "https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro-max",
    "model": "iPhone 16 Pro Max 512GB Space Black",
    "storage": "512GB",
    "color": "Space Black",
    # ...
}
```

### Thay đổi thời gian chạy

```python
PRODUCT_CONFIG = {
    "target_time": "20:30",  # 8:30 PM
    "target_date": "2025-09-15",  # 15/9/2025
    # ...
}
```

### Chạy ngay lập tức

```python
# Thay đổi target_date thành ngày hôm nay
PRODUCT_CONFIG = {
    "target_date": "2025-01-09",  # Ngày hôm nay
    "target_time": "14:00",  # 2:00 PM hôm nay
    # ...
}
```

## 📝 Log và debug

- **Console**: Hiển thị tiến trình real-time
- **File log**: `apple_buy_log.txt` (lưu trữ lâu dài)
- **Screenshot**: Tự động chụp khi có lỗi (tùy chọn)

## ⚠️ Lưu ý quan trọng

### Pháp lý
- Script chỉ dành cho mục đích học tập
- Tuân thủ Terms of Service của Apple
- Sử dụng có trách nhiệm

### Kỹ thuật
- Apple có thể thay đổi giao diện → cần cập nhật script
- Tốc độ mạng ảnh hưởng đến thời gian load
- Có thể cần tăng timeout nếu mạng chậm

### Bảo mật
- Không chia sẻ file `apple_cookies.json`
- Xóa cookies sau khi sử dụng
- Không lưu thông tin thanh toán

## 🐛 Troubleshooting

### Lỗi ChromeDriver
```bash
# Chạy lại setup
python setup_apple_bot.py
```

### Lỗi timeout
```python
# Tăng thời gian chờ trong script
self.wait = WebDriverWait(self.driver, 30)  # Từ 20 → 30
```

### Không tìm thấy element
- Apple đã thay đổi giao diện
- Cần cập nhật CSS selectors
- Kiểm tra console log để debug

### Lỗi đăng nhập
- Xóa file `apple_cookies.json`
- Đăng nhập thủ công trước
- Chạy lại script

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log file `apple_buy_log.txt`
2. Đảm bảo Chrome và ChromeDriver cập nhật
3. Kiểm tra kết nối internet
4. Thử chạy với `headless=False` để xem trình duyệt

## 📄 License

MIT License - Sử dụng tự do cho mục đích học tập.

---

**⚠️ Disclaimer**: Script này chỉ dành cho mục đích giáo dục. Người dùng chịu trách nhiệm về việc sử dụng và tuân thủ các quy định pháp luật.
