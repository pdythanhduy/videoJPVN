# Hướng dẫn khởi động nhanh

## 🚀 **Cách khởi động cả Backend và Frontend:**

### **Cách 1: Tự động (Khuyến nghị)**
```bash
# Double-click file này
start_both.bat
```

### **Cách 2: Thủ công**
```bash
# Terminal 1: Backend
cd backend
.\start_simple.bat

# Terminal 2: Frontend  
npm run dev
```

## 📍 **Vấn đề thường gặp:**

### **Lỗi: "File not found"**
**Nguyên nhân:** Đang ở thư mục sai

**Giải pháp:**
```bash
# Đảm bảo ở đúng thư mục
cd "C:\Users\thanh\OneDrive\Máy tính\webreatJPVN\videoJPVN"

# Sau đó chạy
.\start_both.bat
```

### **Lỗi: "Port already in use"**
**Nguyên nhân:** Backend cũ vẫn chạy

**Giải pháp:**
```bash
# Kill tất cả Python processes
taskkill /f /im python.exe

# Hoặc restart máy tính
```

### **Lỗi: "Cannot access localhost:5173"**
**Nguyên nhân:** Frontend chưa khởi động

**Giải pháp:**
```bash
# Khởi động frontend
npm run dev

# Đợi thông báo: "Local: http://localhost:5173/"
```

## 🎯 **Workflow hoàn chỉnh:**

### **1. Khởi động:**
```bash
# Cách đơn giản nhất
start_both.bat
```

### **2. Đợi khởi động:**
- **Backend:** 5-10 giây
- **Frontend:** 10-15 giây

### **3. Truy cập:**
- **App:** http://localhost:5173
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs

### **4. Sử dụng:**
- **TTS:** Tạo audio tiếng Nhật
- **YouTube:** Download video
- **STT:** Convert thành SRT

## 🔧 **Troubleshooting:**

### **Nếu backend không chạy:**
```bash
cd backend
python main_simple.py
```

### **Nếu frontend không chạy:**
```bash
npm install
npm run dev
```

### **Nếu cả hai không chạy:**
```bash
# Restart máy tính
# Hoặc kill tất cả processes
taskkill /f /im python.exe
taskkill /f /im node.exe
```

## 📊 **Kiểm tra trạng thái:**

### **Backend:**
```bash
# Test health
curl http://localhost:8000/health
# Hoặc mở browser: http://localhost:8000
```

### **Frontend:**
```bash
# Mở browser
http://localhost:5173
```

## 🎉 **Kết luận:**

### **Để chạy không lỗi:**
1. **Double-click:** `start_both.bat`
2. **Đợi:** 15-20 giây
3. **Mở:** http://localhost:5173
4. **Sử dụng:** App bình thường

### **Nếu vẫn lỗi:**
1. **Kiểm tra** thư mục đúng chưa
2. **Kill** processes cũ
3. **Restart** máy tính
4. **Chạy lại** `start_both.bat`

**Bây giờ app sẽ chạy ổn định!** 🎯
