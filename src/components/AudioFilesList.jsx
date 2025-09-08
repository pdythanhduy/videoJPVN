import React, { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, FolderOpen } from 'lucide-react';

const AudioFilesList = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tempDir, setTempDir] = useState('');

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tts/files');
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
        setTempDir(data.temp_dir);
      }
    } catch (error) {
      console.error('Lỗi load files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const handleDownload = async (filename) => {
    try {
      const downloadUrl = `http://localhost:8000/api/tts/download/${filename}`;
      
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="icon-5" />
            Danh sách file audio
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFiles}
              disabled={loading}
              className="text-zinc-400 hover:text-white transition-colors p-2"
            >
              <RefreshCw className={`icon-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Thông tin thư mục */}
        {tempDir && (
          <div className="bg-zinc-800 rounded-xl p-4 mb-4">
            <div className="text-sm text-zinc-300">
              <strong>Thư mục lưu trữ:</strong>
              <div className="font-mono text-blue-400 mt-1 break-all">{tempDir}</div>
            </div>
          </div>
        )}

        {/* Danh sách file */}
        <div className="space-y-2">
          {files.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <FolderOpen className="icon-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có file audio nào</p>
              <p className="text-sm">Tạo audio bằng TTS để thấy file ở đây</p>
            </div>
          ) : (
            files.map((file, index) => (
              <div key={index} className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-medium">{file.filename}</div>
                  <div className="text-sm text-zinc-400">
                    {formatFileSize(file.size)} • Tạo lúc: {formatDate(file.created)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file.filename)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="icon-4" />
                    Tải về
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Hướng dẫn */}
        <div className="mt-6 bg-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-zinc-200 mb-2">Hướng dẫn:</h3>
          <ul className="text-sm text-zinc-300 space-y-1">
            <li>• File audio được lưu trong thư mục <code className="bg-zinc-700 px-1 rounded">backend/temp/</code></li>
            <li>• Nhấn "Tải về" để download file về máy</li>
            <li>• File có định dạng WAV, chất lượng 16kHz mono</li>
            <li>• Hiện tại là file test (silence), cần cấu hình Azure để có audio thực tế</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AudioFilesList;
