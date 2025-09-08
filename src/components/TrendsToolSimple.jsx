import React, { useState } from 'react';
import { TrendingUp, X } from 'lucide-react';

const TrendsToolSimple = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('vi-VN'));

  const testTrends = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test với data mẫu trước
      setTimeout(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timestamp = now.toISOString();
        
        setResult({
          success: true,
          date_jst: today,
          items: [
            {
              platform: "x",
              region: "worldwide",
              label: "#AI",
              type: "hashtag",
              source: "https://trends24.in/",
              collected_at: timestamp
            },
            {
              platform: "tiktok",
              region: "worldwide", 
              label: "#fyp",
              type: "hashtag",
              source: "https://ads.tiktok.com/",
              collected_at: timestamp
            },
            {
              platform: "google",
              region: "worldwide",
              label: "ChatGPT",
              type: "search",
              source: "pytrends:worldwide",
              collected_at: timestamp
            }
          ],
          csv_file: `trends_data/trends_${today.replace(/-/g, '')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}00.csv`
        });
        setIsLoading(false);
      }, 2000);

    } catch (err) {
      setError('Error: ' + err.message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="icon-5" />
              Trends Tool (Test)
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              📅 Hôm nay: {currentDate}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="icon-5" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={testTrends}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Testing...
              </>
            ) : (
              <>
                <TrendingUp className="icon-4" />
                Test Trends Collection
              </>
            )}
          </button>

          {result && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Date:</strong> {result.date_jst}</p>
                <p><strong>Total items:</strong> {result.items?.length || 0}</p>
                <p><strong>CSV file:</strong> {result.csv_file}</p>
                
                {result.items && result.items.length > 0 && (
                  <div>
                    <strong>Sample items:</strong>
                    <div className="mt-2 space-y-1">
                      {result.items.map((item, index) => (
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
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-red-300">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p className="text-sm text-gray-300">
              This is a simplified test version. The full trends tool will be available once dependencies are installed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsToolSimple;
