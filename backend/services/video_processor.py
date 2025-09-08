import cv2
import numpy as np
from pathlib import Path
import asyncio
import logging
from typing import Dict, Any, Optional, List
import json

logger = logging.getLogger(__name__)

class VideoProcessor:
    def __init__(self):
        self.ready = True
        logger.info("VideoProcessor initialized")
    
    def is_ready(self) -> bool:
        return self.ready
    
    async def process_video(self, video_path: Path) -> Dict[str, Any]:
        """Xử lý video và trích xuất thông tin"""
        try:
            cap = cv2.VideoCapture(str(video_path))
            
            if not cap.isOpened():
                raise Exception("Không thể mở video file")
            
            # Lấy thông tin video
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 0
            
            # Trích xuất frame đầu tiên làm thumbnail
            ret, frame = cap.read()
            thumbnail = None
            if ret:
                # Resize thumbnail
                thumbnail_height = 200
                thumbnail_width = int(width * thumbnail_height / height)
                thumbnail = cv2.resize(frame, (thumbnail_width, thumbnail_height))
                # Convert to base64
                import base64
                _, buffer = cv2.imencode('.jpg', thumbnail)
                thumbnail = base64.b64encode(buffer).decode('utf-8')
            
            cap.release()
            
            return {
                "success": True,
                "video_info": {
                    "fps": fps,
                    "frame_count": frame_count,
                    "width": width,
                    "height": height,
                    "duration": duration,
                    "thumbnail": thumbnail
                }
            }
            
        except Exception as e:
            logger.error(f"Lỗi xử lý video: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def extract_frames(self, video_path: Path, interval: float = 1.0) -> List[Dict[str, Any]]:
        """Trích xuất frames theo khoảng thời gian"""
        try:
            cap = cv2.VideoCapture(str(video_path))
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_interval = int(fps * interval)
            
            frames = []
            frame_number = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_number % frame_interval == 0:
                    timestamp = frame_number / fps
                    # Resize frame
                    height, width = frame.shape[:2]
                    if width > 640:
                        scale = 640 / width
                        new_width = 640
                        new_height = int(height * scale)
                        frame = cv2.resize(frame, (new_width, new_height))
                    
                    # Convert to base64
                    import base64
                    _, buffer = cv2.imencode('.jpg', frame)
                    frame_data = base64.b64encode(buffer).decode('utf-8')
                    
                    frames.append({
                        "timestamp": timestamp,
                        "frame_number": frame_number,
                        "data": frame_data
                    })
                
                frame_number += 1
            
            cap.release()
            return frames
            
        except Exception as e:
            logger.error(f"Lỗi trích xuất frames: {str(e)}")
            return []
    
    async def create_thumbnail(self, video_path: Path, timestamp: float = 0.0) -> Optional[str]:
        """Tạo thumbnail tại thời điểm cụ thể"""
        try:
            cap = cv2.VideoCapture(str(video_path))
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_number = int(timestamp * fps)
            
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            ret, frame = cap.read()
            
            if ret:
                # Resize thumbnail
                height, width = frame.shape[:2]
                thumbnail_height = 200
                thumbnail_width = int(width * thumbnail_height / height)
                thumbnail = cv2.resize(frame, (thumbnail_width, thumbnail_height))
                
                # Convert to base64
                import base64
                _, buffer = cv2.imencode('.jpg', thumbnail)
                return base64.b64encode(buffer).decode('utf-8')
            
            cap.release()
            return None
            
        except Exception as e:
            logger.error(f"Lỗi tạo thumbnail: {str(e)}")
            return None
