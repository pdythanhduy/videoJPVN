# Hướng dẫn sử dụng STT với Local Whisper (MIỄN PHÍ)

## 🎉 **Local Whisper đã được cài đặt!**

Bây giờ bạn có thể convert audio/video sang SRT **hoàn toàn miễn phí** bằng local whisper.

## 🚀 **Cách sử dụng:**

### **1. Mở STT Converter:**
1. Mở app tại http://localhost:5173
2. Nhấn nút **"Audio → SRT"**
3. Chọn file audio/video cần convert

### **2. Chọn file audio/video:**
- **File từ TTS:** Chọn file audio đã tạo từ TTS
- **File từ YouTube:** Chọn file video/audio đã download
- **File local:** Upload file audio/video từ máy tính

### **3. Chọn ngôn ngữ:**
- **Japanese (ja)** - Tiếng Nhật (mặc định)
- **English (en)** - Tiếng Anh
- **Vietnamese (vi)** - Tiếng Việt
- **Chinese (zh)** - Tiếng Trung
- **Korean (ko)** - Tiếng Hàn

### **4. Chọn model:**
- **base** - Nhanh, độ chính xác trung bình (mặc định)
- **small** - Chậm hơn, độ chính xác cao hơn
- **medium** - Chậm, độ chính xác cao
- **large** - Rất chậm, độ chính xác cao nhất

### **5. Convert:**
1. Nhấn nút **"Convert to SRT"**
2. Đợi quá trình xử lý (có thể mất vài phút)
3. Download file SRT

## 📊 **So sánh các model:**

| Model | Tốc độ | Độ chính xác | Kích thước | Sử dụng |
|-------|--------|--------------|------------|---------|
| base  | Nhanh  | Trung bình   | ~140MB     | Khuyến nghị |
| small | Vừa    | Cao         | ~460MB     | Chất lượng tốt |
| medium| Chậm   | Rất cao     | ~1.5GB     | Chất lượng rất tốt |
| large | Rất chậm| Cao nhất   | ~2.9GB     | Chất lượng tốt nhất |

## 🎯 **Kết quả mong đợi:**

### **Với Local Whisper:**
- ✅ **SRT thực tế** - Không phải mẫu
- ✅ **Hoàn toàn miễn phí** - Không cần API key
- ✅ **Độ chính xác cao** - Đặc biệt với tiếng Nhật
- ✅ **Xử lý offline** - Không cần internet
- ✅ **Nhiều ngôn ngữ** - Hỗ trợ 99 ngôn ngữ

### **Ví dụ SRT thực tế:**
```
1
00:00:00,000 --> 00:00:03,000
こんにちは、元気ですか？

2
00:00:03,000 --> 00:00:06,000
今日は天気がいいですね。

3
00:00:06,000 --> 00:00:09,000
ありがとうございます。
```

## 🔧 **Troubleshooting:**

### **Nếu vẫn tạo SRT mẫu:**

1. **Kiểm tra backend:**
   - Backend có chạy không?
   - Có lỗi gì trong log không?
   - Local whisper có được import không?

2. **Restart backend:**
   ```bash
   cd backend
   python main_simple.py
   ```

3. **Kiểm tra file audio:**
   - File có tồn tại không?
   - File có định dạng đúng không?
   - File có âm thanh không?

### **Nếu convert chậm:**

1. **Chọn model nhỏ hơn:**
   - Từ `large` → `medium`
   - Từ `medium` → `small`
   - Từ `small` → `base`

2. **Kiểm tra file audio:**
   - File có quá dài không?
   - File có chất lượng cao không?
   - File có nhiều tiếng ồn không?

### **Nếu độ chính xác thấp:**

1. **Chọn model lớn hơn:**
   - Từ `base` → `small`
   - Từ `small` → `medium`
   - Từ `medium` → `large`

2. **Cải thiện file audio:**
   - Giảm tiếng ồn
   - Tăng chất lượng audio
   - Chọn ngôn ngữ đúng

## 💡 **Mẹo sử dụng:**

### **Để có kết quả tốt nhất:**

1. **Chọn ngôn ngữ đúng:**
   - Tiếng Nhật → `ja`
   - Tiếng Anh → `en`
   - Tiếng Việt → `vi`

2. **Chọn model phù hợp:**
   - File ngắn (< 5 phút) → `base`
   - File dài (> 10 phút) → `small`
   - Cần độ chính xác cao → `medium`

3. **Cải thiện file audio:**
   - Giảm tiếng ồn
   - Tăng chất lượng
   - Chia file nhỏ nếu quá dài

### **Để tăng tốc độ:**

1. **Chọn model nhỏ:**
   - `base` - Nhanh nhất
   - `small` - Cân bằng

2. **Chia file nhỏ:**
   - Chia file dài thành nhiều phần
   - Convert từng phần riêng

3. **Tối ưu file audio:**
   - Giảm bitrate
   - Giảm sample rate
   - Chuyển sang mono

## 🎉 **Kết quả:**

Sau khi cài đặt local whisper:
- ✅ **SRT thực tế** thay vì mẫu
- ✅ **Hoàn toàn miễn phí**
- ✅ **Độ chính xác cao**
- ✅ **Xử lý offline**
- ✅ **Nhiều ngôn ngữ**

## 🚀 **Test ngay:**

1. **Mở app** tại http://localhost:5173
2. **Nhấn nút "Audio → SRT"**
3. **Chọn file audio tiếng Nhật**
4. **Chọn ngôn ngữ: Japanese (ja)**
5. **Chọn model: base**
6. **Nhấn "Convert to SRT"**
7. **Đợi và download SRT thực tế**

## 📚 **Tài liệu tham khảo:**

- `STT_CONVERTER_GUIDE.md` - Hướng dẫn chi tiết STT
- `FIX_NO_AUDIO_LOW_QUALITY_ISSUE.md` - Sửa lỗi video không có âm thanh
- `FIX_QUALITY_AND_FORMAT_ISSUE.md` - Sửa lỗi chất lượng và format

## 🆘 **Hỗ trợ:**

Nếu gặp vấn đề:
1. Kiểm tra backend có chạy không
2. Restart backend server
3. Kiểm tra file audio có đúng không
4. Thử model khác
5. Kiểm tra log backend
