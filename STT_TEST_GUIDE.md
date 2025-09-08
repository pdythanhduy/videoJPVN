# Hướng dẫn test STT với Local Whisper

## 🎉 **Local Whisper đã hoạt động!**

Test script đã xác nhận:
- ✅ **Whisper import successful**
- ✅ **Whisper model loaded successfully**
- ✅ **Local Whisper SUCCESS!**
- ✅ **SRT thực tế được tạo**

## 🚀 **Test ngay:**

### **1. Mở STT Converter:**
1. Mở app tại http://localhost:5173
2. Nhấn nút **"Audio → SRT"**
3. Chọn file audio cần convert

### **2. Chọn file audio:**
- **File từ TTS:** `こんにちは元気ですか今日は天気がいいですね.wav`
- **File từ YouTube:** File video/audio đã download
- **File local:** Upload file audio/video từ máy tính

### **3. Chọn ngôn ngữ:**
- **Japanese (ja)** - Tiếng Nhật (mặc định)
- **English (en)** - Tiếng Anh
- **Vietnamese (vi)** - Tiếng Việt

### **4. Chọn model:**
- **base** - Nhanh, độ chính xác trung bình (mặc định)
- **small** - Chậm hơn, độ chính xác cao hơn
- **medium** - Chậm, độ chính xác cao
- **large** - Rất chậm, độ chính xác cao nhất

### **5. Convert:**
1. Nhấn nút **"Convert to SRT"**
2. Đợi quá trình xử lý (có thể mất vài phút)
3. Download file SRT

## 📊 **Kết quả mong đợi:**

### **Với Local Whisper:**
- ✅ **SRT thực tế** - Không phải mẫu
- ✅ **Hoàn toàn miễn phí** - Không cần API key
- ✅ **Độ chính xác cao** - Đặc biệt với tiếng Nhật
- ✅ **Xử lý offline** - Không cần internet

### **Ví dụ SRT thực tế:**
```
1
00:00:00,000 --> 00:00:03,000
こんにちは、元気ですか？

2
00:00:03,000 --> 00:00:06,000
今日は天気がいいですね。
```

## 🔧 **Nếu vẫn hiện SRT mẫu:**

### **1. Kiểm tra backend:**
- Backend có chạy không?
- Có lỗi gì trong log không?
- Local whisper có được import không?

### **2. Restart backend:**
```bash
cd backend
python main_simple.py
```

### **3. Kiểm tra file audio:**
- File có tồn tại không?
- File có định dạng đúng không?
- File có âm thanh không?

### **4. Test với file khác:**
- Thử file audio khác
- Thử file video
- Thử file ngắn hơn

## 💡 **Mẹo để có kết quả tốt nhất:**

### **1. Chọn ngôn ngữ đúng:**
- Tiếng Nhật → `ja`
- Tiếng Anh → `en`
- Tiếng Việt → `vi`

### **2. Chọn model phù hợp:**
- File ngắn (< 5 phút) → `base`
- File dài (> 10 phút) → `small`
- Cần độ chính xác cao → `medium`

### **3. Cải thiện file audio:**
- Giảm tiếng ồn
- Tăng chất lượng
- Chia file nhỏ nếu quá dài

## 🎯 **Test với file cụ thể:**

### **File test 1:**
```
File: こんにちは元気ですか今日は天気がいいですね.wav
Ngôn ngữ: Japanese (ja)
Model: base
Expected: SRT thực tế với 2 subtitle
```

### **File test 2:**
```
File: 先週の夜寮の自分の部屋で勉強していました時計を見るとも.wav
Ngôn ngữ: Japanese (ja)
Model: base
Expected: SRT thực tế với nhiều subtitle
```

## 📚 **Tài liệu tham khảo:**

- `STT_LOCAL_WHISPER_GUIDE.md` - Hướng dẫn chi tiết STT với local whisper
- `STT_CONVERTER_GUIDE.md` - Hướng dẫn tổng quan STT
- `FIX_NO_AUDIO_LOW_QUALITY_ISSUE.md` - Sửa lỗi video không có âm thanh

## 🆘 **Hỗ trợ:**

Nếu gặp vấn đề:
1. Kiểm tra backend có chạy không
2. Restart backend server
3. Kiểm tra file audio có đúng không
4. Thử model khác
5. Kiểm tra log backend
6. Test với file khác
