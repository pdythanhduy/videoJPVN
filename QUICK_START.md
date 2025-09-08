# Hướng dẫn sử dụng nhanh

## 🚀 Cách chạy dự án

### 1. Chạy Backend (Python)

**Cách 1: Sử dụng file batch (Dễ nhất)**
```bash
# Double-click file start_backend.bat
# Hoặc chạy trong terminal:
start_backend.bat
```

**Cách 2: Chạy thủ công**
```bash
cd backend
python main_simple.py
```

Backend sẽ chạy tại: http://localhost:8000

### 2. Chạy Frontend (React)

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## ✅ Kiểm tra kết nối

1. **Backend hoạt động**: Truy cập http://localhost:8000/health
2. **Frontend hoạt động**: Truy cập http://localhost:5173
3. **TTS hoạt động**: Nhấn nút "Text → Audio" trong app

## 🔧 Sửa lỗi thường gặp

### Lỗi "Lỗi kết nối đến server"

**Nguyên nhân**: Backend chưa chạy

**Giải pháp**:
1. Mở terminal/PowerShell
2. Chạy: `cd backend && python main_simple.py`
3. Đợi thấy message: "Application startup complete"
4. Thử lại trong frontend

### Lỗi "ModuleNotFoundError: No module named 'fastapi'"

**Nguyên nhân**: Chưa cài đặt Python dependencies

**Giải pháp**:
```bash
cd backend
pip install -r requirements-simple.txt
```

### Lỗi CORS

**Nguyên nhân**: Frontend và backend chạy port khác

**Giải pháp**: Đảm bảo:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## 🎯 Tính năng hiện tại

### ✅ Đã hoạt động:
- Backend API server
- Frontend React app
- Kết nối giữa frontend và backend
- TTS panel (giao diện)
- API endpoints cơ bản

### 🔄 Đang phát triển:
- TTS thực tế với Azure Speech Service
- Video/Audio processing
- Language analysis

## 📝 Test TTS

1. Mở app tại http://localhost:5173
2. Nhấn nút "Text → Audio"
3. Nhập text tiếng Nhật: `こんにちは、元気ですか？`
4. Chọn giọng nói
5. Nhấn "Tạo Audio"
6. Sẽ thấy thông báo thành công

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra backend có chạy không: http://localhost:8000/health
2. Kiểm tra console browser (F12)
3. Kiểm tra terminal backend có lỗi không
4. Restart cả backend và frontend

## 📁 Cấu trúc file quan trọng

```
videoJPVN/
├── start_backend.bat          # Script chạy backend
├── backend/
│   ├── main_simple.py         # Backend server đơn giản
│   ├── requirements-simple.txt # Dependencies cơ bản
│   └── .env                   # Cấu hình Azure (nếu có)
└── src/
    ├── App.jsx                # App chính
    └── components/
        └── TTSPanel.jsx       # Component TTS
```
