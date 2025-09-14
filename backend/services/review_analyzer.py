"""
Review Analyzer Service - Phân tích và tối ưu hóa nội dung review
Hỗ trợ phân tích sentiment, trích xuất keywords, và đề xuất cải thiện
"""
import re
import json
from typing import Dict, List, Optional, Tuple
import logging
from collections import Counter
import jieba  # For Vietnamese text processing

logger = logging.getLogger(__name__)

class ReviewAnalyzer:
    def __init__(self):
        self.ready = True
        logger.info("ReviewAnalyzer initialized")
        
        # Vietnamese sentiment words
        self.positive_words = {
            "tốt", "đẹp", "thích", "tuyệt", "hay", "xuất sắc", "hoàn hảo",
            "tuyệt vời", "rất tốt", "cực kỳ", "ấn tượng", "hài lòng",
            "chất lượng", "hiệu quả", "tiện lợi", "dễ sử dụng", "thân thiện",
            "nhanh", "mượt", "ổn định", "bền", "đáng tin cậy", "chuyên nghiệp"
        }
        
        self.negative_words = {
            "xấu", "tệ", "không thích", "dở", "kém", "tồi tệ", "thất vọng",
            "khó chịu", "khó sử dụng", "chậm", "lag", "lỗi", "hỏng",
            "không ổn", "không ổn định", "không đáng tin", "phức tạp",
            "rối rắm", "khó hiểu", "không rõ ràng", "mờ nhạt", "nhạt nhẽo"
        }
        
        # Review structure patterns
        self.intro_patterns = [
            r"xin chào.*?",
            r"chào.*?",
            r"hôm nay.*?",
            r"video.*?này.*?",
            r"mình.*?sẽ.*?"
        ]
        
        self.conclusion_patterns = [
            r"tổng kết.*?",
            r"kết luận.*?",
            r"tóm lại.*?",
            r"cuối cùng.*?",
            r"như vậy.*?"
        ]
    
    def is_ready(self) -> bool:
        return self.ready
    
    def analyze_review_script(self, script: str) -> Dict:
        """
        Phân tích script review và đưa ra đánh giá
        
        Args:
            script: Script review cần phân tích
        
        Returns:
            Dict chứa kết quả phân tích
        """
        try:
            # Làm sạch text
            clean_script = self._clean_text(script)
            
            # Phân tích cơ bản
            word_count = len(clean_script.split())
            char_count = len(clean_script)
            sentence_count = len(self._split_sentences(clean_script))
            
            # Phân tích sentiment
            sentiment_analysis = self._analyze_sentiment(clean_script)
            
            # Trích xuất keywords
            keywords = self._extract_keywords(clean_script)
            
            # Phân tích cấu trúc
            structure_analysis = self._analyze_structure(clean_script)
            
            # Đánh giá chất lượng
            quality_score = self._calculate_quality_score(
                word_count, sentiment_analysis, structure_analysis
            )
            
            # Đề xuất cải thiện
            improvements = self._suggest_improvements(
                clean_script, sentiment_analysis, structure_analysis
            )
            
            return {
                "success": True,
                "analysis": {
                    "word_count": word_count,
                    "char_count": char_count,
                    "sentence_count": sentence_count,
                    "sentiment": sentiment_analysis,
                    "keywords": keywords,
                    "structure": structure_analysis,
                    "quality_score": quality_score,
                    "improvements": improvements
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing review script: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _clean_text(self, text: str) -> str:
        """Làm sạch text"""
        # Loại bỏ ký tự đặc biệt, giữ lại chữ cái, số, dấu câu cơ bản
        text = re.sub(r'[^\w\s.,!?;:()\-]', ' ', text)
        # Loại bỏ khoảng trắng thừa
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _split_sentences(self, text: str) -> List[str]:
        """Tách câu"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _analyze_sentiment(self, text: str) -> Dict:
        """Phân tích sentiment"""
        words = text.lower().split()
        
        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)
        
        total_words = len(words)
        positive_ratio = positive_count / total_words if total_words > 0 else 0
        negative_ratio = negative_count / total_words if total_words > 0 else 0
        
        # Xác định sentiment chính
        if positive_ratio > negative_ratio and positive_ratio > 0.05:
            main_sentiment = "positive"
        elif negative_ratio > positive_ratio and negative_ratio > 0.05:
            main_sentiment = "negative"
        else:
            main_sentiment = "neutral"
        
        return {
            "main_sentiment": main_sentiment,
            "positive_ratio": positive_ratio,
            "negative_ratio": negative_ratio,
            "positive_words": positive_count,
            "negative_words": negative_count,
            "confidence": max(positive_ratio, negative_ratio)
        }
    
    def _extract_keywords(self, text: str, top_n: int = 10) -> List[Dict]:
        """Trích xuất keywords quan trọng"""
        try:
            # Sử dụng jieba để tách từ (nếu có)
            try:
                words = jieba.lcut(text)
            except:
                # Fallback: tách từ đơn giản
                words = text.split()
            
            # Loại bỏ stop words
            stop_words = {
                "và", "của", "trong", "với", "cho", "từ", "đến", "về", "là", "có",
                "được", "sẽ", "đã", "đang", "một", "các", "những", "này", "đó",
                "mình", "bạn", "các", "bạn", "chúng", "ta", "tôi", "anh", "chị"
            }
            
            filtered_words = [
                word.lower() for word in words 
                if len(word) > 2 and word.lower() not in stop_words
            ]
            
            # Đếm tần suất
            word_freq = Counter(filtered_words)
            
            # Lấy top keywords
            top_keywords = word_freq.most_common(top_n)
            
            return [
                {"word": word, "frequency": freq, "importance": min(freq / len(filtered_words), 1.0)}
                for word, freq in top_keywords
            ]
            
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []
    
    def _analyze_structure(self, text: str) -> Dict:
        """Phân tích cấu trúc của review"""
        sentences = self._split_sentences(text)
        
        # Kiểm tra intro
        has_intro = any(
            re.search(pattern, text.lower()) for pattern in self.intro_patterns
        )
        
        # Kiểm tra conclusion
        has_conclusion = any(
            re.search(pattern, text.lower()) for pattern in self.conclusion_patterns
        )
        
        # Phân tích độ dài câu
        sentence_lengths = [len(s.split()) for s in sentences]
        avg_sentence_length = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
        
        # Kiểm tra câu hỏi
        question_count = len([s for s in sentences if '?' in s])
        
        # Kiểm tra câu cảm thán
        exclamation_count = len([s for s in sentences if '!' in s])
        
        return {
            "has_intro": has_intro,
            "has_conclusion": has_conclusion,
            "sentence_count": len(sentences),
            "avg_sentence_length": avg_sentence_length,
            "question_count": question_count,
            "exclamation_count": exclamation_count,
            "structure_score": self._calculate_structure_score(
                has_intro, has_conclusion, len(sentences), avg_sentence_length
            )
        }
    
    def _calculate_structure_score(
        self, 
        has_intro: bool, 
        has_conclusion: bool, 
        sentence_count: int, 
        avg_sentence_length: float
    ) -> float:
        """Tính điểm cấu trúc"""
        score = 0.0
        
        # Intro (20 điểm)
        if has_intro:
            score += 20
        
        # Conclusion (20 điểm)
        if has_conclusion:
            score += 20
        
        # Số câu phù hợp (30 điểm)
        if 5 <= sentence_count <= 20:
            score += 30
        elif 3 <= sentence_count < 5 or 20 < sentence_count <= 30:
            score += 20
        else:
            score += 10
        
        # Độ dài câu phù hợp (30 điểm)
        if 8 <= avg_sentence_length <= 20:
            score += 30
        elif 5 <= avg_sentence_length < 8 or 20 < avg_sentence_length <= 30:
            score += 20
        else:
            score += 10
        
        return min(score, 100.0)
    
    def _calculate_quality_score(
        self, 
        word_count: int, 
        sentiment_analysis: Dict, 
        structure_analysis: Dict
    ) -> float:
        """Tính điểm chất lượng tổng thể"""
        score = 0.0
        
        # Độ dài phù hợp (25 điểm)
        if 100 <= word_count <= 500:
            score += 25
        elif 50 <= word_count < 100 or 500 < word_count <= 800:
            score += 20
        else:
            score += 10
        
        # Sentiment rõ ràng (25 điểm)
        confidence = sentiment_analysis.get("confidence", 0)
        score += min(confidence * 100, 25)
        
        # Cấu trúc tốt (50 điểm)
        structure_score = structure_analysis.get("structure_score", 0)
        score += structure_score * 0.5
        
        return min(score, 100.0)
    
    def _suggest_improvements(
        self, 
        text: str, 
        sentiment_analysis: Dict, 
        structure_analysis: Dict
    ) -> List[str]:
        """Đề xuất cải thiện"""
        improvements = []
        
        # Kiểm tra độ dài
        word_count = len(text.split())
        if word_count < 50:
            improvements.append("Script quá ngắn, nên thêm chi tiết và ví dụ cụ thể")
        elif word_count > 800:
            improvements.append("Script hơi dài, nên tóm tắt và tập trung vào điểm chính")
        
        # Kiểm tra sentiment
        confidence = sentiment_analysis.get("confidence", 0)
        if confidence < 0.1:
            improvements.append("Nên thêm từ ngữ thể hiện cảm xúc rõ ràng hơn")
        
        # Kiểm tra cấu trúc
        if not structure_analysis.get("has_intro"):
            improvements.append("Nên thêm phần mở đầu để chào khán giả")
        
        if not structure_analysis.get("has_conclusion"):
            improvements.append("Nên thêm phần kết luận để tóm tắt ý chính")
        
        # Kiểm tra độ dài câu
        avg_length = structure_analysis.get("avg_sentence_length", 0)
        if avg_length > 25:
            improvements.append("Một số câu quá dài, nên chia nhỏ để dễ hiểu")
        elif avg_length < 5:
            improvements.append("Các câu hơi ngắn, nên kết hợp để tạo câu hoàn chỉnh")
        
        # Kiểm tra câu hỏi
        question_count = structure_analysis.get("question_count", 0)
        if question_count == 0:
            improvements.append("Nên thêm câu hỏi để tương tác với khán giả")
        
        return improvements
    
    def optimize_review_script(self, script: str) -> Dict:
        """
        Tối ưu hóa script review
        
        Args:
            script: Script gốc cần tối ưu
        
        Returns:
            Dict chứa script đã tối ưu và các thay đổi
        """
        try:
            # Phân tích script gốc
            analysis = self.analyze_review_script(script)
            if not analysis["success"]:
                return analysis
            
            original_script = script
            optimized_script = script
            changes = []
            
            # Tối ưu hóa dựa trên phân tích
            analysis_data = analysis["analysis"]
            
            # Thêm intro nếu chưa có
            if not analysis_data["structure"]["has_intro"]:
                intro = "Xin chào các bạn, hôm nay mình sẽ chia sẻ về "
                optimized_script = intro + optimized_script
                changes.append("Đã thêm phần mở đầu")
            
            # Thêm conclusion nếu chưa có
            if not analysis_data["structure"]["has_conclusion"]:
                conclusion = "\n\nTổng kết lại, đây là những gì mình muốn chia sẻ với các bạn. Cảm ơn các bạn đã xem video!"
                optimized_script += conclusion
                changes.append("Đã thêm phần kết luận")
            
            # Tối ưu hóa câu quá dài
            sentences = self._split_sentences(optimized_script)
            optimized_sentences = []
            
            for sentence in sentences:
                if len(sentence.split()) > 25:
                    # Chia câu dài thành câu ngắn hơn
                    parts = self._split_long_sentence(sentence)
                    optimized_sentences.extend(parts)
                    changes.append(f"Đã chia câu dài: '{sentence[:50]}...'")
                else:
                    optimized_sentences.append(sentence)
            
            optimized_script = ". ".join(optimized_sentences)
            
            # Thêm câu hỏi nếu chưa có
            if analysis_data["structure"]["question_count"] == 0:
                question = "Các bạn có thắc mắc gì không? Hãy comment bên dưới nhé!"
                optimized_script += f" {question}"
                changes.append("Đã thêm câu hỏi tương tác")
            
            return {
                "success": True,
                "original_script": original_script,
                "optimized_script": optimized_script,
                "changes": changes,
                "analysis": analysis_data
            }
            
        except Exception as e:
            logger.error(f"Error optimizing script: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _split_long_sentence(self, sentence: str) -> List[str]:
        """Chia câu dài thành các câu ngắn hơn"""
        # Tìm các từ nối để chia câu
        connectors = ["và", "nhưng", "tuy nhiên", "ngoài ra", "hơn nữa", "đồng thời"]
        
        for connector in connectors:
            if f" {connector} " in sentence:
                parts = sentence.split(f" {connector} ", 1)
                if len(parts) == 2:
                    return [parts[0].strip(), f"{connector} {parts[1].strip()}"]
        
        # Nếu không tìm được từ nối, chia ở giữa
        words = sentence.split()
        if len(words) > 25:
            mid_point = len(words) // 2
            return [
                " ".join(words[:mid_point]),
                " ".join(words[mid_point:])
            ]
        
        return [sentence]
    
    def get_review_tips(self) -> List[Dict]:
        """Lấy danh sách tips để viết review tốt"""
        return [
            {
                "category": "Cấu trúc",
                "tips": [
                    "Bắt đầu bằng lời chào thân thiện",
                    "Giới thiệu sản phẩm/vấn đề một cách rõ ràng",
                    "Chia sẻ trải nghiệm cá nhân",
                    "Kết thúc bằng lời cảm ơn và kêu gọi tương tác"
                ]
            },
            {
                "category": "Nội dung",
                "tips": [
                    "Sử dụng từ ngữ tích cực và chân thực",
                    "Đưa ra ví dụ cụ thể và chi tiết",
                    "So sánh với sản phẩm khác nếu có thể",
                    "Chia sẻ cả ưu điểm và nhược điểm"
                ]
            },
            {
                "category": "Ngôn ngữ",
                "tips": [
                    "Sử dụng câu ngắn gọn, dễ hiểu",
                    "Tránh thuật ngữ kỹ thuật phức tạp",
                    "Thêm câu hỏi để tương tác với khán giả",
                    "Sử dụng từ ngữ cảm xúc phù hợp"
                ]
            },
            {
                "category": "Kỹ thuật",
                "tips": [
                    "Giữ độ dài script từ 100-500 từ",
                    "Chia thành các đoạn ngắn, dễ đọc",
                    "Thêm dấu câu phù hợp",
                    "Kiểm tra chính tả và ngữ pháp"
                ]
            }
        ]
