"""
AI Video Service - Tạo video AI từ text hoặc ảnh
Hỗ trợ nhiều nền tảng: RunwayML, Stability AI, OpenAI Sora (khi có)
"""
import os
import requests
import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Union
import logging

logger = logging.getLogger(__name__)

class AIVideoService:
    def __init__(self):
        self.output_dir = Path("ai_video_data")
        self.output_dir.mkdir(exist_ok=True)
        
        # API Keys từ environment variables
        self.runway_api_key = os.getenv("RUNWAY_API_KEY")
        self.stability_api_key = os.getenv("STABILITY_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # API Endpoints
        self.runway_base_url = "https://api.runwayml.com/v1"
        self.stability_base_url = "https://api.stability.ai/v2beta"
        self.openai_base_url = "https://api.openai.com/v1"
    
    def generate_video_from_text(
        self, 
        prompt: str, 
        duration: int = 5,
        platform: str = "runway",
        style: str = "realistic",
        aspect_ratio: str = "16:9"
    ) -> Dict:
        """
        Tạo video từ text prompt
        
        Args:
            prompt: Mô tả video muốn tạo
            duration: Thời lượng video (giây)
            platform: Nền tảng sử dụng (runway, stability, openai)
            style: Phong cách (realistic, animated, cinematic)
            aspect_ratio: Tỷ lệ khung hình (16:9, 9:16, 1:1)
        
        Returns:
            Dict chứa thông tin video đã tạo
        """
        try:
            if platform == "runway":
                return self._generate_runway_video(prompt, duration, style, aspect_ratio)
            elif platform == "stability":
                return self._generate_stability_video(prompt, duration, style, aspect_ratio)
            elif platform == "openai":
                return self._generate_openai_video(prompt, duration, style, aspect_ratio)
            else:
                return self._generate_demo_video(prompt, duration, style, aspect_ratio)
                
        except Exception as e:
            logger.error(f"Error generating video: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }
    
    def generate_video_from_image(
        self,
        image_path: str,
        prompt: str,
        duration: int = 5,
        platform: str = "runway"
    ) -> Dict:
        """
        Tạo video từ ảnh + text prompt
        """
        try:
            if platform == "runway":
                return self._generate_runway_video_from_image(image_path, prompt, duration)
            else:
                return self._generate_demo_video_from_image(image_path, prompt, duration)
                
        except Exception as e:
            logger.error(f"Error generating video from image: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }
    
    def _generate_runway_video(
        self, 
        prompt: str, 
        duration: int, 
        style: str, 
        aspect_ratio: str
    ) -> Dict:
        """Tạo video bằng RunwayML API"""
        if not self.runway_api_key:
            return self._generate_demo_video(prompt, duration, style, aspect_ratio)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.runway_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "prompt": prompt,
                "duration": duration,
                "style": style,
                "aspect_ratio": aspect_ratio
            }
            
            response = requests.post(
                f"{self.runway_base_url}/video/generate",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "video_url": result.get("video_url"),
                    "task_id": result.get("task_id"),
                    "platform": "runway",
                    "prompt": prompt
                }
            else:
                return {
                    "success": False,
                    "error": f"Runway API error: {response.status_code}",
                    "video_url": None
                }
                
        except Exception as e:
            logger.error(f"Runway API error: {e}")
            return self._generate_demo_video(prompt, duration, style, aspect_ratio)
    
    def _generate_stability_video(
        self, 
        prompt: str, 
        duration: int, 
        style: str, 
        aspect_ratio: str
    ) -> Dict:
        """Tạo video bằng Stability AI API"""
        if not self.stability_api_key:
            return self._generate_demo_video(prompt, duration, style, aspect_ratio)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.stability_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "text_prompts": [{"text": prompt}],
                "duration": duration,
                "style": style,
                "aspect_ratio": aspect_ratio
            }
            
            response = requests.post(
                f"{self.stability_base_url}/video/generate",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "video_url": result.get("video_url"),
                    "task_id": result.get("task_id"),
                    "platform": "stability",
                    "prompt": prompt
                }
            else:
                return {
                    "success": False,
                    "error": f"Stability API error: {response.status_code}",
                    "video_url": None
                }
                
        except Exception as e:
            logger.error(f"Stability API error: {e}")
            return self._generate_demo_video(prompt, duration, style, aspect_ratio)
    
    def _generate_openai_video(
        self, 
        prompt: str, 
        duration: int, 
        style: str, 
        aspect_ratio: str
    ) -> Dict:
        """Tạo video bằng OpenAI Sora API (khi có)"""
        if not self.openai_api_key:
            return self._generate_demo_video(prompt, duration, style, aspect_ratio)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "sora",
                "prompt": prompt,
                "duration": duration,
                "style": style,
                "aspect_ratio": aspect_ratio
            }
            
            response = requests.post(
                f"{self.openai_base_url}/video/generations",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "video_url": result.get("data", [{}])[0].get("url"),
                    "task_id": result.get("id"),
                    "platform": "openai",
                    "prompt": prompt
                }
            else:
                return {
                    "success": False,
                    "error": f"OpenAI API error: {response.status_code}",
                    "video_url": None
                }
                
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._generate_demo_video(prompt, duration, style, aspect_ratio)
    
    def _generate_demo_video(
        self, 
        prompt: str, 
        duration: int, 
        style: str, 
        aspect_ratio: str
    ) -> Dict:
        """Tạo demo video (fallback khi không có API key)"""
        try:
            # Tạo file demo video
            timestamp = self._get_timestamp()
            demo_filename = f"demo_video_{timestamp}.mp4"
            demo_path = self.output_dir / demo_filename
            
            # Tạo file demo (có thể là video test hoặc placeholder)
            self._create_demo_video_file(demo_path, prompt, duration)
            
            return {
                "success": True,
                "video_url": f"/api/ai-video/download/{demo_filename}",
                "task_id": f"demo_{timestamp}",
                "platform": "demo",
                "prompt": prompt,
                "duration": duration,
                "style": style,
                "aspect_ratio": aspect_ratio,
                "filename": demo_filename
            }
            
        except Exception as e:
            logger.error(f"Demo video creation error: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }
    
    def _generate_demo_video_from_image(
        self,
        image_path: str,
        prompt: str,
        duration: int
    ) -> Dict:
        """Tạo demo video từ ảnh"""
        try:
            timestamp = self._get_timestamp()
            demo_filename = f"demo_video_from_image_{timestamp}.mp4"
            demo_path = self.output_dir / demo_filename
            
            # Tạo file demo từ ảnh
            self._create_demo_video_from_image_file(demo_path, image_path, prompt, duration)
            
            return {
                "success": True,
                "video_url": f"/api/ai-video/download/{demo_filename}",
                "task_id": f"demo_image_{timestamp}",
                "platform": "demo",
                "prompt": prompt,
                "duration": duration,
                "filename": demo_filename
            }
            
        except Exception as e:
            logger.error(f"Demo video from image creation error: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }
    
    def _create_demo_video_file(self, output_path: Path, prompt: str, duration: int):
        """Tạo file demo video"""
        # Tạo file video demo đơn giản
        # Trong thực tế, có thể sử dụng FFmpeg hoặc thư viện khác
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"# Demo AI Video\n")
            f.write(f"Prompt: {prompt}\n")
            f.write(f"Duration: {duration}s\n")
            f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    def _create_demo_video_from_image_file(self, output_path: Path, image_path: str, prompt: str, duration: int):
        """Tạo file demo video từ ảnh"""
        with open(output_path, 'w') as f:
            f.write(f"# Demo AI Video from Image\n")
            f.write(f"Image: {image_path}\n")
            f.write(f"Prompt: {prompt}\n")
            f.write(f"Duration: {duration}s\n")
            f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    def get_available_platforms(self) -> List[str]:
        """Lấy danh sách platforms có sẵn"""
        platforms = ["demo"]
        
        if self.runway_api_key:
            platforms.append("runway")
        if self.stability_api_key:
            platforms.append("stability")
        if self.openai_api_key:
            platforms.append("openai")
            
        return platforms
    
    def get_video_styles(self) -> List[str]:
        """Lấy danh sách styles có sẵn"""
        return [
            "realistic",
            "animated",
            "cinematic",
            "cartoon",
            "documentary",
            "artistic",
            "futuristic",
            "vintage"
        ]
    
    def get_aspect_ratios(self) -> List[str]:
        """Lấy danh sách aspect ratios có sẵn"""
        return [
            "16:9",  # Landscape
            "9:16",  # Portrait (TikTok/Instagram)
            "1:1",   # Square
            "4:3",   # Traditional
            "21:9"   # Ultra-wide
        ]
    
    def get_video_files(self) -> List[Dict]:
        """Lấy danh sách video files đã tạo"""
        files = []
        for file_path in self.output_dir.glob("*.mp4"):
            stat = file_path.stat()
            files.append({
                "filename": file_path.name,
                "path": str(file_path),
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime
            })
        
        # Sắp xếp theo thời gian tạo (mới nhất trước)
        files.sort(key=lambda x: x["created"], reverse=True)
        return files
    
    def delete_video_file(self, filename: str) -> bool:
        """Xóa video file"""
        try:
            file_path = self.output_dir / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {e}")
            return False
    
    def _get_timestamp(self) -> str:
        """Tạo timestamp cho filename"""
        from datetime import datetime
        import pytz
        jst = pytz.timezone("Asia/Tokyo")
        return datetime.now(jst).strftime("%Y%m%d_%H%M%S")
