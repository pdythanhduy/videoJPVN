"""
Trends Service - Thu thập trend/hashtag từ nhiều nguồn
"""
import subprocess
import json
import os
from pathlib import Path
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class TrendsService:
    def __init__(self):
        self.script_path = Path(__file__).parent.parent / "trendspy.py"
        self.output_dir = Path("trends_data")
        self.output_dir.mkdir(exist_ok=True)
    
    def collect_trends(
        self, 
        regions: List[str] = None, 
        limit: int = 30,
        include_tiktok_songs: bool = False,
        exclude_platforms: List[str] = None
    ) -> Dict:
        """
        Thu thập trends từ nhiều nguồn
        
        Args:
            regions: Danh sách khu vực (worldwide, japan, united-states, etc.)
            limit: Giới hạn số lượng mỗi nguồn
            include_tiktok_songs: Có bao gồm TikTok songs không
            exclude_platforms: Loại trừ platform nào (x, tiktok, google)
        
        Returns:
            Dict chứa trends data
        """
        if regions is None:
            regions = ["worldwide"]
        
        if exclude_platforms is None:
            exclude_platforms = []
        
        try:
            # Xây dựng command
            cmd = ["python", str(self.script_path)]
            
            # Thêm regions
            cmd.extend(["--region"] + regions)
            
            # Thêm limit
            cmd.extend(["--limit", str(limit)])
            
            # Loại trừ platforms
            if "x" in exclude_platforms:
                cmd.append("--no-x")
            if "tiktok" in exclude_platforms:
                cmd.append("--no-tiktok")
            if "google" in exclude_platforms:
                cmd.append("--no-google")
            
            # TikTok songs
            if include_tiktok_songs:
                cmd.append("--tiktok-songs")
            
            # Tạo output file
            timestamp = self._get_timestamp()
            csv_file = self.output_dir / f"trends_{timestamp}.csv"
            cmd.extend(["--csv", str(csv_file)])
            
            logger.info(f"Running command: {' '.join(cmd)}")
            
            # Chạy script
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent
            )
            
            if result.returncode != 0:
                logger.error(f"Script failed: {result.stderr}")
                return {
                    "success": False,
                    "error": f"Script execution failed: {result.stderr}",
                    "data": None
                }
            
            # Parse JSON output
            try:
                trends_data = json.loads(result.stdout)
                trends_data["csv_file"] = str(csv_file)
                trends_data["success"] = True
                
                logger.info(f"Collected {len(trends_data.get('items', []))} trends")
                return trends_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON output: {e}")
                return {
                    "success": False,
                    "error": f"Failed to parse output: {e}",
                    "data": None
                }
                
        except Exception as e:
            logger.error(f"Error collecting trends: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    def get_available_regions(self) -> List[str]:
        """Lấy danh sách khu vực có sẵn"""
        return [
            "worldwide",
            "japan", 
            "united-states",
            "india",
            "united-kingdom",
            "germany",
            "france",
            "brazil",
            "mexico",
            "canada",
            "australia",
            "south-korea",
            "thailand",
            "vietnam",
            "philippines",
            "indonesia",
            "malaysia",
            "singapore"
        ]
    
    def get_platforms(self) -> List[str]:
        """Lấy danh sách platforms"""
        return ["x", "tiktok", "google"]
    
    def get_trend_files(self) -> List[Dict]:
        """Lấy danh sách file trends đã tạo"""
        files = []
        for file_path in self.output_dir.glob("trends_*.csv"):
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
    
    def delete_trend_file(self, filename: str) -> bool:
        """Xóa file trends"""
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
