import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Upload, Volume2, VolumeX } from 'lucide-react';

const VideoSubtitlePlayer = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [subtitleData, setSubtitleData] = useState(null);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [playPromise, setPlayPromise] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [karaokeMode, setKaraokeMode] = useState(false);
  const [highlightedTokens, setHighlightedTokens] = useState([]);
  const [displayMode, setDisplayMode] = useState('video'); // 'video' or 'radio'
  const [smoothScrolling, setSmoothScrolling] = useState(true);
  const [audioSource, setAudioSource] = useState('video'); // 'video' or 'audio'
  const [loadingError, setLoadingError] = useState(null);
  const [loadingType, setLoadingType] = useState(''); // 'video', 'audio', 'demo'
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontSize: 18,
    opacity: 0.9,
    position: 'bottom',
    showJapanese: true,
    showVietnamese: true,
    showRomaji: false,
    languageMode: 'vi' // 'vi' or 'en'
  });
  
  const [videoMode, setVideoMode] = useState('youtube'); // 'youtube' or 'tiktok'
  const [videoSize, setVideoSize] = useState({
    youtube: { 
      aspectRatio: '16/9', 
      maxWidth: '100%', 
      maxHeight: '70vh',
      className: 'w-full'
    },
    tiktok: { 
      aspectRatio: '9/16', 
      maxWidth: '400px', 
      maxHeight: '80vh',
      className: 'w-full max-w-sm mx-auto'
    }
  });

  // Sample data for demo
  const sampleData = {
    "duration": 8.72, // Video duration in seconds
    "segments": [
      {
        "start": 0.0,
        "end": 8.72,
        "jp": "ある大学の寮で、不思議な出来事がよく起こると言われています。夜になると、廊下から足音が聞こえてきます。",
        "vi": "Người ta nói rằng trong ký túc xá của một trường đại học thường xảy ra những chuyện kỳ lạ. Vào ban đêm, từ hành lang vang lên tiếng bước chân.",
        "en": "It is said that strange events often occur in a university dormitory. At night, footsteps can be heard from the hallway.",
        "tokens": [
          {
            "surface": "ある",
            "reading": "ある",
            "romaji": "aru",
            "pos": "ADNOM",
            "t": 0.05,
            "vi": "một",
            "en": "a",
            "end": 0.36
          },
          {
            "surface": "大学",
            "reading": "だいがく",
            "romaji": "daigaku",
            "pos": "NOUN",
            "t": 0.36,
            "vi": "đại học",
            "en": "university",
            "end": 0.88
          }
        ]
      }
    ]
  };

  // Initialize with sample data
  useEffect(() => {
    setSubtitleData(sampleData);
    
    // Set duration from JSON if available
    if (sampleData.duration) {
      setDuration(sampleData.duration);
    }
    
    // Load demo video if available
    const loadDemoVideo = async () => {
      try {
        setLoadingType('demo');
        
        // Try to load a demo video from the backend first
        const response = await fetch('/api/demo-video');
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoFile(url);
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.load();
          }
        } else {
          // Fallback: Create a simple demo video with canvas
          await createDemoVideo();
        }
        setLoadingType('');
      } catch (error) {
        console.log('No demo video available, creating fallback');
        try {
          await createDemoVideo();
        } catch (fallbackError) {
          console.log('Fallback demo video creation failed');
          setLoadingType('');
        }
      }
    };
    
    loadDemoVideo();
  }, []);

  // Set duration from subtitle data when it changes
  useEffect(() => {
    if (subtitleData?.duration && typeof subtitleData.duration === 'number') {
      setDuration(subtitleData.duration);
      console.log(`Duration updated from subtitle data: ${subtitleData.duration} seconds`);
    }
  }, [subtitleData]);

  // Cleanup play promise on unmount
  useEffect(() => {
    return () => {
      if (playPromise) {
        playPromise.catch(() => {}); // Ignore errors on cleanup
        setPlayPromise(null);
      }
    };
  }, [playPromise]);

  // Find current segment based on time
  useEffect(() => {
    if (!subtitleData?.segments || !isPlaying) return;

    const findCurrentSegment = () => {
      const time = currentTime;
      const segment = subtitleData.segments.find(seg => 
        time >= seg.start && time < seg.end
      );
      setCurrentSegment(segment || null);
    };

    findCurrentSegment();
  }, [currentSegment, currentTime, subtitleData, isPlaying]);

  // Update highlighted tokens for karaoke effect
  useEffect(() => {
    if (!karaokeMode || !currentSegment?.tokens || !isPlaying) {
      setHighlightedTokens([]);
      return;
    }

    const time = currentTime;
    const highlighted = currentSegment.tokens.filter(token => 
      time >= token.t && time < token.end
    );
    setHighlightedTokens(highlighted);
  }, [currentTime, currentSegment, karaokeMode, isPlaying]);

  // Get display segments for smooth scrolling
  const getDisplaySegments = () => {
    if (!subtitleData?.segments) return [];
    
    const current = currentSegment;
    if (!current) return subtitleData.segments.slice(0, 3);
    
    const currentIndex = subtitleData.segments.findIndex(seg => seg === current);
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(subtitleData.segments.length, startIndex + 3);
    
    return subtitleData.segments.slice(startIndex, endIndex);
  };

  const handlePlayPause = async () => {
    if (!videoRef.current && !audioRef.current) return;
    
    // Prevent multiple rapid clicks
    if (isProcessing) {
      console.log('Play/Pause already processing, ignoring click');
      return;
    }
    
    setIsProcessing(true);
    setLoadingError(null);
    
    try {
      if (isPlaying) {
        // Pause all media
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        
        // Determine which media to play
        const shouldPlayVideo = audioSource === 'video' && videoRef.current && videoFile;
        const shouldPlayAudio = audioSource === 'audio' && audioRef.current && audioFile;
        
        // Set loading type
        if (shouldPlayVideo) {
          setLoadingType('video');
        } else if (shouldPlayAudio) {
          setLoadingType('audio');
        } else {
          setLoadingType('media');
        }
        
        // Play video if available and selected
        if (shouldPlayVideo) {
          try {
            // Check if video has a valid source
            if (!videoRef.current.src || videoRef.current.readyState === 0) {
              throw new Error('Video has no valid source or not loaded');
            }
            
            // Check for decode errors before playing
            if (videoRef.current.error && videoRef.current.error.code === 4) {
              throw new Error('Video codec not supported. Please convert to MP4 with H.264 codec.');
            }
            
            // Simple play without complex loading logic
            await videoRef.current.play();
          } catch (playError) {
            if (playError.name === 'AbortError') {
              console.log('Video play was aborted');
              return;
            }
            console.error('Video play error:', playError);
            throw new Error(`Video play failed: ${playError.message}`);
          }
        }
        
        // Play audio if available and selected
        if (shouldPlayAudio) {
          try {
            await audioRef.current.play();
          } catch (playError) {
            if (playError.name === 'AbortError') {
              console.log('Audio play was aborted');
            } else {
              console.warn('Audio play error:', playError);
            }
          }
        }
        
        // If no media is available, show error
        if (!shouldPlayVideo && !shouldPlayAudio) {
          throw new Error('No media available to play');
        }
        
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play error:', error);
      setLoadingError(error.message);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
      setLoadingType('');
    }
  };

  const handleTimeUpdate = () => {
    const videoTime = videoRef.current?.currentTime || 0;
    const audioTime = audioRef.current?.currentTime || 0;
    const time = videoTime || audioTime;
    setCurrentTime(time);
  };

  const handleLoadedMetadata = () => {
    const videoDuration = videoRef.current?.duration || 0;
    const audioDuration = audioRef.current?.duration || 0;
    const dur = videoDuration || audioDuration;
    setDuration(dur);
  };

  // Create a simple demo video with canvas
  const createDemoVideo = async () => {
    try {
      setLoadingType('demo');
      
      // First try to load a real MP4 from backend
      try {
        const response = await fetch('/api/demo-video');
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoFile(url);
          setAudioSource('video');
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.load();
          }
          setLoadingType('');
          return;
        }
      } catch (error) {
        console.log('Backend demo video not available, trying public folder');
      }
      
      // Try to load from public folder
      try {
        const response = await fetch('/demo_video.mp4');
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoFile(url);
          setAudioSource('video');
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.load();
          }
          setLoadingType('');
          return;
        }
      } catch (error) {
        console.log('Public demo video not available, creating canvas video');
      }
      
      // Fallback: Create canvas video with better codec support
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      
      // Try different codecs in order of preference
      const codecs = [
        'video/mp4;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      
      let selectedCodec = null;
      for (const codec of codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          selectedCodec = codec;
          break;
        }
      }
      
      if (!selectedCodec) {
        throw new Error('No supported video codec found');
      }
      
      console.log('Using codec:', selectedCodec);
      
      // Create video stream
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedCodec
      });
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedCodec });
          const url = URL.createObjectURL(blob);
          setVideoFile(url);
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.load();
          }
          setLoadingType('');
          resolve();
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Draw demo content
        let frame = 0;
        const drawFrame = () => {
          // Clear canvas
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw demo text
          ctx.fillStyle = '#ffffff';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Demo Video', canvas.width / 2, canvas.height / 2 - 50);
          
          ctx.font = '24px Arial';
          ctx.fillText(`Frame: ${frame}`, canvas.width / 2, canvas.height / 2 + 20);
          
          // Draw moving circle
          ctx.fillStyle = '#ff6b6b';
          const x = (canvas.width / 2) + Math.sin(frame * 0.1) * 100;
          const y = canvas.height / 2;
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.fill();
          
          frame++;
          
          if (frame < 150) { // 5 seconds at 30fps
            requestAnimationFrame(drawFrame);
          } else {
            mediaRecorder.stop();
          }
        };
        
        drawFrame();
      });
    } catch (error) {
      console.error('Demo video creation failed:', error);
      setLoadingType('');
      throw error;
    }
  };

  // Create a minimal MP4 file with H.264 codec
  const createMinimalMP4 = () => {
    try {
      // Try to use a real MP4 file from the backend first
      return null; // Let it fall back to canvas method
    } catch (error) {
      console.error('Failed to create minimal MP4:', error);
      return null;
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      // Check for supported video formats
      const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
      const partiallySupportedFormats = ['video/avi', 'video/mov', 'video/wmv'];
      
      if (!supportedFormats.includes(file.type) && !partiallySupportedFormats.includes(file.type)) {
        setLoadingError(`Unsupported video format: ${file.type}. Recommended: MP4, WebM, OGG`);
        return;
      }
      
      // Warn about partially supported formats
      if (partiallySupportedFormats.includes(file.type)) {
        console.warn('Partially supported format:', file.type);
      }
      
      if (videoFile) URL.revokeObjectURL(videoFile);
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setIsLoading(true);
      setLoadingError(null);
      setLoadingType('video');
      
      // Auto-set audio source to video when video is uploaded
      setAudioSource('video');
      
      console.log('Video file info:', {
        name: file.name,
        type: file.type,
        size: file.size,
        url: url
      });
      
      // Wait for next tick to ensure videoRef is available
      setTimeout(() => {
      if (videoRef.current) {
          // Clear any existing sources
          videoRef.current.src = '';
          videoRef.current.load();
          
          // Set new source
        videoRef.current.src = url;
        videoRef.current.load();
          
          console.log('Video source set:', url);
          console.log('Video readyState:', videoRef.current.readyState);
        } else {
          console.error('Video ref not available');
          setLoadingError('Video element not available');
        }
      }, 100);
    } else {
      setLoadingError('Please select a valid video file');
    }
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      if (audioFile) URL.revokeObjectURL(audioFile);
      const url = URL.createObjectURL(file);
      setAudioFile(url);
      setLoadingError(null);
      setLoadingType('audio');
      
      // Auto-set audio source to audio when audio file is uploaded
      setAudioSource('audio');
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        
        // Clear loading when audio is ready
        audioRef.current.addEventListener('loadedmetadata', () => {
          setLoadingType('');
        }, { once: true });
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
          if (!obj?.segments || !Array.isArray(obj.segments)) {
            throw new Error("JSON không đúng schema (thiếu 'segments').");
          }
          
          // Set subtitle data
          setSubtitleData(obj);
          
          // Set duration from JSON if available
          if (obj.duration && typeof obj.duration === 'number') {
            setDuration(obj.duration);
            console.log(`Duration set from JSON: ${obj.duration} seconds`);
          }
          
          event.target.value = '';
          const durationMsg = obj.duration ? ` và duration ${obj.duration}s` : '';
          alert(`Đã tải thành công ${obj.segments.length} segments${durationMsg} từ file JSON!`);
        } catch (err) {
          console.error('JSON parse error:', err);
          alert("Lỗi đọc JSON: " + err.message);
        }
      };
      reader.readAsText(file, "utf-8");
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  const getSubtitleText = () => {
    if (!currentSegment) return '';
    
    if (subtitleSettings.languageMode === 'vi') {
      return currentSegment.vi || '';
    } else if (subtitleSettings.languageMode === 'en') {
      return currentSegment.en || '';
    }
    return '';
  };

  const getJapaneseText = () => {
    return currentSegment?.jp || '';
  };

  const getRomajiText = () => {
    if (!currentSegment?.tokens) return '';
    return currentSegment.tokens
      .map(token => token.romaji)
      .filter(Boolean)
      .join(' ');
  };

  const renderKaraokeText = (text, tokens, highlightedTokens) => {
    if (!tokens || !karaokeMode) {
      return <span>{text}</span>;
    }

    let currentIndex = 0;
    const elements = [];

    tokens.forEach((token, index) => {
      const isHighlighted = highlightedTokens.some(ht => ht.surface === token.surface);
      const tokenStart = text.indexOf(token.surface, currentIndex);
      
      if (tokenStart !== -1) {
        // Add text before token
        if (tokenStart > currentIndex) {
          elements.push(
            <span key={`before-${index}`}>
              {text.substring(currentIndex, tokenStart)}
            </span>
          );
        }
        
        // Add highlighted token
        elements.push(
          <span
            key={`token-${index}`}
            className={`transition-all duration-200 ${
              isHighlighted 
                ? 'bg-yellow-400 text-black font-bold px-1 rounded' 
                : 'text-gray-300'
            }`}
          >
            {token.surface}
          </span>
        );
        
        currentIndex = tokenStart + token.surface.length;
      }
    });

    // Add remaining text
    if (currentIndex < text.length) {
      elements.push(
        <span key="remaining">
          {text.substring(currentIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="video-subtitle-player bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video Subtitle Player</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Video/Audio Display */}
          <div 
            className={`relative bg-black rounded-lg overflow-hidden mb-6 ${videoSize[videoMode].className}`}
            style={{ 
              aspectRatio: videoSize[videoMode].aspectRatio,
              maxWidth: videoSize[videoMode].maxWidth,
              maxHeight: videoSize[videoMode].maxHeight
            }}
          >
            {displayMode === 'radio' ? (
              // Radio Mode - Audio only with visualizer
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                <div className="text-center text-white">
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    {/* Radio Visualizer */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <Volume2 className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    {/* Animated rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">📻 Radio Mode</h3>
                  <p className="text-lg opacity-80">Audio Only</p>
                  {isPlaying && (
                    <div className="mt-4 flex justify-center space-x-1">
                      <div className="w-1 h-8 bg-white/60 animate-pulse"></div>
                      <div className="w-1 h-6 bg-white/40 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-10 bg-white/80 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-4 bg-white/30 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      <div className="w-1 h-7 bg-white/50 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  )}
                </div>
              </div>
            ) : videoFile ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={() => {
                  console.log('Video can play');
                  setIsLoading(false);
                  setLoadingType('');
                }}
                onPlay={() => {
                  console.log('Video playing');
                  setIsPlaying(true);
                }}
                onPause={() => {
                  console.log('Video paused');
                  setIsPlaying(false);
                }}
                onEnded={() => {
                  console.log('Video ended');
                  setIsPlaying(false);
                }}
                onWaiting={() => {
                  console.log('Video waiting');
                  setIsLoading(true);
                  setLoadingType('video');
                }}
                onPlaying={() => {
                  console.log('Video playing event');
                  setIsLoading(false);
                  setLoadingType('');
                }}
                onError={(e) => {
                  console.error('Video error details:', e);
                  console.error('Video error code:', e.target.error?.code);
                  console.error('Video error message:', e.target.error?.message);
                  
                  setIsLoading(false);
                  setLoadingType('');
                  
                  // Handle specific error codes
                  const errorCode = e.target.error?.code;
                  const errorMessage = e.target.error?.message;
                  
                  let userMessage = 'Video playback error';
                  
                  if (errorCode === 4) {
                    userMessage = 'Video format not supported. Please try MP4, WebM, or OGG format.';
                  } else if (errorCode === 3) {
                    userMessage = 'Video decoding error. File may be corrupted.';
                  } else if (errorCode === 2) {
                    userMessage = 'Network error loading video.';
                  } else if (errorCode === 1) {
                    userMessage = 'Video loading aborted.';
                  }
                  
                  if (errorMessage?.includes('DEMUXER_ERROR')) {
                    userMessage = 'Video codec not supported. Please convert to MP4 with H.264 codec.';
                  }
                  
                  setLoadingError(userMessage);
                }}
                onLoadStart={() => {
                  console.log('Video load started');
                  setIsLoading(true);
                  setLoadingType('video');
                }}
                onLoadedData={() => {
                  console.log('Video data loaded');
                  setIsLoading(false);
                  setLoadingType('');
                }}
                muted={isMuted || audioSource === 'audio'}
                volume={volume}
                controls={false}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p>Upload a video file to start</p>
                </div>
              </div>
            )}

            {/* Audio-only indicator */}
            {audioFile && !videoFile && displayMode !== 'radio' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Volume2 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg">Audio Mode</p>
                </div>
              </div>
            )}

            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                disabled={isLoading || isProcessing || (!videoFile && !audioFile)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isLoading || isProcessing || (!videoFile && !audioFile)
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">
                    {loadingType === 'video' && '🎬 Loading video...'}
                    {loadingType === 'audio' && '🎵 Loading audio...'}
                    {loadingType === 'demo' && '📺 Loading demo...'}
                    {loadingType === 'media' && '⏳ Loading media...'}
                    {!loadingType && '⏳ Loading...'}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {audioSource === 'video' ? 'Using video audio' : 'Using audio file'}
                  </p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {loadingError && (
              <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p className="text-sm mb-2">Video Error</p>
                  <p className="text-xs text-red-200 mb-4">{loadingError}</p>
                  
                  {loadingError.includes('codec') && (
                    <div className="text-xs text-yellow-200 mb-4 p-2 bg-yellow-900/50 rounded">
                      <p className="font-semibold">💡 Solution:</p>
                      <p>Convert your video to MP4 with H.264 codec using:</p>
                      <p>• Online: CloudConvert, Convertio</p>
                      <p>• Software: HandBrake, VLC</p>
                      <p>• Command: ffmpeg -i input.mp4 -c:v libx264 output.mp4</p>
                    </div>
                  )}
                  
                  <div className="space-x-2">
                    <button
                      onClick={() => setLoadingError(null)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        setLoadingError(null);
                        setVideoFile(null);
                        if (videoRef.current) {
                          videoRef.current.src = '';
                          videoRef.current.load();
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Try Different Video
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtitle Display */}
          {subtitleData?.segments && subtitleData.segments.length > 0 && (
            <div 
              className={`bg-black/80 backdrop-blur-sm rounded-lg p-4 lg:p-6 text-center ${
                videoMode === 'tiktok' ? 'max-w-sm mx-auto' : 'w-full'
              }`}
              style={{
                fontSize: `${subtitleSettings.fontSize}px`,
                opacity: subtitleSettings.opacity,
                height: smoothScrolling ? '18rem' : 'auto',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {smoothScrolling ? (
                <div 
                  className="transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateY(${getDisplaySegments().findIndex(seg => seg === currentSegment) * -6}rem)`
                  }}
                >
                  {getDisplaySegments().map((segment, index) => {
                    const isCurrent = segment === currentSegment;
                    const isNext = index > getDisplaySegments().findIndex(seg => seg === currentSegment);
                    const isPrevious = index < getDisplaySegments().findIndex(seg => seg === currentSegment);
                    
                    let segmentClass = 'mb-6 transition-all duration-300';
                    if (isCurrent) segmentClass += ' opacity-100 scale-105';
                    else if (isNext) segmentClass += ' opacity-60 scale-95';
                    else if (isPrevious) segmentClass += ' opacity-40 scale-90';

                    return (
                      <div key={`${segment.start}-${segment.end}`} className={segmentClass}>
              {/* Japanese Text */}
              {subtitleSettings.showJapanese && (
                <div className="text-2xl font-semibold mb-2 text-white">
                            {karaokeMode && segment?.tokens ? (
                              renderKaraokeText(segment.jp || '', segment.tokens, highlightedTokens)
                            ) : (
                              segment.jp || ''
                            )}
                </div>
              )}

              {/* Romaji Text */}
              {subtitleSettings.showRomaji && (
                <div className="text-lg mb-2 text-gray-300 italic">
                            {karaokeMode && segment?.tokens ? (
                              renderKaraokeText(
                                segment.tokens?.map(token => token.romaji).filter(Boolean).join(' ') || '', 
                                segment.tokens, 
                                highlightedTokens
                              )
                            ) : (
                              segment.tokens?.map(token => token.romaji).filter(Boolean).join(' ') || ''
                            )}
                          </div>
                        )}

                        {/* Translation Text */}
                        {(subtitleSettings.showVietnamese || subtitleSettings.languageMode !== 'vi') && (
                          <div className="text-xl text-gray-200">
                            {subtitleSettings.languageMode === 'vi' ? segment.vi : segment.en}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Static display (current segment only)
                currentSegment && (
                  <>
                    {/* Japanese Text */}
                    {subtitleSettings.showJapanese && (
                      <div className="text-2xl font-semibold mb-2 text-white">
                        {karaokeMode && currentSegment?.tokens ? (
                          renderKaraokeText(getJapaneseText(), currentSegment.tokens, highlightedTokens)
                        ) : (
                          getJapaneseText()
                        )}
                      </div>
                    )}

                    {/* Romaji Text */}
                    {subtitleSettings.showRomaji && (
                      <div className="text-lg mb-2 text-gray-300 italic">
                        {karaokeMode && currentSegment?.tokens ? (
                          renderKaraokeText(getRomajiText(), currentSegment.tokens, highlightedTokens)
                        ) : (
                          getRomajiText()
                        )}
                </div>
              )}

              {/* Translation Text */}
              {(subtitleSettings.showVietnamese || subtitleSettings.languageMode !== 'vi') && (
                <div className="text-xl text-gray-200">
                  {getSubtitleText()}
                </div>
                    )}
                  </>
                )
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className={`mt-4 ${videoMode === 'tiktok' ? 'max-w-sm mx-auto' : 'w-full'}`}>
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Volume Control */}
          <div className={`mt-4 ${videoMode === 'tiktok' ? 'max-w-sm mx-auto' : 'w-full'}`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleMuteToggle}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <span className="text-sm text-gray-400 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full lg:w-80 bg-gray-800 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            
            {/* File Uploads */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Video File</label>
                <div className="space-y-2">
                <label className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  Upload Video
                </label>
                  <button
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        setLoadingType('demo');
                        setLoadingError(null);
                        // Try to load demo video from backend
                        const response = await fetch('/api/demo-video');
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = URL.createObjectURL(blob);
                          setVideoFile(url);
                          setAudioSource('video');
                          if (videoRef.current) {
                            videoRef.current.src = url;
                            videoRef.current.load();
                          }
                        } else {
                          alert('Demo video không có sẵn. Vui lòng upload video của bạn.');
                        }
                      } catch (error) {
                        alert('Không thể load demo video. Vui lòng upload video của bạn.');
                      } finally {
                        setIsLoading(false);
                        setLoadingType('');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                  >
                    Load Demo Video
                  </button>
                  <button
                    onClick={createDemoVideo}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm ml-2"
                  >
                    Create Demo Video
                  </button>
                </div>
                {videoFile && (
                  <p className="text-xs text-green-400 mt-1">✓ Video loaded</p>
                )}
                
                {/* Video Conversion Guide */}
                <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-200 mb-2">💡 Video Format Guide</h4>
                  <div className="text-xs text-yellow-100 space-y-1">
                    <p><strong>Recommended:</strong> MP4 with H.264 codec</p>
                    <p><strong>Online Converters:</strong> CloudConvert, Convertio</p>
                    <p><strong>Software:</strong> HandBrake, VLC Media Player</p>
                    <p><strong>Command Line:</strong></p>
                    <code className="block bg-gray-800 p-1 rounded text-xs mt-1">
                      ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Audio File</label>
                <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  Upload Audio
                </label>
                {audioFile && (
                  <p className="text-xs text-blue-400 mt-1">✓ Audio loaded</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subtitle JSON</label>
                <label className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleJsonUpload}
                    className="hidden"
                  />
                  Upload JSON
                </label>
                {subtitleData && (
                  <div className="text-xs text-purple-400 mt-1">
                    <p>✓ JSON loaded</p>
                    {subtitleData.duration && (
                      <p>✓ Duration: {formatTime(subtitleData.duration)}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Display Mode Settings */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">Display Mode</h4>
              
              <div>
                <label className="block text-sm mb-2">Mode</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="displayMode"
                      value="video"
                      checked={displayMode === 'video'}
                      onChange={(e) => setDisplayMode(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span>🎬 Video Mode</span>
                      <span className="ml-2 text-xs text-gray-400">Video + Audio</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="displayMode"
                      value="radio"
                      checked={displayMode === 'radio'}
                      onChange={(e) => setDisplayMode(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span>📻 Radio Mode</span>
                      <span className="ml-2 text-xs text-gray-400">Audio Only</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Audio Source Settings */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">Audio Source</h4>
              
              <div>
                <label className="block text-sm mb-2">Choose Audio Source</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="audioSource"
                      value="video"
                      checked={audioSource === 'video'}
                      onChange={(e) => setAudioSource(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span>🎬 Video Audio</span>
                      <span className="ml-2 text-xs text-gray-400">Use video's audio track</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="audioSource"
                      value="audio"
                      checked={audioSource === 'audio'}
                      onChange={(e) => setAudioSource(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span>🎵 Audio File</span>
                      <span className="ml-2 text-xs text-gray-400">Use uploaded audio file</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Current: {audioSource === 'video' ? 'Video Audio' : 'Audio File'}</p>
                {audioSource === 'video' && videoFile && (
                  <p className="text-green-400 mt-1">✓ Video audio available</p>
                )}
                {audioSource === 'audio' && audioFile && (
                  <p className="text-blue-400 mt-1">✓ Audio file loaded</p>
                )}
                {audioSource === 'audio' && !audioFile && (
                  <p className="text-yellow-400 mt-1">⚠️ No audio file uploaded</p>
                )}
                
                {/* Debug Info */}
                <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                  <p>Debug Info:</p>
                  <p>Video File: {videoFile ? '✓' : '✗'}</p>
                  <p>Audio File: {audioFile ? '✓' : '✗'}</p>
                  <p>Video Ready: {videoRef.current?.readyState || 'N/A'}</p>
                  <p>Audio Ready: {audioRef.current?.readyState || 'N/A'}</p>
                  <p>Video Src: {videoRef.current?.src ? '✓' : '✗'}</p>
                  <p>Is Playing: {isPlaying ? '✓' : '✗'}</p>
                  <p>Is Loading: {isLoading ? '✓' : '✗'}</p>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        console.log('Video element details:', {
                          src: videoRef.current.src,
                          readyState: videoRef.current.readyState,
                          networkState: videoRef.current.networkState,
                          error: videoRef.current.error,
                          duration: videoRef.current.duration,
                          paused: videoRef.current.paused,
                          muted: videoRef.current.muted,
                          volume: videoRef.current.volume
                        });
                      }
                    }}
                    className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    Log Video Details
                  </button>
                </div>
              </div>
            </div>

            {/* Video Mode Settings */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">Video Format</h4>
              
              <div>
                <label className="block text-sm mb-2">Aspect Ratio</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="videoMode"
                      value="youtube"
                      checked={videoMode === 'youtube'}
                      onChange={(e) => setVideoMode(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span>YouTube (16:9)</span>
                      <span className="ml-2 text-xs text-gray-400">Landscape</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="videoMode"
                      value="tiktok"
                      checked={videoMode === 'tiktok'}
                      onChange={(e) => setVideoMode(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span>TikTok (9:16)</span>
                      <span className="ml-2 text-xs text-gray-400">Portrait</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Current: {videoMode === 'youtube' ? '16:9 Landscape' : '9:16 Portrait'}</p>
                <p>Size: {videoSize[videoMode].maxWidth} × {videoSize[videoMode].maxHeight}</p>
                {videoMode === 'tiktok' && (
                  <p className="text-yellow-400 mt-1">📱 Optimized for mobile</p>
                )}
                {videoMode === 'youtube' && (
                  <p className="text-blue-400 mt-1">🖥️ Optimized for desktop</p>
                )}
              </div>
            </div>

            {/* Subtitle Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Subtitle Display</h4>
              
              <div>
                <label className="block text-sm mb-2">Font Size: {subtitleSettings.fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={subtitleSettings.fontSize}
                  onChange={(e) => setSubtitleSettings(prev => ({
                    ...prev,
                    fontSize: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Opacity: {Math.round(subtitleSettings.opacity * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={subtitleSettings.opacity}
                  onChange={(e) => setSubtitleSettings(prev => ({
                    ...prev,
                    opacity: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Language</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="vi"
                      checked={subtitleSettings.languageMode === 'vi'}
                      onChange={(e) => setSubtitleSettings(prev => ({
                        ...prev,
                        languageMode: e.target.value
                      }))}
                      className="mr-2"
                    />
                    Tiếng Việt
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={subtitleSettings.languageMode === 'en'}
                      onChange={(e) => setSubtitleSettings(prev => ({
                        ...prev,
                        languageMode: e.target.value
                      }))}
                      className="mr-2"
                    />
                    English
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={subtitleSettings.showJapanese}
                    onChange={(e) => setSubtitleSettings(prev => ({
                      ...prev,
                      showJapanese: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Show Japanese
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={subtitleSettings.showRomaji}
                    onChange={(e) => setSubtitleSettings(prev => ({
                      ...prev,
                      showRomaji: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Show Romaji
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={karaokeMode}
                    onChange={(e) => setKaraokeMode(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    🎤 Karaoke Mode
                    <span className="ml-2 text-xs text-yellow-400">Highlight words as they play</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={smoothScrolling}
                    onChange={(e) => setSmoothScrolling(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    📜 Smooth Scrolling
                    <span className="ml-2 text-xs text-blue-400">Animated subtitle transitions</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      {audioFile && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => {
            setIsLoading(false);
            setLoadingType('');
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onWaiting={() => {
            setIsLoading(true);
            setLoadingType('audio');
          }}
          onPlaying={() => {
            setIsLoading(false);
            setLoadingType('');
          }}
          onError={(e) => {
            console.error('Audio error:', e);
            setIsLoading(false);
            setLoadingType('');
            setLoadingError('Audio playback error');
          }}
          muted={isMuted || audioSource === 'video'}
          volume={volume}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default VideoSubtitlePlayer;
