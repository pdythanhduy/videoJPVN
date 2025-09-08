# Hướng dẫn chạy Backend Server

## 🚨 **Lỗi kết nối đến server**

Nếu gặp lỗi "Lỗi kết nối đến server", backend chưa chạy hoặc đã dừng.

## 🚀 **Cách chạy Backend:**

### **Cách 1: Chạy trực tiếp (Khuyến nghị)**

1. **Mở PowerShell hoặc Command Prompt**
2. **Chuyển đến thư mục backend:**
   ```bash
   cd "C:\Users\thanh\OneDrive\Máy tính\webreatJPVN\videoJPVN\backend"
   ```
3. **Chạy backend:**
   ```bash
   python main_simple.py
   ```

### **Cách 2: Sử dụng script**

1. **Double-click file `start_backend.bat`**
2. **Hoặc chạy từ PowerShell:**
   ```bash
   .\start_backend.bat
   ```

### **Cách 3: Chạy từ VS Code**

1. **Mở VS Code**
2. **Mở thư mục backend**
3. **Mở Terminal (Ctrl + `)**
4. **Chạy:**
   ```bash
   python main_simple.py
   ```

## ✅ **Kiểm tra Backend có chạy:**

### **1. Kiểm tra port 8000:**
```bash
netstat -ano | findstr :8000
```

**Kết quả mong đợi:**
```
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING       [PID]
```

### **2. Kiểm tra trong browser:**
- Mở http://localhost:8000
- Nếu thấy JSON response thì backend đã chạy

### **3. Kiểm tra log:**
Backend sẽ hiển thị log như:
```
INFO:services.youtube_service:YouTubeService initialized - Download dir: C:\Users\thanh\OneDrive\Máy tính\YoutubeFile
INFO:services.stt_service:STTService initialized
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## 🔧 **Troubleshooting:**

### **Nếu backend không chạy:**

1. **Kiểm tra Python:**
   ```bash
   python --version
   ```

2. **Kiểm tra dependencies:**
   ```bash
   pip install -r requirements-simple.txt
   ```

3. **Kiểm tra file main_simple.py:**
   - File có tồn tại không?
   - File có lỗi syntax không?

4. **Kiểm tra port 8000:**
   - Port có bị sử dụng không?
   - Firewall có chặn không?

### **Nếu backend chạy nhưng frontend không kết nối được:**

1. **Kiểm tra CORS:**
   - Backend có cấu hình CORS không?
   - Frontend có gọi đúng URL không?

2. **Kiểm tra network:**
   - Internet có hoạt động không?
   - Proxy có chặn không?

3. **Kiểm tra firewall:**
   - Windows Firewall có chặn không?
   - Antivirus có chặn không?

## 💡 **Mẹo:**

### **1. Chạy backend trong background:**
```bash
python main_simple.py &
```

### **2. Chạy backend với reload:**
```bash
python main_simple.py --reload
```

### **3. Chạy backend trên port khác:**
```bash
python main_simple.py --port 8001
```

## 🎯 **Test Backend:**

### **1. Test API endpoints:**
```bash
# Test TTS
curl -X POST "http://localhost:8000/api/tts/generate" -H "Content-Type: application/json" -d "{\"text\":\"こんにちは\"}"

# Test YouTube
curl -X POST "http://localhost:8000/api/youtube/info" -H "Content-Type: application/json" -d "{\"url\":\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}"

# Test STT
curl -X POST "http://localhost:8000/api/stt/convert-to-srt" -H "Content-Type: application/json" -d "{\"audio_path\":\"test.wav\",\"language\":\"ja\"}"
```

### **2. Test trong browser:**
- http://localhost:8000 - API root
- http://localhost:8000/docs - API documentation

## 🆘 **Hỗ trợ:**

Nếu vẫn gặp vấn đề:
1. Kiểm tra Python version
2. Kiểm tra dependencies
3. Kiểm tra port 8000
4. Kiểm tra firewall
5. Restart computer
6. Kiểm tra log backend
