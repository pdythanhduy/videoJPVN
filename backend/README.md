# JP-VI Video Subtitle Backend

Backend API để xử lý video, audio và phụ đề tiếng Nhật với tích hợp Azure TTS.

## Tính năng

- **Text-to-Speech (TTS)**: Chuyển đổi text tiếng Nhật thành audio bằng Azure Speech Service
- **Video Processing**: Xử lý và phân tích video files
- **Audio Processing**: Xử lý audio và transcribe với Whisper
- **Subtitle Processing**: Xử lý và export phụ đề nhiều định dạng
- **Language Analysis**: Phân tích ngôn ngữ tiếng Nhật

## Cài đặt

### 1. Cài đặt Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Cấu hình Azure Speech Service

1. Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

2. Cập nhật thông tin Azure Speech Service trong `.env`:
```
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=japanwest
```

### 3. Chạy server

```bash
python run.py
```

Server sẽ chạy tại: http://localhost:8000

## API Endpoints

### TTS (Text-to-Speech)

- `POST /api/tts/text-to-speech` - Chuyển đổi text thành audio
- `GET /api/tts/voices` - Lấy danh sách giọng nói có sẵn
- `POST /api/tts/batch` - Chuyển đổi nhiều text thành audio

### Video Processing

- `POST /api/upload/video` - Upload và xử lý video
- `POST /api/upload/audio` - Upload và xử lý audio

### Audio Processing

- `POST /api/transcribe` - Transcribe audio thành text

### Subtitle Processing

- `POST /api/process-subtitles` - Xử lý phụ đề
- `POST /api/export` - Export phụ đề
- `POST /api/generate-subtitles` - Tạo phụ đề tự động

### Language Analysis

- `POST /api/analyze-text` - Phân tích text tiếng Nhật

## Sử dụng với Frontend

Frontend React sẽ tự động kết nối đến backend tại `http://localhost:8000`.

### Ví dụ sử dụng TTS API

```javascript
// Tạo audio từ text
const response = await fetch('http://localhost:8000/api/tts/text-to-speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'こんにちは、元気ですか？',
    voice: 'ja-JP-NanamiNeural'
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

## Cấu trúc thư mục

```
backend/
├── main.py                 # FastAPI app chính
├── run.py                  # Script chạy server
├── requirements.txt        # Python dependencies
├── env.example            # Template cấu hình
├── services/              # Các service xử lý
│   ├── tts_service.py     # Azure TTS service
│   ├── video_processor.py # Xử lý video
│   ├── audio_processor.py # Xử lý audio
│   ├── subtitle_processor.py # Xử lý phụ đề
│   └── language_analyzer.py # Phân tích ngôn ngữ
└── temp/                  # Thư mục file tạm
```

## Troubleshooting

### Lỗi Azure Speech Service

- Kiểm tra API key và region trong file `.env`
- Đảm bảo có kết nối internet
- Kiểm tra quota và billing của Azure account

### Lỗi Whisper

- Whisper model sẽ được tải tự động lần đầu
- Cần kết nối internet để tải model
- Model được cache trong thư mục `~/.cache/huggingface/`

### Lỗi CORS

- Backend đã cấu hình CORS cho `localhost:5173` (Vite dev server)
- Nếu dùng port khác, cập nhật trong `main.py`
