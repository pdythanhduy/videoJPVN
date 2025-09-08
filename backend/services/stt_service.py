import os
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
import json
import tempfile
import subprocess

logger = logging.getLogger(__name__)

class STTService:
    def __init__(self):
        self.ready = True
        self.temp_dir = Path("temp/stt")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        logger.info("STTService initialized")
    
    def is_ready(self) -> bool:
        return self.ready
    
    async def convert_audio_to_srt(
        self, 
        audio_path: str, 
        language: str = "ja",
        model: str = "whisper-1"
    ) -> Dict[str, Any]:
        """Convert audio/video file to SRT subtitle"""
        try:
            # Xử lý đường dẫn file
            audio_file = self._resolve_audio_path(audio_path)
            
            if not audio_file.exists():
                # Thử tìm file trong các thư mục khác
                audio_file = self._find_audio_file(audio_path)
                if not audio_file:
                    raise Exception(f"File không tồn tại: {audio_path}")
            
            logger.info(f"Converting file: {audio_file}")
            
            # Kiểm tra API key
            if not self.openai_api_key:
                return await self._fallback_conversion(str(audio_file), language)
            
            # Sử dụng OpenAI Whisper
            return await self._openai_whisper_conversion(audio_file, language, model)
            
        except Exception as e:
            logger.error(f"Lỗi convert audio to SRT: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _openai_whisper_conversion(
        self, 
        audio_file: Path, 
        language: str, 
        model: str
    ) -> Dict[str, Any]:
        """Sử dụng OpenAI Whisper API"""
        try:
            import openai
            
            # Set API key
            openai.api_key = self.openai_api_key
            
            # Đọc file audio
            with open(audio_file, 'rb') as f:
                audio_data = f.read()
            
            # Gọi Whisper API
            response = await asyncio.to_thread(
                openai.Audio.transcribe,
                model=model,
                file=audio_data,
                language=language,
                response_format="srt"
            )
            
            # Lưu SRT file
            srt_filename = f"{audio_file.stem}_subtitle.srt"
            srt_path = self.temp_dir / srt_filename
            
            with open(srt_path, 'w', encoding='utf-8') as f:
                f.write(response)
            
            # Đếm số dòng subtitle
            subtitle_count = len([line for line in response.split('\n') if line.strip() and '-->' in line])
            
            return {
                "success": True,
                "message": f"✅ Convert thành công!\n\nFile gốc: {audio_file.name}\nFile SRT: {srt_filename}\nSố subtitle: {subtitle_count}\nNgôn ngữ: {language}",
                "srt_path": str(srt_path),
                "srt_filename": srt_filename,
                "subtitle_count": subtitle_count,
                "language": language,
                "model": model,
                "method": "OpenAI Whisper"
            }
            
        except Exception as e:
            logger.error(f"Lỗi OpenAI Whisper: {str(e)}")
            # Fallback to local method
            return await self._fallback_conversion(str(audio_file), language)
    
    async def _fallback_conversion(
        self, 
        audio_path: str, 
        language: str
    ) -> Dict[str, Any]:
        """Fallback conversion using free methods"""
        try:
            # Thử sử dụng local whisper trước
            local_result = await self._try_local_whisper(audio_path, language)
            if local_result["success"]:
                return local_result
            
            # Nếu không có local whisper, tạo SRT mẫu
            return await self._create_sample_srt_file(audio_path, language)
            
        except Exception as e:
            logger.error(f"Lỗi fallback conversion: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _try_local_whisper(self, audio_path: str, language: str) -> Dict[str, Any]:
        """Thử sử dụng local whisper (miễn phí)"""
        try:
            import whisper
            
            # Kiểm tra file có tồn tại không
            audio_file = Path(audio_path)
            if not audio_file.exists():
                logger.error(f"Audio file not found: {audio_path}")
                return {"success": False, "error": f"File không tồn tại: {audio_path}"}
            
            logger.info(f"Using local whisper on: {audio_file}")
            
            # Load model whisper (miễn phí)
            model = whisper.load_model("base")
            
            # Transcribe audio với cấu hình tối ưu
            transcribe_options = {
                "language": language if language != "ja" else None,  # Auto-detect cho tiếng Nhật
                "task": "transcribe",
                "verbose": False,
                "word_timestamps": True,  # Tăng độ chính xác timing
                "condition_on_previous_text": True,  # Cải thiện context
                "compression_ratio_threshold": 2.4,  # Giảm hallucination
                "logprob_threshold": -1.0,  # Lọc kết quả kém
                "no_speech_threshold": 0.6,  # Giảm false positive
            }
            
            # Thử auto-detect trước
            result = model.transcribe(str(audio_file), **transcribe_options)
            detected_lang = result.get('language', 'unknown')
            logger.info(f"Auto-detected language: {detected_lang}")
            
            # Nếu ngôn ngữ được detect khác với yêu cầu, thử lại
            if language != "ja" and detected_lang != language and detected_lang != "unknown":
                logger.info(f"Re-transcribing with detected language: {detected_lang}")
                transcribe_options["language"] = detected_lang
                result = model.transcribe(str(audio_file), **transcribe_options)
            
            # Tạo SRT content
            srt_content = self._whisper_to_srt(result)
            
            # Lưu file SRT
            audio_file = Path(audio_path)
            srt_filename = f"{audio_file.stem}_subtitle.srt"
            srt_path = self.temp_dir / srt_filename
            
            with open(srt_path, 'w', encoding='utf-8-sig') as f:  # UTF-8 with BOM
                f.write(srt_content)
            
            # Đếm số subtitle
            subtitle_count = len([line for line in srt_content.split('\n') if line.strip() and '-->' in line])
            
            # Lấy ngôn ngữ thực tế từ result
            actual_language = result.get('language', language)
            
            return {
                "success": True,
                "message": f"✅ Convert thành công bằng Local Whisper (MIỄN PHÍ)!\n\nFile gốc: {audio_file.name}\nFile SRT: {srt_filename}\nSố subtitle: {subtitle_count}\nNgôn ngữ: {actual_language}",
                "srt_path": str(srt_path),
                "srt_filename": srt_filename,
                "subtitle_count": subtitle_count,
                "language": actual_language,
                "model": "local-whisper",
                "method": "Local Whisper (Free)"
            }
            
        except ImportError:
            logger.info("Local whisper not available, using sample SRT")
            return {"success": False, "error": "Local whisper not installed"}
        except Exception as e:
            logger.error(f"Local whisper error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _whisper_to_srt(self, whisper_result) -> str:
        """Convert whisper result to SRT format"""
        srt_content = ""
        segments = whisper_result.get("segments", [])
        
        for i, segment in enumerate(segments, 1):
            start_time = self._format_timestamp(segment["start"])
            end_time = self._format_timestamp(segment["end"])
            text = segment["text"].strip()
            
            # Làm sạch text
            text = self._clean_text(text)
            
            # Bỏ qua segment rỗng hoặc quá ngắn
            if len(text) < 2:
                continue
                
            srt_content += f"{i}\n"
            srt_content += f"{start_time} --> {end_time}\n"
            srt_content += f"{text}\n\n"
        
        return srt_content
    
    def _clean_text(self, text: str) -> str:
        """Làm sạch text từ whisper"""
        # Loại bỏ ký tự đặc biệt
        import re
        
        # Loại bỏ [MUSIC], [APPLAUSE], etc.
        text = re.sub(r'\[.*?\]', '', text)
        
        # Loại bỏ ký tự không in được
        text = re.sub(r'[^\w\s\.,!?;:\-\(\)\'\"àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]', '', text)
        
        # Chuẩn hóa khoảng trắng
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _format_timestamp(self, seconds: float) -> str:
        """Format timestamp for SRT"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    async def _create_sample_srt_file(self, audio_path: str, language: str) -> Dict[str, Any]:
        """Tạo file SRT mẫu"""
        try:
            audio_file = Path(audio_path)
            srt_filename = f"{audio_file.stem}_subtitle.srt"
            srt_path = self.temp_dir / srt_filename
            
            # Tạo SRT mẫu (placeholder)
            sample_srt = self._create_sample_srt(audio_file.name, language)
            
            with open(srt_path, 'w', encoding='utf-8') as f:
                f.write(sample_srt)
            
            return {
                "success": True,
                "message": f"⚠️ Tạo SRT mẫu (MIỄN PHÍ)\n\nFile gốc: {audio_file.name}\nFile SRT: {srt_filename}\n\nĐể có SRT thực tế:\n1. Cài đặt local whisper: pip install openai-whisper\n2. Hoặc thêm OPENAI_API_KEY vào .env\n3. Restart backend và convert lại",
                "srt_path": str(srt_path),
                "srt_filename": srt_filename,
                "subtitle_count": 3,
                "language": language,
                "model": "sample",
                "method": "Sample SRT (Free)",
                "is_sample": True
            }
            
        except Exception as e:
            logger.error(f"Lỗi tạo sample SRT: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _create_sample_srt(self, filename: str, language: str) -> str:
        """Tạo SRT mẫu"""
        if language == "ja":
            sample_text = [
                "こんにちは、元気ですか？",
                "今日は天気がいいですね。",
                "ありがとうございました。"
            ]
        else:
            sample_text = [
                "Hello, how are you?",
                "The weather is nice today.",
                "Thank you very much."
            ]
        
        srt_content = ""
        for i, text in enumerate(sample_text, 1):
            start_time = f"00:00:{i-1:02d},000"
            end_time = f"00:00:{i:02d},000"
            srt_content += f"{i}\n"
            srt_content += f"{start_time} --> {end_time}\n"
            srt_content += f"{text}\n\n"
        
        return srt_content
    
    async def list_srt_files(self) -> Dict[str, Any]:
        """Liệt kê các file SRT đã tạo"""
        try:
            files = []
            for file_path in self.temp_dir.glob("*.srt"):
                files.append({
                    "filename": file_path.name,
                    "size": file_path.stat().st_size,
                    "created": file_path.stat().st_ctime,
                    "path": str(file_path)
                })
            
            return {
                "success": True,
                "files": files,
                "srt_dir": str(self.temp_dir.absolute())
            }
            
        except Exception as e:
            logger.error(f"Lỗi liệt kê SRT files: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_srt_file(self, filename: str) -> Dict[str, Any]:
        """Xóa file SRT"""
        try:
            file_path = self.temp_dir / filename
            
            if not file_path.exists():
                raise Exception("File không tồn tại")
            
            file_path.unlink()
            
            return {
                "success": True,
                "message": f"Đã xóa file SRT: {filename}"
            }
            
        except Exception as e:
            logger.error(f"Lỗi xóa SRT file: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_srt_content(self, filename: str) -> Dict[str, Any]:
        """Lấy nội dung file SRT"""
        try:
            file_path = self.temp_dir / filename
            
            if not file_path.exists():
                raise Exception("File không tồn tại")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "success": True,
                "content": content,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"Lỗi đọc SRT file: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format kích thước file"""
        if size_bytes == 0:
            return "0 Bytes"
        
        size_names = ["Bytes", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f} {size_names[i]}"
    
    def _resolve_audio_path(self, audio_path: str) -> Path:
        """Xử lý đường dẫn file audio"""
        # Nếu là đường dẫn tuyệt đối
        if Path(audio_path).is_absolute():
            return Path(audio_path)
        
        # Nếu chỉ có tên file, tìm trong các thư mục
        if not "/" in audio_path and not "\\" in audio_path:
            # Tìm trong thư mục temp
            temp_path = Path("temp") / audio_path
            if temp_path.exists():
                return temp_path
            
            # Tìm trong thư mục YouTube
            youtube_path = Path(r"C:\Users\thanh\OneDrive\Máy tính\YoutubeFile") / audio_path
            if youtube_path.exists():
                return youtube_path
            
            # Nếu không tìm thấy file, tìm file đầu tiên trong thư mục YouTube
            youtube_dir = Path(r"C:\Users\thanh\OneDrive\Máy tính\YoutubeFile")
            if youtube_dir.exists() and audio_path == "YoutubeFile":
                # Tìm file video/audio đầu tiên
                for file in youtube_dir.glob("*"):
                    if file.is_file() and file.suffix.lower() in ['.mp4', '.mp3', '.wav', '.m4a', '.webm']:
                        logger.info(f"Found audio file: {file}")
                        return file
        
        # Trả về đường dẫn gốc
        return Path(audio_path)
    
    def _find_audio_file(self, filename: str) -> Optional[Path]:
        """Tìm file audio trong các thư mục"""
        search_dirs = [
            Path("temp"),
            Path(r"C:\Users\thanh\OneDrive\Máy tính\YoutubeFile"),
            Path("."),
        ]
        
        for search_dir in search_dirs:
            if search_dir.exists():
                # Tìm file chính xác
                file_path = search_dir / filename
                if file_path.exists():
                    return file_path
                
                # Tìm file có tên tương tự
                for file in search_dir.glob("*"):
                    if file.is_file() and filename.lower() in file.name.lower():
                        return file
        
        return None
