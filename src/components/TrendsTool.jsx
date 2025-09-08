import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Trash2, X, TikTok, FileText, Settings, Play } from 'lucide-react';

const TrendsTool = ({ isOpen, onClose }) => {
  const [regions, setRegions] = useState(['worldwide']);
  const [limit, setLimit] = useState(30);
  const [includeTiktokSongs, setIncludeTiktokSongs] = useState(false);
  const [excludePlatforms, setExcludePlatforms] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [trendFiles, setTrendFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadAvailableRegions();
      loadAvailablePlatforms();
      loadTrendFiles();
    }
  }, [isOpen]);

  const loadAvailableRegions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/trends/regions');
      const data = await response.json();
      setAvailableRegions(data.regions);
    } catch (err) {
      console.error('Error loading regions:', err);
    }
  };

  const loadAvailablePlatforms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/trends/platforms');
      const data = await response.json();
      setAvailablePlatforms(data.platforms);
    } catch (err) {
      console.error('Error loading platforms:', err);
    }
  };

  const loadTrendFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/trends/files');
      const data = await response.json();
      setTrendFiles(data.files);
    } catch (err) {
      console.error('Error loading trend files:', err);
    }
  };

  const handleRegionChange = (region, checked) => {
    if (checked) {
      setRegions([...regions, region]);
    } else {
      setRegions(regions.filter(r => r !== region));
    }
  };

  const handlePlatformChange = (platform, checked) => {
    if (checked) {
      setExcludePlatforms([...excludePlatforms, platform]);
    } else {
      setExcludePlatforms(excludePlatforms.filter(p => p !== platform));
    }
  };

  const collectTrends = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/trends/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regions,
          limit,
          include_tiktok_songs: includeTiktokSongs,
          exclude_platforms: excludePlatforms
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        loadTrendFiles(); // Refresh file list
      } else {
        setError(data.error || 'Failed to collect trends');
      }
    } catch (err) {
      console.error('Trends collection error:', err);
      setError('Connection error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (filename) => {
    try {
      const response = await fetch(`http://localhost:8000/api/trends/download/${filename}`);
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
      const response = await fetch(`http://localhost:8000/api/trends/files/${filename}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadTrendFiles(); // Refresh file list
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
            <TrendingUp className="icon-5" />
            Trends & Hashtags Tool
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

              {/* Regions */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Regions:</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableRegions.map(region => (
                    <label key={region} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={regions.includes(region)}
                        onChange={(e) => handleRegionChange(region, e.target.checked)}
                        className="rounded"
                      />
                      <span className="capitalize">{region.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Limit */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Limit per source: {limit}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Platforms to exclude */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exclude platforms:</label>
                <div className="flex gap-4">
                  {availablePlatforms.map(platform => (
                    <label key={platform} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={excludePlatforms.includes(platform)}
                        onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                        className="rounded"
                      />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* TikTok Songs */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeTiktokSongs}
                    onChange={(e) => setIncludeTiktokSongs(e.target.checked)}
                    className="rounded"
                  />
                  <TikTok className="icon-4" />
                  Include TikTok songs
                </label>
              </div>

              {/* Collect Button */}
              <button
                onClick={collectTrends}
                disabled={isLoading || regions.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Collecting...
                  </>
                ) : (
                  <>
                    <Play className="icon-4" />
                    Collect Trends
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="icon-4" />
                  Results
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {result.date_jst}</p>
                  <p><strong>Total items:</strong> {result.items?.length || 0}</p>
                  <p><strong>CSV file:</strong> {result.csv_file}</p>
                  
                  {/* Platform counts */}
                  {result.items && (
                    <div>
                      <strong>By platform:</strong>
                      <div className="mt-1">
                        {Object.entries(
                          result.items.reduce((acc, item) => {
                            acc[item.platform] = (acc[item.platform] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([platform, count]) => (
                          <span key={platform} className="inline-block bg-gray-700 px-2 py-1 rounded mr-2 mb-1 text-xs">
                            {platform}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
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
                <FileText className="icon-4" />
                Trend Files
              </h3>
              
              {trendFiles.length === 0 ? (
                <p className="text-gray-400 text-sm">No trend files found</p>
              ) : (
                <div className="space-y-2">
                  {trendFiles.map((file, index) => (
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

            {/* Sample Data Preview */}
            {result && result.items && result.items.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Sample Data</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.items.slice(0, 10).map((item, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.platform === 'x' ? 'bg-blue-600' :
                          item.platform === 'tiktok' ? 'bg-pink-600' :
                          'bg-green-600'
                        }`}>
                          {item.platform}
                        </span>
                        <span className="text-gray-400 text-xs">{item.region}</span>
                        <span className="text-gray-400 text-xs">{item.type}</span>
                      </div>
                      <p className="font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
                {result.items.length > 10 && (
                  <p className="text-gray-400 text-xs mt-2">
                    ... and {result.items.length - 10} more items
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsTool;
