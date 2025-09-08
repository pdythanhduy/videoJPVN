import whisper
import librosa
import numpy as np
from pathlib import Path
import asyncio
import logging
from typing import Dict, Any, Optional, List
import json
import tempfile
import os

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.whisper_model = None
        self.ready = False
        self._load_models()
    
    def _load_models(self):
        """Load Whisper models"""
        try:
            # Load model nhỏ nhất để test
            self.whisper_model = whisper.load_model("tiny")
            self.ready = True
            logger.info("AudioProcessor initialized with Whisper tiny model")
        except Exception as e:
            logger.error(f"Lỗi load Whisper model: {str(e)}")
            self.ready = False
    
    def is_ready(self) -> bool:
        return self.ready
    
    async def process_audio(self, audio_path: Path) -> Dict[str, Any]:
        """Xử lý audio và trích xuất thông tin"""
        try:
            # Load audio với librosa
            y, sr = librosa.load(str(audio_path))
            duration = len(y) / sr
            
            # Tính toán các đặc trưng audio
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
            
            return {
                "success": True,
                "audio_info": {
                    "duration": duration,
                    "sample_rate": sr,
                    "tempo": float(tempo),
                    "mean_spectral_centroid": float(np.mean(spectral_centroids)),
                    "mean_zero_crossing_rate": float(np.mean(zero_crossing_rate))
                }
            }
            
        except Exception as e:
            logger.error(f"Lỗi xử lý audio: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def transcribe(self, audio_path: Path, model: str = "whisper-1", language: str = "ja") -> Dict[str, Any]:
        """Transcribe audio thành text"""
        try:
            if not self.whisper_model:
                raise Exception("Whisper model chưa được load")
            
            # Transcribe với Whisper
            result = self.whisper_model.transcribe(
                str(audio_path),
                language=language,
                word_timestamps=True
            )
            
            # Chuyển đổi kết quả thành format phù hợp
            segments = []
            for segment in result["segments"]:
                segments.append({
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"].strip(),
                    "words": segment.get("words", [])
                })
            
            return {
                "success": True,
                "text": result["text"],
                "language": result["language"],
                "segments": segments
            }
            
        except Exception as e:
            logger.error(f"Lỗi transcribe: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def extract_audio_features(self, audio_path: Path) -> Dict[str, Any]:
        """Trích xuất đặc trưng audio chi tiết"""
        try:
            y, sr = librosa.load(str(audio_path))
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
            
            # Rhythm features
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            
            return {
                "success": True,
                "features": {
                    "mfcc_mean": [float(x) for x in np.mean(mfccs, axis=1)],
                    "mfcc_std": [float(x) for x in np.std(mfccs, axis=1)],
                    "spectral_centroid_mean": float(np.mean(spectral_centroids)),
                    "spectral_centroid_std": float(np.std(spectral_centroids)),
                    "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
                    "spectral_rolloff_std": float(np.std(spectral_rolloff)),
                    "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
                    "spectral_bandwidth_std": float(np.std(spectral_bandwidth)),
                    "tempo": float(tempo),
                    "zero_crossing_rate_mean": float(np.mean(zcr)),
                    "zero_crossing_rate_std": float(np.std(zcr))
                }
            }
            
        except Exception as e:
            logger.error(f"Lỗi trích xuất đặc trưng audio: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def detect_silence(self, audio_path: Path, threshold: float = 0.01) -> List[Dict[str, Any]]:
        """Phát hiện khoảng lặng trong audio"""
        try:
            y, sr = librosa.load(str(audio_path))
            
            # Tính toán energy
            frame_length = 2048
            hop_length = 512
            energy = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
            
            # Tìm các frame có energy thấp (silence)
            silence_frames = energy < threshold
            
            # Chuyển đổi frame indices thành timestamps
            silence_segments = []
            in_silence = False
            silence_start = 0
            
            for i, is_silent in enumerate(silence_frames):
                timestamp = i * hop_length / sr
                
                if is_silent and not in_silence:
                    silence_start = timestamp
                    in_silence = True
                elif not is_silent and in_silence:
                    silence_segments.append({
                        "start": silence_start,
                        "end": timestamp,
                        "duration": timestamp - silence_start
                    })
                    in_silence = False
            
            # Xử lý trường hợp kết thúc trong silence
            if in_silence:
                silence_segments.append({
                    "start": silence_start,
                    "end": len(y) / sr,
                    "duration": (len(y) / sr) - silence_start
                })
            
            return silence_segments
            
        except Exception as e:
            logger.error(f"Lỗi phát hiện silence: {str(e)}")
            return []
