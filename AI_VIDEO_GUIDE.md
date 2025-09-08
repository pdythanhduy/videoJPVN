# 🎬 AI Video Generator Guide

## 🎯 Tổng quan

AI Video Generator là công cụ tạo video AI từ text prompt hoặc ảnh, tương tự như Veo3, RunwayML, và các nền tảng AI video khác.

## 🚀 Tính năng chính

### **1. Text-to-Video**
- Tạo video từ mô tả văn bản
- Hỗ trợ nhiều phong cách: realistic, animated, cinematic, etc.
- Tùy chỉnh thời lượng (3-30 giây)
- Nhiều tỷ lệ khung hình: 16:9, 9:16, 1:1, etc.

### **2. Image-to-Video**
- Tạo video từ ảnh + text prompt
- Biến ảnh tĩnh thành video động
- Giữ nguyên style và composition của ảnh gốc

### **3. Multi-Platform Support**
- **Demo Mode**: Hoạt động ngay lập tức (không cần API key)
- **RunwayML**: API chuyên nghiệp cho video generation
- **Stability AI**: Nền tảng AI video mạnh mẽ
- **OpenAI Sora**: Khi có sẵn (tương lai)

## 🎨 Cách sử dụng

### **1. Mở AI Video Tool**
- Click nút **"AI Video"** trong header
- Tool sẽ mở trong modal popup

### **2. Tạo video từ Text**

#### **Bước 1: Nhập Prompt**
```
Ví dụ prompts tốt:
✅ "A golden retriever playing with a ball of yarn in a sunny garden"
✅ "A futuristic city with flying cars at sunset"
✅ "A cat sitting on a windowsill watching rain"

❌ Tránh:
❌ "dog" (quá ngắn)
❌ "A complex scene with many characters doing different things" (quá phức tạp)
```

#### **Bước 2: Cấu hình**
- **Duration**: 3-30 giây (khuyến nghị 5-10s)
- **Platform**: Chọn nền tảng (demo/runway/stability/openai)
- **Style**: realistic, animated, cinematic, cartoon, etc.
- **Aspect Ratio**: 16:9 (landscape), 9:16 (portrait), 1:1 (square)

#### **Bước 3: Generate**
- Click **"Generate from Text"**
- Chờ quá trình tạo video hoàn tất

### **3. Tạo video từ ảnh**

#### **Bước 1: Upload ảnh**
- Click **"Upload Image"**
- Chọn file ảnh (JPG, PNG, etc.)

#### **Bước 2: Nhập prompt**
```
Ví dụ:
✅ "The cat starts walking towards the camera"
✅ "The landscape becomes animated with moving clouds"
✅ "The person in the photo starts smiling"
```

#### **Bước 3: Generate**
- Click **"Generate from Image"**
- Chờ quá trình tạo video

## 🔧 Cấu hình API Keys

### **1. RunwayML API**
```bash
# Thêm vào .env file
RUNWAY_API_KEY=your_runway_api_key_here
```

### **2. Stability AI API**
```bash
# Thêm vào .env file
STABILITY_API_KEY=your_stability_api_key_here
```

### **3. OpenAI API (cho Sora)**
```bash
# Thêm vào .env file
OPENAI_API_KEY=your_openai_api_key_here
```

## 📊 Kết quả

### **JSON Response**
```json
{
  "success": true,
  "video_url": "/api/ai-video/download/demo_video_20241219_153045.mp4",
  "task_id": "demo_20241219_153045",
  "platform": "demo",
  "prompt": "A cat playing with yarn",
  "duration": 5,
  "style": "realistic",
  "aspect_ratio": "16:9",
  "filename": "demo_video_20241219_153045.mp4"
}
```

### **Video Files**
- Tự động lưu trong thư mục `ai_video_data/`
- Format: MP4
- Có thể download và preview

## 💡 Tips cho kết quả tốt nhất

### **1. Prompt Writing**
- **Be specific**: "A golden retriever playing in a park" thay vì "dog"
- **Include details**: lighting, camera angle, mood, colors
- **Use English**: Hầu hết AI models hoạt động tốt nhất với tiếng Anh
- **Keep it simple**: Tránh scenes phức tạp với nhiều elements

### **2. Duration**
- **3-5s**: Tốt cho simple actions
- **5-10s**: Lý tưởng cho most content
- **10-30s**: Chỉ dùng cho complex scenes

### **3. Style Selection**
- **Realistic**: Cho content thực tế
- **Animated**: Cho cartoon/anime style
- **Cinematic**: Cho video có chất lượng phim
- **Artistic**: Cho creative/abstract content

### **4. Aspect Ratio**
- **16:9**: YouTube, landscape videos
- **9:16**: TikTok, Instagram Stories
- **1:1**: Instagram posts, square format
- **4:3**: Traditional video format

## 🎬 Use Cases

### **Content Creation**
- Tạo video cho social media
- Demo products/services
- Educational content
- Marketing materials

### **Creative Projects**
- Art projects
- Music videos
- Short films
- Experimental videos

### **Business**
- Product demos
- Training videos
- Presentations
- Marketing campaigns

## 🔧 API Endpoints

### **Generate from Text**
```bash
POST /api/ai-video/generate
Content-Type: multipart/form-data

prompt: "A cat playing with yarn"
duration: 5
platform: "demo"
style: "realistic"
aspect_ratio: "16:9"
```

### **Generate from Image**
```bash
POST /api/ai-video/generate-from-image
Content-Type: multipart/form-data

image: [file]
prompt: "The cat starts moving"
duration: 5
platform: "demo"
```

### **Get Available Options**
```bash
GET /api/ai-video/platforms
GET /api/ai-video/styles
GET /api/ai-video/aspect-ratios
GET /api/ai-video/files
```

### **File Management**
```bash
GET /api/ai-video/download/{filename}
DELETE /api/ai-video/files/{filename}
```

## 🛠️ Troubleshooting

### **Lỗi thường gặp**

#### **1. "Connection error"**
- Kiểm tra backend có chạy không
- Kiểm tra firewall/antivirus

#### **2. "Failed to generate video"**
- Kiểm tra API key (nếu dùng platform khác demo)
- Kiểm tra prompt có hợp lệ không
- Thử prompt đơn giản hơn

#### **3. "Please enter a prompt"**
- Đảm bảo đã nhập prompt
- Prompt không được để trống

#### **4. "Please select an image"**
- Upload ảnh trước khi generate
- Kiểm tra format ảnh (JPG, PNG)

### **Performance Tips**
- Sử dụng Demo mode để test trước
- Bắt đầu với duration ngắn (3-5s)
- Sử dụng prompts đơn giản
- Kiểm tra API quota (nếu dùng paid services)

## 🎯 Kết luận

AI Video Generator cung cấp:
- ✅ Text-to-Video generation
- ✅ Image-to-Video generation  
- ✅ Multi-platform support
- ✅ Flexible configuration
- ✅ File management
- ✅ Easy-to-use interface

**Perfect cho content creators, marketers, và creative professionals!** 🎬✨

## 🔮 Roadmap

### **Planned Features**
- [ ] Video editing tools
- [ ] Batch generation
- [ ] Custom models
- [ ] Video upscaling
- [ ] Audio generation
- [ ] Advanced prompts (negative prompts, style references)
- [ ] Video interpolation
- [ ] Real-time preview

### **API Integrations**
- [ ] Pika Labs
- [ ] Luma AI
- [ ] Stable Video Diffusion
- [ ] Custom local models
