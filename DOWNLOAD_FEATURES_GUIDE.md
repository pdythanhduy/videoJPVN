# Hướng dẫn tính năng Download

## 🎯 **Tổng quan tính năng Download:**

### ✅ **Các loại file có thể download:**

1. **TTS Audio Files** - File audio tiếng Nhật
2. **YouTube Videos** - Video/audio từ YouTube  
3. **SRT Subtitles** - File subtitle từ STT
4. **Video với Subtitle** - Video đã burn-in subtitle

## 🎵 **1. Download TTS Audio Files**

### **Cách sử dụng:**
1. **Tạo audio:** Nhập text tiếng Nhật → Generate Audio
2. **Download:** Click nút Download bên cạnh file
3. **File được tạo:** `filename.wav` (16kHz, mono)

### **Tính năng:**
- ✅ **Format:** WAV, 16kHz, mono
- ✅ **Chất lượng:** Cao (Azure Speech Service)
- ✅ **Tên file:** Tự động từ text input
- ✅ **Download:** Blob URL, an toàn

### **Code implementation:**
```javascript
const handleDownload = async (filename) => {
  const response = await fetch(`http://localhost:8000/api/tts/download/${filename}`);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
};
```

---

## 🎬 **2. Download YouTube Videos**

### **Cách sử dụng:**
1. **Nhập URL:** Paste YouTube URL
2. **Get Info:** Click "Get Video Info"
3. **Chọn format:** Video (MP4) hoặc Audio (MP3)
4. **Download:** Click "Download Video/Audio"

### **Tính năng:**
- ✅ **Video formats:** MP4 (1080p, 720p, 480p, 360p)
- ✅ **Audio formats:** MP3, M4A, WAV
- ✅ **Quality selection:** Dropdown chọn chất lượng
- ✅ **Format info:** Hiển thị codec, size, availability
- ✅ **Auto-retry:** Tự động thử format khác nếu lỗi

### **Supported formats:**
```
Video: 🎬🎵 = Video + Audio
Audio: 🎵 = Audio only  
Video: 🎬 = Video only
⚠️ = Format có vấn đề (0 bytes)
```

### **Code implementation:**
```javascript
const downloadFile = async (filename) => {
  const response = await fetch(`http://localhost:8000/api/youtube/download/${filename}`);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
};
```

---

## 📝 **3. Download SRT Subtitles**

### **Cách sử dụng:**
1. **Upload audio/video:** Chọn file từ TTS, YouTube, hoặc upload
2. **Convert:** Click "Convert to SRT"
3. **Download:** Click nút Download bên cạnh file SRT

### **Tính năng:**
- ✅ **Format:** SRT (SubRip Subtitle)
- ✅ **Encoding:** UTF-8 with BOM
- ✅ **Languages:** Auto-detect hoặc chọn manual
- ✅ **Quality:** Local Whisper (miễn phí)
- ✅ **Preview:** Xem nội dung trước khi download

### **SRT format:**
```
1
00:00:00,000 --> 00:00:04,139
こんにちは

2
00:00:04,139 --> 00:00:08,000
元気ですか
```

### **Code implementation:**
```javascript
const downloadSrtFile = async (filename) => {
  const response = await fetch(`http://localhost:8000/api/stt/download/${filename}`);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
};
```

---

## 🎥 **4. Download Video với Subtitle**

### **Cách sử dụng:**
1. **Upload video:** Chọn file video
2. **Upload SRT:** Chọn file subtitle
3. **Burn subtitle:** Click "Burn Subtitle"
4. **Download:** Click "Download Video"

### **Tính năng:**
- ✅ **Format:** MP4 với subtitle burn-in
- ✅ **Subtitle style:** Tùy chỉnh font, size, color
- ✅ **Position:** Subtitle ở dưới video
- ✅ **Quality:** Giữ nguyên chất lượng gốc

---

## 🔧 **Technical Details:**

### **Download Method:**
```javascript
// Sử dụng Blob URL để download an toàn
const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
  }
};
```

### **Backend Endpoints:**
```
GET /api/tts/download/{filename}     - Download TTS audio
GET /api/youtube/download/{filename} - Download YouTube video/audio  
GET /api/stt/download/{filename}     - Download SRT subtitle
POST /api/video/burn-subtitle        - Burn subtitle to video
```

### **File Storage:**
```
backend/temp/tts/          - TTS audio files
backend/temp/stt/          - SRT subtitle files
C:/Users/.../YoutubeFile/  - YouTube downloaded files
```

---

## 🚀 **Workflow hoàn chỉnh:**

### **1. TTS → Audio:**
```
Text Input → TTS Service → WAV File → Download
```

### **2. YouTube → Video:**
```
URL → yt-dlp → MP4/MP3 → Download
```

### **3. Audio → SRT:**
```
Audio/Video → Whisper → SRT → Download
```

### **4. Video + SRT:**
```
Video + SRT → FFmpeg → MP4 with subtitle → Download
```

---

## 🎯 **Best Practices:**

### **1. File Management:**
- **Tên file:** Tự động từ content
- **Format:** Chuẩn (WAV, MP4, SRT)
- **Encoding:** UTF-8 cho text files
- **Cleanup:** Tự động xóa blob URLs

### **2. Error Handling:**
- **Network errors:** Retry mechanism
- **File not found:** Clear error messages
- **Format errors:** Fallback options
- **Size limits:** Progress indicators

### **3. User Experience:**
- **Progress:** Download progress bars
- **Preview:** Xem file trước khi download
- **Batch:** Download nhiều file cùng lúc
- **History:** Lưu lịch sử download

---

## 🔧 **Troubleshooting:**

### **Download không hoạt động:**
1. **Kiểm tra backend:** http://localhost:8000
2. **Kiểm tra file:** File có tồn tại không
3. **Kiểm tra network:** Console có lỗi không
4. **Kiểm tra browser:** Có block download không

### **File bị lỗi:**
1. **TTS:** Kiểm tra Azure Speech Service
2. **YouTube:** Kiểm tra URL và format
3. **STT:** Kiểm tra Whisper installation
4. **Video:** Kiểm tra FFmpeg

### **Performance issues:**
1. **Large files:** Sử dụng streaming
2. **Multiple downloads:** Queue system
3. **Memory:** Cleanup blob URLs
4. **Network:** Compression

---

## 🎉 **Kết luận:**

### **Tính năng download hoàn chỉnh:**
- ✅ **TTS Audio** - WAV files từ text
- ✅ **YouTube Videos** - MP4/MP3 từ URL
- ✅ **SRT Subtitles** - Từ audio/video
- ✅ **Video with Subtitle** - Burn-in subtitle

### **Technical features:**
- ✅ **Blob URL** - Download an toàn
- ✅ **Error handling** - Robust error management
- ✅ **Progress tracking** - User feedback
- ✅ **File management** - Organized storage

### **User experience:**
- ✅ **One-click download** - Đơn giản
- ✅ **Preview content** - Xem trước
- ✅ **Multiple formats** - Nhiều lựa chọn
- ✅ **Quality options** - Tùy chỉnh chất lượng

**Bây giờ bạn có thể download tất cả các loại file từ app!** 🎯
