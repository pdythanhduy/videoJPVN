"""
Video Review Service - Phiên bản đơn giản
Tạo video review từ video gốc với các tính năng cơ bản
"""
import os
import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Union
import logging
from datetime import datetime
import pytz

logger = logging.getLogger(__name__)

class VideoReviewServiceSimple:
    def __init__(self):
        self.output_dir = Path("video_review_data")
        self.output_dir.mkdir(exist_ok=True)
        
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
        Tạo video review từ video gốc (phiên bản đơn giản)
        """
        try:
            timestamp = self._get_timestamp()
            review_id = f"review_{timestamp}"
            
            # Tạo thư mục cho review này
            review_dir = self.output_dir / review_id
            review_dir.mkdir(exist_ok=True)
            
            # 1. Tạo script review
            if custom_script:
                script = custom_script
            else:
                script = self._generate_simple_script(review_type, product_name)
            
            # 2. Tạo file script
            script_path = review_dir / "script.txt"
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(script)
            
            # 3. Lưu metadata
            metadata = {
                "review_id": review_id,
                "original_video": video_path,
                "script": script,
                "script_path": str(script_path),
                "review_type": review_type,
                "product_name": product_name,
                "created_at": timestamp,
                "voice_settings": voice_settings or {"voice": "vi-VN-Standard-A", "speed": 1.0}
            }
            
            metadata_path = review_dir / "metadata.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            return {
                "success": True,
                "review_id": review_id,
                "script": script,
                "script_url": f"/api/video-review/script/{review_id}",
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error creating video review: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _generate_simple_script(self, review_type: str, product_name: str) -> str:
        """Tạo script review đơn giản"""
        try:
            template = self.review_templates.get(review_type, self.review_templates["general_review"])
            
            script_parts = []
            
            # Intro
            intro = template["intro"].format(
                product_name=product_name or "sản phẩm này",
                topic="chủ đề này"
            )
            script_parts.append(intro)
            
            # Nội dung chính dựa trên loại review
            if review_type == "tech_review":
                script_parts.append("Đây là một sản phẩm công nghệ rất thú vị.")
                script_parts.append("Về thiết kế, sản phẩm có vẻ ngoài hiện đại và sang trọng.")
                script_parts.append("Về tính năng, có nhiều chức năng hữu ích cho người dùng.")
                script_parts.append("Tuy nhiên, giá cả có thể hơi cao so với một số đối thủ cạnh tranh.")
                
            elif review_type == "product_review":
                script_parts.append("Sản phẩm này có thiết kế đẹp mắt và chất lượng tốt.")
                script_parts.append("Về hiệu suất, sản phẩm hoạt động ổn định và đáng tin cậy.")
                script_parts.append("Giá cả cũng hợp lý so với chất lượng sản phẩm.")
                
            else:  # general_review
                script_parts.append("Đây là một chủ đề rất thú vị và đáng để tìm hiểu.")
                script_parts.append("Có nhiều khía cạnh khác nhau mà chúng ta cần xem xét.")
                script_parts.append("Tôi nghĩ đây là một trải nghiệm tích cực.")
            
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
