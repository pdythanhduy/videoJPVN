# Hướng dẫn sử dụng YouTube Downloader + Whisper Subtitle Generator

## 🎉 **Script đã hoạt động thành công!**

Script `downloadytd.py` đã được tích hợp và test thành công:
- ✅ **Download YouTube video** - MP4 với video + audio
- ✅ **Extract audio** - MP3 từ video
- ✅ **Generate subtitles** - TXT, SRT, VTT bằng Whisper
- ✅ **Local Whisper** - Hoàn toàn miễn phí

## 🚀 **Cách sử dụng:**

### **Cách 1: Chạy trực tiếp (Khuyến nghị)**

1. **Mở PowerShell hoặc Command Prompt**
2. **Chuyển đến thư mục backend:**
   ```bash
   cd "C:\Users\thanh\OneDrive\Máy tính\webreatJPVN\videoJPVN\backend"
   ```
3. **Chạy script:**
   ```bash
   python run_downloadytd.py
   ```

### **Cách 2: Sử dụng script batch**

1. **Double-click file `run_downloadytd.bat`**
2. **Hoặc chạy từ PowerShell:**
   ```bash
   .\run_downloadytd.bat
   ```

### **Cách 3: Chạy trực tiếp downloadytd.py**

1. **Chỉnh sửa URL trong file:**
   ```python
   VIDEO_URL = "https://youtu.be/1dV0plXMO9Y?si=gy1dgwUtnuum1Jqv"  # ← Đổi link tại đây
   ```
2. **Chạy:**
   ```bash
   python downloadytd.py
   ```

## ⚙️ **Cấu hình:**

### **Thay đổi URL video:**
```python
VIDEO_URL = "https://youtu.be/YOUR_VIDEO_ID"  # ← Đổi link tại đây
```

### **Thay đổi tên file:**
```python
BASE_FILENAME = "youtube_audio"  # tên gốc cho MP4/MP3 và phụ đề
```

### **Thay đổi ngôn ngữ:**
```python
LANG = "ja"  # 'ja' (tiếng Nhật), 'vi' (tiếng Việt), 'en' (tiếng Anh)
```

### **Thay đổi model Whisper:**
```python
MODEL = None  # None (mặc định), "base", "small", "medium", "large"
```

### **Thay đổi chất lượng audio:**
```python
BITRATE = "192k"  # "128k", "192k", "320k"
MONO = False      # True (mono), False (stereo)
```

## 📊 **Kết quả:**

### **Files được tạo:**
- `youtube_audio.mp4` - Video MP4 với video + audio
- `youtube_audio.mp3` - Audio MP3
- `subs/youtube_audio.txt` - Subtitle text
- `subs/youtube_audio.srt` - Subtitle SRT
- `subs/youtube_audio.vtt` - Subtitle VTT

### **Ví dụ output:**
```
✅ Hoàn tất! File đã tạo:
 - youtube_audio.mp4 (MP4)
 - youtube_audio.mp3 (MP3)
 - subs/youtube_audio.txt
 - subs/youtube_audio.srt
 - subs/youtube_audio.vtt
```

## 🔧 **Troubleshooting:**

### **Nếu thiếu yt-dlp:**
```bash
pip install -U yt-dlp
```

### **Nếu thiếu ffmpeg:**
```bash
# Windows
winget install Gyan.FFmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

### **Nếu thiếu whisper:**
```bash
pip install openai-whisper
```

### **Nếu lỗi download:**
1. **Kiểm tra URL** - URL có đúng không?
2. **Kiểm tra mạng** - Internet có hoạt động không?
3. **Kiểm tra video** - Video có bị hạn chế không?

### **Nếu lỗi Whisper:**
1. **Kiểm tra file audio** - File MP3 có được tạo không?
2. **Kiểm tra ngôn ngữ** - Ngôn ngữ có đúng không?
3. **Kiểm tra model** - Model có được load không?

## 💡 **Mẹo sử dụng:**

### **1. Chọn ngôn ngữ đúng:**
- Tiếng Nhật → `ja`
- Tiếng Việt → `vi`
- Tiếng Anh → `en`
- Tiếng Trung → `zh`
- Tiếng Hàn → `ko`

### **2. Chọn model phù hợp:**
- `base` - Nhanh, độ chính xác trung bình
- `small` - Vừa, độ chính xác cao
- `medium` - Chậm, độ chính xác rất cao
- `large` - Rất chậm, độ chính xác cao nhất

### **3. Tối ưu chất lượng:**
- **Video:** yt-dlp tự động chọn best quality
- **Audio:** 192k bitrate cho chất lượng tốt
- **Subtitle:** Whisper với model phù hợp

## 🎯 **Test với video khác:**

### **Video test 1:**
```python
VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Astley
LANG = "en"  # Tiếng Anh
```

### **Video test 2:**
```python
VIDEO_URL = "https://www.youtube.com/watch?v=9bZkp7q19f0"  # Gangnam Style
LANG = "ko"  # Tiếng Hàn
```

### **Video test 3:**
```python
VIDEO_URL = "https://www.youtube.com/watch?v=kJQP7kiw5Fk"  # Despacito
LANG = "es"  # Tiếng Tây Ban Nha
```

## 📚 **Tài liệu tham khảo:**

- `STT_TEST_GUIDE.md` - Hướng dẫn test STT
- `STT_LOCAL_WHISPER_GUIDE.md` - Hướng dẫn STT với local whisper
- `BACKEND_START_GUIDE.md` - Hướng dẫn chạy backend
- `FIX_NO_AUDIO_LOW_QUALITY_ISSUE.md` - Sửa lỗi video không có âm thanh

## 🆘 **Hỗ trợ:**

Nếu gặp vấn đề:
1. Kiểm tra dependencies (yt-dlp, ffmpeg, whisper)
2. Kiểm tra URL video
3. Kiểm tra mạng internet
4. Kiểm tra quyền ghi file
5. Kiểm tra log lỗi
6. Thử với video khác
