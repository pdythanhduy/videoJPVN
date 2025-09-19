import React, { useState, useEffect, useRef } from 'react';
import './KaraokeSubtitle.css';

/**
 * KaraokeSubtitle Component
 * 
 * Hiển thị phụ đề karaoke với smooth scrolling và token highlighting
 * 
 * @param {Object} props
 * @param {Array} props.segments - Mảng segments từ JSON data
 * @param {React.RefObject<HTMLAudioElement>} props.audioRef - Reference đến audio element
 * @param {number} props.numberOfLines - Số dòng hiển thị (mặc định 3)
 * @param {string} props.className - CSS class tùy chỉnh
 */
const KaraokeSubtitle = ({ 
  segments = [], 
  audioRef, 
  numberOfLines = 3,
  className = ""
}) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // Lấy segment hiện tại dựa trên thời gian audio
  const getCurrentSegment = () => {
    if (!segments.length || !audioRef || !audioRef.current) return null;
    
    const time = audioRef.current.currentTime || 0;
    return segments.find(segment => time >= segment.start && time < segment.end) || null;
  };

  // Lấy danh sách segments để hiển thị (current + next + previous)
  const getDisplaySegments = () => {
    if (!segments.length) return [];
    
    const current = getCurrentSegment();
    if (!current) return segments.slice(0, numberOfLines);
    
    const currentIndex = segments.findIndex(seg => seg === current);
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(segments.length, startIndex + numberOfLines);
    
    return segments.slice(startIndex, endIndex);
  };

  // Cập nhật thời gian và segment hiện tại
  const updateCurrentTime = () => {
    if (!audioRef || !audioRef.current) return;
    
    const time = audioRef.current.currentTime || 0;
    setCurrentTime(time);
    
    const current = getCurrentSegment();
    if (current) {
      const newIndex = segments.findIndex(seg => seg === current);
      if (newIndex !== currentSegmentIndex) {
        setCurrentSegmentIndex(newIndex);
      }
    }
  };

  // Lắng nghe audio events
  useEffect(() => {
    if (!audioRef || !audioRef.current) return;

    const audio = audioRef.current;
    const handleTimeUpdate = () => updateCurrentTime();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, segments, currentSegmentIndex]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateCurrentTime();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Render token với highlighting
  const renderToken = (token, segmentTime) => {
    const isActive = currentTime >= segmentTime + token.t && 
                     currentTime < segmentTime + (token.end || segmentTime + 0.5);
    
    return (
      <span
        key={`${token.surface}-${token.t}`}
        className={`karaoke-token ${isActive ? 'active' : ''}`}
      >
        {token.surface}
      </span>
    );
  };

  // Render segment
  const renderSegment = (segment, index) => {
    const displaySegments = getDisplaySegments();
    const currentSegment = getCurrentSegment();
    const isCurrent = segment === currentSegment;
    const isNext = index > displaySegments.findIndex(seg => seg === currentSegment);
    const isPrevious = index < displaySegments.findIndex(seg => seg === currentSegment);
    
    let segmentClass = 'karaoke-segment';
    if (isCurrent) segmentClass += ' current';
    else if (isNext) segmentClass += ' next';
    else if (isPrevious) segmentClass += ' previous';

    return (
      <div
        key={`${segment.start}-${segment.end}`}
        className={segmentClass}
      >
        {/* Japanese text với token highlighting */}
        <div className="karaoke-japanese">
          {segment.tokens && segment.tokens.length > 0 ? (
            segment.tokens.map((token, tokenIndex) => 
              renderToken(token, segment.start)
            )
          ) : (
            <span>{segment.jp}</span>
          )}
        </div>
        
        {/* Vietnamese text */}
        <div className="karaoke-vietnamese">
          {segment.vi}
        </div>
      </div>
    );
  };

  if (!segments.length) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <p>Chưa có dữ liệu phụ đề</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`karaoke-subtitle-container ${className}`}
      style={{
        height: `${numberOfLines * 6}rem`, // 6rem per line for better spacing
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        className="karaoke-scroll-container karaoke-subtitle-content"
        style={{
          transform: `translateY(${getDisplaySegments().findIndex(seg => seg === getCurrentSegment()) * -6}rem)`
        }}
      >
        {getDisplaySegments().map((segment, index) => 
          renderSegment(segment, index)
        )}
      </div>
    </div>
  );
};

export default KaraokeSubtitle;
