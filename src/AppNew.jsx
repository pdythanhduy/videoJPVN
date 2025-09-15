import React, { useState } from 'react';
import VideoCreator from './components/VideoCreator';
import MainVideoPlayer from './components/MainVideoPlayer';

function App() {
  const [currentPage, setCurrentPage] = useState('main');

  const Navigation = () => (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-white">Navigation</h2>
        <div className="space-y-2">
          <button
            onClick={() => setCurrentPage('main')}
            className={`w-full px-4 py-2 rounded text-left ${
              currentPage === 'main' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📺 Main Video Player
          </button>
          <button
            onClick={() => setCurrentPage('video-creator')}
            className={`w-full px-4 py-2 rounded text-left ${
              currentPage === 'video-creator' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎬 Video Creator
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      {currentPage === 'main' && <MainVideoPlayer />}
      {currentPage === 'video-creator' && <VideoCreator />}
    </div>
  );
}

export default App;
