import React, { useRef, useState, useEffect } from 'react';
import KaraokeSubtitle from './KaraokeSubtitle';

// Sample data cho demo
const sampleData = {
  "segments": [
    {
      "start": 0.0,
      "end": 6.0,
      "jp": "愛情： \"親の愛情は子供にとって大切だ。\"",
      "vi": "tình yêu thương: \"Tình yêu thương của cha mẹ rất quan trọng đối với con cái.\"",
      "tokens": [
        { "surface": "愛情", "reading": "あいじょう", "romaji": "aijou", "pos": "NOUN", "t": 0.1, "vi": "tình yêu thương", "end": 0.8 },
        { "surface": "：", "reading": "：", "romaji": "", "pos": "PUNCT", "t": 0.8, "vi": "", "end": 1.0 },
        { "surface": "「", "reading": "「", "romaji": "", "pos": "PUNCT", "t": 1.0, "vi": "", "end": 1.1 },
        { "surface": "親", "reading": "おや", "romaji": "oya", "pos": "NOUN", "t": 1.1, "vi": "cha mẹ", "end": 1.4 },
        { "surface": "の", "reading": "の", "romaji": "no", "pos": "PARTICLE", "t": 1.4, "vi": "của", "end": 1.6 },
        { "surface": "愛情", "reading": "あいじょう", "romaji": "aijou", "pos": "NOUN", "t": 1.6, "vi": "tình yêu thương", "end": 2.3 },
        { "surface": "は", "reading": "は", "romaji": "wa", "pos": "PARTICLE", "t": 2.3, "vi": "thì", "end": 2.5 },
        { "surface": "子供", "reading": "こども", "romaji": "kodomo", "pos": "NOUN", "t": 2.5, "vi": "con cái", "end": 3.2 },
        { "surface": "にとって", "reading": "にとって", "romaji": "ni totte", "pos": "PARTICLE", "t": 3.2, "vi": "đối với", "end": 3.8 },
        { "surface": "大切", "reading": "たいせつ", "romaji": "taisetsu", "pos": "ADJ", "t": 3.8, "vi": "quan trọng", "end": 4.5 },
        { "surface": "だ", "reading": "だ", "romaji": "da", "pos": "AUX", "t": 4.5, "vi": "là", "end": 4.8 },
        { "surface": "。", "reading": "。", "romaji": "", "pos": "PUNCT", "t": 4.8, "vi": "", "end": 5.0 },
        { "surface": "」", "reading": "」", "romaji": "", "pos": "PUNCT", "t": 5.0, "vi": "", "end": 5.1 }
      ]
    },
    {
      "start": 6.0,
      "end": 12.0,
      "jp": "感謝： \"ありがとうございます。\"",
      "vi": "cảm ơn: \"Cảm ơn bạn.\"",
      "tokens": [
        { "surface": "感謝", "reading": "かんしゃ", "romaji": "kansha", "pos": "NOUN", "t": 0.1, "vi": "cảm ơn", "end": 0.8 },
        { "surface": "：", "reading": "：", "romaji": "", "pos": "PUNCT", "t": 0.8, "vi": "", "end": 1.0 },
        { "surface": "「", "reading": "「", "romaji": "", "pos": "PUNCT", "t": 1.0, "vi": "", "end": 1.1 },
        { "surface": "ありがとう", "reading": "ありがとう", "romaji": "arigatou", "pos": "INTJ", "t": 1.1, "vi": "cảm ơn", "end": 2.5 },
        { "surface": "ございます", "reading": "ございます", "romaji": "gozaimasu", "pos": "AUX", "t": 2.5, "vi": "ạ", "end": 3.8 },
        { "surface": "。", "reading": "。", "romaji": "", "pos": "PUNCT", "t": 3.8, "vi": "", "end": 4.0 },
        { "surface": "」", "reading": "」", "romaji": "", "pos": "PUNCT", "t": 4.0, "vi": "", "end": 4.1 }
      ]
    },
    {
      "start": 12.0,
      "end": 18.0,
      "jp": "希望： \"明日は良い日になるでしょう。\"",
      "vi": "hy vọng: \"Ngày mai sẽ là một ngày tốt đẹp.\"",
      "tokens": [
        { "surface": "希望", "reading": "きぼう", "romaji": "kibou", "pos": "NOUN", "t": 0.1, "vi": "hy vọng", "end": 0.8 },
        { "surface": "：", "reading": "：", "romaji": "", "pos": "PUNCT", "t": 0.8, "vi": "", "end": 1.0 },
        { "surface": "「", "reading": "「", "romaji": "", "pos": "PUNCT", "t": 1.0, "vi": "", "end": 1.1 },
        { "surface": "明日", "reading": "あした", "romaji": "ashita", "pos": "NOUN", "t": 1.1, "vi": "ngày mai", "end": 1.8 },
        { "surface": "は", "reading": "は", "romaji": "wa", "pos": "PARTICLE", "t": 1.8, "vi": "thì", "end": 2.0 },
        { "surface": "良い", "reading": "よい", "romaji": "yoi", "pos": "ADJ", "t": 2.0, "vi": "tốt đẹp", "end": 2.5 },
        { "surface": "日", "reading": "ひ", "romaji": "hi", "pos": "NOUN", "t": 2.5, "vi": "ngày", "end": 2.8 },
        { "surface": "に", "reading": "に", "romaji": "ni", "pos": "PARTICLE", "t": 2.8, "vi": "sẽ", "end": 3.0 },
        { "surface": "なる", "reading": "なる", "romaji": "naru", "pos": "VERB", "t": 3.0, "vi": "trở thành", "end": 3.5 },
        { "surface": "でしょう", "reading": "でしょう", "romaji": "deshou", "pos": "AUX", "t": 3.5, "vi": "chắc chắn", "end": 4.2 },
        { "surface": "。", "reading": "。", "romaji": "", "pos": "PUNCT", "t": 4.2, "vi": "", "end": 4.5 },
        { "surface": "」", "reading": "」", "romaji": "", "pos": "PUNCT", "t": 4.5, "vi": "", "end": 4.6 }
      ]
    }
  ]
};

const KaraokeDemo = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [subtitleData, setSubtitleData] = useState(sampleData);
  const [jsonFile, setJsonFile] = useState(null);

  const handlePlayPause = async () => {
    if (!audioRef.current || isLoading) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      // Handle AbortError and other play() errors
      if (error.name === 'AbortError') {
        console.log('Play request was interrupted');
      } else {
        console.error('Audio play error:', error);
      }
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      // Clean up previous audio URL
      if (audioFile) {
        URL.revokeObjectURL(audioFile);
      }
      
      const url = URL.createObjectURL(file);
      setAudioFile(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
  };

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(String(reader.result));
          console.log('Uploaded JSON:', obj);
          
          if (!obj?.segments || !Array.isArray(obj.segments)) {
            throw new Error("JSON không đúng schema (thiếu 'segments').");
          }
          
          setSubtitleData(obj);
          setJsonFile(file.name);
          
          // Reset the input so the same file can be selected again
          event.target.value = '';
          
          alert(`Đã tải thành công ${obj.segments.length} segments từ file JSON!`);
        } catch (err) {
          console.error('JSON parse error:', err);
          alert("Lỗi đọc JSON: " + err.message);
        }
      };
      reader.readAsText(file, "utf-8");
    }
  };

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioFile) {
        URL.revokeObjectURL(audioFile);
      }
    };
  }, [audioFile]);

  return (
    <div className="karaoke-demo-container bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Karaoke Subtitle Demo</h2>
      
      {/* File Upload Section */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <label className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
            Upload Audio
          </label>
          <label className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer">
            <input
              type="file"
              accept="application/json"
              onChange={handleJsonUpload}
              className="hidden"
            />
            Upload JSON
          </label>
        </div>
        
        {/* Upload Status */}
        <div className="flex items-center justify-center gap-4 text-sm">
          {audioFile && (
            <span className="text-green-400">
              ✓ Audio: {audioFile.split('/').pop()}
            </span>
          )}
          {jsonFile && (
            <span className="text-blue-400">
              ✓ JSON: {jsonFile}
            </span>
          )}
        </div>
      </div>
      
      {/* Audio Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !audioFile}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isLoading || !audioFile
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Loading...' : (!audioFile ? 'Upload Audio First' : (isPlaying ? 'Pause' : 'Play'))}
          </button>
          <span className="text-sm text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div 
          className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Karaoke Subtitle */}
      <div className="karaoke-subtitle-wrapper bg-black rounded-lg p-6 mb-6">
        <KaraokeSubtitle
          segments={subtitleData.segments}
          audioRef={audioRef}
          numberOfLines={3}
          className="text-center"
        />
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setIsPlaying(false);
        }}
        preload="metadata"
        controls
        style={{ display: 'none' }}
      >
        {/* No audio sources - user needs to upload their own audio */}
        Your browser does not support the audio element.
      </audio>

      {/* Instructions */}
      <div className="text-sm text-gray-400 text-center">
        <p>1. Upload an audio file using the "Upload Audio" button above</p>
        <p>2. Upload a JSON subtitle file using the "Upload JSON" button above</p>
        <p>3. Click "Play" to see karaoke subtitle in action</p>
        <p>4. Each token will highlight as the audio plays through the segment</p>
        <p className="text-yellow-400 mt-2">Note: You can use the sample data or upload your own audio and JSON files.</p>
      </div>
    </div>
  );
};

export default KaraokeDemo;
