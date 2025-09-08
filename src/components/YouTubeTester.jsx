import React, { useState } from 'react';
import { Youtube, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

const YouTubeTester = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const testVideos = [
    {
      name: "Rick Astley - Never Gonna Give You Up",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Video test chuẩn, luôn có sẵn",
      expected: "success"
    },
    {
      name: "PSY - GANGNAM STYLE",
      url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      description: "Video K-pop nổi tiếng",
      expected: "success"
    },
    {
      name: "Luis Fonsi - Despacito",
      url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
      description: "Video có nhiều format",
      expected: "success"
    },
    {
      name: "Queen - Bohemian Rhapsody",
      url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
      description: "Video âm nhạc cổ điển",
      expected: "success"
    },
    {
      name: "3Blue1Brown - Neural Networks",
      url: "https://www.youtube.com/watch?v=aircAruvnKk",
      description: "Video giáo dục",
      expected: "success"
    }
  ];

  const testVideo = async (video) => {
    try {
      // Test lấy thông tin video
      const infoResponse = await fetch('http://localhost:8000/api/youtube/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: video.url })
      });

      const infoData = await infoResponse.json();
      
      if (!infoData.success) {
        return {
          ...video,
          status: 'error',
          message: `Lỗi lấy thông tin: ${infoData.error}`,
          details: null
        };
      }

      // Test lấy danh sách format
      const formatsResponse = await fetch('http://localhost:8000/api/youtube/formats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: video.url })
      });

      const formatsData = await formatsResponse.json();
      
      if (!formatsData.success) {
        return {
          ...video,
          status: 'error',
          message: `Lỗi lấy format: ${formatsData.error}`,
          details: infoData.info
        };
      }

      const availableFormats = formatsData.formats.filter(f => f.has_url);
      
      if (availableFormats.length === 0) {
        return {
          ...video,
          status: 'warning',
          message: `Không có format khả dụng (${formatsData.formats.length} format, 0 khả dụng)`,
          details: infoData.info
        };
      }

      return {
        ...video,
        status: 'success',
        message: `Có ${availableFormats.length} format khả dụng`,
        details: infoData.info,
        formats: availableFormats
      };

    } catch (error) {
      return {
        ...video,
        status: 'error',
        message: `Lỗi kết nối: ${error.message}`,
        details: null
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);

    for (const video of testVideos) {
      const result = await testVideo(video);
      setTestResults(prev => [...prev, result]);
      
      // Delay giữa các test
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="icon-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="icon-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="icon-4 text-red-500" />;
      default:
        return <AlertCircle className="icon-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Youtube className="icon-5" />
            YouTube Tester
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Test Button */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">Test Video YouTube</h3>
            <p className="text-zinc-300 mb-4">
              Test các video YouTube để kiểm tra tính năng download
            </p>
            <button
              onClick={runAllTests}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang test...
                </>
              ) : (
                <>
                  <Play className="icon-4" />
                  Chạy Test
                </>
              )}
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Kết quả Test</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{result.name}</h4>
                        <p className="text-sm text-zinc-300 mb-2">{result.description}</p>
                        <p className="text-sm text-zinc-400 mb-2">
                          <strong>URL:</strong> {result.url}
                        </p>
                        <p className="text-sm text-zinc-400 mb-2">
                          <strong>Kết quả:</strong> {result.message}
                        </p>
                        {result.details && (
                          <div className="text-sm text-zinc-400">
                            <p><strong>Tiêu đề:</strong> {result.details.title}</p>
                            <p><strong>Kênh:</strong> {result.details.uploader}</p>
                            <p><strong>Thời lượng:</strong> {Math.floor(result.details.duration / 60)}:{(result.details.duration % 60).toString().padStart(2, '0')}</p>
                            <p><strong>Lượt xem:</strong> {result.details.view_count?.toLocaleString()}</p>
                          </div>
                        )}
                        {result.formats && (
                          <div className="text-sm text-zinc-400 mt-2">
                            <p><strong>Format khả dụng:</strong></p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {result.formats.slice(0, 4).map((format, i) => (
                                <div key={i} className="bg-zinc-700 p-2 rounded text-xs">
                                  {format.format_id} - {format.ext} - {format.resolution}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {testResults.length > 0 && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Tổng kết</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {testResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-zinc-300">Thành công</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {testResults.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm text-zinc-300">Cảnh báo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {testResults.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-zinc-300">Lỗi</div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">Hướng dẫn</h3>
            <div className="text-sm text-zinc-300 space-y-2">
              <p><strong>✅ Thành công:</strong> Video có thể download được</p>
              <p><strong>⚠️ Cảnh báo:</strong> Video có vấn đề nhưng vẫn có thể download</p>
              <p><strong>❌ Lỗi:</strong> Video không thể download được</p>
              <p><strong>💡 Lưu ý:</strong> Sử dụng video thành công để test tính năng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeTester;
