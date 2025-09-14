"""
Video Review Service - Tạo video review từ video gốc
Hỗ trợ tạo script review, voice-over, và video review hoàn chỉnh
"""
import os
import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Union
import logging
from datetime import datetime
import pytz

from .video_processor import VideoProcessor
from .stt_service import STTService
from .tts_service import TTSService
from .subtitle_processor import SubtitleProcessor

logger = logging.getLogger(__name__)

class VideoReviewService:
    def __init__(self):
        self.output_dir = Path("video_review_data")
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize services
        self.video_processor = VideoProcessor()
        self.stt_service = STTService()
        self.tts_service = TTSService()
        self.subtitle_processor = SubtitleProcessor()
        
        # Review templates
        self.review_templates = {
            "tech_review": {
                "intro": "Xin chào các bạn, hôm nay mình sẽ review về {product_name}",
                "pros": "Ưu điểm của sản phẩm này là:",
                "cons": "Nhược điểm cần lưu ý:",
                "conclusion": "Tổng kết lại, đây là một sản phẩm {rating}",
                "outro": "Cảm ơn các bạn đã xem, đừng quên like và subscribe nhé!"
            },
            "product_review": {
                "intro": "Chào mọi người, hôm nay mình sẽ đánh giá chi tiết về {product_name}",
                "features": "Các tính năng nổi bật:",
                "performance": "Về hiệu suất:",
                "price": "Về giá cả:",
                "conclusion": "Kết luận: {rating}",
                "outro": "Nếu thích video này, hãy like và share nhé!"
            },
            "general_review": {
                "intro": "Hôm nay mình sẽ chia sẻ về {topic}",
                "main_points": "Những điểm chính mình muốn nói:",
                "details": "Chi tiết hơn:",
                "conclusion": "Tóm lại:",
                "outro": "Cảm ơn các bạn đã theo dõi!"
            }
        }
    
    def create_video_review(
        self,
        video_path: str,
        review_type: str = "general_review",
        product_name: str = "",
        custom_script: str = "",
        voice_settings: Dict = None
    ) -> Dict:
        """
        Tạo video review từ video gốc
        
        Args:
            video_path: Đường dẫn video gốc
            review_type: Loại review (tech_review, product_review, general_review)
            product_name: Tên sản phẩm (nếu có)
            custom_script: Script tùy chỉnh (nếu có)
            voice_settings: Cài đặt giọng nói
        
        Returns:
            Dict chứa thông tin video review đã tạo
        """
        try:
            timestamp = self._get_timestamp()
            review_id = f"review_{timestamp}"
            
            # Tạo thư mục cho review này
            review_dir = self.output_dir / review_id
            review_dir.mkdir(exist_ok=True)
            
            # 1. Phân tích video gốc
            video_analysis = self._analyze_video(video_path)
            
            # 2. Tạo script review
            if custom_script:
                script = custom_script
            else:
                script = self._generate_review_script(
                    video_analysis, 
                    review_type, 
                    product_name
                )
            
            # 3. Tạo voice-over
            voice_settings = voice_settings or {"voice": "vi-VN-Standard-A", "speed": 1.0}
            audio_path = self._create_voiceover(script, voice_settings, review_dir)
            
            # 4. Tạo phụ đề
            subtitle_path = self._create_subtitles(script, review_dir)
            
            # 5. Tạo video review (kết hợp video gốc + voice-over + phụ đề)
            final_video_path = self._create_final_review_video(
                video_path, audio_path, subtitle_path, review_dir
            )
            
            # 6. Lưu metadata
            metadata = {
                "review_id": review_id,
                "original_video": video_path,
                "script": script,
                "audio_path": str(audio_path),
                "subtitle_path": str(subtitle_path),
                "final_video": str(final_video_path),
                "review_type": review_type,
                "product_name": product_name,
                "created_at": timestamp,
                "voice_settings": voice_settings
            }
            
            metadata_path = review_dir / "metadata.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            return {
                "success": True,
                "review_id": review_id,
                "script": script,
                "audio_url": f"/api/video-review/audio/{review_id}",
                "subtitle_url": f"/api/video-review/subtitle/{review_id}",
                "video_url": f"/api/video-review/video/{review_id}",
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error creating video review: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _analyze_video(self, video_path: str) -> Dict:
        """Phân tích video gốc để tạo script review"""
        try:
            # Lấy thông tin video
            import asyncio
            video_info = asyncio.run(self.video_processor.process_video(Path(video_path)))
            
            # Trích xuất audio để phân tích
            audio_path = self._extract_audio(video_path)
            
            # Chuyển đổi speech to text
            transcript = self.stt_service.transcribe_audio(audio_path)
            
            # Phân tích nội dung (đơn giản)
            analysis = {
                "duration": video_info.get("video_info", {}).get("duration", 0),
                "transcript": transcript,
                "key_topics": self._extract_key_topics(transcript),
                "sentiment": self._analyze_sentiment(transcript),
                "video_quality": video_info.get("video_info", {})
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing video: {e}")
            return {"duration": 0, "transcript": "", "key_topics": [], "sentiment": "neutral"}
    
    def _generate_review_script(
        self, 
        video_analysis: Dict, 
        review_type: str, 
        product_name: str
    ) -> str:
        """Tạo script review dựa trên phân tích video"""
        try:
            template = self.review_templates.get(review_type, self.review_templates["general_review"])
            
            # Thay thế placeholders
            script_parts = []
            
            # Intro
            intro = template["intro"].format(product_name=product_name or "sản phẩm này")
            script_parts.append(intro)
            
            # Dựa trên transcript để tạo nội dung
            transcript = video_analysis.get("transcript", "")
            key_topics = video_analysis.get("key_topics", [])
            
            if key_topics:
                script_parts.append(f"Dựa trên video, mình thấy có những điểm chính sau:")
                for topic in key_topics[:3]:  # Lấy 3 topic chính
                    script_parts.append(f"- {topic}")
            
            # Thêm nội dung dựa trên transcript
            if transcript:
                script_parts.append("Để hiểu rõ hơn, mình sẽ phân tích chi tiết:")
                # Tóm tắt transcript (đơn giản)
                summary = self._summarize_transcript(transcript)
                script_parts.append(summary)
            
            # Kết luận
            if "conclusion" in template:
                conclusion = template["conclusion"].format(rating="tốt")
                script_parts.append(conclusion)
            
            # Outro
            if "outro" in template:
                script_parts.append(template["outro"])
            
            return "\n\n".join(script_parts)
            
        except Exception as e:
            logger.error(f"Error generating script: {e}")
            return "Xin chào các bạn, hôm nay mình sẽ review về video này. Đây là một video rất thú vị và mình muốn chia sẻ với các bạn những điều mình học được từ video này."
    
    def _extract_key_topics(self, transcript: str) -> List[str]:
        """Trích xuất các chủ đề chính từ transcript"""
        # Đơn giản: tách theo câu và lấy từ khóa
        sentences = transcript.split('.')
        topics = []
        
        # Từ khóa thường gặp trong review
        keywords = [
            "tốt", "xấu", "đẹp", "rẻ", "đắt", "nhanh", "chậm", 
            "chất lượng", "hiệu suất", "tính năng", "thiết kế",
            "dễ sử dụng", "khó sử dụng", "thích", "không thích"
        ]
        
        for sentence in sentences:
            for keyword in keywords:
                if keyword in sentence.lower():
                    topics.append(sentence.strip())
                    break
        
        return topics[:5]  # Lấy tối đa 5 topics
    
    def _analyze_sentiment(self, transcript: str) -> str:
        """Phân tích cảm xúc của transcript"""
        positive_words = ["tốt", "đẹp", "thích", "tuyệt", "hay", "xuất sắc"]
        negative_words = ["xấu", "tệ", "không thích", "dở", "kém"]
        
        text_lower = transcript.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        else:
            return "neutral"
    
    def _summarize_transcript(self, transcript: str) -> str:
        """Tóm tắt transcript"""
        # Đơn giản: lấy 2-3 câu đầu
        sentences = [s.strip() for s in transcript.split('.') if s.strip()]
        return '. '.join(sentences[:3]) + '.'
    
    def _extract_audio(self, video_path: str) -> str:
        """Trích xuất audio từ video"""
        try:
            import subprocess
            audio_path = video_path.replace('.mp4', '.wav')
            
            cmd = [
                'ffmpeg', '-i', video_path, 
                '-vn', '-acodec', 'pcm_s16le', 
                '-ar', '16000', '-ac', '1', 
                '-y', audio_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if result.returncode == 0:
                return audio_path
            else:
                raise Exception(f"FFmpeg error: {result.stderr}")
                
        except Exception as e:
            logger.error(f"Error extracting audio: {e}")
            raise
    
    def _create_voiceover(self, script: str, voice_settings: Dict, output_dir: Path) -> Path:
        """Tạo voice-over từ script"""
        try:
            audio_path = output_dir / "voiceover.wav"
            
            # Sử dụng TTS service
            result = self.tts_service.synthesize_speech(
                text=script,
                voice=voice_settings.get("voice", "vi-VN-Standard-A"),
                speed=voice_settings.get("speed", 1.0),
                output_path=str(audio_path)
            )
            
            if result.get("success"):
                return audio_path
            else:
                raise Exception(f"TTS error: {result.get('error')}")
                
        except Exception as e:
            logger.error(f"Error creating voiceover: {e}")
            raise
    
    def _create_subtitles(self, script: str, output_dir: Path) -> Path:
        """Tạo phụ đề từ script"""
        try:
            subtitle_path = output_dir / "subtitles.srt"
            
            # Tạo SRT file đơn giản
            self.subtitle_processor.create_srt_from_text(
                text=script,
                output_path=str(subtitle_path),
                duration_per_segment=5.0  # 5 giây mỗi segment
            )
            
            return subtitle_path
            
        except Exception as e:
            logger.error(f"Error creating subtitles: {e}")
            raise
    
    def _create_final_review_video(
        self, 
        original_video: str, 
        audio_path: Path, 
        subtitle_path: Path, 
        output_dir: Path
    ) -> Path:
        """Tạo video review cuối cùng"""
        try:
            final_video_path = output_dir / "final_review.mp4"
            
            # Sử dụng FFmpeg để kết hợp video + audio + subtitle
            import subprocess
            
            cmd = [
                'ffmpeg',
                '-i', original_video,  # Video gốc
                '-i', str(audio_path),  # Audio voice-over
                '-c:v', 'copy',  # Copy video stream
                '-c:a', 'aac',   # Encode audio
                '-map', '0:v:0', # Video từ file đầu tiên
                '-map', '1:a:0', # Audio từ file thứ hai
                '-shortest',      # Kết thúc khi stream ngắn nhất kết thúc
                '-y', str(final_video_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                return final_video_path
            else:
                raise Exception(f"FFmpeg error: {result.stderr}")
                
        except Exception as e:
            logger.error(f"Error creating final video: {e}")
            raise
    
    def get_review_templates(self) -> Dict:
        """Lấy danh sách review templates"""
        return self.review_templates
    
    def get_review_files(self) -> List[Dict]:
        """Lấy danh sách video review đã tạo"""
        files = []
        for review_dir in self.output_dir.iterdir():
            if review_dir.is_dir():
                metadata_path = review_dir / "metadata.json"
                if metadata_path.exists():
                    try:
                        with open(metadata_path, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                        files.append(metadata)
                    except Exception as e:
                        logger.error(f"Error reading metadata for {review_dir}: {e}")
        
        # Sắp xếp theo thời gian tạo (mới nhất trước)
        files.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return files
    
    def get_review_by_id(self, review_id: str) -> Optional[Dict]:
        """Lấy thông tin review theo ID"""
        try:
            review_dir = self.output_dir / review_id
            metadata_path = review_dir / "metadata.json"
            
            if metadata_path.exists():
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return None
            
        except Exception as e:
            logger.error(f"Error getting review {review_id}: {e}")
            return None
    
    def delete_review(self, review_id: str) -> bool:
        """Xóa video review"""
        try:
            import shutil
            review_dir = self.output_dir / review_id
            if review_dir.exists():
                shutil.rmtree(review_dir)
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting review {review_id}: {e}")
            return False
    
    def _get_timestamp(self) -> str:
        """Tạo timestamp cho filename"""
        jst = pytz.timezone("Asia/Tokyo")
        return datetime.now(jst).strftime("%Y%m%d_%H%M%S")
