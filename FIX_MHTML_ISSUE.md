# Sửa lỗi file .mhtml

## 🚨 Vấn đề

File download được tạo là `.mhtml` thay vì `.mp4` hoặc `.mp3`

## 🔍 Nguyên nhân

1. **yt-dlp tạo file MHTML** thay vì video thực tế
2. **Format không phù hợp** với video
3. **Video bị hạn chế** hoặc có vấn đề
4. **Browser xử lý sai** MIME type

## ✅ Đã sửa

### **1. Backend cải thiện:**
- Thêm `noplaylist: True` để tránh playlist
- Thêm `no_warnings: True` để giảm warning
- Kiểm tra file MHTML và xóa nếu phát hiện
- Kiểm tra file size (phải > 1000 bytes)
- Loại bỏ format có thể tạo MHTML

### **2. Frontend cải thiện:**
- Sử dụng `fetch()` để download
- Tạo `blob` từ response
- Sử dụng `blob URL` để download
- Cleanup memory sau khi download

### **3. Media types:**
- `.mp4` → `video/mp4`
- `.webm` → `video/webm`
- `.mp3` → `audio/mpeg`
- `.wav` → `audio/wav`
- `.m4a` → `audio/mp4`

## 🎯 Test với video đơn giản

### **Video test chắc chắn:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
- Rick Astley - Never Gonna Give You Up
- Video test chuẩn
- Luôn có sẵn
- Có nhiều format
```

### **Cách test:**
1. Mở app tại http://localhost:5173
2. Nhấn nút **"YouTube"**
3. Dán URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Nhấn **"Thông tin"**
5. Chọn format có ✅
6. Nhấn **"Download"**

### **Kết quả mong đợi:**
- ✅ File `.mp4` hoặc `.webm`
- ✅ File size > 1MB
- ✅ Có thể mở được
- ✅ Không phải `.mhtml`

## 🔧 Troubleshooting

### **Nếu vẫn tạo file .mhtml:**

1. **Kiểm tra video:**
   - Video có bị hạn chế không?
   - Video có bị chặn theo khu vực không?
   - Video có giới hạn độ tuổi không?

2. **Thử video khác:**
   - Sử dụng video test chuẩn
   - Thử video ngắn hơn
   - Thử video giáo dục

3. **Kiểm tra format:**
   - Chọn format có ✅
   - Tránh format có ❌
   - Chọn format có filesize > 0

4. **Kiểm tra kết nối:**
   - Internet có ổn định không?
   - YouTube có bị chặn không?
   - Firewall có chặn không?

## 💡 Lưu ý

### **Video dễ download:**
- Video công khai (Public)
- Video ngắn (< 5 phút)
- Video giáo dục
- Video nổi tiếng
- Video không có bản quyền nghiêm ngặt

### **Video khó download:**
- Video bị hạn chế
- Video riêng tư
- Video có bản quyền nghiêm ngặt
- Video bị chặn theo khu vực
- Video có giới hạn độ tuổi

## 🎉 Kết quả

Sau khi sửa:
- ✅ File download đúng định dạng
- ✅ File size hợp lý
- ✅ Có thể mở được
- ✅ Không còn file .mhtml

## 🚀 Test ngay

1. **Test video cơ bản:**
   ```
   URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   Expected: File .mp4 hoặc .webm
   ```

2. **Test video ngắn:**
   ```
   URL: https://www.youtube.com/watch?v=YQHsXMglC9A
   Expected: File .mp4 hoặc .webm
   ```

3. **Test video giáo dục:**
   ```
   URL: https://www.youtube.com/watch?v=aircAruvnKk
   Expected: File .mp4 hoặc .webm
   ```

## 📊 Monitoring

### **Kiểm tra file:**
- File extension đúng không?
- File size hợp lý không?
- File có thể mở được không?

### **Kiểm tra log:**
- Backend log có lỗi không?
- yt-dlp có warning không?
- Format có được chọn đúng không?

## 🆘 Hỗ trợ

Nếu vẫn gặp vấn đề:
1. Kiểm tra video có phù hợp không
2. Thử video test chuẩn
3. Kiểm tra format có sẵn
4. Kiểm tra kết nối internet
5. Restart backend server
