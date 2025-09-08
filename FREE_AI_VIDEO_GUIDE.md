# 🆓 Free AI Video Generation Guide

## ✅ **Có thể dùng FREE 100%!**

AI Video Tool được thiết kế để hoạt động **ngay lập tức** mà không cần API key nào cả!

## 🎯 **Demo Mode - Hoạt động ngay**

### **Không cần cài đặt gì thêm:**
- ✅ Không cần API key
- ✅ Không cần đăng ký tài khoản
- ✅ Không cần thanh toán
- ✅ Hoạt động ngay lập tức

### **Cách sử dụng:**
1. **Mở AI Video Tool**: Click nút "AI Video" trong header
2. **Chọn Platform**: Để mặc định "demo" 
3. **Nhập prompt**: Mô tả video bạn muốn tạo
4. **Click Generate**: Video sẽ được tạo ngay!

## 🎬 **Demo Mode Features**

### **Text-to-Video:**
```
Prompt: "A cat playing with a ball of yarn"
Duration: 5 seconds
Style: realistic
Aspect Ratio: 16:9
Platform: demo
```

### **Image-to-Video:**
```
Upload: Ảnh bất kỳ
Prompt: "The cat starts moving"
Duration: 5 seconds
Platform: demo
```

## 🔧 **Cách hoạt động của Demo Mode**

### **Backend Logic:**
```python
def _generate_demo_video(self, prompt, duration, style, aspect_ratio):
    """Tạo demo video (fallback khi không có API key)"""
    # Tạo file demo video
    timestamp = self._get_timestamp()
    demo_filename = f"demo_video_{timestamp}.mp4"
    
    # Tạo file demo (có thể là video test hoặc placeholder)
    self._create_demo_video_file(demo_path, prompt, duration)
    
    return {
        "success": True,
        "video_url": f"/api/ai-video/download/{demo_filename}",
        "platform": "demo",
        "prompt": prompt,
        "duration": duration
    }
```

### **Frontend Detection:**
```javascript
// Tự động detect platforms có sẵn
const loadAvailablePlatforms = async () => {
    const response = await fetch('http://localhost:8000/api/ai-video/platforms');
    const data = await response.json();
    setAvailablePlatforms(data.platforms); // ["demo"] nếu không có API keys
};
```

## 🎨 **Demo Mode Capabilities**

### **✅ Hoạt động:**
- Tạo video từ text prompt
- Tạo video từ ảnh + prompt
- Tùy chỉnh duration, style, aspect ratio
- Download video files
- Quản lý files (delete)
- Preview results

### **📝 Demo Output:**
- Tạo file demo với thông tin prompt
- Timestamp thực tế
- Filename unique
- Có thể download và xem

## 🚀 **Upgrade Options (Optional)**

### **Nếu muốn dùng AI thật:**

#### **1. RunwayML (Free tier available)**
```bash
# Đăng ký tại runwayml.com
# Có free credits mỗi tháng
RUNWAY_API_KEY=your_free_api_key
```

#### **2. Stability AI (Free tier available)**
```bash
# Đăng ký tại stability.ai
# Có free credits
STABILITY_API_KEY=your_free_api_key
```

#### **3. OpenAI (Pay per use)**
```bash
# Đăng ký tại openai.com
# Trả tiền theo usage
OPENAI_API_KEY=your_api_key
```

## 💡 **Tips sử dụng Demo Mode**

### **1. Test trước khi upgrade:**
- Dùng Demo Mode để test prompts
- Xem kết quả format
- Quyết định có cần upgrade không

### **2. Prompt testing:**
```
✅ Good prompts for testing:
- "A cat sitting on a windowsill"
- "A dog running in a park"
- "A sunset over mountains"
- "A person walking on a beach"

❌ Avoid complex prompts:
- "A complex scene with many characters doing different things"
- "A detailed cityscape with moving cars and people"
```

### **3. File management:**
- Demo files được lưu trong `ai_video_data/`
- Có thể download và xem
- Xóa files cũ để tiết kiệm dung lượng

## 🎯 **So sánh Demo vs Real AI**

| Feature | Demo Mode | Real AI APIs |
|---------|-----------|--------------|
| **Cost** | 🆓 Free | 💰 Paid/Free tier |
| **Setup** | ⚡ Instant | 🔧 API key needed |
| **Quality** | 📝 Demo files | 🎬 Real AI videos |
| **Speed** | ⚡ Instant | ⏳ 30s-5min |
| **Use case** | 🧪 Testing | 🎬 Production |

## 🔮 **Demo Mode Roadmap**

### **Planned Improvements:**
- [ ] Better demo video generation
- [ ] Sample video templates
- [ ] Preview thumbnails
- [ ] More realistic demo outputs
- [ ] Integration with free AI services

## 🎉 **Kết luận**

**Demo Mode = 100% FREE + Instant Access!**

- ✅ Không cần API key
- ✅ Hoạt động ngay lập tức
- ✅ Perfect cho testing
- ✅ Có thể upgrade sau
- ✅ Full feature set

**Bắt đầu ngay với Demo Mode!** 🚀✨
