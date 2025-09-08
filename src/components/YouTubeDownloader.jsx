import React, { useState, useEffect } from 'react';
import { Download, Play, Pause, Trash2, RefreshCw, Youtube, FileVideo, Music, Info } from 'lucide-react';

const YouTubeDownloader = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [downloadedFiles, setDownloadedFiles] = useState([]);
  const [downloadType, setDownloadType] = useState('video'); // 'video' or 'audio'
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Load downloaded files
  useEffect(() => {
    if (isOpen) {
      loadDownloadedFiles();
    }
  }, [isOpen]);

  const loadDownloadedFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/youtube/files');
      const data = await response.json();
      
      if (data.success) {
        setDownloadedFiles(data.files);
      }
    } catch (error) {
      console.error('Lỗi load files:', error);
    }
  };

  const getVideoInfo = async () => {
    if (!url.trim()) {
      alert('Vui lòng nhập URL YouTube');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/youtube/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      
      if (data.success) {
        setVideoInfo(data.info);
        // Lấy danh sách format chi tiết
        await getAvailableFormats();
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Lỗi lấy thông tin:', error);
      alert('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableFormats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/youtube/formats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      
      if (data.success) {
        setAvailableFormats(data.formats);
        
        // Mặc định chọn 720p với video+audio
        setSelectedFormat("best[height<=720][ext=mp4]/best[height<=720]");
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách format:', error);
    }
  };

  const downloadVideo = async () => {
    if (!url.trim()) {
      alert('Vui lòng nhập URL YouTube');
      return;
    }

    setDownloading(true);
    setDownloadProgress('Đang download...');
    
    try {
      const endpoint = downloadType === 'audio' 
        ? 'http://localhost:8000/api/youtube/download-audio'
        : 'http://localhost:8000/api/youtube/download';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          format_id: selectedFormat || 'best[height<=720]'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDownloadProgress('Download hoàn thành!');
        alert(`✅ ${data.message}`);
        loadDownloadedFiles(); // Reload file list
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Lỗi download:', error);
      alert('Lỗi kết nối đến server');
    } finally {
      setDownloading(false);
      setDownloadProgress('');
    }
  };

  const downloadFile = async (filename) => {
    try {
      const downloadUrl = `http://localhost:8000/api/youtube/download/${filename}`;
      
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

  const handlePreviewFile = async (filename) => {
    try {
      const previewUrl = `http://localhost:8000/api/youtube/files/${filename}`;
      
      // Kiểm tra xem file có phải video không
      const isVideo = filename.toLowerCase().match(/\.(mp4|avi|mov|mkv|webm)$/);
      
      if (isVideo) {
        setPreviewFile(filename);
        setPreviewUrl(previewUrl);
      } else {
        // Nếu là audio, mở trong tab mới
        window.open(previewUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Lỗi preview file:', error);
      alert('Lỗi preview file: ' + error.message);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl('');
  };

  const deleteFile = async (filename) => {
    if (!confirm(`Bạn có chắc muốn xóa file "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/youtube/files/${filename}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        loadDownloadedFiles();
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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Youtube className="icon-5" />
            YouTube Downloader
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              YouTube URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={getVideoInfo}
                disabled={loading || !url.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="icon-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Info className="icon-4" />
                    Thông tin
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Info */}
          {videoInfo && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="flex gap-4">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt="Thumbnail"
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{videoInfo.title}</h3>
                  <div className="text-sm text-zinc-300 space-y-1">
                    <div>Kênh: {videoInfo.uploader}</div>
                    <div>Thời lượng: {formatDuration(videoInfo.duration)}</div>
                    <div>Lượt xem: {videoInfo.view_count?.toLocaleString()}</div>
                    <div>Ngày đăng: {videoInfo.upload_date}</div>
                    {availableFormats.length > 0 && (
                      <div>Format có sẵn: {availableFormats.length} ({availableFormats.filter(f => f.has_url).length} khả dụng)</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Options */}
          {videoInfo && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Tùy chọn download</h3>
              
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="video"
                    checked={downloadType === 'video'}
                    onChange={(e) => setDownloadType(e.target.value)}
                    className="text-blue-600"
                  />
                  <FileVideo className="icon-4" />
                  <span className="text-white">Video (MP4)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="audio"
                    checked={downloadType === 'audio'}
                    onChange={(e) => setDownloadType(e.target.value)}
                    className="text-blue-600"
                  />
                  <Music className="icon-4" />
                  <span className="text-white">Audio (MP3)</span>
                </label>
              </div>

              {/* Quality Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Chọn chất lượng:
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="best[height<=1080][ext=mp4]/best[height<=1080]">🎬🎵 1080p (Chất lượng cao nhất)</option>
                  <option value="best[height<=720][ext=mp4]/best[height<=720]">🎬🎵 720p (Chất lượng cao)</option>
                  <option value="best[height<=480][ext=mp4]/best[height<=480]">🎬🎵 480p (Chất lượng trung bình)</option>
                  <option value="best[height<=360][ext=mp4]/best[height<=360]">🎬🎵 360p (Chất lượng thấp)</option>
                  <option value="bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio">🎵 Audio only (Chất lượng cao)</option>
                  <option value="bestaudio/best">🎵 Audio only (Tự động)</option>
                </select>
              </div>

              {/* Format Selection */}
              {availableFormats.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Hoặc chọn format cụ thể:
                    <span className="text-xs text-zinc-400 ml-2">
                      🎬🎵 = Video + Audio | 🎵 = Audio only | 🎬 = Video only | ⚠️ = 0 bytes
                    </span>
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:outline-none"
                  >
                    {availableFormats.map((format, index) => {
                      const hasVideo = format.vcodec && format.vcodec !== 'none';
                      const hasAudio = format.acodec && format.acodec !== 'none';
                      const isVideoAudio = hasVideo && hasAudio;
                      const isAudioOnly = !hasVideo && hasAudio;
                      const isVideoOnly = hasVideo && !hasAudio;
                      
                      let typeIcon = '';
                      if (isVideoAudio) typeIcon = '🎬🎵';
                      else if (isAudioOnly) typeIcon = '🎵';
                      else if (isVideoOnly) typeIcon = '🎬';
                      else typeIcon = '❓';
                      
                      const isAvailable = format.is_available || format.has_url;
                      const statusIcon = isAvailable ? '✅' : '⚠️';
                      
                      return (
                        <option key={index} value={format.format_id}>
                          {typeIcon} {format.format_id} - {format.ext} - {format.resolution} - {format.format_note} - {formatFileSize(format.filesize)} {statusIcon}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <button
                onClick={downloadVideo}
                disabled={downloading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="icon-4 animate-spin" />
                    {downloadProgress}
                  </>
                ) : (
                  <>
                    <Download className="icon-4" />
                    Download {downloadType === 'audio' ? 'Audio' : 'Video'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Downloaded Files */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">File đã download</h3>
              <button
                onClick={loadDownloadedFiles}
                className="text-zinc-400 hover:text-white transition-colors p-2"
              >
                <RefreshCw className="icon-4" />
              </button>
            </div>

            <div className="space-y-2">
              {downloadedFiles.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <Youtube className="icon-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có file nào được download</p>
                </div>
              ) : (
                downloadedFiles.map((file, index) => (
                  <div key={index} className="bg-zinc-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium">{file.filename}</div>
                      <div className="text-sm text-zinc-400">
                        {formatFileSize(file.size)} • {new Date(file.created * 1000).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewFile(file.filename)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Play className="icon-4" />
                        Xem
                      </button>
                      <button
                        onClick={() => downloadFile(file.filename)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="icon-4" />
                        Tải về
                      </button>
                      <button
                        onClick={() => deleteFile(file.filename)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="icon-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sample URLs */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-zinc-200 mb-2">URL mẫu:</h3>
            <div className="text-sm text-zinc-300 space-y-1">
              <div>• https://www.youtube.com/watch?v=VIDEO_ID</div>
              <div>• https://youtu.be/VIDEO_ID</div>
              <div>• https://www.youtube.com/embed/VIDEO_ID</div>
            </div>
            <button
              onClick={() => setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Sử dụng URL mẫu
            </button>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Xem trước: {previewFile}</h3>
              <button
                onClick={closePreview}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <video
                src={previewUrl}
                controls
                className="w-full h-auto max-h-96 bg-black rounded-lg"
                preload="metadata"
              >
                Trình duyệt không hỗ trợ video.
              </video>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => downloadFile(previewFile)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="icon-4" />
                Tải về
              </button>
              <button
                onClick={closePreview}
                className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeDownloader;
