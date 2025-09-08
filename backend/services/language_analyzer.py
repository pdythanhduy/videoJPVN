import re
import asyncio
import logging
from typing import Dict, Any, List, Optional
import json

logger = logging.getLogger(__name__)

class LanguageAnalyzer:
    def __init__(self):
        self.ready = True
        logger.info("LanguageAnalyzer initialized")
    
    def is_ready(self) -> bool:
        return self.ready
    
    async def analyze(self, text: str) -> Dict[str, Any]:
        """Phân tích text tiếng Nhật (tokenization, POS tagging)"""
        try:
            if not text.strip():
                raise Exception("Text không được để trống")
            
            # Tokenization đơn giản (có thể thay thế bằng MeCab/Sudachi)
            tokens = self._simple_tokenize(text)
            
            # Phân tích cơ bản
            analysis = {
                "text": text,
                "tokens": tokens,
                "statistics": self._calculate_statistics(text, tokens),
                "sentences": self._split_sentences(text)
            }
            
            return {
                "success": True,
                "analysis": analysis
            }
            
        except Exception as e:
            logger.error(f"Lỗi phân tích text: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _simple_tokenize(self, text: str) -> List[Dict[str, Any]]:
        """Tokenization đơn giản cho tiếng Nhật"""
        tokens = []
        
        # Tách theo khoảng trắng và dấu câu
        words = re.findall(r'[^\s]+', text)
        
        for i, word in enumerate(words):
            # Phân loại cơ bản
            pos = self._classify_pos(word)
            
            token = {
                "surface": word,
                "reading": "",  # Sẽ được điền bởi MeCab/Sudachi
                "romaji": "",   # Sẽ được điền bởi wanakana
                "pos": pos,
                "t": i * 0.5  # Thời gian giả định
            }
            
            tokens.append(token)
        
        return tokens
    
    def _classify_pos(self, word: str) -> str:
        """Phân loại từ loại cơ bản"""
        # Hiragana
        if re.match(r'^[\u3040-\u309F]+$', word):
            return "HIRAGANA"
        
        # Katakana
        if re.match(r'^[\u30A0-\u30FF]+$', word):
            return "KATAKANA"
        
        # Kanji
        if re.match(r'^[\u4E00-\u9FAF]+$', word):
            return "KANJI"
        
        # Dấu câu
        if re.match(r'^[。、！？「」『』（）【】]+$', word):
            return "PUNCT"
        
        # Số
        if re.match(r'^[0-9]+$', word):
            return "NUM"
        
        # Mặc định
        return "OTHER"
    
    def _calculate_statistics(self, text: str, tokens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Tính toán thống kê text"""
        total_chars = len(text)
        total_tokens = len(tokens)
        
        # Đếm các loại ký tự
        hiragana_count = len(re.findall(r'[\u3040-\u309F]', text))
        katakana_count = len(re.findall(r'[\u30A0-\u30FF]', text))
        kanji_count = len(re.findall(r'[\u4E00-\u9FAF]', text))
        punct_count = len(re.findall(r'[。、！？「」『』（）【】]', text))
        
        # Đếm từ loại
        pos_counts = {}
        for token in tokens:
            pos = token["pos"]
            pos_counts[pos] = pos_counts.get(pos, 0) + 1
        
        return {
            "total_characters": total_chars,
            "total_tokens": total_tokens,
            "hiragana_count": hiragana_count,
            "katakana_count": katakana_count,
            "kanji_count": kanji_count,
            "punctuation_count": punct_count,
            "pos_distribution": pos_counts,
            "average_token_length": total_chars / total_tokens if total_tokens > 0 else 0
        }
    
    def _split_sentences(self, text: str) -> List[str]:
        """Tách câu"""
        # Tách theo dấu kết thúc câu
        sentences = re.split(r'[。！？]', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    async def get_reading(self, text: str) -> Dict[str, Any]:
        """Lấy cách đọc (reading) cho text"""
        try:
            # Placeholder - trong thực tế sẽ sử dụng MeCab/Sudachi
            readings = []
            
            for char in text:
                if re.match(r'[\u4E00-\u9FAF]', char):  # Kanji
                    readings.append(f"[{char}]")  # Placeholder
                else:
                    readings.append(char)
            
            return {
                "success": True,
                "text": text,
                "reading": "".join(readings)
            }
            
        except Exception as e:
            logger.error(f"Lỗi lấy reading: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def translate_to_vietnamese(self, text: str) -> Dict[str, Any]:
        """Dịch text sang tiếng Việt (placeholder)"""
        try:
            # Placeholder - trong thực tế sẽ sử dụng Google Translate API hoặc tương tự
            return {
                "success": True,
                "original": text,
                "translation": f"[Dịch: {text}]",  # Placeholder
                "confidence": 0.0
            }
            
        except Exception as e:
            logger.error(f"Lỗi dịch: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
