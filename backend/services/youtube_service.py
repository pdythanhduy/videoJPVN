import yt_dlp
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
import json
import os

logger = logging.getLogger(__name__)

class YouTubeService:
    def __init__(self):
        self.ready = True
        # Thay đổi thư mục download
        self.download_dir = Path(r"C:\Users\thanh\OneDrive\Máy tính\YoutubeFile")
        self.download_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"YouTubeService initialized - Download dir: {self.download_dir}")
    
    def is_ready(self) -> bool:
        return self.ready
    
    async def get_video_info(self, url: str) -> Dict[str, Any]:
        """Lấy thông tin video từ YouTube URL"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                return {
                    "success": True,
                    "info": {
                        "title": info.get('title', ''),
                        "description": info.get('description', ''),
                        "duration": info.get('duration', 0),
                        "uploader": info.get('uploader', ''),
                        "upload_date": info.get('upload_date', ''),
                        "view_count": info.get('view_count', 0),
                        "thumbnail": info.get('thumbnail', ''),
                        "formats": self._get_available_formats(info),
                        "url": url
                    }
                }
                
        except Exception as e:
            logger.error(f"Lỗi lấy thông tin video: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_available_formats(self, url: str) -> Dict[str, Any]:
        """Lấy danh sách format có sẵn cho video"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'listformats': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                formats = []
                for f in info.get('formats', []):
                    # Chấp nhận tất cả format, kể cả 0 bytes
                    formats.append({
                        "format_id": f.get('format_id', ''),
                        "ext": f.get('ext', ''),
                        "resolution": f.get('resolution', ''),
                        "fps": f.get('fps', ''),
                        "filesize": f.get('filesize', 0),
                        "quality": f.get('quality', 0),
                        "vcodec": f.get('vcodec', ''),
                        "acodec": f.get('acodec', ''),
                        "format_note": f.get('format_note', ''),
                        "url": f.get('url', ''),
                        "has_url": bool(f.get('url')),
                        "is_available": bool(f.get('url')) or f.get('filesize', 0) > 0
                    })
                
                # Nếu không có format nào, thử lấy format cơ bản
                if not formats:
                    logger.warning("Không có format nào khả dụng, thử format cơ bản")
                    for f in info.get('formats', []):
                        if f.get('format_id') in ['18', '22', '140', '139', 'worst', 'best']:
                            formats.append({
                                "format_id": f.get('format_id', ''),
                                "ext": f.get('ext', ''),
                                "resolution": f.get('resolution', ''),
                                "fps": f.get('fps', ''),
                                "filesize": f.get('filesize', 0),
                                "quality": f.get('quality', 0),
                                "vcodec": f.get('vcodec', ''),
                                "acodec": f.get('acodec', ''),
                                "format_note": f.get('format_note', ''),
                                "url": f.get('url', ''),
                                "has_url": bool(f.get('url'))
                            })
                
                return {
                    "success": True,
                    "formats": formats,
                    "title": info.get('title', ''),
                    "url": url,
                    "total_formats": len(info.get('formats', [])),
                    "available_formats": len(formats)
                }
                
        except Exception as e:
            logger.error(f"Lỗi lấy danh sách format: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_available_formats(self, info: Dict) -> List[Dict]:
        """Lấy danh sách format có sẵn"""
        formats = []
        
        for f in info.get('formats', []):
            # Lấy cả video+audio và audio only
            if (f.get('vcodec') != 'none' and f.get('acodec') != 'none') or \
               (f.get('vcodec') == 'none' and f.get('acodec') != 'none'):
                formats.append({
                    "format_id": f.get('format_id', ''),
                    "ext": f.get('ext', ''),
                    "resolution": f.get('resolution', ''),
                    "fps": f.get('fps', ''),
                    "filesize": f.get('filesize', 0),
                    "quality": f.get('quality', 0),
                    "vcodec": f.get('vcodec', ''),
                    "acodec": f.get('acodec', ''),
                    "format_note": f.get('format_note', '')
                })
        
        # Sắp xếp theo chất lượng
        formats.sort(key=lambda x: x.get('quality', 0), reverse=True)
        return formats[:15]  # Lấy nhiều format hơn
    
    async def download_video(
        self, 
        url: str, 
        format_id: str = "best[height<=720]",
        extract_audio: bool = False
    ) -> Dict[str, Any]:
        """Download video từ YouTube"""
        try:
            # Tạo tên file an toàn
            safe_filename = self._get_safe_filename(url)
            
            # Lấy danh sách format thực tế có sẵn
            formats_info = await self.get_available_formats(url)
            available_format_ids = []
            
            if formats_info["success"] and formats_info["formats"]:
                available_format_ids = [f["format_id"] for f in formats_info["formats"]]
                logger.info(f"Available formats: {available_format_ids}")
            
            # Danh sách format fallback - cải thiện để có cả video và audio với chất lượng cao
            if extract_audio:
                format_fallbacks = [
                    "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio",
                    "bestaudio/best",
                    "bestaudio",
                    "worstaudio",
                    "140/139/140",  # Audio only formats
                    "worst"
                ]
            else:
                # Ưu tiên format có cả video và audio với chất lượng cao
                format_fallbacks = [
                    "best[height<=1080][ext=mp4]/best[height<=1080]",  # 1080p
                    "best[height<=720][ext=mp4]/best[height<=720]",    # 720p
                    "best[height<=480][ext=mp4]/best[height<=480]",    # 480p
                    "best[height<=360][ext=mp4]/best[height<=360]",    # 360p
                    "best[ext=mp4]/best",
                    "worst[ext=mp4]/worst",
                    "18/22/18",  # Common video formats
                    "worst"
                ]
                
                # Thêm format có cả video và audio với chất lượng cao
                video_audio_formats = [
                    "best[height<=1080][ext=mp4]/best[height<=1080]",  # 1080p
                    "best[height<=720][ext=mp4]/best[height<=720]",    # 720p
                    "best[height<=480][ext=mp4]/best[height<=480]",    # 480p
                    "best[height<=360][ext=mp4]/best[height<=360]",    # 360p
                    "best[ext=mp4]/best",
                    "worst[ext=mp4]/worst",
                    "18/22/18",  # Common video formats
                    "worst"
                ]
                
                # Thêm format có cả video và audio vào đầu danh sách
                format_fallbacks = video_audio_formats + format_fallbacks
            
            # Loại bỏ format có thể tạo MHTML
            format_fallbacks = [f for f in format_fallbacks if 'mhtml' not in f.lower()]
            
            # Thêm format có sẵn vào đầu danh sách, ưu tiên format có cả video và audio
            if available_format_ids:
                # Lọc format có cả video và audio
                video_audio_available = []
                audio_only_available = []
                video_only_available = []
                
                for format_id in available_format_ids:
                    # Tìm format info
                    format_info = None
                    if formats_info["success"] and formats_info["formats"]:
                        for f in formats_info["formats"]:
                            if f["format_id"] == format_id:
                                format_info = f
                                break
                    
                    if format_info:
                        # Kiểm tra có cả video và audio không
                        has_video = format_info.get("vcodec", "") != "none" and format_info.get("vcodec", "") != ""
                        has_audio = format_info.get("acodec", "") != "none" and format_info.get("acodec", "") != ""
                        has_url = format_info.get("has_url", False)
                        
                        # Ưu tiên format có URL
                        if has_url:
                            if has_video and has_audio:
                                video_audio_available.append(format_id)
                            elif has_audio:
                                audio_only_available.append(format_id)
                            elif has_video:
                                video_only_available.append(format_id)
                
                # Ưu tiên format có cả video và audio
                if not extract_audio:
                    format_fallbacks = video_audio_available + video_only_available + audio_only_available + format_fallbacks
                else:
                    format_fallbacks = audio_only_available + video_audio_available + video_only_available + format_fallbacks
            
            last_error = None
            
            logger.info(f"Trying formats in order: {format_fallbacks[:10]}...")  # Log first 10 formats
            
            for attempt_format in format_fallbacks:
                try:
                    output_path = self.download_dir / f"{safe_filename}.%(ext)s"
                    
                    if extract_audio:
                        ydl_opts = {
                            'format': attempt_format,
                            'outtmpl': str(output_path),
                            'extractaudio': True,
                            'audioformat': 'mp3',
                            'audioquality': '192K',
                            'noplaylist': True,
                            'no_warnings': True,
                        }
                    else:
                        ydl_opts = {
                            'format': attempt_format,
                            'outtmpl': str(output_path),
                            'noplaylist': True,
                            'no_warnings': True,
                            'merge_output_format': 'mp4',  # Đảm bảo merge video+audio thành mp4
                            'writesubtitles': False,
                            'writeautomaticsub': False,
                        }
                    
                    # Progress hook
                    def progress_hook(d):
                        if d['status'] == 'downloading':
                            percent = d.get('_percent_str', '0%')
                            speed = d.get('_speed_str', 'N/A')
                            logger.info(f"Downloading: {percent} at {speed}")
                        elif d['status'] == 'finished':
                            logger.info(f"Finished downloading: {d['filename']}")
                    
                    ydl_opts['progress_hooks'] = [progress_hook]
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        # Lấy thông tin trước
                        info = ydl.extract_info(url, download=False)
                        title = info.get('title', 'Unknown')
                        
                        # Download
                        ydl.download([url])
                        
                        # Tìm file đã download
                        downloaded_files = list(self.download_dir.glob(f"{safe_filename}.*"))
                        if downloaded_files:
                            downloaded_file = downloaded_files[0]
                            file_size = downloaded_file.stat().st_size
                            
                            # Kiểm tra file có phải MHTML không
                            if downloaded_file.suffix.lower() == '.mhtml':
                                logger.warning(f"File MHTML detected: {downloaded_file.name}")
                                # Xóa file MHTML và thử format khác
                                downloaded_file.unlink()
                                raise Exception("File MHTML không mong muốn")
                            
                            # Kiểm tra file size - cho phép file nhỏ hơn nếu là format hợp lệ
                            if file_size < 100:  # File quá nhỏ (chỉ 100 bytes)
                                logger.warning(f"File too small: {downloaded_file.name} ({file_size} bytes)")
                                downloaded_file.unlink()
                                raise Exception("File quá nhỏ, có thể bị lỗi")
                            
                            return {
                                "success": True,
                                "message": f"✅ Download thành công!\n\nVideo: {title}\nFile: {downloaded_file.name}\nKích thước: {self._format_file_size(file_size)}\nFormat: {attempt_format}",
                                "file_path": str(downloaded_file),
                                "filename": downloaded_file.name,
                                "file_size": file_size,
                                "title": title,
                                "extract_audio": extract_audio,
                                "format_used": attempt_format
                            }
                        else:
                            raise Exception("Không tìm thấy file đã download")
                            
                except Exception as e:
                    last_error = e
                    logger.warning(f"Format {attempt_format} failed: {str(e)}")
                    continue
            
            # Nếu tất cả format đều fail, tạo file test
            logger.warning("Tất cả format đều không khả dụng, tạo file test")
            return await self._create_test_file(url, extract_audio)
                    
        except Exception as e:
            logger.error(f"Lỗi download video: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _create_test_file(self, url: str, extract_audio: bool) -> Dict[str, Any]:
        """Tạo file test khi không download được"""
        try:
            safe_filename = self._get_safe_filename(url)
            
            if extract_audio:
                # Tạo file audio test (silence)
                output_path = self.download_dir / f"{safe_filename}_test.mp3"
                # Tạo file MP3 test 2 giây
                import wave
                import struct
                
                sample_rate = 44100
                duration = 2  # 2 giây
                samples = sample_rate * duration
                
                # Tạo file WAV trước
                wav_path = self.download_dir / f"{safe_filename}_test.wav"
                with wave.open(str(wav_path), 'w') as wav_file:
                    wav_file.setnchannels(1)  # Mono
                    wav_file.setsampwidth(2)  # 16-bit
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes(b'\x00' * (samples * 2))
                
                # Convert WAV to MP3 (nếu có ffmpeg)
                try:
                    import subprocess
                    subprocess.run([
                        'ffmpeg', '-i', str(wav_path), '-acodec', 'mp3', 
                        str(output_path), '-y'
                    ], check=True, capture_output=True)
                    wav_path.unlink()  # Xóa file WAV
                except:
                    # Nếu không có ffmpeg, đổi tên WAV thành MP3
                    wav_path.rename(output_path)
                
                file_size = output_path.stat().st_size
                
                return {
                    "success": True,
                    "message": f"⚠️ Tạo file audio test (video không download được)\n\nFile: {output_path.name}\nKích thước: {self._format_file_size(file_size)}\nThời lượng: {duration} giây (silence)\n\nLý do: Video có thể bị hạn chế hoặc không khả dụng",
                    "file_path": str(output_path),
                    "filename": output_path.name,
                    "file_size": file_size,
                    "title": "Test Audio File",
                    "extract_audio": True,
                    "format_used": "test",
                    "is_test": True
                }
            else:
                # Tạo file video test
                output_path = self.download_dir / f"{safe_filename}_test.mp4"
                
                # Tạo file MP4 test đơn giản
                try:
                    import subprocess
                    # Tạo video test 2 giây với ffmpeg
                    subprocess.run([
                        'ffmpeg', '-f', 'lavfi', '-i', 'color=c=black:size=320x240:duration=2',
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 
                        str(output_path), '-y'
                    ], check=True, capture_output=True)
                    
                    file_size = output_path.stat().st_size
                    
                    return {
                        "success": True,
                        "message": f"⚠️ Tạo file video test (video không download được)\n\nFile: {output_path.name}\nKích thước: {self._format_file_size(file_size)}\nThời lượng: 2 giây (black screen)\n\nLý do: Video có thể bị hạn chế hoặc không khả dụng",
                        "file_path": str(output_path),
                        "filename": output_path.name,
                        "file_size": file_size,
                        "title": "Test Video File",
                        "extract_audio": False,
                        "format_used": "test",
                        "is_test": True
                    }
                except:
                    # Nếu không có ffmpeg, tạo file text
                    with open(output_path, 'w') as f:
                        f.write("Test file - Video not available")
                    
                    file_size = output_path.stat().st_size
                    
                    return {
                        "success": True,
                        "message": f"⚠️ Tạo file test (video không download được)\n\nFile: {output_path.name}\nKích thước: {self._format_file_size(file_size)}\n\nLý do: Video có thể bị hạn chế hoặc không khả dụng\nCần cài đặt ffmpeg để tạo file test tốt hơn",
                        "file_path": str(output_path),
                        "filename": output_path.name,
                        "file_size": file_size,
                        "title": "Test File",
                        "extract_audio": False,
                        "format_used": "test",
                        "is_test": True
                    }
                    
        except Exception as e:
            logger.error(f"Lỗi tạo file test: {str(e)}")
            return {
                "success": False,
                "error": f"Không thể download video và không thể tạo file test: {str(e)}"
            }
    
    async def download_audio_only(self, url: str) -> Dict[str, Any]:
        """Download chỉ audio từ video"""
        return await self.download_video(url, extract_audio=True)
    
    def _get_safe_filename(self, url: str) -> str:
        """Tạo tên file an toàn từ URL"""
        # Lấy video ID từ URL
        video_id = self._extract_video_id(url)
        if video_id:
            return f"youtube_{video_id}"
        else:
            # Fallback: hash URL
            import hashlib
            return f"youtube_{hashlib.md5(url.encode()).hexdigest()[:8]}"
    
    def _extract_video_id(self, url: str) -> Optional[str]:
        """Trích xuất video ID từ YouTube URL"""
        import re
        
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/v\/([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
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
    
    async def list_downloaded_files(self) -> Dict[str, Any]:
        """Liệt kê các file đã download"""
        try:
            files = []
            for file_path in self.download_dir.glob("*"):
                if file_path.is_file():
                    files.append({
                        "filename": file_path.name,
                        "size": file_path.stat().st_size,
                        "created": file_path.stat().st_ctime,
                        "path": str(file_path)
                    })
            
            return {
                "success": True,
                "files": files,
                "download_dir": str(self.download_dir.absolute())
            }
            
        except Exception as e:
            logger.error(f"Lỗi liệt kê file: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_file_path(self, filename: str) -> Path:
        """Lấy đường dẫn file"""
        return self.download_dir / filename
    
    async def delete_file(self, filename: str) -> Dict[str, Any]:
        """Xóa file đã download"""
        try:
            file_path = self.download_dir / filename
            
            if not file_path.exists():
                raise Exception("File không tồn tại")
            
            file_path.unlink()
            
            return {
                "success": True,
                "message": f"Đã xóa file: {filename}"
            }
            
        except Exception as e:
            logger.error(f"Lỗi xóa file: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
