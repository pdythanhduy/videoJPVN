import React, { useState, useRef, useEffect } from 'react';

// Copy from Main Video Player - Constants
const DEFAULT_POS_COLORS = {
  NOUN: "bg-blue-500",
  PROPN: "bg-indigo-500",
  PRON: "bg-sky-500",
  PARTICLE: "bg-emerald-500",
  VERB: "bg-rose-500",
  ADJ: "bg-orange-500",
  ADV: "bg-amber-500",
  EXPR: "bg-violet-500",
  NUM: "bg-cyan-500",
  AUX: "bg-pink-500",
  COUNTER: "bg-teal-500",
  PUNCT: "bg-zinc-500",
  SYMBOL: "bg-stone-500",
  OTHER: "bg-gray-500",
};

// Copy from Main Video Player - Demo Data
const DEMO_DATA = {
  segments: [
    {
      start: 0.0,
      end: 6.0,
      jp: "最近、映画を見ましたか。はい、先週友だちとアクション映画を見ました。",
      vi: "Gần đây bạn có xem phim không? Có, tuần trước tôi đi xem phim hành động với bạn.",
      tokens: [
        { surface: "最近", reading: "さいきん", romaji: "saikin", pos: "NOUN", vi: "gần đây", t: 0.2 },
        { surface: "、", reading: "、", romaji: "", pos: "PUNCT", t: 0.35 },
        { surface: "映画", reading: "えいが", romaji: "eiga", pos: "NOUN", vi: "phim", t: 0.6 },
        { surface: "を", reading: "を", romaji: "o", pos: "PARTICLE", t: 0.9 },
        { surface: "見ました", reading: "みました", romaji: "mimashita", pos: "VERB", vi: "đã xem", t: 1.2 },
        { surface: "か", reading: "か", romaji: "ka", pos: "PARTICLE", t: 1.6 },
        { surface: "。", reading: "。", romaji: "", pos: "PUNCT", t: 2.0 },
        { surface: "はい", reading: "はい", romaji: "hai", pos: "EXPR", t: 2.3 },
        { surface: "、", reading: "、", romaji: "", pos: "PUNCT", t: 2.5 },
        { surface: "先週", reading: "せんしゅう", romaji: "senshuu", pos: "NOUN", vi: "tuần trước", t: 2.8 },
        { surface: "友だち", reading: "ともだち", romaji: "tomodachi", pos: "NOUN", vi: "bạn bè", t: 3.1 },
        { surface: "と", reading: "と", romaji: "to", pos: "PARTICLE", t: 3.4 },
        { surface: "アクション映画", reading: "あくしょんえいが", romaji: "akushon eiga", pos: "NOUN", vi: "phim hành động", t: 3.7 },
        { surface: "を", reading: "を", romaji: "o", pos: "PARTICLE", t: 4.2 },
        { surface: "見ました", reading: "みました", romaji: "mimashita", pos: "VERB", vi: "đã xem", t: 4.6 },
        { surface: "。", reading: "。", romaji: "", pos: "PUNCT", t: 5.2 },
      ],
    },
    {
      start: 6.2,
      end: 10.0,
      jp: "昨日、友だちと大阪へ行きました。",
      vi: "Hôm qua tôi đã đi Osaka với bạn.",
      tokens: [
        { surface: "昨日", reading: "きのう", romaji: "kinou", pos: "NOUN", vi: "hôm qua", t: 0.1 },
        { surface: "、", reading: "、", romaji: "", pos: "PUNCT", t: 0.45 },
        { surface: "友だち", reading: "ともだち", romaji: "tomodachi", pos: "NOUN", vi: "bạn bè", t: 0.8 },
        { surface: "と", reading: "と", romaji: "to", pos: "PARTICLE", t: 1.2 },
        { surface: "大阪", reading: "おおさか", romaji: "oosaka", pos: "PROPN", vi: "Osaka", t: 1.6 },
        { surface: "へ", reading: "へ", romaji: "e", pos: "PARTICLE", t: 2.0 },
        { surface: "行きました", reading: "いきました", romaji: "ikimashita", pos: "VERB", vi: "đã đi", t: 2.6 },
        { surface: "。", reading: "。", romaji: "", pos: "PUNCT", t: 3.5 },
      ],
    },
  ],
};

// Copy from Main Video Player - Helper functions
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function posClass(pos, map) {
  const key = (pos || "OTHER").toUpperCase();
  return (map && map[key]) || DEFAULT_POS_COLORS[key] || DEFAULT_POS_COLORS.OTHER;
}

function isPunctToken(token) {
  const key = String(token?.pos || '').toUpperCase();
  return key === 'PUNCT';
}

const VideoCreator = () => {
  // Copy from Main Video Player - Core states
  const [data, setData] = useState(DEMO_DATA);
  const [videoURL, setVideoURL] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [demo, setDemo] = useState(true);
  const [simTime, setSimTime] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const [posColors, setPosColors] = useState({ ...DEFAULT_POS_COLORS });
  const [tokenByTokenMode, setTokenByTokenMode] = useState(false);
  const [rate, setRate] = useState(1);
  const [opacity, setOpacity] = useState(0.92);
  const [highlightOffset, setHighlightOffset] = useState(-0.5);
  const [subFontSize, setSubFontSize] = useState(16);
  const [subOffsetY, setSubOffsetY] = useState(-24);
  
  // Video Creator specific states
  const [videoFile, setVideoFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);
  const [segments, setSegments] = useState(DEMO_DATA.segments);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(3); // 3 seconds per segment
  const [subtitleFontSize, setSubtitleFontSize] = useState(18);
  const [vocabFontSize, setVocabFontSize] = useState(12);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isCurrentSegmentExpanded, setIsCurrentSegmentExpanded] = useState(true);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewSegmentIndex, setPreviewSegmentIndex] = useState(0);
  
  // Mode B Highlight Settings (copied from Main Video Player)
  const [highlightMode, setHighlightMode] = useState('A'); // 'A' = backup mode, 'B' = custom mode
  const [highlightModeAEnabled, setHighlightModeAEnabled] = useState(true);
  const [highlightModeBEnabled, setHighlightModeBEnabled] = useState(true);
  const [highlightModeBOffset, setHighlightModeBOffset] = useState(-0.3); // seconds
  const [highlightModeBTokenLead, setHighlightModeBTokenLead] = useState(-0.15); // seconds
  const [highlightModeBPunctSkip, setHighlightModeBPunctSkip] = useState(0.08); // seconds
  const [highlightModeBIntensity, setHighlightModeBIntensity] = useState(1.5); // highlight intensity multiplier
  const [highlightModeBColorScheme, setHighlightModeBColorScheme] = useState('enhanced'); // 'original' or 'enhanced'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);
  const previewIntervalRef = useRef(null);

  // Parse SRT file
  const parseSRT = (text) => {
    const lines = text.split('\n');
    const segments = [];
    let i = 0;
    
    while (i < lines.length) {
      if (/^\d+$/.test(lines[i].trim())) {
        i++; // Skip index
        const timecode = lines[i];
        const [start, end] = timecode.split(' --> ').map(tc => {
          const [time, ms] = tc.split(',');
          const [h, m, s] = time.split(':').map(Number);
          return h * 3600 + m * 60 + s + ms / 1000;
        });
        
        i++; // Skip timecode
        const textLines = [];
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i].trim());
          i++;
        }
        
        if (textLines.length > 0) {
          segments.push({
            start,
            end,
            text: textLines.join(' ')
          });
        }
      }
      i++;
    }
    
    return segments;
  };

  // Handle video file upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoURL(url);
    }
  };

  // Handle SRT file upload
  const handleSRTUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const parsedSegments = parseSRT(text);
        console.log('Parsed SRT segments:', parsedSegments);
        setSegments(parsedSegments);
        setSrtFile(file);
      };
      reader.readAsText(file);
    }
  };

  // Handle JSON file upload (like main video player)
  const handleJSONUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          console.log('Loaded JSON data:', jsonData);
          
          let segments = [];
          
          // Handle different JSON formats
          if (Array.isArray(jsonData)) {
            // Direct array format
            segments = jsonData.map((item, index) => ({
              id: index + 1,
              startTime: item.startTime || item.start || 0,
              endTime: item.endTime || item.end || 0,
              text: item.text || item.subtitle || item.sentence || item.jp || '',
              tokens: item.tokens || item.words || [],
              vocabulary: item.vocabulary || item.vocab || []
            }));
          } else if (jsonData.segments && Array.isArray(jsonData.segments)) {
            // Object with segments property (your format)
            segments = jsonData.segments.map((item, index) => ({
              id: index + 1,
              startTime: item.start || 0,
              endTime: item.end || 0,
              text: item.jp || item.text || item.subtitle || item.sentence || '',
              tokens: item.tokens || [],
              vocabulary: item.vocabulary || []
            }));
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            // Object with data property
            segments = jsonData.data.map((item, index) => ({
              id: index + 1,
              startTime: item.startTime || item.start || 0,
              endTime: item.endTime || item.end || 0,
              text: item.text || item.subtitle || item.sentence || item.jp || '',
              tokens: item.tokens || item.words || [],
              vocabulary: item.vocabulary || item.vocab || []
            }));
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            // Try to find array in object properties
            const possibleArrays = Object.values(jsonData).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              const arrayData = possibleArrays[0];
              segments = arrayData.map((item, index) => ({
                id: index + 1,
                startTime: item.startTime || item.start || 0,
                endTime: item.endTime || item.end || 0,
                text: item.text || item.subtitle || item.sentence || item.jp || '',
                tokens: item.tokens || item.words || [],
                vocabulary: item.vocabulary || item.vocab || []
              }));
            } else {
              throw new Error('No array found in JSON. Expected format: array of segments or object with segments/data property');
            }
          } else {
            throw new Error('Invalid JSON format. Expected array or object with segments');
          }
          
          if (segments.length === 0) {
            throw new Error('No segments found in JSON file');
          }
          
          console.log('Converted segments:', segments);
          setSegments(segments);
          setSrtFile(file);
          
          // Show success message
          alert(`Successfully loaded ${segments.length} segments from JSON file!`);
          
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Error parsing JSON file: ' + error.message + '\n\nSupported formats:\n- Array of segments\n- Object with "segments" property\n- Object with "data" property');
        }
      };
      reader.readAsText(file);
    }
  };

  // Start/Stop preview
  const togglePreview = () => {
    if (isPreviewPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  };

  // Start preview
  const startPreview = () => {
    if (segments.length === 0) {
      alert('Please upload JSON/SRT file first!');
      return;
    }

    // Set canvas size before starting preview
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 1280;
      canvas.height = 720;
      console.log('Canvas size set for preview:', canvas.width, 'x', canvas.height);
    }

    setIsPreviewPlaying(true);
    setPreviewSegmentIndex(0);
    playPreviewSegments();
  };

  // Stop preview
  const stopPreview = () => {
    setIsPreviewPlaying(false);
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
    }
  };

  // Play preview segments
  const playPreviewSegments = () => {
    let currentIndex = 0;
    
    const playNextPreviewSegment = () => {
      if (currentIndex >= segments.length) {
        console.log('Preview completed');
        setIsPreviewPlaying(false);
        return;
      }

      const segment = segments[currentIndex];
      console.log(`Preview segment ${currentIndex + 1}:`, segment.text);
      setPreviewSegmentIndex(currentIndex);
      
      // Draw preview frame
      drawPreviewFrame(segment);
      
      currentIndex++;
      
      // Calculate duration from segment (use actual duration or default 3s)
      const segmentDuration = segment.end && segment.start ? 
        (segment.end - segment.start) * 1000 : duration * 1000;
      
      // Schedule next segment
      previewIntervalRef.current = setTimeout(playNextPreviewSegment, segmentDuration);
    };

    // Start immediately
    playNextPreviewSegment();
  };

  // Draw preview frame
  const drawPreviewFrame = (segment) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    
    if (!canvas || !ctx) {
      console.error('Canvas not available for preview');
      return;
    }
    
    console.log('Drawing preview frame for segment:', segment.text);
    
    // Set canvas size to match video container
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      console.log('Canvas size set to container:', canvas.width, 'x', canvas.height);
    } else {
      canvas.width = 480;
      canvas.height = 853; // 9:16 aspect ratio
    }
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtitle overlay
    console.log('Drawing subtitle overlay:', segment.text);
    drawSubtitle(ctx, segment, canvas.width, canvas.height);
    
    // Draw vocabulary overlay
    console.log('Drawing vocabulary overlay for segment');
    drawVocabulary(ctx, segment, canvas.width, canvas.height);
    
    console.log('Preview frame drawn successfully');
  };

  // Start/Stop video creation
  const toggleVideoCreation = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Start recording
  const startRecording = async () => {
    if (segments.length === 0) {
      alert('Please upload SRT file first!');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    // Set canvas size to match Main Video Player (9:16)
    canvas.width = 480;
    canvas.height = 853;

    try {
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
      });

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      setIsRecording(true);
      setCurrentSegmentIndex(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'created_video_tiktok.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      
      // Play segments without video (just canvas)
      playSegmentsWithoutVideo();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error starting recording: ' + error.message);
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Play segments with 3-second intervals
  const playSegments = () => {
    let currentIndex = 0;
    
    const playNextSegment = () => {
      if (currentIndex >= segments.length) {
        console.log('All segments completed, stopping recording...');
        stopRecording();
        return;
      }

      const segment = segments[currentIndex];
      console.log(`Playing segment ${currentIndex + 1}:`, segment.text);
      setCurrentSegmentIndex(currentIndex);
      
      // Draw current frame
      drawFrame(segment);
      
      currentIndex++;
      
      // Calculate duration from segment (use actual duration or default 3s)
      const segmentDuration = segment.end && segment.start ? 
        (segment.end - segment.start) * 1000 : duration * 1000;
      
      // Schedule next segment
      intervalRef.current = setTimeout(playNextSegment, segmentDuration);
    };

    // Start immediately
    playNextSegment();
  };

  // Play segments without video (for recording)
  const playSegmentsWithoutVideo = () => {
    let currentIndex = 0;
    
    const playNextSegment = () => {
      if (currentIndex >= segments.length) {
        console.log('All segments completed, stopping recording...');
        stopRecording();
        return;
      }

      const segment = segments[currentIndex];
      console.log(`Recording segment ${currentIndex + 1}:`, segment.text);
      setCurrentSegmentIndex(currentIndex);
      
      // Draw frame directly on canvas (no video background)
      drawFrameWithoutVideo(segment);
      
      currentIndex++;
      
      // Calculate duration from segment (use actual duration or default 3s)
      const segmentDuration = segment.end && segment.start ? 
        (segment.end - segment.start) * 1000 : duration * 1000;
      
      // Schedule next segment
      intervalRef.current = setTimeout(playNextSegment, segmentDuration);
    };

    // Start immediately
    playNextSegment();
  };

  // Draw frame with subtitle and vocabulary
  const drawFrame = (segment) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    if (!canvas || !ctx) {
      console.error('Canvas not available');
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    if (video && video.videoWidth > 0) {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.log('Video not ready, using black background');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      // Black background if no video
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw subtitle
    drawSubtitle(ctx, segment, canvas.width, canvas.height);
    
    // Draw vocabulary
    drawVocabulary(ctx, segment, canvas.width, canvas.height);
  };

  // Draw frame without video (for recording)
  const drawFrameWithoutVideo = (segment) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!canvas || !ctx) {
      console.error('Canvas not available');
      return;
    }
    
    // Clear canvas and fill with black background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtitle
    drawSubtitle(ctx, segment, canvas.width, canvas.height);
    
    // Draw vocabulary
    drawVocabulary(ctx, segment, canvas.width, canvas.height);
  };

  // Draw subtitle with JP and VI text, centered in video
  const drawSubtitle = (ctx, segment, width, height) => {
    const jpText = segment.jp || segment.text || '';
    const viText = segment.vi || '';
    const fontSize = Math.max(subtitleFontSize, width / 25);
    const fontFamily = 'Arial, sans-serif';
    
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    
    // Text wrapping for Japanese text
    const maxWidth = width - 60; // Leave 30px margin on each side
    const jpLines = [];
    let currentLine = '';
    
    // For Japanese text, split by characters
    const characters = jpText.split('');
    for (let i = 0; i < characters.length; i++) {
      const testLine = currentLine + characters[i];
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth > maxWidth && currentLine) {
        jpLines.push(currentLine);
        currentLine = characters[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      jpLines.push(currentLine);
    }
    
    // Text wrapping for Vietnamese text
    const viLines = [];
    if (viText) {
      currentLine = '';
      const viWords = viText.split(' ');
      for (let i = 0; i < viWords.length; i++) {
        const testLine = currentLine + (currentLine ? ' ' : '') + viWords[i];
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxWidth && currentLine) {
          viLines.push(currentLine);
          currentLine = viWords[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        viLines.push(currentLine);
      }
    }
    
    // Calculate background dimensions
    const lineHeight = fontSize * 1.3;
    const padding = 20;
    const totalLines = jpLines.length + viLines.length;
    const bgWidth = maxWidth + padding * 2;
    const bgHeight = totalLines * lineHeight + padding * 2;
    const bgX = (width - bgWidth) / 2;
    
    // Position in center of video (not relative to vocabulary)
    const bgY = (height - bgHeight) / 2; // Center vertically
    
    // Background with transparency
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

    // Border for better visibility
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);

    // Draw Japanese text lines
    ctx.fillStyle = '#ffffff';
    jpLines.forEach((line, index) => {
      const y = bgY + padding + fontSize + (index * lineHeight);
      ctx.fillText(line, width / 2, y);
    });
    
    // Draw Vietnamese text lines
    if (viLines.length > 0) {
      ctx.fillStyle = '#fbbf24';
      viLines.forEach((line, index) => {
        const y = bgY + padding + fontSize + ((jpLines.length + index) * lineHeight);
        ctx.fillText(line, width / 2, y);
      });
    }
  };

    // Draw vocabulary panel centered in video
    const drawVocabulary = (ctx, segment, width, height) => {
      const fontSize = Math.max(vocabFontSize, width / 40);
      const fontFamily = 'Arial, sans-serif';

      // Calculate vocabulary items first to get proper dimensions
      const itemsPerRow = 3;
      const itemSpacing = 20;
      const itemWidth = (width - 40 - 40 - (itemsPerRow - 1) * itemSpacing) / itemsPerRow; // 40px margin + 40px padding
      const itemHeight = 55;
      const verticalSpacing = 15;
      
      // Calculate how many rows we need
      const vocabItems = extractVocabularyFromSegment(segment);
      const totalRows = Math.ceil(vocabItems.length / itemsPerRow);
      
      // Calculate panel dimensions based on content
      const panelHeight = totalRows * (itemHeight + verticalSpacing) + 40; // 40px padding
      const panelY = (height - panelHeight) / 2 + 100; // Center + offset down
      const panelX = 20;
      const panelWidth = width - 40;

      // Semi-transparent background for overlay with margin
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

      // Border for better visibility
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Title with margin
    ctx.font = `bold ${fontSize + 4}px ${fontFamily}`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('📚 Vocabulary', panelX + panelWidth / 2, contentY + 25);
    
    // Get vocabulary data with hiragana (vocabItems already declared above)
    if (segment.vocabulary && segment.vocabulary.length > 0) {
      // Use JSON vocabulary data
      vocabItems = segment.vocabulary.slice(0, 6).map((vocab, index) => ({
        ja: vocab.ja,
        reading: vocab.reading || '',
        vi: vocab.vi,
        pos: vocab.pos || 'OTHER'
      }));
    } else if (segment.tokens && segment.tokens.length > 0) {
      // Extract vocabulary from tokens (your JSON format)
      vocabItems = segment.tokens
        .filter(token => token.pos === 'NOUN' || token.pos === 'VERB' || token.pos === 'ADV')
        .slice(0, 6)
        .map(token => ({
          ja: token.surface || token.ja,
          reading: token.reading || '',
          vi: token.vi || '',
          pos: token.pos || 'OTHER'
        }));
    } else {
      // Fallback: extract from text
      const words = segment.text.split(' ').slice(0, 4);
      vocabItems = words.map(word => ({
        ja: word,
        reading: '',
        vi: '',
        pos: 'OTHER'
      }));
    }

    // Draw vocabulary items with 8px margin inside background
    const margin = 8; // 8px margin inside background
    const contentX = panelX + margin;
    const contentY = panelY + margin;
    const contentWidth = panelWidth - (margin * 2);
    const contentHeight = panelHeight - (margin * 2);
    
    // Recalculate item dimensions with margin
    itemWidth = (contentWidth - (itemsPerRow - 1) * itemSpacing) / itemsPerRow;

    vocabItems.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = contentX + 20 + (col * (itemWidth + itemSpacing));
      const y = contentY + 40 + (row * (itemHeight + verticalSpacing));

      // Item background with better visibility
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fillRect(x, y - 25, itemWidth, itemHeight);

      // Item border with rounded corners effect
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y - 25, itemWidth, itemHeight);

      // Item text (Japanese)
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(item.ja, x + itemWidth / 2, y - 10);

      // Item text (Hiragana)
      if (item.reading) {
        ctx.font = `${fontSize - 2}px ${fontFamily}`;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(item.reading, x + itemWidth / 2, y + 5);
      }

      // Item text (Vietnamese translation)
      if (item.vi) {
        ctx.font = `${fontSize - 3}px ${fontFamily}`;
        ctx.fillStyle = '#a3a3a3';
        ctx.fillText(item.vi, x + itemWidth / 2, y + 20);
      }
    });
  };

  // Calculate highlight timing (copied from Main Video Player)
  const calculateHighlightTiming = (segment, currentTime) => {
    if (highlightMode === 'A') {
      return {
        enabled: highlightModeAEnabled,
        offset: 0,
        tokenLead: 0,
        punctSkip: 0
      };
    } else {
      return {
        offset: highlightModeBOffset,
        tokenLead: highlightModeBTokenLead,
        punctSkip: highlightModeBPunctSkip,
        enabled: highlightModeBEnabled
      };
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
      }
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [videoURL]);

  return (
    <div className="h-screen bg-gray-900 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pb-32">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            ← Back to Main Player
          </button>
          <h1 className="text-3xl font-bold text-center flex-1">🎬 Video Creator (Main Video Player Copy)</h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
        
        {/* Test scroll indicator */}
        <div className="text-center mb-4 text-gray-400 text-sm">
          📜 Video Creator has its own scroll - scroll down to see Current Segment section
          <button
            onClick={() => {
              const element = document.querySelector('.current-segment-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                const container = document.querySelector('.h-screen.overflow-y-auto');
                if (container) {
                  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                }
              }
            }}
            className="ml-4 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-xs"
          >
            Go to Current Segment
          </button>
        </div>
        
        {/* Control Buttons - Moved to top */}
        <div className="mb-6 space-y-3">
          {/* Start Creating Video Button */}
          <button
            onClick={toggleVideoCreation}
            disabled={!srtFile || segments.length === 0 || isPreviewPlaying}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          >
            {isRecording ? '⏹️ Stop Recording' : `🎬 Start Creating Video (Mode ${highlightMode})`}
          </button>
          
          {/* Test Debug & Preview Video Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (segments.length > 0) {
                  console.log('First segment structure:', segments[0]);
                  alert(`Debug Info:\n\nSegments: ${segments.length}\nFirst segment: ${JSON.stringify(segments[0], null, 2)}`);
                } else {
                  alert('No segments loaded. Please upload a JSON or SRT file first.');
                }
              }}
              className="py-2 px-4 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              🔧 Test Debug
            </button>
            
            <button
              onClick={togglePreview}
              disabled={!srtFile || segments.length === 0}
              className={`py-2 px-4 rounded-lg font-semibold ${
                isPreviewPlaying
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
              {isPreviewPlaying ? '⏹️ Stop Preview' : '▶️ Preview Video'}
            </button>
          </div>
          
          {isPreviewPlaying && (
            <div className="text-center">
              <p className="text-lg">
                Previewing... Segment {previewSegmentIndex + 1} of {segments.length}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((previewSegmentIndex + 1) / segments.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Upload Section */}
          <div className="space-y-4 bg-gray-800 p-4 rounded-lg h-fit">
            <h2 className="text-xl font-semibold text-yellow-400">📁 Upload Files</h2>
            
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Video File (Optional)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white"
              />
              {videoFile && (
                <p className="mt-2 text-sm text-green-400">
                  ✓ {videoFile.name} uploaded
                </p>
              )}
            </div>
            
            {/* SRT Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                SRT File
              </label>
              <input
                type="file"
                accept=".srt"
                onChange={handleSRTUpload}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white"
              />
            </div>
            
            {/* JSON Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  JSON File (Recommended - with vocabulary & tokens)
                </label>
                <button
                  onClick={() => {
                    const sampleFormats = `
Supported JSON formats:

1. Direct Array:
[
  {
    "text": "こんにちは",
    "startTime": 0,
    "endTime": 3,
    "tokens": [{"ja": "こんにちは", "vi": "xin chào"}],
    "vocabulary": [{"ja": "こんにちは", "vi": "xin chào", "pos": "NOUN"}]
  }
]

2. Object with segments:
{
  "segments": [
    {
      "text": "こんにちは",
      "start": 0,
      "end": 3,
      "words": [{"ja": "こんにちは", "vi": "xin chào"}],
      "vocab": [{"ja": "こんにちは", "vi": "xin chào", "pos": "NOUN"}]
    }
  ]
}

3. Object with data:
{
  "data": [
    {
      "subtitle": "こんにちは",
      "startTime": 0,
      "endTime": 3,
      "tokens": [{"ja": "こんにちは", "vi": "xin chào"}],
      "vocabulary": [{"ja": "こんにちは", "vi": "xin chào", "pos": "NOUN"}]
    }
  ]
}
                    `;
                    alert(sampleFormats);
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                >
                  📋 Sample Formats
                </button>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleJSONUpload}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white"
              />
            </div>
            
            {/* File Status */}
            {srtFile && (
              <div className="p-3 bg-green-900/20 border border-green-600 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ {srtFile.name} uploaded ({segments.length} segments)
                </p>
                {segments.length > 0 && segments[0].tokens && (
                  <p className="text-xs text-green-300 mt-1">
                    Includes tokens and vocabulary data
                  </p>
                )}
              </div>
            )}
            
            {/* Duration Setting */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration per segment (seconds)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                max="10"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white"
              />
            </div>
            
            {/* Highlight Mode Controls */}
            <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400">🎨 Highlight Mode</h3>
              
              {/* Mode Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setHighlightMode('A')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    highlightMode === 'A' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  Mode A
                </button>
                <button
                  onClick={() => setHighlightMode('B')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    highlightMode === 'B' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  Mode B
                </button>
              </div>
              
              {/* Font Size Settings */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-400">Font Size</h4>
                <div>
                  <label className="block text-sm mb-1">Subtitle: {subtitleFontSize}px</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="50" 
                    value={subtitleFontSize} 
                    onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Vocabulary: {vocabFontSize}px</label>
                  <input 
                    type="range" 
                    min="8" 
                    max="30" 
                    value={vocabFontSize} 
                    onChange={(e) => setVocabFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Mode B Settings */}
              {highlightMode === 'B' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={highlightModeBEnabled} 
                      onChange={(e) => setHighlightModeBEnabled(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable Mode B</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Offset: {highlightModeBOffset.toFixed(3)}s</label>
                    <input 
                      type="range" 
                      min={-1} 
                      max={1} 
                      step={0.005} 
                      value={highlightModeBOffset} 
                      onChange={(e) => setHighlightModeBOffset(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Token Lead: {highlightModeBTokenLead.toFixed(3)}s</label>
                    <input 
                      type="range" 
                      min={-0.5} 
                      max={0.5} 
                      step={0.005} 
                      value={highlightModeBTokenLead} 
                      onChange={(e) => setHighlightModeBTokenLead(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Intensity: {highlightModeBIntensity.toFixed(1)}x</label>
                    <input 
                      type="range" 
                      min={0.5} 
                      max={3} 
                      step={0.1} 
                      value={highlightModeBIntensity} 
                      onChange={(e) => setHighlightModeBIntensity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Color Scheme</label>
                    <select 
                      value={highlightModeBColorScheme} 
                      onChange={(e) => setHighlightModeBColorScheme(e.target.value)}
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    >
                      <option value="original">Original</option>
                      <option value="enhanced">Enhanced</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="space-y-4">
              
              {isPreviewPlaying && (
                <button
                  onClick={() => {
                    const videoContainer = document.querySelector('.relative.bg-black.rounded-lg.overflow-hidden');
                    if (videoContainer) {
                      videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full py-2 px-4 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                >
                  📺 Go to Video
                </button>
              )}
              
              
              {isRecording && (
                <div className="text-center">
                  <p className="text-lg">
                    Creating video... Segment {currentSegmentIndex + 1} of {segments.length}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentSegmentIndex + 1) / segments.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
          </div>
          
          {/* Preview Section */}
          <div className="space-y-4 bg-gray-800 p-4 rounded-lg h-fit">
            <h2 className="text-xl font-semibold text-green-400">🎬 Preview</h2>
            
            {/* Video Preview - Same as Main Video Player */}
            <div className="video-wrapper tiktok relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoURL}
                controls
                playsInline
                muted
                loop
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
              />
              {/* Overlay canvas for preview */}
              {isPreviewPlaying && (
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ 
                    backgroundColor: 'transparent',
                    zIndex: 10
                  }}
                />
              )}
              {isPreviewPlaying && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full font-bold z-20">
                  🎬 Previewing {previewSegmentIndex + 1}/{segments.length}
                </div>
              )}
            </div>
            
            
            {/* Segments List */}
            {segments.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">All Segments</h3>
                  <button
                    onClick={() => {
                      const currentSegmentElement = document.querySelector(`[data-segment-id="${currentSegmentIndex}"]`);
                      if (currentSegmentElement) {
                        currentSegmentElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }}
                    className="text-xs bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded"
                  >
                    📍 Go to Current
                  </button>
                </div>
                <div className="space-y-2">
                  {segments.map((segment, index) => (
                    <div
                      key={index}
                      data-segment-id={index}
                      className={`p-2 rounded text-sm ${
                        index === currentSegmentIndex
                          ? 'bg-blue-600 text-white border-2 border-yellow-400'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <span className="font-mono text-xs">
                        {Math.floor(segment.startTime / 60)}:
                        {Math.floor(segment.startTime % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="ml-2">{segment.text}</span>
                      {index === currentSegmentIndex && (
                        <div className="text-xs text-yellow-300 mt-1">
                          ⭐ Currently processing
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Current Segment Section - Full Width at Bottom */}
        {segments.length > 0 && (
          <div className="current-segment-section mt-8 bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg border-2 border-yellow-400 shadow-lg mb-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-2xl text-yellow-400">
                🎬 {isPreviewPlaying ? 'Preview Segment' : 'Current Segment'}
              </h3>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-lg">
                  {(isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex) + 1} / {segments.length}
                </div>
                <button
                  onClick={() => setIsCurrentSegmentExpanded(!isCurrentSegmentExpanded)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm bg-black/30 px-3 py-2 rounded-lg"
                >
                  {isCurrentSegmentExpanded ? '📉 Collapse' : '📈 Expand'}
                </button>
              </div>
            </div>
            
            <div className="bg-black/50 p-6 rounded-lg mb-4" style={{ minHeight: '120px' }}>
              <p className="text-xl break-words text-white font-medium leading-relaxed">
                {segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex]?.text || 'No segment selected'}
              </p>
            </div>
            
            {/* Show vocabulary if available and expanded */}
            {isCurrentSegmentExpanded && (
              (() => {
                const segment = segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex];
                let vocabItems = [];
                
                if (segment?.vocabulary && segment.vocabulary.length > 0) {
                  vocabItems = segment.vocabulary;
                } else if (segment?.tokens && segment.tokens.length > 0) {
                  vocabItems = segment.tokens
                    .filter(token => token.pos === 'NOUN' || token.pos === 'VERB' || token.pos === 'ADV')
                    .map(token => ({
                      ja: token.surface || token.ja,
                      vi: token.vi || '',
                      pos: token.pos
                    }));
                }
                
                return vocabItems.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                      📚 Vocabulary ({vocabItems.length})
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                      {vocabItems.slice(0, 20).map((vocab, idx) => (
                        <span key={idx} className="text-sm bg-blue-600 px-3 py-2 rounded border border-blue-400">
                          <span className="font-bold text-white">{vocab.ja}</span>
                          <span className="text-yellow-300"> - {vocab.vi}</span>
                        </span>
                      ))}
                      {vocabItems.length > 20 && (
                        <span className="text-sm text-gray-300 bg-gray-700 px-3 py-2 rounded">
                          +{vocabItems.length - 20} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null;
              })()
            )}
            
            {/* Show tokens if available and expanded */}
            {isCurrentSegmentExpanded && segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex]?.tokens && segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex].tokens.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                  🔤 Tokens ({segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex].tokens.length})
                </h4>
                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                  {segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex].tokens.slice(0, 30).map((token, idx) => (
                    <span key={idx} className="text-sm bg-green-600 px-2 py-1 rounded border border-green-400 text-white">
                      {token.surface || token.ja || token.text}
                    </span>
                  ))}
                  {segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex].tokens.length > 30 && (
                    <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      +{segments[isPreviewPlaying ? previewSegmentIndex : currentSegmentIndex].tokens.length - 30} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCreator;
