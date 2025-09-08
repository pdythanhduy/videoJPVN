from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
import os
import json
import tempfile
import shutil
from pathlib import Path
from typing import List, Optional, Dict, Any
import asyncio
import logging

# Import các module xử lý
from services.video_processor import VideoProcessor
from services.audio_processor import AudioProcessor
from services.subtitle_processor import SubtitleProcessor
from services.language_analyzer import LanguageAnalyzer
from services.tts_service import TTSService

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="JP-VI Video Subtitle API",
    description="API để xử lý video, audio và phụ đề tiếng Nhật",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo các service
video_processor = VideoProcessor()
audio_processor = AudioProcessor()
subtitle_processor = SubtitleProcessor()
language_analyzer = LanguageAnalyzer()
tts_service = TTSService()

# Tạo thư mục tạm
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "JP-VI Video Subtitle API đang hoạt động"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": {
        "video_processor": video_processor.is_ready(),
        "audio_processor": audio_processor.is_ready(),
        "subtitle_processor": subtitle_processor.is_ready(),
        "language_analyzer": language_analyzer.is_ready(),
        "tts_service": tts_service.is_ready()
    }}

@app.post("/api/upload/video")
async def upload_video(file: UploadFile = File(...)):
    """Upload và xử lý video file"""
    try:
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File phải là video")
        
        # Lưu file tạm
        temp_file = TEMP_DIR / f"video_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Xử lý video
        result = await video_processor.process_video(temp_file)
        
        # Cleanup
        temp_file.unlink()
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi xử lý video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý video: {str(e)}")

@app.post("/api/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    """Upload và xử lý audio file"""
    try:
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File phải là audio")
        
        # Lưu file tạm
        temp_file = TEMP_DIR / f"audio_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Xử lý audio
        result = await audio_processor.process_audio(temp_file)
        
        # Cleanup
        temp_file.unlink()
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi xử lý audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý audio: {str(e)}")

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    model: str = Form("whisper-1"),
    language: str = Form("ja")
):
    """Chuyển đổi audio thành text với Whisper"""
    try:
        # Lưu file tạm
        temp_file = TEMP_DIR / f"transcribe_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Transcribe
        result = await audio_processor.transcribe(temp_file, model, language)
        
        # Cleanup
        temp_file.unlink()
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi transcribe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi transcribe: {str(e)}")

@app.post("/api/analyze-text")
async def analyze_text(data: Dict[str, Any]):
    """Phân tích text tiếng Nhật (tokenization, POS tagging)"""
    try:
        text = data.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text không được để trống")
        
        result = await language_analyzer.analyze(text)
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi phân tích text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi phân tích text: {str(e)}")

@app.post("/api/process-subtitles")
async def process_subtitles(data: Dict[str, Any]):
    """Xử lý và tối ưu hóa phụ đề"""
    try:
        segments = data.get("segments", [])
        if not segments:
            raise HTTPException(status_code=400, detail="Segments không được để trống")
        
        result = await subtitle_processor.process(segments)
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi xử lý phụ đề: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý phụ đề: {str(e)}")

@app.post("/api/generate-subtitles")
async def generate_subtitles(
    video_file: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
    language: str = Form("ja"),
    model: str = Form("whisper-1")
):
    """Tạo phụ đề tự động từ video/audio"""
    try:
        if not video_file and not audio_file:
            raise HTTPException(status_code=400, detail="Cần có video hoặc audio file")
        
        # Xử lý file
        if video_file:
            temp_file = TEMP_DIR / f"generate_video_{video_file.filename}"
            with open(temp_file, "wb") as buffer:
                shutil.copyfileobj(video_file.file, buffer)
        else:
            temp_file = TEMP_DIR / f"generate_audio_{audio_file.filename}"
            with open(temp_file, "wb") as buffer:
                shutil.copyfileobj(audio_file.file, buffer)
        
        # Tạo phụ đề
        result = await subtitle_processor.generate_subtitles(temp_file, language, model)
        
        # Cleanup
        temp_file.unlink()
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi tạo phụ đề: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo phụ đề: {str(e)}")

@app.post("/api/export")
async def export_subtitles(
    data: Dict[str, Any],
    format: str = Form("srt")
):
    """Export phụ đề ra các định dạng khác nhau"""
    try:
        segments = data.get("segments", [])
        if not segments:
            raise HTTPException(status_code=400, detail="Segments không được để trống")
        
        result = await subtitle_processor.export(segments, format)
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi export: {str(e)}")

@app.post("/api/tts/text-to-speech")
async def text_to_speech(
    data: Dict[str, Any]
):
    """Chuyển đổi text tiếng Nhật thành audio"""
    try:
        text = data.get("text", "")
        voice = data.get("voice", "ja-JP-NanamiNeural")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text không được để trống")
        
        result = await tts_service.text_to_speech(text, voice)
        
        if result["success"]:
            # Trả về file audio
            return FileResponse(
                path=result["output_path"],
                media_type="audio/wav",
                filename=Path(result["output_path"]).name
            )
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    
    except Exception as e:
        logger.error(f"Lỗi TTS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi TTS: {str(e)}")

@app.get("/api/tts/voices")
async def get_available_voices(language: str = "ja-JP"):
    """Lấy danh sách các giọng nói có sẵn"""
    try:
        result = await tts_service.get_available_voices(language)
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi lấy danh sách giọng nói: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi lấy danh sách giọng nói: {str(e)}")

@app.post("/api/tts/batch")
async def batch_text_to_speech(
    data: Dict[str, Any]
):
    """Chuyển đổi nhiều text thành audio"""
    try:
        texts = data.get("texts", [])
        voice = data.get("voice", "ja-JP-NanamiNeural")
        
        if not texts or not isinstance(texts, list):
            raise HTTPException(status_code=400, detail="Texts phải là danh sách không rỗng")
        
        result = await tts_service.batch_text_to_speech(texts, voice)
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Lỗi batch TTS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi batch TTS: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
