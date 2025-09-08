# Sửa lỗi video không có âm thanh và chất lượng kém

## 🚨 Vấn đề

1. **Video tải xuống không có âm thanh**
2. **Chất lượng video rất kém**
3. **File MP4 chỉ có video hoặc chỉ có audio**
4. **Format không được merge đúng cách**

## 🔍 Nguyên nhân

1. **Format selection sai** - chọn format chỉ có video hoặc chỉ có audio
2. **yt-dlp không merge** video và audio
3. **Format fallback không đúng** - ưu tiên format chất lượng thấp
4. **yt-dlp options thiếu** - không có merge_output_format

## ✅ Đã sửa

### **1. Backend cải thiện:**

#### **yt-dlp options cải thiện:**
```python
if extract_audio:
    ydl_opts = {
        'format': attempt_format,
        'outtmpl': str(output_path),
        'extractaudio': True,
        'audioformat': 'mp3',
        'audioquality': '192K',
        'noplaylist': True,
        'no_warnings': True,
    }
else:
    ydl_opts = {
        'format': attempt_format,
        'outtmpl': str(output_path),
        'noplaylist': True,
        'no_warnings': True,
        'merge_output_format': 'mp4',  # Đảm bảo merge video+audio thành mp4
        'writesubtitles': False,
        'writeautomaticsub': False,
    }
```

#### **Format fallback cải thiện:**
```python
# Ưu tiên format có cả video và audio với chất lượng cao
format_fallbacks = [
    "best[height<=1080][ext=mp4]/best[height<=1080]",  # 1080p
    "best[height<=720][ext=mp4]/best[height<=720]",    # 720p
    "best[height<=480][ext=mp4]/best[height<=480]",    # 480p
    "best[height<=360][ext=mp4]/best[height<=360]",    # 360p
    "best[ext=mp4]/best",
    "worst[ext=mp4]/worst",
    "18/22/18",  # Common video formats
    "worst"
]
```

#### **Format prioritization cải thiện:**
```python
# Thêm format có cả video và audio với chất lượng cao
video_audio_formats = [
    "best[height<=1080][ext=mp4]/best[height<=1080]",  # 1080p
    "best[height<=720][ext=mp4]/best[height<=720]",    # 720p
    "best[height<=480][ext=mp4]/best[height<=480]",    # 480p
    "best[height<=360][ext=mp4]/best[height<=360]",    # 360p
    "best[ext=mp4]/best",
    "worst[ext=mp4]/worst",
    "18/22/18",  # Common video formats
    "worst"
]

# Thêm format có cả video và audio vào đầu danh sách
format_fallbacks = video_audio_formats + format_fallbacks
```

### **2. Frontend cải thiện:**

#### **Mặc định chọn 720p với video+audio:**
```javascript
if (data.success) {
    setAvailableFormats(data.formats);
    
    // Mặc định chọn 720p với video+audio
    setSelectedFormat("best[height<=720][ext=mp4]/best[height<=720]");
}
```

#### **Tùy chọn chất lượng rõ ràng:**
```javascript
<select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
  <option value="best[height<=1080][ext=mp4]/best[height<=1080]">🎬🎵 1080p (Chất lượng cao nhất)</option>
  <option value="best[height<=720][ext=mp4]/best[height<=720]">🎬🎵 720p (Chất lượng cao)</option>
  <option value="best[height<=480][ext=mp4]/best[height<=480]">🎬🎵 480p (Chất lượng trung bình)</option>
  <option value="best[height<=360][ext=mp4]/best[height<=360]">🎬🎵 360p (Chất lượng thấp)</option>
</select>
```

## 🎯 Cách sử dụng

### **1. Chọn chất lượng phù hợp:**

#### **🎬🎵 1080p (Chất lượng cao nhất):**
- **Độ phân giải:** 1920x1080
- **Chất lượng:** Rất cao
- **Kích thước:** 50-200MB
- **Sử dụng:** Khi cần chất lượng tốt nhất

#### **🎬🎵 720p (Chất lượng cao) - Khuyến nghị:**
- **Độ phân giải:** 1280x720
- **Chất lượng:** Cao
- **Kích thước:** 20-100MB
- **Sử dụng:** Cân bằng giữa chất lượng và kích thước

#### **🎬🎵 480p (Chất lượng trung bình):**
- **Độ phân giải:** 854x480
- **Chất lượng:** Trung bình
- **Kích thước:** 10-50MB
- **Sử dụng:** Khi cần tải nhanh

#### **🎬🎵 360p (Chất lượng thấp):**
- **Độ phân giải:** 640x360
- **Chất lượng:** Thấp
- **Kích thước:** 5-20MB
- **Sử dụng:** Khi kết nối chậm

### **2. Kiểm tra format:**

#### **Format tốt (🎬🎵):**
- **Mô tả:** Video + Audio
- **Kết quả:** File MP4 có cả hình và tiếng
- **Ví dụ:** `🎬🎵 18 - mp4 - 360p - 360p - 5.2MB ✅`

#### **Format tránh (🎵 hoặc 🎬):**
- **🎵** - Audio only: Chỉ có tiếng, không có hình
- **🎬** - Video only: Chỉ có hình, không có tiếng

## 🔧 Troubleshooting

### **Nếu video không có âm thanh:**

1. **Kiểm tra format đã chọn:**
   - Có icon 🎬🎵 không?
   - Có cả `vcodec` và `acodec` không?
   - Không phải format 🎬 (video only)?

2. **Chọn format khác:**
   - Chọn format có icon 🎬🎵
   - Tránh format có icon 🎬 (video only)
   - Chọn chất lượng 720p hoặc 480p

3. **Kiểm tra video gốc:**
   - Video gốc có âm thanh không?
   - Video có bị mute không?
   - Video có bị hạn chế audio không?

### **Nếu video chất lượng kém:**

1. **Chọn chất lượng cao hơn:**
   - Từ 360p → 480p
   - Từ 480p → 720p
   - Từ 720p → 1080p

2. **Kiểm tra video gốc:**
   - Video gốc có chất lượng cao không?
   - Video có bị compress không?
   - Video có độ phân giải cao không?

3. **Kiểm tra kết nối:**
   - Internet có đủ nhanh không?
   - Có bị giới hạn băng thông không?

### **Nếu file MP4 chỉ có video hoặc audio:**

1. **Kiểm tra yt-dlp merge:**
   - Backend có sử dụng `merge_output_format` không?
   - yt-dlp có merge video và audio không?
   - Format có hỗ trợ merge không?

2. **Thử format khác:**
   - Chọn format có icon 🎬🎵
   - Tránh format có icon 🎵 hoặc 🎬
   - Chọn format có `has_url: true`

## 💡 Lưu ý

### **Format tốt nhất:**

| Format | Icon | Mô tả | Chất lượng | Kích thước | Sử dụng |
|--------|------|-------|------------|------------|---------|
| 1080p  | 🎬🎵 | Video + Audio | Rất cao | 50-200MB | Chất lượng tốt nhất |
| 720p   | 🎬🎵 | Video + Audio | Cao | 20-100MB | Cân bằng (Khuyến nghị) |
| 480p   | 🎬🎵 | Video + Audio | Trung bình | 10-50MB | Tải nhanh |
| 360p   | 🎬🎵 | Video + Audio | Thấp | 5-20MB | Kết nối chậm |

### **Format tránh:**

| Format | Icon | Mô tả | Vấn đề |
|--------|------|-------|---------|
| Audio only | 🎵 | Chỉ có audio | Không có video |
| Video only | 🎬 | Chỉ có video | Không có audio |
| 0 bytes | ⚠️ | Không khả dụng | Có thể lỗi |

### **Video dễ download:**
- Video công khai (Public)
- Video ngắn (< 10 phút)
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
- ✅ **Video có cả hình và tiếng**
- ✅ **Chất lượng cao (720p mặc định)**
- ✅ **Format được merge đúng cách**
- ✅ **yt-dlp options tối ưu**
- ✅ **Tùy chọn chất lượng rõ ràng**

## 🚀 Test ngay

### **1. Test video với audio:**
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Chọn: 🎬🎵 720p (Chất lượng cao)
Expected: File MP4 720p có cả video và audio
```

### **2. Test video chất lượng cao:**
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Chọn: 🎬🎵 1080p (Chất lượng cao nhất)
Expected: File MP4 1080p có cả video và audio
```

### **3. Test video chất lượng thấp:**
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Chọn: 🎬🎵 360p (Chất lượng thấp)
Expected: File MP4 360p có cả video và audio
```

## 📊 Monitoring

### **Kiểm tra file:**
- File extension: `.mp4`
- File size: Phù hợp với chất lượng
- File có thể mở được
- File có cả video và audio
- Chất lượng video rõ nét
- Audio có âm thanh

### **Kiểm tra format:**
- Format có icon 🎬🎵
- Format có `vcodec` và `acodec`
- Format có `has_url: true`
- Format có resolution phù hợp

### **Kiểm tra log:**
- Backend log có lỗi không?
- yt-dlp có warning không?
- Format có được merge không?
- File có được tạo đúng không?

## 🆘 Hỗ trợ

Nếu vẫn gặp vấn đề:
1. Kiểm tra format có icon 🎬🎵
2. Chọn chất lượng 720p
3. Tránh format có icon 🎵 hoặc 🎬
4. Thử video test chuẩn
5. Kiểm tra video gốc có audio không
6. Restart backend server
7. Kiểm tra yt-dlp version
