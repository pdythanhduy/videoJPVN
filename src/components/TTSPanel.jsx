import React, { useState, useEffect } from 'react';
import { Volume2, Download, Play, Pause, Settings, Loader } from 'lucide-react';

const TTSPanel = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('ja-JP-NanamiNeural');
  const [voices, setVoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tts/voices');
        const data = await response.json();
        if (data.success) {
          setVoices(data.voices);
        }
      } catch (error) {
        console.error('Lỗi load voices:', error);
      }
    };
    
    if (isOpen) {
      loadVoices();
    }
  }, [isOpen]);

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      alert('Vui lòng nhập text tiếng Nhật');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tts/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voice
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Lưu thông tin audio
          setAudioInfo({
            filename: result.filename,
            outputPath: result.output_path,
            duration: result.duration,
            isTest: result.is_test || false
          });
          
          // Tạo URL để tải file
          const downloadUrl = `http://localhost:8000/api/tts/download/${result.filename}`;
          setAudioUrl(downloadUrl);
          
          // Hiển thị thông báo thành công
          if (result.is_test) {
            alert(`⚠️ ${result.message}`);
          } else {
            alert(`✅ ${result.message}`);
          }
        } else {
          alert(`Lỗi: ${result.error || 'Không thể tạo audio'}`);
        }
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || 'Không thể tạo audio'}`);
      }
    } catch (error) {
      console.error('Lỗi TTS:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('❌ Lỗi kết nối đến server!\n\nVui lòng:\n1. Chạy backend: cd backend && python main_simple.py\n2. Đảm bảo backend chạy tại http://localhost:8000\n3. Thử lại');
      } else {
        alert('Lỗi kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  };

  const handleDownload = () => {
    if (audioUrl && audioInfo) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = audioInfo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioElement(null);
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Volume2 className="icon-5" />
            Text-to-Speech (TTS)
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Chọn giọng nói
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(voices).map(([voiceId, description]) => (
                <option key={voiceId} value={voiceId}>
                  {description}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Nhập text tiếng Nhật
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập text tiếng Nhật để tạo audio..."
              className="w-full p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:outline-none resize-none"
              rows={6}
            />
            <div className="text-xs text-zinc-400 mt-1">
              {text.length} ký tự
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleTextToSpeech}
              disabled={loading || !text.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="icon-4 animate-spin" />
                  Đang tạo audio...
                </>
              ) : (
                <>
                  <Volume2 className="icon-4" />
                  Tạo Audio
                </>
              )}
            </button>

            {audioUrl && (
              <>
                <button
                  onClick={handlePlayPause}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="icon-4" /> : <Play className="icon-4" />}
                  {isPlaying ? 'Tạm dừng' : 'Phát'}
                </button>

                <button
                  onClick={handleDownload}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="icon-4" />
                  Tải về
                </button>
              </>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && audioInfo && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm text-zinc-300 mb-2">
                    Audio đã tạo: <span className="font-mono text-blue-400">{audioInfo.filename}</span>
                    {audioInfo.isTest && <span className="ml-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">TEST</span>}
                  </div>
                  <div className="text-xs text-zinc-400 mb-2">
                    Thời lượng: {audioInfo.duration.toFixed(2)}s | 
                    {audioInfo.isTest ? "File test (silence)" : "Audio thực tế"} | 
                    Vị trí: {audioInfo.outputPath}
                  </div>
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sample Text */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-zinc-200 mb-2">Text mẫu:</h3>
            <div className="text-sm text-zinc-300 space-y-2">
              <div>
                <strong>Đơn giản:</strong> こんにちは、元気ですか？
              </div>
              <div>
                <strong>Trung bình:</strong> 今日は天気がいいですね。散歩に行きましょう。
              </div>
              <div>
                <strong>Phức tạp:</strong> 先月、コンビニのアルバイトでちょっと恥ずかしい失敗をしました。
              </div>
            </div>
            <button
              onClick={() => setText('こんにちは、元気ですか？今日は天気がいいですね。')}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Sử dụng text mẫu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTSPanel;
