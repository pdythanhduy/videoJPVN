# Hướng dẫn tích hợp Python vào dự án React

## Tổng quan

Dự án này đã được tích hợp với backend Python để cung cấp các tính năng:

- **Text-to-Speech (TTS)**: Chuyển đổi text tiếng Nhật thành audio bằng Azure Speech Service
- **Video/Audio Processing**: Xử lý media files
- **Language Analysis**: Phân tích ngôn ngữ tiếng Nhật
- **Subtitle Processing**: Xử lý và export phụ đề

## Cấu trúc dự án

```
videoJPVN/
├── src/                    # Frontend React
│   ├── App.jsx            # Component chính
│   └── components/
│       └── TTSPanel.jsx   # Component TTS
├── backend/               # Backend Python
│   ├── main.py           # FastAPI server
│   ├── services/         # Các service xử lý
│   └── requirements.txt  # Python dependencies
└── INTEGRATION_GUIDE.md  # File này
```

## Cài đặt và chạy

### 1. Cài đặt Backend Python

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình Azure Speech Service
cp env.example .env
# Chỉnh sửa .env với API key của bạn

# Chạy backend server
python run.py
```

Backend sẽ chạy tại: http://localhost:8000

### 2. Chạy Frontend React

```bash
# Trong thư mục gốc
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## Tính năng mới

### Text-to-Speech (TTS)

1. **Truy cập**: Nhấn nút "Text → Audio" trong header
2. **Sử dụng**: 
   - Chọn giọng nói tiếng Nhật
   - Nhập text tiếng Nhật
   - Nhấn "Tạo Audio"
   - Phát hoặc tải về file audio

### API Endpoints

Backend cung cấp các API endpoints:

- `POST /api/tts/text-to-speech` - Tạo audio từ text
- `GET /api/tts/voices` - Lấy danh sách giọng nói
- `POST /api/upload/video` - Upload video
- `POST /api/transcribe` - Transcribe audio
- `POST /api/analyze-text` - Phân tích text tiếng Nhật

## Cấu hình Azure Speech Service

1. **Tạo Azure account**: https://azure.microsoft.com/
2. **Tạo Speech Service resource**
3. **Lấy API key và region**
4. **Cập nhật file `.env`**:

```env
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=japanwest
```

## Script Python gốc

Script `output_audio_only.py` của bạn đã được tích hợp vào:

- **File**: `backend/services/tts_service.py`
- **Class**: `TTSService`
- **Method**: `text_to_speech()`

### So sánh với script gốc:

| Script gốc | Backend tích hợp |
|------------|------------------|
| Chạy độc lập | API endpoint |
| File cứng | Linh hoạt qua API |
| Azure key cố định | Cấu hình qua .env |
| Output file | Trả về audio stream |

## Mở rộng tính năng

### Thêm giọng nói mới

Cập nhật `backend/services/tts_service.py`:

```python
japanese_voices = {
    "ja-JP-NanamiNeural": "Nanami (Female, Natural)",
    "ja-JP-KeitaNeural": "Keita (Male, Natural)",
    # Thêm giọng mới
    "ja-JP-NewVoiceNeural": "New Voice (Description)"
}
```

### Thêm xử lý ngôn ngữ khác

Cập nhật `backend/services/language_analyzer.py` để hỗ trợ:
- MeCab tokenization
- Sudachi morphological analysis
- Google Translate integration

### Thêm format export

Cập nhật `backend/services/subtitle_processor.py` để hỗ trợ:
- ASS/SSA subtitles
- VTT with styling
- Custom JSON formats

## Troubleshooting

### Backend không chạy

```bash
# Kiểm tra Python version
python --version  # Cần >= 3.8

# Kiểm tra dependencies
pip list | grep fastapi

# Kiểm tra port 8000
netstat -an | grep 8000
```

### TTS không hoạt động

```bash
# Kiểm tra Azure credentials
cat backend/.env

# Test API key
curl -X GET "https://japanwest.tts.speech.microsoft.com/cognitiveservices/voices/list" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY"
```

### CORS errors

Cập nhật `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    # Thêm origin mới nếu cần
)
```

## Phát triển thêm

### Thêm service mới

1. Tạo file trong `backend/services/`
2. Implement class với method `is_ready()`
3. Import và khởi tạo trong `main.py`
4. Thêm API endpoints

### Thêm component React

1. Tạo component trong `src/components/`
2. Import vào `App.jsx`
3. Thêm state và UI controls
4. Gọi API endpoints

## Kết luận

Việc tích hợp Python vào dự án React đã hoàn thành với:

✅ **Backend API** với FastAPI  
✅ **TTS Service** tích hợp Azure Speech  
✅ **Frontend Component** cho TTS  
✅ **CORS Configuration**  
✅ **Error Handling**  
✅ **Documentation**  

Dự án giờ đây có thể:
- Tạo audio từ text tiếng Nhật
- Xử lý video/audio files
- Phân tích ngôn ngữ
- Export phụ đề nhiều định dạng

Để sử dụng, chỉ cần chạy backend và frontend song song!
