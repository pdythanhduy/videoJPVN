# Hướng dẫn cấu hình Azure Speech Service

## 🎯 Mục tiêu

Để có audio thực tế với tiếng nói tiếng Nhật thay vì file test (silence).

## 🔧 Cấu hình Azure Speech Service

### **1. Tạo Azure Account**

1. Truy cập: https://azure.microsoft.com/
2. Đăng ký tài khoản miễn phí
3. Xác thực thông tin

### **2. Tạo Speech Service Resource**

1. Đăng nhập Azure Portal: https://portal.azure.com
2. Tìm kiếm "Speech Services"
3. Nhấn "Create"
4. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource Group**: Tạo mới hoặc chọn có sẵn
   - **Region**: Chọn "Japan West" (japanwest)
   - **Name**: Đặt tên cho service
   - **Pricing Tier**: Chọn "Free (F0)" để test

### **3. Lấy API Key**

1. Sau khi tạo xong, vào resource
2. Vào "Keys and Endpoint"
3. Copy **Key 1** và **Region**

### **4. Cấu hình trong dự án**

1. Mở file `backend/.env`
2. Cập nhật thông tin:

```env
AZURE_SPEECH_KEY=your_actual_api_key_here
AZURE_SPEECH_REGION=japanwest
```

### **5. Test cấu hình**

1. Restart backend server
2. Thử tạo audio trong app
3. Kiểm tra log backend

## 🎵 Kết quả mong đợi

### **Trước khi cấu hình:**
- File test: 2 giây silence
- Tên file: `text_test.wav`
- Thông báo: "⚠️ Tạo file test (Azure TTS lỗi)"

### **Sau khi cấu hình:**
- Audio thực tế: Có tiếng nói tiếng Nhật
- Tên file: `text.wav`
- Thông báo: "✅ Audio thực tế đã tạo thành công!"
- Thời lượng: Theo độ dài text thực tế

## 🔍 Troubleshooting

### **Lỗi "Azure TTS failed"**

**Nguyên nhân có thể:**
1. API key sai
2. Region không đúng
3. Quota hết
4. Kết nối internet

**Giải pháp:**
1. Kiểm tra API key trong Azure Portal
2. Đảm bảo region là "japanwest"
3. Kiểm tra quota trong Azure Portal
4. Test kết nối internet

### **Lỗi "Subscription not found"**

**Giải pháp:**
1. Kiểm tra subscription trong Azure Portal
2. Đảm bảo Speech Service được tạo đúng subscription
3. Kiểm tra quyền truy cập

### **Lỗi "Region not supported"**

**Giải pháp:**
1. Sử dụng region: "japanwest"
2. Hoặc "eastasia", "southeastasia"
3. Tránh các region không hỗ trợ Speech Service

## 💰 Chi phí

### **Free Tier (F0):**
- 5 triệu ký tự/tháng
- Đủ cho test và sử dụng cá nhân

### **Standard Tier (S0):**
- $4/1 triệu ký tự
- Cho sử dụng thương mại

## 🎛️ Cấu hình nâng cao

### **Thay đổi giọng nói:**

Trong app, chọn giọng nói khác:
- `ja-JP-NanamiNeural` - Nữ, tự nhiên
- `ja-JP-KeitaNeural` - Nam, tự nhiên
- `ja-JP-AoiNeural` - Nữ, trẻ trung
- `ja-JP-DaichiNeural` - Nam, trưởng thành

### **Thay đổi chất lượng audio:**

Trong `backend/main_simple.py`, dòng 77:
```python
# Chất lượng cao hơn
speechsdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm

# Chất lượng thấp hơn (nhỏ hơn)
speechsdk.SpeechSynthesisOutputFormat.Riff8Khz16BitMonoPcm
```

## 📊 Monitoring

### **Theo dõi sử dụng:**
1. Azure Portal → Speech Service → Metrics
2. Xem số lượng request
3. Kiểm tra quota còn lại

### **Log backend:**
- Xem console backend để debug
- Log sẽ hiển thị lỗi Azure nếu có

## ✅ Checklist

- [ ] Tạo Azure account
- [ ] Tạo Speech Service resource
- [ ] Lấy API key và region
- [ ] Cập nhật file `.env`
- [ ] Restart backend
- [ ] Test tạo audio
- [ ] Kiểm tra file có tiếng nói

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log backend
2. Xem Azure Portal metrics
3. Test API key trực tiếp
4. Kiểm tra quota và billing
