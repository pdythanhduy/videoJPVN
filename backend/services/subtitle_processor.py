import re
from pathlib import Path
import asyncio
import logging
from typing import Dict, Any, List, Optional
import json

logger = logging.getLogger(__name__)

class SubtitleProcessor:
    def __init__(self):
        self.ready = True
        logger.info("SubtitleProcessor initialized")
    
    def is_ready(self) -> bool:
        return self.ready
    
    async def process(self, segments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Xử lý và tối ưu hóa phụ đề"""
        try:
            processed_segments = []
            
            for segment in segments:
                # Chuẩn hóa segment
                processed_segment = {
                    "start": float(segment.get("start", 0)),
                    "end": float(segment.get("end", 0)),
                    "jp": segment.get("jp", "").strip(),
                    "vi": segment.get("vi", "").strip(),
                    "tokens": segment.get("tokens", [])
                }
                
                # Đảm bảo thời gian hợp lệ
                if processed_segment["end"] <= processed_segment["start"]:
                    processed_segment["end"] = processed_segment["start"] + 1.0
                
                processed_segments.append(processed_segment)
            
            # Sắp xếp theo thời gian
            processed_segments.sort(key=lambda x: x["start"])
            
            return {
                "success": True,
                "segments": processed_segments,
                "total_segments": len(processed_segments),
                "total_duration": processed_segments[-1]["end"] if processed_segments else 0
            }
            
        except Exception as e:
            logger.error(f"Lỗi xử lý phụ đề: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def export(self, segments: List[Dict[str, Any]], format: str = "srt") -> Dict[str, Any]:
        """Export phụ đề ra các định dạng khác nhau"""
        try:
            if format.lower() == "srt":
                content = self._export_srt(segments)
            elif format.lower() == "vtt":
                content = self._export_vtt(segments)
            elif format.lower() == "json":
                content = json.dumps({"segments": segments}, ensure_ascii=False, indent=2)
            else:
                raise Exception(f"Định dạng {format} không được hỗ trợ")
            
            return {
                "success": True,
                "content": content,
                "format": format,
                "segments_count": len(segments)
            }
            
        except Exception as e:
            logger.error(f"Lỗi export: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _export_srt(self, segments: List[Dict[str, Any]]) -> str:
        """Export ra định dạng SRT"""
        lines = []
        
        for i, segment in enumerate(segments, 1):
            start_time = self._format_srt_time(segment["start"])
            end_time = self._format_srt_time(segment["end"])
            
            lines.append(str(i))
            lines.append(f"{start_time} --> {end_time}")
            lines.append(segment["jp"])
            if segment["vi"]:
                lines.append(segment["vi"])
            lines.append("")
        
        return "\n".join(lines)
    
    def _export_vtt(self, segments: List[Dict[str, Any]]) -> str:
        """Export ra định dạng VTT"""
        lines = ["WEBVTT", ""]
        
        for segment in segments:
            start_time = self._format_vtt_time(segment["start"])
            end_time = self._format_vtt_time(segment["end"])
            
            lines.append(f"{start_time} --> {end_time}")
            lines.append(segment["jp"])
            if segment["vi"]:
                lines.append(segment["vi"])
            lines.append("")
        
        return "\n".join(lines)
    
    def _format_srt_time(self, seconds: float) -> str:
        """Format thời gian cho SRT (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    def _format_vtt_time(self, seconds: float) -> str:
        """Format thời gian cho VTT (HH:MM:SS.mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millisecs:03d}"
    
    async def generate_subtitles(self, media_path: Path, language: str = "ja", model: str = "whisper-1") -> Dict[str, Any]:
        """Tạo phụ đề tự động từ media file"""
        try:
            # Đây là placeholder - trong thực tế sẽ gọi audio_processor.transcribe
            # và xử lý kết quả thành format phụ đề
            
            return {
                "success": True,
                "message": "Chức năng tạo phụ đề tự động đang được phát triển",
                "segments": []
            }
            
        except Exception as e:
            logger.error(f"Lỗi tạo phụ đề: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
