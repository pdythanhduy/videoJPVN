import React, { useState, useEffect } from 'react';
import { Video, Upload, Download, Trash2, X, Play, Settings, Image, Wand2 } from 'lucide-react';

const AIVideoTool = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [platform, setPlatform] = useState('demo');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [availableStyles, setAvailableStyles] = useState([]);
  const [availableAspectRatios, setAvailableAspectRatios] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadAvailablePlatforms();
      loadAvailableStyles();
      loadAvailableAspectRatios();
      loadVideoFiles();
    }
  }, [isOpen]);

  const loadAvailablePlatforms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-video/platforms');
      const data = await response.json();
      setAvailablePlatforms(data.platforms || ['demo']);
    } catch (err) {
      console.error('Error loading platforms:', err);
      setAvailablePlatforms(['demo']); // Fallback
    }
  };

  const loadAvailableStyles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-video/styles');
      const data = await response.json();
      setAvailableStyles(data.styles || ['realistic', 'animated', 'cinematic']);
    } catch (err) {
      console.error('Error loading styles:', err);
      setAvailableStyles(['realistic', 'animated', 'cinematic']); // Fallback
    }
  };

  const loadAvailableAspectRatios = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-video/aspect-ratios');
      const data = await response.json();
      setAvailableAspectRatios(data.aspect_ratios || ['16:9', '9:16', '1:1']);
    } catch (err) {
      console.error('Error loading aspect ratios:', err);
      setAvailableAspectRatios(['16:9', '9:16', '1:1']); // Fallback
    }
  };

  const loadVideoFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai-video/files');
      const data = await response.json();
      setVideoFiles(data.files);
    } catch (err) {
      console.error('Error loading video files:', err);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const generateVideoFromText = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('duration', duration.toString());
      formData.append('platform', platform);
      formData.append('style', style);
      formData.append('aspect_ratio', aspectRatio);

      console.log('Sending request to generate video...');
      
      const response = await fetch('http://localhost:8000/api/ai-video/generate', {
        method: 'POST',
        body: formData
      });

      console.log('Response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setResult(data);
        loadVideoFiles(); // Refresh file list
      } else {
        setError(data.error || 'Failed to generate video');
      }
    } catch (err) {
      console.error('Video generation error:', err);
      setError('Connection error: ' + err.message);
    } finally {
      setIsLoading(false);
      console.log('Loading finished');
    }
  };

  const generateVideoFromImage = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', prompt);
      formData.append('duration', duration.toString());
      formData.append('platform', platform);

      console.log('Sending request to generate video from image...');
      
      const response = await fetch('http://localhost:8000/api/ai-video/generate-from-image', {
        method: 'POST',
        body: formData
      });

      console.log('Response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setResult(data);
        loadVideoFiles(); // Refresh file list
      } else {
        setError(data.error || 'Failed to generate video from image');
      }
    } catch (err) {
      console.error('Video generation from image error:', err);
      setError('Connection error: ' + err.message);
    } finally {
      setIsLoading(false);
      console.log('Loading finished');
    }
  };

  const downloadFile = async (filename) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ai-video/download/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (err) {
      alert('Download error: ' + err.message);
    }
  };

  const deleteFile = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/ai-video/files/${filename}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadVideoFiles(); // Refresh file list
      } else {
        alert('Failed to delete file');
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
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
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="icon-5" />
            AI Video Generator
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="icon-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="icon-4" />
                Configuration
              </h3>

              {/* Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Video Prompt:</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to create... (e.g., 'A cat playing with a ball of yarn in a sunny garden')"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  rows={4}
                />
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Duration: {duration} seconds
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Platform */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Platform:</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {availablePlatforms.map(p => (
                    <option key={p} value={p} className="capitalize">{p}</option>
                  ))}
                </select>
              </div>

              {/* Style */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Style:</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {availableStyles.map(s => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Aspect Ratio:</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {availableAspectRatios.map(ar => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-3">
                <button
                  onClick={generateVideoFromText}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="icon-4" />
                      Generate from Text
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image className="icon-4" />
                Generate from Image
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <button
                onClick={generateVideoFromImage}
                disabled={isLoading || !selectedImage || !prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="icon-4" />
                    Generate from Image
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Play className="icon-4" />
                  Generation Result
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}</p>
                  <p><strong>Platform:</strong> {result.platform}</p>
                  <p><strong>Prompt:</strong> {result.prompt}</p>
                  {result.duration && <p><strong>Duration:</strong> {result.duration}s</p>}
                  {result.style && <p><strong>Style:</strong> {result.style}</p>}
                  {result.aspect_ratio && <p><strong>Aspect Ratio:</strong> {result.aspect_ratio}</p>}
                  {result.video_url && (
                    <p><strong>Video URL:</strong> 
                      <a href={result.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
                        {result.video_url}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-red-300">Error</h3>
                <p className="text-red-200">{error}</p>
              </div>
            )}
          </div>

          {/* Files Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Video className="icon-4" />
                Generated Videos
              </h3>
              
              {videoFiles.length === 0 ? (
                <p className="text-gray-400 text-sm">No video files found</p>
              ) : (
                <div className="space-y-2">
                  {videoFiles.map((file, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(file.size)} • {formatDate(file.created)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadFile(file.filename)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Download"
                        >
                          <Download className="icon-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.filename)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="icon-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">💡 Tips for Better Results</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• <strong>Be specific:</strong> "A golden retriever playing in a park" vs "dog"</p>
                <p>• <strong>Include details:</strong> lighting, camera angle, mood</p>
                <p>• <strong>Use English:</strong> Most AI models work best with English prompts</p>
                <p>• <strong>Keep it simple:</strong> Avoid complex scenes with many elements</p>
                <p>• <strong>Consider duration:</strong> Shorter videos (3-10s) often work better</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVideoTool;
