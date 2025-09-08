# Hướng dẫn STT Converter (Audio/Video → SRT)

## 🎯 Tính năng

Convert file audio/video thành file phụ đề SRT sử dụng OpenAI Whisper API.

## 🚀 Cách sử dụng

### **1. Truy cập STT Converter**

1. Mở app tại http://localhost:5173
2. Nhấn nút **"Audio → SRT"** trong header
3. Giao diện STT Converter sẽ mở

### **2. Convert audio/video sang SRT**

1. **Chọn file:**
   - Upload file audio/video từ máy
   - Hoặc nhập đường dẫn file (ví dụ: file YouTube đã download)

2. **Cài đặt:**
   - **Ngôn ngữ**: Chọn ngôn ngữ của audio (mặc định: Tiếng Nhật)
   - **Model**: Chọn model Whisper (mặc định: whisper-1)

3. **Convert:**
   - Nhấn nút **"Convert to SRT"**
   - Đợi quá trình convert hoàn tất

### **3. Quản lý file SRT**

- **Xem nội dung**: Nhấn "Xem" để xem nội dung SRT
- **Tải về**: Download file SRT về máy
- **Xóa**: Xóa file SRT không cần

## 📁 Vị trí file

### **Thư mục lưu trữ:**
```
backend/temp/stt/
```

### **Đường dẫn đầy đủ:**
```
C:\Users\thanh\OneDrive\Máy tính\webreatJPVN\videoJPVN\backend\temp\stt\
```

## 🔧 Các tùy chọn STT (MIỄN PHÍ)

### **🎯 Tùy chọn 1: Local Whisper (KHUYẾN NGHỊ - MIỄN PHÍ)**

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Không cần internet
- ✅ Chất lượng cao
- ✅ Hỗ trợ nhiều ngôn ngữ

**Cài đặt:**
```bash
cd backend
pip install openai-whisper
```

**Sử dụng:**
- Không cần cấu hình gì thêm
- Tự động sử dụng local whisper
- Convert ngay lập tức

### **🎯 Tùy chọn 2: OpenAI API (CÓ PHÍ)**

**Ưu điểm:**
- ✅ Chất lượng rất cao
- ✅ Nhanh hơn
- ✅ Không tốn tài nguyên máy

**Nhược điểm:**
- ❌ Có phí sử dụng
- ❌ Cần internet
- ❌ Cần API key

**Cấu hình:**
1. Lấy API key tại https://platform.openai.com/
2. Thêm vào `backend/.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### **🎯 Tùy chọn 3: SRT Mẫu (FALLBACK)**

**Khi nào sử dụng:**
- Không có local whisper
- Không có OpenAI API key
- Chỉ cần test tính năng

**Tính năng:**
- Tạo SRT mẫu với nội dung placeholder
- Hoàn toàn miễn phí
- Không cần cài đặt gì thêm

## 🎵 Định dạng hỗ trợ

### **Audio:**
- MP3, WAV, FLAC, M4A, AAC, OGG

### **Video:**
- MP4, AVI, MOV, MKV, WEBM

### **Ngôn ngữ hỗ trợ:**
- Tiếng Nhật (ja)
- Tiếng Anh (en)
- Tiếng Việt (vi)
- Tiếng Hàn (ko)
- Tiếng Trung (zh)

## 🔧 API Endpoints

### **Convert audio to SRT:**
```
POST /api/stt/convert-to-srt
{
  "audio_path": "C:\\Users\\thanh\\OneDrive\\Máy tính\\YoutubeFile\\video.mp4",
  "language": "ja",
  "model": "whisper-1"
}
```

### **Liệt kê file SRT:**
```
GET /api/stt/files
```

### **Tải file SRT:**
```
GET /api/stt/download/{filename}
```

### **Xem nội dung SRT:**
```
GET /api/stt/content/{filename}
```

### **Xóa file SRT:**
```
DELETE /api/stt/files/{filename}
```

## 🎯 Workflow hoàn chỉnh

### **1. Download video từ YouTube:**
1. Mở **YouTube Downloader**
2. Download video/audio tiếng Nhật
3. File được lưu vào `C:\Users\thanh\OneDrive\Máy tính\YoutubeFile\`

### **2. Convert sang SRT:**
1. Mở **STT Converter**
2. Nhập đường dẫn file đã download
3. Chọn ngôn ngữ "Tiếng Nhật"
4. Convert to SRT

### **3. Sử dụng SRT:**
1. Xem nội dung SRT
2. Tải về máy
3. Import vào app chính để tạo phụ đề

## ⚠️ Lưu ý quan trọng

### **API Key:**
- Cần OpenAI API key để convert thực tế
- Không có API key sẽ tạo SRT mẫu
- API key có phí sử dụng

### **Giới hạn:**
- File audio dài có thể mất thời gian convert
- Cần kết nối internet ổn định
- Whisper API có giới hạn request

### **Troubleshooting:**
- **Lỗi "API key not found"**: Thêm OPENAI_API_KEY vào .env
- **Lỗi "File not found"**: Kiểm tra đường dẫn file
- **Lỗi "Convert failed"**: Kiểm tra kết nối internet

## 🔍 Troubleshooting

### **Lỗi "OpenAI API key not found"**

**Giải pháp:**
1. Thêm `OPENAI_API_KEY=sk-...` vào `backend/.env`
2. Restart backend
3. Convert lại

### **Lỗi "File not found"**

**Nguyên nhân:**
- Đường dẫn file không đúng
- File không tồn tại
- Quyền truy cập file

**Giải pháp:**
- Kiểm tra đường dẫn file
- Sử dụng đường dẫn tuyệt đối
- Kiểm tra file có tồn tại không

### **Lỗi "Convert failed"**

**Nguyên nhân:**
- Kết nối internet không ổn định
- OpenAI API lỗi
- File audio bị hỏng

**Giải pháp:**
- Kiểm tra kết nối internet
- Thử file audio khác
- Kiểm tra OpenAI API status

### **SRT mẫu thay vì SRT thực**

**Nguyên nhân:**
- Không có OpenAI API key
- API key không hợp lệ
- OpenAI API lỗi

**Giải pháp:**
- Thêm API key hợp lệ
- Kiểm tra API key có đúng không
- Thử lại sau

## 📊 Monitoring

### **Theo dõi convert:**
- Xem log backend để theo dõi tiến trình
- Kiểm tra file SRT được tạo
- Monitor OpenAI API usage

### **Quản lý chi phí:**
- Theo dõi OpenAI API usage
- Sử dụng model phù hợp
- Tối ưu hóa file audio

## ✅ Checklist

- [ ] OpenAI API key được cấu hình
- [ ] Backend chạy với STT service
- [ ] Test convert file audio ngắn
- [ ] Test với file YouTube đã download
- [ ] Kiểm tra file SRT được tạo
- [ ] Test tải file SRT về máy
- [ ] Test xóa file SRT

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log backend
2. Kiểm tra OpenAI API key
3. Test với file audio khác
4. Kiểm tra kết nối internet
5. Restart backend server

## 🎉 Kết quả

Sau khi setup xong, bạn có thể:
- ✅ Convert audio/video sang SRT
- ✅ Hỗ trợ nhiều ngôn ngữ
- ✅ Quản lý file SRT
- ✅ Tích hợp với YouTube downloader
- ✅ Tạo workflow hoàn chỉnh

## 💡 Tips

### **Tối ưu hóa:**
- Sử dụng file audio chất lượng tốt
- Chọn ngôn ngữ chính xác
- Sử dụng model phù hợp

### **Workflow hiệu quả:**
1. Download video YouTube
2. Convert sang SRT
3. Import vào app chính
4. Tạo phụ đề đa lớp
5. Export kết quả
