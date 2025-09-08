import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, RefreshCw, Play, Eye, Languages, Settings } from 'lucide-react';

const STTConverter = ({ isOpen, onClose }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioPath, setAudioPath] = useState('');
  const [language, setLanguage] = useState('ja');
  const [model, setModel] = useState('whisper-1');
  const [converting, setConverting] = useState(false);
  const [srtFiles, setSrtFiles] = useState([]);
  const [selectedSrt, setSelectedSrt] = useState(null);
  const [srtContent, setSrtContent] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);

  // Load SRT files and available audio files
  useEffect(() => {
    if (isOpen) {
      loadSrtFiles();
      loadAvailableFiles();
    }
  }, [isOpen]);

  const loadSrtFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stt/files');
      const data = await response.json();
      
      if (data.success) {
        setSrtFiles(data.files);
      }
    } catch (error) {
      console.error('Lỗi load SRT files:', error);
    }
  };

  const loadAvailableFiles = async () => {
    try {
      // Load TTS audio files
      const ttsResponse = await fetch('http://localhost:8000/api/tts/files');
      const ttsData = await ttsResponse.json();
      
      // Load YouTube files
      const youtubeResponse = await fetch('http://localhost:8000/api/youtube/files');
      const youtubeData = await youtubeResponse.json();
      
      const files = [];
      
      if (ttsData.success) {
        ttsData.files.forEach(file => {
          files.push({
            name: file.filename,
            path: `backend/temp/${file.filename}`,
            type: 'TTS Audio',
            size: file.size,
            created: file.created
          });
        });
      }
      
      if (youtubeData.success) {
        youtubeData.files.forEach(file => {
          files.push({
            name: file.filename,
            path: file.path,
            type: 'YouTube',
            size: file.size,
            created: file.created
          });
        });
      }
      
      setAvailableFiles(files);
    } catch (error) {
      console.error('Lỗi load available files:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioPath(file.name);
    }
  };

  const handlePathInput = (event) => {
    setAudioPath(event.target.value);
  };

  const selectFile = (file) => {
    setAudioPath(file.path);
    setAudioFile(null);
  };

  const convertToSrt = async () => {
    if (!audioPath.trim()) {
      alert('Vui lòng chọn file audio/video hoặc nhập đường dẫn');
      return;
    }

    setConverting(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/stt/convert-to-srt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_path: audioPath,
          language: language,
          model: model
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        loadSrtFiles(); // Reload SRT files
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Lỗi convert:', error);
      alert('Lỗi kết nối đến server');
    } finally {
      setConverting(false);
    }
  };

  const downloadSrtFile = async (filename) => {
    try {
      const downloadUrl = `http://localhost:8000/api/stt/download/${filename}`;
      
      // Sử dụng fetch để download
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Lấy blob từ response
      const blob = await response.blob();
      
      // Tạo URL cho blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tạo link download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      
      // Thêm vào DOM và click
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('Lỗi download file:', error);
      alert(`Lỗi download file: ${error.message}`);
    }
  };

  const viewSrtContent = async (filename) => {
    try {
      const response = await fetch(`http://localhost:8000/api/stt/content/${filename}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedSrt(filename);
        setSrtContent(data.content);
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Lỗi đọc SRT content:', error);
      alert('Lỗi kết nối đến server');
    }
  };

  const deleteSrtFile = async (filename) => {
    if (!confirm(`Bạn có chắc muốn xóa file "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/stt/files/${filename}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        loadSrtFiles();
        if (selectedSrt === filename) {
          setSelectedSrt(null);
          setSrtContent('');
        }
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Lỗi xóa file:', error);
      alert('Lỗi kết nối đến server');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="icon-5" />
            Audio/Video → SRT Converter
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Convert */}
          <div className="space-y-6">
            {/* File Input */}
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Chọn file audio/video</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Upload file
                  </label>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileUpload}
                    className="w-full p-3 rounded-xl bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="text-center text-zinc-400">hoặc</div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Đường dẫn file
                  </label>
                  <input
                    type="text"
                    value={audioPath}
                    onChange={handlePathInput}
                    placeholder="C:\Users\thanh\OneDrive\Máy tính\YoutubeFile\video.mp4"
                    className="w-full p-3 rounded-xl bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="icon-4" />
                Cài đặt
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ja">Tiếng Nhật (Japanese)</option>
                    <option value="en">Tiếng Anh (English)</option>
                    <option value="vi">Tiếng Việt (Vietnamese)</option>
                    <option value="ko">Tiếng Hàn (Korean)</option>
                    <option value="zh">Tiếng Trung (Chinese)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="whisper-1">Whisper-1 (Mặc định)</option>
                    <option value="whisper-2">Whisper-2 (Nâng cao)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={convertToSrt}
              disabled={converting || !audioPath.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <RefreshCw className="icon-4 animate-spin" />
                  Đang convert...
                </>
              ) : (
                <>
                  <FileText className="icon-4" />
                  Convert to SRT
                </>
              )}
            </button>

            {/* Available Files */}
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-200 mb-2">File có sẵn:</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableFiles.length === 0 ? (
                  <div className="text-sm text-zinc-400">Chưa có file nào</div>
                ) : (
                  availableFiles.map((file, index) => (
                    <div key={index} className="bg-zinc-700 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-zinc-400">
                          {file.type} • {formatFileSize(file.size)}
                        </div>
                      </div>
                      <button
                        onClick={() => selectFile(file)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Chọn
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sample Paths */}
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-200 mb-2">Đường dẫn mẫu:</h3>
              <div className="text-sm text-zinc-300 space-y-1">
                <div>• C:\Users\thanh\OneDrive\Máy tính\YoutubeFile\video.mp4</div>
                <div>• C:\Users\thanh\OneDrive\Máy tính\YoutubeFile\audio.mp3</div>
                <div>• backend\temp\youtube\video.webm</div>
              </div>
            </div>
          </div>

          {/* Right Panel - SRT Files */}
          <div className="space-y-6">
            {/* SRT Files List */}
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">File SRT đã tạo</h3>
                <button
                  onClick={loadSrtFiles}
                  className="text-zinc-400 hover:text-white transition-colors p-2"
                >
                  <RefreshCw className="icon-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {srtFiles.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <FileText className="icon-8 mx-auto mb-2 opacity-50" />
                    <p>Chưa có file SRT nào</p>
                  </div>
                ) : (
                  srtFiles.map((file, index) => (
                    <div key={index} className="bg-zinc-700 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium">{file.filename}</div>
                        <div className="text-sm text-zinc-400">
                          {formatFileSize(file.size)} • {new Date(file.created * 1000).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewSrtContent(file.filename)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="icon-4" />
                          Xem
                        </button>
                        <button
                          onClick={() => downloadSrtFile(file.filename)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="icon-4" />
                          Tải
                        </button>
                        <button
                          onClick={() => deleteSrtFile(file.filename)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="icon-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SRT Content Viewer */}
            {selectedSrt && (
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Nội dung: {selectedSrt}</h3>
                  <button
                    onClick={() => setSelectedSrt(null)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap">{srtContent}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default STTConverter;
