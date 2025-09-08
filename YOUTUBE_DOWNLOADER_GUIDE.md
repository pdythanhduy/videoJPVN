# Hướng dẫn YouTube Downloader

## 🎯 Tính năng

Download video và audio từ YouTube để sử dụng trong dự án JP-VI Video Subtitle.

## 🚀 Cách sử dụng

### **1. Truy cập YouTube Downloader**

1. Mở app tại http://localhost:5173
2. Nhấn nút **"YouTube"** trong header
3. Giao diện YouTube Downloader sẽ mở

### **2. Download video/audio**

1. **Nhập URL YouTube:**
   - Dán URL video YouTube
   - Ví dụ: `https://www.youtube.com/watch?v=VIDEO_ID`

2. **Lấy thông tin video:**
   - Nhấn nút **"Thông tin"**
   - Xem thông tin: tiêu đề, kênh, thời lượng, lượt xem

3. **Chọn loại download:**
   - **Video (MP4)**: Download toàn bộ video
   - **Audio (MP3)**: Chỉ download audio

4. **Download:**
   - Nhấn nút **"Download Video/Audio"**
   - Đợi quá trình download hoàn tất

### **3. Quản lý file**

- **Xem danh sách**: Tất cả file đã download
- **Tải về**: Download file về máy
- **Xóa**: Xóa file khỏi server

## 📁 Vị trí file

### **Thư mục lưu trữ:**
```
C:\Users\thanh\OneDrive\Máy tính\YoutubeFile\
```

### **Đường dẫn đầy đủ:**
```
C:\Users\thanh\OneDrive\Máy tính\YoutubeFile\
```

## 🎵 Định dạng file

### **Video:**
- **Format**: MP4
- **Chất lượng**: Tối đa 720p
- **Codec**: H.264 + AAC

### **Audio:**
- **Format**: MP3
- **Bitrate**: 192kbps
- **Chất lượng**: High

## 🔧 API Endpoints

### **Lấy thông tin video:**
```
POST /api/youtube/info
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### **Download video:**
```
POST /api/youtube/download
{
  "url": "https://www.youtube.com/watch?v=...",
  "format_id": "best[height<=720]"
}
```

### **Download audio:**
```
POST /api/youtube/download-audio
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### **Liệt kê file:**
```
GET /api/youtube/files
```

### **Tải file:**
```
GET /api/youtube/download/{filename}
```

### **Xóa file:**
```
DELETE /api/youtube/files/{filename}
```

## 🎯 Sử dụng với dự án

### **1. Download video tiếng Nhật:**
- Tìm video YouTube có phụ đề tiếng Nhật
- Download video hoặc audio
- Sử dụng trong app để tạo phụ đề

### **2. Workflow hoàn chỉnh:**
1. **Download video** từ YouTube
2. **Upload video** vào app
3. **Tạo phụ đề** bằng STT
4. **Phân tích ngôn ngữ** tiếng Nhật
5. **Tạo audio** bằng TTS
6. **Export** phụ đề

## ⚠️ Lưu ý quan trọng

### **Bản quyền:**
- Chỉ download video có quyền sử dụng
- Tuân thủ Terms of Service của YouTube
- Sử dụng cho mục đích học tập cá nhân

### **Giới hạn:**
- Video dài có thể mất thời gian download
- File lớn sẽ tốn dung lượng
- Cần kết nối internet ổn định

### **Troubleshooting:**
- **Lỗi "Video unavailable"**: Video bị hạn chế hoặc xóa
- **Lỗi "Age-restricted"**: Video có giới hạn độ tuổi
- **Lỗi "Private video"**: Video riêng tư
- **Lỗi "Region blocked"**: Video bị chặn theo khu vực

## 🔍 Troubleshooting

### **Lỗi "yt-dlp not found"**

**Giải pháp:**
```bash
cd backend
pip install yt-dlp
```

### **Lỗi "Video unavailable"**

**Nguyên nhân:**
- Video bị xóa hoặc hạn chế
- URL không đúng
- Video riêng tư

**Giải pháp:**
- Kiểm tra URL
- Thử video khác
- Kiểm tra video có public không

### **Lỗi "Download failed"**

**Nguyên nhân:**
- Kết nối internet không ổn định
- Video quá dài
- Server không đủ dung lượng

**Giải pháp:**
- Kiểm tra kết nối internet
- Thử video ngắn hơn
- Restart backend

### **File không tải được**

**Giải pháp:**
- Kiểm tra file có tồn tại không
- Kiểm tra quyền truy cập
- Thử tải lại

## 📊 Monitoring

### **Theo dõi download:**
- Xem log backend để theo dõi tiến trình
- Kiểm tra dung lượng thư mục `temp/youtube/`
- Monitor network usage

### **Quản lý dung lượng:**
- Xóa file cũ khi cần
- Backup file quan trọng
- Monitor disk space

## ✅ Checklist

- [ ] Backend chạy với yt-dlp
- [ ] Test download video ngắn
- [ ] Test download audio
- [ ] Kiểm tra file được tạo
- [ ] Test tải file về máy
- [ ] Test xóa file

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log backend
2. Test với video khác
3. Kiểm tra kết nối internet
4. Restart backend server
5. Cài đặt lại yt-dlp

## 🎉 Kết quả

Sau khi setup xong, bạn có thể:
- ✅ Download video YouTube
- ✅ Download audio YouTube  
- ✅ Quản lý file đã download
- ✅ Tích hợp với dự án phụ đề
- ✅ Tạo workflow hoàn chỉnh
