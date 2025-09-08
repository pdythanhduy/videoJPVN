# Hướng dẫn về file audio

## 📁 Vị trí file audio

### **Thư mục lưu trữ:**
```
backend/temp/
```

### **Đường dẫn đầy đủ:**
```
C:\Users\thanh\OneDrive\Máy tính\webreatJPVN\videoJPVN\backend\temp\
```

## 🎵 Cách tạo và tải file audio

### **1. Tạo file audio:**
1. Mở app tại http://localhost:5173
2. Nhấn nút **"Text → Audio"**
3. Nhập text tiếng Nhật
4. Chọn giọng nói
5. Nhấn **"Tạo Audio"**
6. File sẽ được tạo trong `backend/temp/`

### **2. Xem danh sách file:**
1. Nhấn nút **"File Audio"** trong header
2. Xem danh sách tất cả file đã tạo
3. Thông tin hiển thị:
   - Tên file
   - Kích thước
   - Thời gian tạo
   - Vị trí lưu trữ

### **3. Tải file về máy:**
- **Cách 1**: Nhấn nút "Tải về" trong danh sách file
- **Cách 2**: Nhấn nút "Tải về" trong TTS panel
- **Cách 3**: Truy cập trực tiếp: `http://localhost:8000/api/tts/download/filename.wav`

## 📋 Thông tin file

### **Định dạng:**
- **Format**: WAV
- **Sample Rate**: 16kHz
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit

### **Tên file:**
- Tự động tạo từ text đầu vào
- Ví dụ: `こんにちは元気ですか.wav`
- Tối đa 30 ký tự đầu của text

## 🔧 Quản lý file

### **Xem file trong Windows Explorer:**
1. Mở File Explorer
2. Điều hướng đến: `C:\Users\thanh\OneDrive\Máy tính\webreatJPVN\videoJPVN\backend\temp\`
3. Xem tất cả file .wav đã tạo

### **API endpoints:**
- `GET /api/tts/files` - Liệt kê tất cả file
- `GET /api/tts/download/{filename}` - Tải file cụ thể

## ⚠️ Lưu ý quan trọng

### **File hiện tại:**
- **Là file test**: Chỉ chứa silence (âm thanh im lặng)
- **Thời lượng**: 1 giây
- **Mục đích**: Test hệ thống và giao diện

### **Để có audio thực tế:**
1. Cấu hình Azure Speech Service
2. Cập nhật API key trong `backend/.env`
3. Sử dụng TTS service thực tế

## 🚀 Sử dụng file audio

### **Trong ứng dụng khác:**
- File WAV chuẩn, tương thích với mọi phần mềm
- Có thể import vào video editor
- Sử dụng làm audio cho video phụ đề

### **Chất lượng:**
- **Hiện tại**: Test quality (silence)
- **Tương lai**: High quality với Azure TTS
- **Giọng nói**: Nhiều lựa chọn tiếng Nhật

## 📊 Thống kê

### **Theo dõi:**
- Số lượng file đã tạo
- Tổng dung lượng
- File gần nhất
- Lịch sử tạo file

### **Dọn dẹp:**
- File tự động lưu trong `temp/`
- Có thể xóa thủ công khi cần
- Không tự động xóa (để bảo toàn dữ liệu)

## 🆘 Troubleshooting

### **Không thấy file:**
1. Kiểm tra backend có chạy không
2. Kiểm tra thư mục `backend/temp/`
3. Tạo file mới để test

### **Không tải được:**
1. Kiểm tra tên file có đúng không
2. Kiểm tra backend API
3. Thử tải trực tiếp qua URL

### **File bị lỗi:**
1. Tạo lại file mới
2. Kiểm tra log backend
3. Restart backend server
