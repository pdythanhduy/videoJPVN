# Sửa lỗi MP4 chỉ có audio, không có video

## 🚨 Vấn đề

File MP4 được tạo nhưng **chỉ có audio, không có video**

## 🔍 Nguyên nhân

1. **Format selection sai** - chọn format chỉ có audio
2. **yt-dlp download format audio-only** thay vì video+audio
3. **Format fallback không ưu tiên** video+audio
4. **User chọn format audio-only** thay vì video+audio

## ✅ Đã sửa

### **1. Backend cải thiện:**

#### **Format prioritization:**
```python
# Ưu tiên format có cả video và audio
video_audio_available = []
audio_only_available = []

for format_id in available_format_ids:
    has_video = format_info.get("vcodec", "") != "none"
    has_audio = format_info.get("acodec", "") != "none"
    
    if has_video and has_audio:
        video_audio_available.append(format_id)
    elif has_audio:
        audio_only_available.append(format_id)

# Ưu tiên format có cả video và audio
if not extract_audio:
    format_fallbacks = video_audio_available + audio_only_available + format_fallbacks
```

#### **Format fallback cải thiện:**
```python
# Ưu tiên format có cả video và audio
format_fallbacks = [
    "best[height<=720][ext=mp4]/best[height<=720]",
    "best[height<=480][ext=mp4]/best[height<=480]",
    "best[height<=360][ext=mp4]/best[height<=360]",
    "best[ext=mp4]/best",
    "worst[ext=mp4]/worst",
    "18/22/18",  # Common video formats
    "worst"
]
```

### **2. Frontend cải thiện:**

#### **Format display với icons:**
```javascript
const hasVideo = format.vcodec && format.vcodec !== 'none';
const hasAudio = format.acodec && format.acodec !== 'none';
const isVideoAudio = hasVideo && hasAudio;
const isAudioOnly = !hasVideo && hasAudio;
const isVideoOnly = hasVideo && !hasAudio;

let typeIcon = '';
if (isVideoAudio) typeIcon = '🎬🎵';
else if (isAudioOnly) typeIcon = '🎵';
else if (isVideoOnly) typeIcon = '🎬';
else typeIcon = '❓';
```

#### **Auto-select format có video+audio:**
```javascript
// Ưu tiên format có cả video và audio
const videoAudioFormat = data.formats.find(f => 
  f.vcodec && f.vcodec !== 'none' && 
  f.acodec && f.acodec !== 'none' && 
  f.has_url
);

if (videoAudioFormat) {
  setSelectedFormat(videoAudioFormat.format_id);
}
```

## 🎯 Cách chọn format đúng

### **1. Format có cả video và audio (Khuyến nghị):**
- **Icon:** 🎬🎵
- **Mô tả:** Video + Audio
- **Kết quả:** File MP4 có cả hình và tiếng
- **Ví dụ:** `🎬🎵 18 - mp4 - 360p - 360p - 5.2MB ✅`

### **2. Format chỉ có audio:**
- **Icon:** 🎵
- **Mô tả:** Audio only
- **Kết quả:** File MP4 chỉ có tiếng, không có hình
- **Ví dụ:** `🎵 140 - m4a - audio only - 128kbps - 2.1MB ✅`

### **3. Format chỉ có video:**
- **Icon:** 🎬
- **Mô tả:** Video only
- **Kết quả:** File MP4 chỉ có hình, không có tiếng
- **Ví dụ:** `🎬 137 - mp4 - 1080p - 1080p - 15.3MB ✅`

## 🔧 Troubleshooting

### **Nếu file MP4 chỉ có audio:**

1. **Kiểm tra format đã chọn:**
   - Có icon 🎬🎵 không?
   - Có `vcodec` và `acodec` không?
   - Có `has_url: true` không?

2. **Chọn format khác:**
   - Tìm format có icon 🎬🎵
   - Chọn format có resolution (360p, 480p, 720p)
   - Tránh format có icon 🎵

3. **Kiểm tra video:**
   - Video có bị hạn chế không?
   - Video có format video+audio không?
   - Video có bị chặn theo khu vực không?

### **Nếu không có format video+audio:**

1. **Thử video khác:**
   - Video công khai (Public)
   - Video ngắn (< 5 phút)
   - Video giáo dục
   - Video nổi tiếng

2. **Kiểm tra video info:**
   - Video có tồn tại không?
   - Video có bị hạn chế không?
   - Video có format khả dụng không?

## 💡 Lưu ý

### **Format tốt nhất:**
- **🎬🎵 18** - MP4 360p với audio
- **🎬🎵 22** - MP4 720p với audio
- **🎬🎵 137** - MP4 1080p với audio

### **Format tránh:**
- **🎵 140** - M4A audio only
- **🎵 139** - M4A audio only
- **🎬 137** - MP4 video only (không có audio)

### **Video dễ download:**
- Video công khai (Public)
- Video ngắn (< 5 phút)
- Video giáo dục
- Video nổi tiếng
- Video không có bản quyền nghiêm ngặt

## 🎉 Kết quả

Sau khi sửa:
- ✅ **File MP4 có cả video và audio**
- ✅ **Format được chọn tự động**
- ✅ **Icon hiển thị rõ ràng**
- ✅ **Hướng dẫn chọn format**

## 🚀 Test ngay

### **1. Test video cơ bản:**
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Expected: File MP4 có cả video và audio
Format: 🎬🎵 18 - mp4 - 360p
```

### **2. Test video ngắn:**
```
URL: https://www.youtube.com/watch?v=YQHsXMglC9A
Expected: File MP4 có cả video và audio
Format: 🎬🎵 18 - mp4 - 360p
```

### **3. Test video giáo dục:**
```
URL: https://www.youtube.com/watch?v=aircAruvnKk
Expected: File MP4 có cả video và audio
Format: 🎬🎵 18 - mp4 - 360p
```

## 📊 Monitoring

### **Kiểm tra file:**
- File extension: `.mp4`
- File size: > 1MB
- File có thể mở được
- File có cả video và audio

### **Kiểm tra format:**
- Format có icon 🎬🎵
- Format có `vcodec` và `acodec`
- Format có `has_url: true`
- Format có resolution

### **Kiểm tra log:**
- Backend log có lỗi không?
- yt-dlp có warning không?
- Format có được chọn đúng không?

## 🆘 Hỗ trợ

Nếu vẫn gặp vấn đề:
1. Kiểm tra format có icon 🎬🎵
2. Chọn format có resolution
3. Tránh format có icon 🎵
4. Thử video test chuẩn
5. Kiểm tra video có bị hạn chế không
