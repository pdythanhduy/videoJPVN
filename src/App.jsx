import React, { useEffect, useMemo, useRef, useState } from "react";
// Local STT (no API)
let localTranscribePipeline = null;
import { Link } from 'react-router-dom';
import * as wanakana from 'wanakana';
import { Play, Pause, Upload, RefreshCw, Settings2, Wand2, BookOpenText, Type, Languages, Highlighter, Download as DownloadIcon, Volume2, FileText } from "lucide-react";
import "./App.css";
import TTSPanel from './components/TTSPanel';
import AudioFilesList from './components/AudioFilesList';
import YouTubeDownloader from './components/YouTubeDownloader';
import STTConverter from './components/STTConverter';
import YouTubeTester from './components/YouTubeTester';

// =============================================================
// JP–VI Video Sub App (React) – Furigana + POS Highlight
// - Hiển thị video + phụ đề đa lớp: Kanji (JP), Furigana (Hiragana), Romaji, Việt
// - Highlight theo từ và theo loại từ (POS: danh từ, trợ từ, động từ, v.v.)
// - Cho phép upload video (mp4/webm) và file JSON phụ đề tuân theo schema bên dưới
// - Có "Demo Mode" mô phỏng thời gian nếu bạn chưa có file video
// =============================================================

/**
 * JSON schema tối giản (UTF-8, LF):
 * {
 *   "segments": [
 *     {
 *       "start": 0.00,            // giây
 *       "end": 3.20,              // giây
 *       "jp": "日本語を勉強しています。",
 *       "vi": "Tôi đang học tiếng Nhật.",
 *       "tokens": [               // từng token có thời điểm tương đối trong segment
 *         { "surface": "日本語", "reading": "にほんご", "romaji": "nihongo", "pos": "NOUN", "t": 0.20 },
 *         { "surface": "を",     "reading": "を",       "romaji": "o",       "pos": "PARTICLE", "t": 0.60 },
 *         { "surface": "勉強",   "reading": "べんきょう", "romaji": "benkyou", "pos": "NOUN", "t": 1.00 },
 *         { "surface": "して",   "reading": "して",     "romaji": "shite",   "pos": "VERB", "t": 1.50 },
 *         { "surface": "います", "reading": "います",   "romaji": "imasu",   "pos": "AUX",  "t": 1.90 },
 *         { "surface": "。",     "reading": "。",       "romaji": "",        "pos": "PUNCT", "t": 2.40 }
 *       ]
 *     },
 *     ...
 *   ]
 * }
 */

// Bảng màu cho loại từ (có thể chỉnh trong UI)
const DEFAULT_POS_COLORS = {
  NOUN: "bg-blue-500",
  PROPN: "bg-indigo-500",       // danh từ riêng
  PRON: "bg-sky-500",           // đại từ
  PARTICLE: "bg-emerald-500",   // trợ từ
  VERB: "bg-rose-500",
  ADJ: "bg-orange-500",
  ADV: "bg-amber-500",
  EXPR: "bg-violet-500",        // biểu thức/cụm cố định
  NUM: "bg-cyan-500",
  AUX: "bg-pink-500",
  COUNTER: "bg-teal-500",
  PUNCT: "bg-zinc-500",
  SYMBOL: "bg-stone-500",
  OTHER: "bg-gray-500",
};

// Data demo nhỏ gọn
const DEMO_DATA = {
  segments: [
    {
      start: 0.0,
      end: 6.0,
      jp: "最近、映画を見ましたか。はい、先週友だちとアクション映画を見ました。",
      vi: "Gần đây bạn có xem phim không? Có, tuần trước tôi đi xem phim hành động với bạn.",
      tokens: [
        { surface: "最近", reading: "さいきん", romaji: "saikin", pos: "NOUN", t: 0.2 },
        { surface: "、", reading: "、", romaji: "", pos: "PUNCT", t: 0.35 },
        { surface: "映画", reading: "えいが", romaji: "eiga", pos: "NOUN", t: 0.6 },
        { surface: "を", reading: "を", romaji: "o", pos: "PARTICLE", t: 0.9 },
        { surface: "見ました", reading: "みました", romaji: "mimashita", pos: "VERB", t: 1.2 },
        { surface: "か", reading: "か", romaji: "ka", pos: "PARTICLE", t: 1.6 },
        { surface: "。", reading: "。", romaji: "", pos: "PUNCT", t: 2.0 },
        { surface: "はい", reading: "はい", romaji: "hai", pos: "EXPR", t: 2.3 },
        { surface: "、", reading: "、", romaji: "", pos: "PUNCT", t: 2.5 },
        { surface: "先週", reading: "せんしゅう", romaji: "senshuu", pos: "NOUN", t: 2.8 },
        { surface: "友だち", reading: "ともだち", romaji: "tomodachi", pos: "NOUN", t: 3.1 },
        { surface: "と", reading: "と", romaji: "to", pos: "PARTICLE", t: 3.4 },
        { surface: "アクション映画", reading: "あくしょんえいが", romaji: "akushon eiga", pos: "NOUN", t: 3.7 },
        { surface: "を", reading: "を", romaji: "o", pos: "PARTICLE", t: 4.2 },
        { surface: "見ました", reading: "みました", romaji: "mimashita", pos: "VERB", t: 4.6 },
        { surface: "。", reading: "。", romaji: "", pos: "PUNCT", t: 5.2 },
      ],
    },
    {
      start: 6.2,
      end: 10.0,
      jp: "昨日、友だちと大阪へ行きました。",
      vi: "Hôm qua tôi đã đi Osaka với bạn.",
      tokens: [
        { surface: "昨日", reading: "きのう", romaji: "kinou", pos: "NOUN", t: 0.1 },
        { surface: "、", reading: "、", romaji: "", pos: "PUNCT", t: 0.45 },
        { surface: "友だち", reading: "ともだち", romaji: "tomodachi", pos: "NOUN", t: 0.8 },
        { surface: "と", reading: "と", romaji: "to", pos: "PARTICLE", t: 1.2 },
        { surface: "大阪", reading: "おおさか", romaji: "oosaka", pos: "PROPN", t: 1.6 },
        { surface: "へ", reading: "へ", romaji: "e", pos: "PARTICLE", t: 2.0 },
        { surface: "行きました", reading: "いきました", romaji: "ikimashita", pos: "VERB", t: 2.6 },
        { surface: "。", reading: "。", romaji: "", pos: "PUNCT", t: 3.5 },
      ],
    },
  ],
};

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function posClass(pos, map) {
  const key = (pos || "OTHER").toUpperCase();
  return (map && map[key]) || DEFAULT_POS_COLORS[key] || DEFAULT_POS_COLORS.OTHER;
}

function isPunctToken(token) {
  const key = String(token?.pos || '').toUpperCase();
  return key === 'PUNCT';
}

// Chia token thành các dòng theo dấu câu kết thúc câu ("。" hoặc ".")
function splitTokensBySentences(tokens) {
  const lines = [];
  let currentLine = [];
  for (let i = 0; i < (tokens?.length || 0); i++) {
    const tk = tokens[i];
    currentLine.push([tk, i]);
    const surface = String(tk?.surface ?? "");
    const isSentenceEnd = /[。．\.！？\?]/.test(surface);
    if (isSentenceEnd) {
      lines.push(currentLine);
      currentLine = [];
    }
  }
  if (currentLine.length) lines.push(currentLine);
  return lines;
}

function splitViLines(text) {
  const s = String(text ?? '').trim();
  if (!s) return [];
  const parts = s.match(/[^.!?]+[.!?]?/g);
  return (parts || []).map((p) => p.trim()).filter(Boolean);
}

// Tạo thời gian fallback cho token khi thiếu (t/end) dựa vào độ dài reading/surface
function normalizeSegmentTokens(segment) {
  const segStart = typeof segment.start === 'number' ? segment.start : 0;
  const segEnd = typeof segment.end === 'number' ? segment.end : segStart;
  const segDuration = Math.max(0, segEnd - segStart);
  const tokens = Array.isArray(segment.tokens) ? segment.tokens.map((t) => ({ ...t })) : [];
  if (tokens.length === 0 || segDuration === 0) {
    return { ...segment, tokens };
  }

  // Chuẩn hoá t trong [0, segDuration] nếu có
  const anchorIndices = [];
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i].t === 'number' && isFinite(tokens[i].t)) {
      tokens[i].t = Math.min(Math.max(0, tokens[i].t), segDuration);
      anchorIndices.push(i);
    }
  }

  function weightOf(token) {
    const base = (token.reading && String(token.reading).length) || (token.surface && String(token.surface).length) || 1;
    return Math.max(1, base);
  }

  const anchors = [{ index: -1, time: 0 }]
    .concat(anchorIndices.map((idx) => ({ index: idx, time: tokens[idx].t })))
    .concat([{ index: tokens.length, time: segDuration }])
    .sort((a, b) => (a.time - b.time) || (a.index - b.index));

  // Phân bổ t cho khoảng giữa các anchor dựa theo trọng số
  for (let a = 0; a < anchors.length - 1; a++) {
    const left = anchors[a];
    const right = anchors[a + 1];
    const startIndex = Math.max(0, left.index + 1);
    const endIndex = Math.min(tokens.length - 1, right.index - 1);
    const timeStart = left.time;
    const timeEnd = right.time;
    if (endIndex < startIndex) continue;
    const span = Math.max(0, timeEnd - timeStart);
    let sumWeights = 0;
    for (let i = startIndex; i <= endIndex; i++) sumWeights += weightOf(tokens[i]);
    if (sumWeights <= 0) sumWeights = endIndex - startIndex + 1;
    let acc = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      const w = weightOf(tokens[i]);
      const prev = acc;
      acc += w / sumWeights;
      const startRel = timeStart + span * prev;
      if (typeof tokens[i].t !== 'number') tokens[i].t = startRel;
    }
  }

  // Suy diễn end cho từng token
  for (let i = 0; i < tokens.length; i++) {
    const start = Math.min(Math.max(0, tokens[i].t ?? 0), segDuration);
    let end;
    if (typeof tokens[i].end === 'number') {
      end = tokens[i].end;
    } else if (typeof tokens[i].d === 'number') {
      end = start + tokens[i].d;
    } else {
      const nextT = tokens[i + 1]?.t;
      end = typeof nextT === 'number' ? nextT : segDuration;
    }
    tokens[i].t = start;
    tokens[i].end = Math.min(Math.max(start, end), segDuration);
  }

  return { ...segment, tokens };
}

function normalizeData(data) {
  const segments = Array.isArray(data?.segments) ? data.segments.map((s) => normalizeSegmentTokens(s)) : [];
  return { ...data, segments };
}

function secondsToTimestamp(s) {
  const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
  const sec = Math.floor(s) % 60; const mm = Math.floor(s / 60) % 60; const hh = Math.floor(s / 3600);
  const p2 = (n) => n.toString().padStart(2, '0');
  return `${p2(hh)}:${p2(mm)}:${p2(sec)}.${ms}`;
}

export default function JPVideoSubApp() {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [data, setData] = useState(() => normalizeData(DEMO_DATA));
  const [videoURL, setVideoURL] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const bgImageRef = useRef(null);
  const audioMainRef = useRef(null);
  const [audioMainURL, setAudioMainURL] = useState(null);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [demo, setDemo] = useState(true); // Demo Mode: mô phỏng thời gian nếu chưa có video
  const [simTime, setSimTime] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const [posColors, setPosColors] = useState({ ...DEFAULT_POS_COLORS });
  const [rate, setRate] = useState(1);
  const [opacity, setOpacity] = useState(0.92);
  const [highlightOffset, setHighlightOffset] = useState(-0.5); // seconds, positive = highlight later
  const [subFontSize, setSubFontSize] = useState(16); // px
  const [subOffsetY, setSubOffsetY] = useState(-24); // px, positive moves down
  const [recording, setRecording] = useState(false);
  const tokenizerRef = useRef(null);
  const [autoReading, setAutoReading] = useState(true);
  const [tokenizerReady, setTokenizerReady] = useState(false);
  const [lastLoadedFromSrt, setLastLoadedFromSrt] = useState(false);
  const [tokenLead, setTokenLead] = useState(-0.1); // seconds: advance token highlight
  const [segOffsets, setSegOffsets] = useState({}); // per-segment fine offsets in seconds
  const [subCentered, setSubCentered] = useState(true);
  const [punctSkip, setPunctSkip] = useState(0.06); // seconds to skip into next token when inside punctuation
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [showVocabTop, setShowVocabTop] = useState(false);
  const [ttsOpen, setTtsOpen] = useState(false);
  const [audioFilesOpen, setAudioFilesOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [sttOpen, setSttOpen] = useState(false);
  const [youtubeTestOpen, setYoutubeTestOpen] = useState(false);

  // STT (Audio -> SRT)
  const [sttApiKey, setSttApiKey] = useState('');
  const [sttModel, setSttModel] = useState('whisper-1');
  const [sttApiBase, setSttApiBase] = useState('https://api.openai.com');
  const [sttAudioFile, setSttAudioFile] = useState(null);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttResult, setSttResult] = useState('');
  const [sttError, setSttError] = useState('');

  // Build kuromoji tokenizer once (dynamic import to avoid bundling issues)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('kuromoji');
        const kuromoji = mod.default || mod;
        kuromoji.builder({ dicPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/' }).build((err, tokenizer) => {
          if (cancelled) return;
          if (err) { console.warn('Kuromoji init failed', err); return; }
          tokenizerRef.current = tokenizer;
          setTokenizerReady(true);
        });
      } catch (e) {
        console.warn('Kuromoji load error', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Enrich tokens with readings after tokenizer becomes ready (for SRT loads)
  useEffect(() => {
    if (!autoReading || !tokenizerReady || !lastLoadedFromSrt) return;
    setData(prev => {
      const src = prev?.segments ? prev : data;
      const segments = (src.segments || []).map((seg) => {
        const tokens = buildTokensFromJP(seg.jp || '');
        const enriched = { ...seg, tokens };
        addTokenTimings(enriched);
        return enriched;
      });
      return normalizeData({ segments });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoReading, tokenizerReady, lastLoadedFromSrt]);

  // Tính tổng thời lượng demo từ segment cuối
  const demoDuration = useMemo(() => (data?.segments?.at(-1)?.end ?? 15), [data]);

  // Đồng bộ thời gian: ưu tiên audio nếu có; nếu không có audio thì dùng video (frame-accurate nếu có)
  useEffect(() => {
    if (!demo && videoRef.current && !audioMainURL) {
      const vid = videoRef.current;
      let rafId = 0; let running = true;
      const onFrame = (_now, metadata) => {
        if (!running) return;
        const mediaTime = (metadata && typeof metadata.mediaTime === 'number') ? metadata.mediaTime : vid.currentTime;
        setSimTime(mediaTime);
        if (typeof vid.requestVideoFrameCallback === 'function') {
          vid.requestVideoFrameCallback(onFrame);
        } else {
          rafId = requestAnimationFrame(onFrame);
        }
      };
      if (typeof vid.requestVideoFrameCallback === 'function') {
        vid.requestVideoFrameCallback(onFrame);
      } else {
        rafId = requestAnimationFrame(onFrame);
      }
      return () => { running = false; if (rafId) cancelAnimationFrame(rafId); };
    }
  }, [demo, audioMainURL]);

  // When audio ends during normal playback, stop everything (video, state)
  useEffect(() => {
    const a = audioMainRef.current;
    if (!a) return;
    const onEnded = () => {
      setPlaying(false);
      const vid = videoRef.current;
      if (vid) { try { vid.pause(); } catch {} }
    };
    a.addEventListener('ended', onEnded);
    return () => { a.removeEventListener('ended', onEnded); };
  }, [audioMainURL]);

  // Khi có audio, luôn drive simTime từ audio (kể cả khi có video)
  useEffect(() => {
    const a = audioMainRef.current;
    if (!a) return;
    let raf = 0; let running = true;
    const step = () => {
      if (!running) return;
      setSimTime(isFinite(a.currentTime) ? a.currentTime : 0);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { running = false; if (raf) cancelAnimationFrame(raf); };
  }, [audioMainURL, videoURL]);

  // Đồng bộ video theo audio khi cả hai cùng tồn tại (để video lặp theo audio)
  useEffect(() => {
    if (demo) return;
    const a = audioMainRef.current;
    const vid = videoRef.current;
    if (!a || !vid) return;
    let raf = 0; let running = true;
    const step = () => {
      if (!running) return;
      const dur = isFinite(vid.duration) ? vid.duration : 0;
      if (dur > 0) {
        const desired = (a.currentTime % dur);
        const diff = Math.abs((vid.currentTime || 0) - desired);
        if (diff > 0.05) { try { vid.currentTime = desired; } catch {} }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { running = false; if (raf) cancelAnimationFrame(raf); };
  }, [demo, audioMainURL, videoURL]);

  // Tick Demo
  useEffect(() => {
    if (!demo || !playing) return;
    let id; let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000 * rate; last = now;
      setSimTime((t) => {
        const nx = t + dt; return nx >= demoDuration ? 0 : nx;
      });
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [playing, demo, rate, demoDuration]);

  const now = simTime + highlightOffset;

  // Tìm segment hiện tại theo thời gian
  const currentSegIndex = useMemo(() => {
    if (!data?.segments?.length) return -1;
    return data.segments.findIndex((s) => now >= s.start && now <= s.end);
  }, [data, now]);

  const currentSeg = currentSegIndex >= 0 ? data.segments[currentSegIndex] : null;

  // Tìm token gần nhất theo thời gian trong segment (dựa vào token.t)
  const currentTokenIndex = useMemo(() => {
    if (!currentSeg) return -1;
    const segOffset = segOffsets[currentSegIndex] || 0;
    const rel = (now + tokenLead + segOffset) - currentSeg.start;
    const tokens = currentSeg.tokens || [];
    if (!tokens.length) return -1;
    for (let i = 0; i < tokens.length; i++) {
      const start = tokens[i].t ?? 0;
      const end = (() => {
        if (typeof tokens[i].end === 'number') return tokens[i].end;
        if (typeof tokens[i].d === 'number') return start + tokens[i].d;
        const nextT = tokens[i + 1]?.t;
        if (typeof nextT === 'number') return nextT;
        return (currentSeg.end - currentSeg.start);
      })();
      if (rel >= start && rel < end) {
        if (!isPunctToken(tokens[i])) return i;
        // Within punctuation window: optionally jump to next non-punct after a small skip
        if ((rel - start) >= punctSkip) {
          for (let j = i + 1; j < tokens.length; j++) if (!isPunctToken(tokens[j])) return j;
        }
        // otherwise stick to previous non-punct for continuity
        for (let j = i - 1; j >= 0; j--) if (!isPunctToken(tokens[j])) return j;
        // fallback next
        for (let j = i + 1; j < tokens.length; j++) if (!isPunctToken(tokens[j])) return j;
        return i;
      }
    }
    // Nếu không rơi vào khoảng nào, chọn token gần nhất
    let bestIndex = -1; let bestDelta = Infinity;
    for (let i = 0; i < tokens.length; i++) {
      const delta = Math.abs(rel - (tokens[i].t ?? 0));
      if (delta < bestDelta) { bestDelta = delta; bestIndex = i; }
    }
    if (bestIndex >= 0 && isPunctToken(tokens[bestIndex])) {
      for (let j = bestIndex - 1; j >= 0; j--) if (!isPunctToken(tokens[j])) return j;
      for (let j = bestIndex + 1; j < tokens.length; j++) if (!isPunctToken(tokens[j])) return j;
    }
    return bestIndex;
  }, [currentSeg, now, tokenLead, segOffsets, currentSegIndex, punctSkip]);

  const activeToken = useMemo(() => {
    if (!currentSeg || currentTokenIndex < 0) return null;
    return currentSeg.tokens[currentTokenIndex] || null;
  }, [currentSeg, currentTokenIndex]);

  // ===== Vocab list (JP–VI) for current segment =====
  const vocabEntries = useMemo(() => {
    const entries = [];
    const seen = new Set();
    const seg = currentSeg;
    if (!seg) return entries;
    for (const tk of (seg.tokens || [])) {
      const pos = String(tk?.pos || '').toUpperCase();
      if (pos !== 'NOUN' && pos !== 'PROPN') continue;
      const surface = String(tk?.surface || '').trim();
      if (!surface || seen.has(surface)) continue;
      seen.add(surface);
      entries.push({
        surface,
        reading: String(tk?.reading || '').trim(),
        vi: String(tk?.vi || '').trim(),
      });
    }
    return entries;
  }, [currentSeg]);

  function downloadVocabCsv() {
    try {
      const lines = ['JP,Reading,VI'];
      for (const it of vocabEntries) {
        const jp = (it.surface || '').replaceAll('"', '""');
        const rd = (it.reading || '').replaceAll('"', '""');
        const vi = (it.vi || '').replaceAll('"', '""');
        lines.push(`"${jp}","${rd}","${vi}"`);
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'vocab.csv';
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    } catch {}
  }

  async function copyVocabCsv() {
    try {
      const lines = ['JP,Reading,VI'];
      for (const it of vocabEntries) {
        const jp = (it.surface || '').replaceAll('"', '""');
        const rd = (it.reading || '').replaceAll('"', '""');
        const vi = (it.vi || '').replaceAll('"', '""');
        lines.push(`"${jp}","${rd}","${vi}"`);
      }
      await navigator.clipboard.writeText(lines.join('\n'));
      alert('Đã copy CSV từ vựng vào clipboard');
    } catch {}
  }

  function handlePlayPause() {
    const a = audioMainRef.current;
    const isAudioMode = !videoURL && !!a;
    if (isAudioMode) {
      if (playing) { try { a.pause(); } catch {} setPlaying(false); }
      else {
        try { a.currentTime = Math.max(0, simTime); } catch {}
        const p = a.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            alert('Trình duyệt chặn phát audio tự động. Hãy nhấn Play lần nữa sau khi tương tác.');
          });
        }
        setPlaying(true);
      }
      return;
    }
    if (demo) {
      setPlaying(p => !p);
    } else if (a) {
      // Prefer driving play/pause via audio when available
      if (playing) { try { a.pause(); } catch {} setPlaying(false); }
      else {
        try { a.currentTime = Math.max(0, simTime); } catch {}
        const p = a.play();
        if (p && typeof p.catch === 'function') { p.catch(() => { alert('Trình duyệt chặn phát audio tự động. Hãy nhấn Play lần nữa.'); }); }
        // ensure video plays muted & loop when audio exists
        const vid = videoRef.current;
        if (vid && videoURL) { try { vid.muted = true; vid.loop = true; vid.play(); } catch {} }
        setPlaying(true);
      }
    } else if (videoRef.current) {
      const vid = videoRef.current;
      if (vid.paused) { vid.play(); setPlaying(true); }
      else { vid.pause(); setPlaying(false); }
    }
  }

  function onVideoFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    setVideoURL(url); setImageURL(null); setDemo(false); setPlaying(false); setSimTime(0);
  }

  function onJsonFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (!obj?.segments || !Array.isArray(obj.segments)) throw new Error("JSON không đúng schema (thiếu 'segments').");
        setData(normalizeData(obj)); setSimTime(0);
      } catch (err) {
        alert("Lỗi đọc JSON: " + err.message);
      }
    };
    reader.readAsText(f, "utf-8");
  }

  // ===== SRT import → segments =====
  function parseSrtTimecode(tc) {
    // 00:00:01,000 or 00:00:01.000
    const m = tc.trim().match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})/);
    if (!m) return 0;
    const hh = parseInt(m[1], 10) || 0;
    const mm = parseInt(m[2], 10) || 0;
    const ss = parseInt(m[3], 10) || 0;
    const ms = parseInt(m[4].padEnd(3, '0').slice(0,3), 10) || 0;
    return hh * 3600 + mm * 60 + ss + ms / 1000;
  }

  function looksJapanese(s) {
    return /[\u3040-\u30FF\u4E00-\u9FFF]/u.test(s);
  }

  function parseSRT(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const cues = [];
    let i = 0;
    while (i < lines.length) {
      // optional index
      if (/^\d+$/.test(lines[i].trim())) i++;
      // timecode
      const tc = lines[i] || '';
      const mt = tc.match(/-->+/);
      if (!mt) { i++; continue; }
      const [left, right] = tc.split(/-->+/);
      const start = parseSrtTimecode(left || '');
      const end = parseSrtTimecode(right || '');
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i]);
        i++;
      }
      // skip blank
      while (i < lines.length && lines[i].trim() === '') i++;
      cues.push({ start, end, lines: textLines });
    }
    return cues;
  }

  function srtToSegments(srtText) {
    const cues = parseSRT(srtText);
    const segments = cues.map(c => {
      const jpLines = [];
      const viLines = [];
      for (const ln of c.lines) {
        const s = String(ln || '').trim();
        if (!s) continue;
        if (looksJapanese(s)) jpLines.push(s); else viLines.push(s);
      }
      const jpJoined = jpLines.join(' ');
      const seg = {
        start: c.start,
        end: c.end,
        jp: jpJoined,
        vi: viLines.join(' '),
        tokens: buildTokensFromJP(jpJoined),
      };
      // distribute times across tokens relative to segment duration
      addTokenTimings(seg);
      return seg;
    });
    return { segments };
  }

  function buildTokensFromJP(jpText) {
    const s = String(jpText || '');
    if (!s) return [];
    // Prefer morphological analysis when tokenizer is ready
    if (autoReading && tokenizerRef.current) {
      const ms = tokenizerRef.current.tokenize(s);
      const out = [];
      for (const m of ms) {
        const surface = m.surface_form || '';
        if (!surface.trim()) continue;
        const pos = (m.pos || '').toUpperCase();
        const isPunct = pos === '記号' || /\p{P}/u.test(surface);
        if (isPunct) {
          out.push({ surface, reading: '', pos: 'PUNCT' });
        } else {
          const readingKana = m.reading ? wanakana.toHiragana(m.reading) : (isKanaOnly(surface) ? wanakana.toHiragana(surface) : '');
          const romaji = readingKana ? wanakana.toRomaji(readingKana) : '';
          out.push({ surface, reading: readingKana, romaji, pos: mapKuromojiPos(pos) });
        }
      }
      return out;
    }
    // Fallback: simple split
    const fallback = [];
    let buf = '';
    const punctSet = new Set(['。','、','！','？','｡','､','!','?','.',',','…','・','「','」','（','）','(',')','［','］','[',']','【','】','ー','—','-','・']);
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (punctSet.has(ch) || /\s/.test(ch)) {
        if (buf) { fallback.push(makeToken(buf)); buf = ''; }
        if (!/\s/.test(ch)) { fallback.push({ surface: ch, reading: '', pos: 'PUNCT' }); }
      } else {
        buf += ch;
      }
    }
    if (buf) fallback.push(makeToken(buf));
    return fallback;
  }

  function mapKuromojiPos(posJa) {
    // Simple map from Japanese POS to our POS
    if (posJa.includes('名詞')) return 'NOUN';
    if (posJa.includes('固有')) return 'PROPN';
    if (posJa.includes('動詞')) return 'VERB';
    if (posJa.includes('形容詞')) return 'ADJ';
    if (posJa.includes('副詞')) return 'ADV';
    if (posJa.includes('助詞')) return 'PARTICLE';
    if (posJa.includes('助動詞')) return 'AUX';
    if (posJa.includes('記号')) return 'PUNCT';
    return 'OTHER';
  }

  function isKanaOnly(str) {
    return /^[\u3040-\u309F\u30A0-\u30FF]+$/u.test(str);
  }

  function makeToken(surface) {
    const reading = isKanaOnly(surface) ? wanakana.toHiragana(surface) : '';
    return { surface, reading, pos: 'OTHER' };
  }

  // Extract vocabulary list (unique NOUN/PROPN) from a segment
  function extractVocabList(seg) {
    const out = [];
    const seen = new Set();
    const tokens = seg?.tokens || [];
    for (const tk of tokens) {
      const pos = String(tk?.pos || '').toUpperCase();
      if (pos === 'NOUN' || pos === 'PROPN') {
        const word = String(tk?.surface || '').trim();
        if (word && !seen.has(word)) { seen.add(word); out.push(word); }
      }
    }
    return out;
  }

  function addTokenTimings(segment) {
    const tokens = segment.tokens || [];
    const dur = Math.max(0, (segment.end || 0) - (segment.start || 0));
    if (!tokens.length || dur === 0) return;
    const weights = tokens.map(t => Math.max(1, (t.reading?.length || t.surface?.length || 1)));
    const sum = weights.reduce((a,b)=>a+b,0);
    let acc = 0;
    for (let i = 0; i < tokens.length; i++) {
      const startRel = (acc / sum) * dur;
      acc += weights[i];
      const endRel = (acc / sum) * dur;
      tokens[i].t = startRel;
      tokens[i].end = endRel;
    }
  }

  function onSrtFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const txt = String(reader.result || '');
        const obj = srtToSegments(txt);
        // If we already have JSON with tokens, merge SRT timings into existing segments
        if (data?.segments?.length) {
          const merged = (data.segments || []).map((seg, i) => {
            const srtSeg = obj.segments?.[i];
            if (!srtSeg) return seg;
            const newSeg = { ...seg, start: srtSeg.start, end: srtSeg.end };
            // Remove existing per-token timings and recompute within new duration
            const tokens = (seg.tokens || []).map((t) => {
              const c = { ...t };
              delete c.t; delete c.end; delete c.d;
              return c;
            });
            newSeg.tokens = tokens;
            addTokenTimings(newSeg);
            return newSeg;
          });
          setData(normalizeData({ segments: merged })); setSimTime(0); setLastLoadedFromSrt(true);
        } else {
          setData(normalizeData(obj)); setSimTime(0); setLastLoadedFromSrt(true);
        }
      } catch (err) {
        alert('Lỗi đọc SRT: ' + (err?.message || err));
      }
    };
    reader.readAsText(f, 'utf-8');
  }

  function adjustSegOffset(segIndex, delta) {
    setSegOffsets(prev => ({ ...prev, [segIndex]: (prev[segIndex] || 0) + delta }));
  }

  function seekTo(segIdx, tokenIdx) {
    const seg = data.segments[segIdx]; if (!seg) return;
    let t = seg.start;
    if (typeof tokenIdx === 'number' && seg.tokens[tokenIdx]) {
      t = seg.start + (seg.tokens[tokenIdx].t ?? 0);
    }
    if (demo) { setSimTime(t); }
    else if (videoRef.current && videoURL) { videoRef.current.currentTime = t; }
    else if (audioMainRef.current && !videoURL) { try { audioMainRef.current.currentTime = t; } catch {} setSimTime(t); }
  }

  function setPlaybackRate(r) {
    setRate(r);
    if (videoRef.current) videoRef.current.playbackRate = r;
    if (audioMainRef.current) { try { audioMainRef.current.playbackRate = r; } catch {} }
  }

  function formatSrtTimestamp(s) {
    const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
    const sec = Math.floor(s) % 60; const mm = Math.floor(s / 60) % 60; const hh = Math.floor(s / 3600);
    const p2 = (n) => n.toString().padStart(2, '0');
    return `${p2(hh)}:${p2(mm)}:${p2(sec)},${ms}`;
  }

  function buildSrt(dataObj) {
    const segs = dataObj?.segments || [];
    let idx = 1; const lines = [];
    for (const seg of segs) {
      const start = Math.max(0, seg.start || 0);
      const end = Math.max(start, seg.end || start);
      const hira = (seg.tokens || []).map(t => t.reading || t.surface || '').join('');
      const jp = String(seg.jp || '');
      const vi = String(seg.vi || '');
      lines.push(String(idx++));
      lines.push(`${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}`);
      if (hira) lines.push(hira);
      if (jp) lines.push(jp);
      if (vi) lines.push(vi);
      lines.push('');
    }
    return lines.join('\n');
  }

  function downloadSrt() {
    try {
      const srt = buildSrt(data);
      const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'subtitles.srt';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    } catch (e) {
      alert('Xuất SRT thất bại: ' + (e?.message || e));
    }
  }

  function findSegmentAtTime(segmentsArr, time) {
    if (!segmentsArr?.length) return -1;
    for (let i = 0; i < segmentsArr.length; i++) {
      const s = segmentsArr[i];
      if (time >= s.start && time <= s.end) return i;
    }
    return -1;
  }

  async function recordVideoWithSub() {
    const vid = videoRef.current;
    if (!('MediaRecorder' in window)) { alert('Trình duyệt không hỗ trợ MediaRecorder.'); return; }
    // Determine source: video or image
    const hasVideo = !!videoURL && vid;
    let width = 1280, height = 720;
    if (hasVideo) {
      width = vid.videoWidth || width;
      height = vid.videoHeight || height;
    } else {
      // fallback size for image (9:16 TikTok style)
      width = 720; height = 1280;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    const canvasStream = canvas.captureStream(30);
    let stream = canvasStream;
    try {
      // Prefer uploaded audio if present
      if (audioMainRef.current) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(audioMainRef.current);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        // Do NOT connect to destination here to avoid echo in some browsers during recording
        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) stream = new MediaStream([...canvasStream.getVideoTracks(), audioTrack]);
      } else if (hasVideo && typeof vid.captureStream === 'function') {
        // Fallback: use video's own audio track if no uploaded audio
        const mediaElStream = vid.captureStream();
        const audioTracks = mediaElStream.getAudioTracks();
        if (audioTracks && audioTracks.length) {
          stream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
        }
      }
    } catch {}
    let chunks = [];
    const mimeCandidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    let mime = '';
    for (const m of mimeCandidates) { if (MediaRecorder.isTypeSupported(m)) { mime = m; break; } }
    const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 4_000_000, audioBitsPerSecond: 128_000 });
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'video_with_sub.webm';
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
      setRecording(false);
    };

    // Prepare draw with per-token highlight (scale to native resolution)
    const wrapper = wrapperRef.current;
    const displayW = Math.max(1, (wrapper?.clientWidth || width));
    const scale = width / displayW; // scale UI px -> video native px
    const bgAlpha = opacity;
    const fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial';
    const padX = Math.round(12 * scale), padY = Math.round(10 * scale);
    const tokenGap = Math.round(4 * scale);
    const lineGap = Math.round(6 * scale);
    const cornerRadius = Math.round(10 * scale);

    const POS_RGB = {
      NOUN: '59,130,246', PROPN: '99,102,241', PRON: '14,165,233', PARTICLE: '16,185,129', VERB: '244,63,94', ADJ: '249,115,22', ADV: '245,158,11', EXPR: '139,92,246', NUM: '6,182,212', AUX: '236,72,153', COUNTER: '20,184,166', SYMBOL: '120,113,108', OTHER: '107,114,128'
    };
    function posBg(pos, active) {
      const rgb = POS_RGB[(pos || 'OTHER').toUpperCase()] || POS_RGB.OTHER;
      const a = active ? 1 : 0.4;
      return `rgba(${rgb},${a})`;
    }
    function roundRect(context, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      context.beginPath();
      context.moveTo(x + rr, y);
      context.arcTo(x + w, y, x + w, y + h, rr);
      context.arcTo(x + w, y + h, x, y + h, rr);
      context.arcTo(x, y + h, x, y, rr);
      context.arcTo(x, y, x + w, y, rr);
      context.closePath();
    }
    function wrapWords(context, text, maxWidth) {
      const s = String(text || '');
      if (!s) return [];
      const words = s.split(/\s+/).filter(Boolean);
      const lines = [];
      const pushChars = (str) => {
        let cur = '';
        for (const ch of Array.from(str)) {
          const test = cur + ch;
          if (context.measureText(test).width <= maxWidth || !cur) cur = test; else { lines.push(cur); cur = ch; }
        }
        if (cur) lines.push(cur);
      };
      if (words.length <= 1) { pushChars(s); return lines; }
      let line = words[0];
      for (let i = 1; i < words.length; i++) {
        const test = line + ' ' + words[i];
        if (context.measureText(test).width <= maxWidth) line = test; else { lines.push(line); line = words[i]; }
      }
      if (context.measureText(line).width > maxWidth) { pushChars(line); } else { lines.push(line); }
      return lines;
    }
    function getActiveTokenIndex(seg, rel, punctSkipLocal) {
      const tokens = seg.tokens || [];
      if (!tokens.length) return -1;
      for (let i = 0; i < tokens.length; i++) {
        const start = tokens[i].t ?? 0;
        const end = (() => {
          if (typeof tokens[i].end === 'number') return tokens[i].end;
          if (typeof tokens[i].d === 'number') return start + tokens[i].d;
          const nextT = tokens[i + 1]?.t; return typeof nextT === 'number' ? nextT : (seg.end - seg.start);
        })();
        if (rel >= start && rel < end) {
          if (!isPunctToken(tokens[i])) return i;
          if ((rel - start) >= punctSkipLocal) {
            for (let j = i + 1; j < tokens.length; j++) if (!isPunctToken(tokens[j])) return j;
          }
          for (let j = i - 1; j >= 0; j--) if (!isPunctToken(tokens[j])) return j;
          for (let j = i + 1; j < tokens.length; j++) if (!isPunctToken(tokens[j])) return j;
          return i;
        }
      }
      let bestIndex = -1; let bestDelta = Infinity;
      for (let i = 0; i < tokens.length; i++) {
        const delta = Math.abs(rel - (tokens[i].t ?? 0));
        if (delta < bestDelta) { bestDelta = delta; bestIndex = i; }
      }
      if (bestIndex >= 0 && isPunctToken(tokens[bestIndex])) {
        for (let j = bestIndex - 1; j >= 0; j--) if (!isPunctToken(tokens[j])) return j;
        for (let j = bestIndex + 1; j < tokens.length; j++) if (!isPunctToken(tokens[j])) return j;
      }
      return bestIndex;
    }

    function drawOverlayFrame(nowTime) {
      ctx.clearRect(0, 0, width, height);
      if (hasVideo) {
        ctx.drawImage(vid, 0, 0, width, height);
      } else if (bgImageRef.current) {
        const img = bgImageRef.current;
        // cover
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const scale = Math.max(width / imgW, height / imgH);
        const dw = imgW * scale;
        const dh = imgH * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, dw, dh);
      }
      const tNow = nowTime + highlightOffset;
      const segIdx = findSegmentAtTime(data.segments, tNow);
      const seg = segIdx >= 0 ? data.segments[segIdx] : null;
      if (!seg) return;

      // Layout area
      ctx.textBaseline = 'top';
      const outerMargin = Math.round(8 * scale);
      const panelW = width - outerMargin * 2; // total panel width inside outer margins
      const innerW = panelW - outerMargin * 2; // preserve spacing similar to UI
      const x0 = outerMargin; // panel left
      const contentW = innerW - 2 * padX; // content area width inside panel
      const centerX = x0 + padX + Math.round(contentW / 2);
      const subFontSizeScaled = Math.max(8 * scale, subFontSize * scale);
      const readingFontSizeScaled = Math.max(8 * scale, Math.round(subFontSizeScaled * 0.7));

      // VI text: split sentences and wrap per line, center each line
      const vi = String(seg.vi || '');
      const viFontSizeScaled = Math.max(10 * scale, (subFontSize - 2) * scale);
      ctx.font = `500 ${viFontSizeScaled}px ${fontFamily}`;
      const sentences = vi.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
      const toWrapped = (txt) => {
        const words = txt.split(/\s+/).filter(Boolean);
        const lines = [];
        let current = '';
        for (const w of words) {
          const test = current ? current + ' ' + w : w;
          if (ctx.measureText(test).width <= contentW) current = test; else { if (current) lines.push(current); current = w; }
        }
        if (current) lines.push(current);
        return lines.length ? lines : [''];
      };
      const viLines = sentences.length ? sentences.flatMap(toWrapped) : toWrapped(vi);
      const viLineH = viFontSizeScaled + Math.round(2 * scale);
      const viBlockH_all = viLines.length ? viLines.length * viLineH + Math.max(0, (viLines.length - 1) * Math.round(2 * scale)) : 0;

      // Compute VOCAB line (top): disabled for export to avoid extra top lines
      const showVocabTopLocal = false;
      let vocabLines = [];
      let vocabBlockH = 0;
      if (showVocabTopLocal) {
        const vocabList = extractVocabList(seg);
        ctx.font = `700 ${Math.max(10 * scale, Math.round(subFontSizeScaled * 0.9))}px ${fontFamily}`;
        const items = vocabList.length ? vocabList : [];
        // render as one item per line
        vocabLines = items;
        const vocabLineH = Math.max(10 * scale, Math.round(subFontSizeScaled * 0.9)) + Math.round(2 * scale);
        vocabBlockH = vocabLines.length ? (vocabLines.length * vocabLineH + Math.max(0, (vocabLines.length - 1) * Math.round(2 * scale))) : 0;
      }

      // Build JP/VI per-sentence layout (wrap JP tokens to multiple rows, keep font size)
      const segTokens = seg.tokens || [];
      // Active token index within segment for ring
      const segOffset = segOffsets[segIdx] || 0;
      const rel = (tNow + tokenLead + segOffset) - seg.start;
      const activeIdx = getActiveTokenIndex(seg, rel, punctSkip);

      // Precompute sentences
      const sents = splitTokensBySentences(segTokens);
      const viPartsAll = splitViLines(seg.vi);
      const jpViLayouts = [];
      const tokenPadXBase = Math.round(4 * scale);
      const tokenPadYBase = Math.round(3 * scale);
      const subFontPxBase = Math.max(8 * scale, subFontSizeScaled);
      const readingFontPxBase = Math.max(8 * scale, readingFontSizeScaled);
      const tokenGapBase = Math.max(1, Math.round(tokenGap));
      for (let li = 0; li < sents.length; li++) {
        const line = sents[li];
        // Measure JP boxes at base size
        ctx.font = `700 ${subFontPxBase}px ${fontFamily}`;
        const boxesAll = [];
        for (const [tk, gi] of line) {
          const label = tk.surface || '';
          const w = Math.ceil(ctx.measureText(label).width) + tokenPadXBase * 2;
          const h = subFontPxBase + tokenPadYBase * 2;
          boxesAll.push({ tk, gi, w, h });
        }
        const tagWBase = Math.ceil(ctx.measureText('A:').width) + Math.round(6 * scale);

        // Wrap boxes across multiple rows to keep font size
        const jpRows = [];
        let idx = 0;
        let firstRow = true;
        while (idx < boxesAll.length) {
          const row = [];
          const anyReadingRow = { value: false };
          const avail = firstRow ? (contentW - tagWBase) : contentW;
          let used = 0; let count = 0;
          while (idx < boxesAll.length) {
            const b = boxesAll[idx];
            const wPlus = (count === 0 ? b.w : (b.w + tokenGapBase));
            if (count > 0 && used + wPlus > avail) break;
            used += wPlus; row.push(b); count++;
            if (showFurigana && b.tk.reading && !isPunctToken(b.tk)) anyReadingRow.value = true;
            idx++;
            // if single token doesn't fit even when first in row, force it
            if (count === 1 && b.w > avail) { break; }
          }
          const tagWRow = firstRow ? tagWBase : 0;
          const anyReadingBool = anyReadingRow.value;
          const jpLineW = tagWRow + used;
          const jpLineH = (anyReadingBool ? (readingFontPxBase + Math.round(2 * scale)) : 0) + (subFontPxBase + Math.round(2 * scale));
          jpRows.push({ boxes: row, tagW: tagWRow, jpLineW, jpLineH, anyReading: anyReadingBool });
          firstRow = false;
        }

        // VI for this sentence (wrap)
        ctx.font = `500 ${viFontSizeScaled}px ${fontFamily}`;
        const viRaw = String(viPartsAll[li] || '');
        const viWrapped = (() => {
          const words = viRaw.split(/\s+/).filter(Boolean);
          const lines = [];
          let current = '';
          for (const w of words) {
            const test = current ? current + ' ' + w : w;
            if (ctx.measureText(test).width <= contentW) current = test; else { if (current) lines.push(current); current = w; }
          }
          if (current) lines.push(current);
          return lines;
        })();
        const viLineH_local = viFontSizeScaled + Math.round(2 * scale);
        const viBlockH_local = viWrapped.length ? (viWrapped.length * viLineH_local + Math.max(0, (viWrapped.length - 1) * Math.round(2 * scale))) : 0;
        // total JP block height for this sentence (sum of row heights + small gaps between rows)
        const rowGap = Math.round(2 * scale);
        const jpBlockH_local = jpRows.reduce((s, r) => s + r.jpLineH, 0) + Math.max(0, (jpRows.length - 1) * rowGap);
        jpViLayouts.push({ jpRows, jpBlockH: jpBlockH_local, rowGap, viWrapped, viLineH: viLineH_local, viBlockH: viBlockH_local, subFontPx: subFontPxBase, readingFontPx: readingFontPxBase, tokenGap: tokenGapBase });
      }

      const sentenceGap = Math.round(10 * scale);
      const jpBlockH = jpViLayouts.reduce((s, it) => s + it.jpBlockH, 0) + Math.max(0, (jpViLayouts.length - 1) * sentenceGap);
      const viBlockH = jpViLayouts.reduce((s, it) => s + it.viBlockH, 0) + Math.max(0, (jpViLayouts.length - 1) * Math.round(2 * scale));
      const boxH = padY + vocabBlockH + (vocabBlockH ? Math.round(6 * scale) : 0) + jpBlockH + (viBlockH ? Math.round(6 * scale) : 0) + viBlockH + padY;
      const bottomMargin = Math.round(36 * scale);
      const offsetY = Math.round(subOffsetY * scale);
      // Keep subtitle panel strictly within frame
      let boxY = subCentered ? (Math.round(height / 2 - boxH / 2 + offsetY)) : (height - boxH - bottomMargin + offsetY);
      if (boxY < 0) boxY = 0; if (boxY + boxH > height) boxY = Math.max(0, height - boxH);

      // Panel background
      ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
      roundRect(ctx, x0, boxY, innerW + outerMargin * 2, boxH, Math.max(8, Math.round(16 * scale)));
      ctx.fill();

      // Draw VOCAB top (disabled for export)
      if (showVocabTopLocal && vocabLines.length) {
        ctx.fillStyle = '#f4f4f5';
        ctx.textAlign = 'center';
        ctx.font = `700 ${Math.max(10 * scale, Math.round(subFontSizeScaled * 0.9))}px ${fontFamily}`;
        let vy = boxY + padY;
        for (const l of vocabLines) { ctx.fillText(l, centerX, vy); vy += Math.max(10 * scale, Math.round(subFontSizeScaled * 0.9)) + Math.round(2 * scale); }
      }

      // Draw sentences: JP tokens line (centered) then VI lines (centered)
      let jy = boxY + padY + vocabBlockH + (vocabBlockH ? Math.round(6 * scale) : 0);
      for (const layout of jpViLayouts) {
        // Draw JP rows for this sentence
        for (const row of layout.jpRows) {
          let x = x0 + padX + Math.round((contentW - row.jpLineW) / 2);
          ctx.textAlign = 'left';
          ctx.font = `700 ${subFontPxBase}px ${fontFamily}`;
          ctx.fillStyle = '#e5e7eb';
          if (row.tagW) {
            const tagY = jy + (row.anyReading ? (readingFontPxBase + Math.round(2 * scale)) : 0);
            ctx.fillText('A:', x, tagY);
            x += row.tagW;
          }
          for (const b of row.boxes) {
            const isActive = highlightEnabled && b.gi === activeIdx && !isPunctToken(b.tk);
            const bg = posBg(b.tk.pos, isActive);
            if (row.anyReading && showFurigana && b.tk.reading && !isPunctToken(b.tk)) {
              ctx.font = `500 ${readingFontPxBase}px ${fontFamily}`;
              ctx.fillStyle = '#e4e4e7';
              const rw = Math.ceil(ctx.measureText(b.tk.reading).width);
              const rx = x + Math.round((b.w - rw) / 2);
              ctx.fillText(b.tk.reading, rx, jy);
            }
            const baseY = jy + (row.anyReading ? (readingFontPxBase + Math.round(2 * scale)) : 0);
            if (!isPunctToken(b.tk)) {
              roundRect(ctx, x, baseY - Math.round(2 * scale), b.w, subFontPxBase + Math.round(6 * scale), Math.max(6, Math.round(8 * scale)));
              ctx.fillStyle = bg; ctx.fill();
              if (isActive) { ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1, Math.round(2 * scale)); roundRect(ctx, x, baseY - Math.round(2 * scale), b.w, subFontPxBase + Math.round(6 * scale), Math.max(6, Math.round(8 * scale))); ctx.stroke(); }
            }
            ctx.font = `700 ${subFontPxBase}px ${fontFamily}`; ctx.fillStyle = '#ffffff';
            ctx.fillText(b.tk.surface || '', x + Math.round(4 * scale), baseY);
            x += b.w + tokenGapBase;
          }
          jy += row.jpLineH + layout.rowGap;
        }
        // VI lines for this sentence
        ctx.textAlign = 'center'; ctx.font = `500 ${viFontSizeScaled}px ${fontFamily}`; ctx.fillStyle = 'rgba(228,228,231,0.95)';
        for (const l of layout.viWrapped) { ctx.fillText(l, centerX, jy); jy += layout.viLineH; }
        jy += sentenceGap;
      }

      // Optional: draw current time debug marker for multi-sentence verification
      // ctx.fillStyle = '#0f0'; ctx.fillRect(4, 4, 2, 8);
    }

    // Playback and record
    setRecording(true);
    chunks = [];
    rec.start(500);
    const useRVFC = hasVideo && typeof vid.requestVideoFrameCallback === 'function';
    let rafId = 0;
    function onFrame(_n, metadata) {
      const useAudioClock = !!audioMainRef.current;
      const time = useAudioClock
        ? (audioMainRef.current.currentTime || 0)
        : (hasVideo ? ((metadata && typeof metadata.mediaTime === 'number') ? metadata.mediaTime : vid.currentTime) : 0);
      drawOverlayFrame(time);
      if (useRVFC) vid.requestVideoFrameCallback(onFrame); else rafId = requestAnimationFrame(() => onFrame());
    }
    if (useRVFC) vid.requestVideoFrameCallback(onFrame); else rafId = requestAnimationFrame(() => onFrame());

    const onVideoEnded = () => {
      if (!audioMainRef.current) {
        if (rafId) cancelAnimationFrame(rafId);
        try { rec.stop(); } catch {}
      }
      vid.removeEventListener('ended', onVideoEnded);
    };
    if (hasVideo) {
      vid.addEventListener('ended', onVideoEnded);
      try { vid.currentTime = 0; } catch {}
      // If there is audio, drive by audio; otherwise let video play once
      if (audioMainRef.current) {
        const a = audioMainRef.current;
        const stopWhenAudioEnds = () => { try { rec.stop(); } catch {}; setPlaying(false); };
        a.addEventListener('ended', stopWhenAudioEnds, { once: true });
        try { a.currentTime = 0; a.play(); } catch {}
      } else {
        try { vid.play(); } catch {}
      }
    } else if (audioMainRef.current) {
      const a = audioMainRef.current;
      const stopWhenAudioEnds = () => {
        try { a.pause(); } catch {}
        try { rec.stop(); } catch {}
        setPlaying(false);
      };
      a.addEventListener('ended', stopWhenAudioEnds, { once: true });
      try { a.currentTime = 0; a.play(); } catch {}
    }
  }

  const Legend = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {Object.entries(posColors).map(([k, cls]) => (
        <div key={k} className="flex items-center gap-2 text-sm">
          <span className={`inline-block w-3 h-3 rounded ${cls}`} />
          <span className="text-zinc-200 font-medium">{k}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-root">
      <div className="app-container">
        {/* Header */}
        <div className="app-header">
          <div className="header-left">
            <BookOpenText className="icon-6" />
            <h1 className="app-title">JP–VI Video Sub • Furigana + POS Highlight</h1>
          </div>
          <div className="header-actions">
            <label className="btn-upload">
              <Upload className="icon-4" />
              <span className="btn-label">Video</span>
              <input type="file" accept="video/mp4,video/webm" style={{ display: 'none' }} onChange={onVideoFile} />
            </label>
            <label className="btn-upload">
              <Upload className="icon-4" />
              <span className="btn-label">Ảnh nền</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = URL.createObjectURL(f);
                setImageURL(url);
              }} />
            </label>
            <label className="btn-upload">
              <Upload className="icon-4" />
              <span className="btn-label">Audio</span>
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = URL.createObjectURL(f);
                setAudioMainURL(url);
              }} />
            </label>
            <button className="btn" onClick={() => setSttOpen(v => !v)}>
              <span>Audio → SRT</span>
            </button>
            <button className="btn" onClick={() => setTtsOpen(true)}>
              <Volume2 className="icon-4" />
              <span>Text → Audio</span>
            </button>
            <button className="btn" onClick={() => setAudioFilesOpen(true)}>
              <DownloadIcon className="icon-4" />
              <span>File Audio</span>
            </button>
            <button className="btn" onClick={() => setYoutubeOpen(true)}>
              <DownloadIcon className="icon-4" />
              <span>YouTube</span>
            </button>
            <button className="btn" onClick={() => setSttOpen(true)}>
              <FileText className="icon-4" />
              <span>Audio → SRT</span>
            </button>
            <button className="btn" onClick={() => setYoutubeTestOpen(true)}>
              <Play className="icon-4" />
              <span>Test YouTube</span>
            </button>
            <label className="btn-upload">
              <Upload className="icon-4" />
              <span className="btn-label">JSON</span>
              <input type="file" accept="application/json" style={{ display: 'none' }} onChange={onJsonFile} />
            </label>
            <label className="btn-upload">
              <Upload className="icon-4" />
              <span className="btn-label">SRT</span>
              <input type="file" accept=".srt,text/plain,application/x-subrip" style={{ display: 'none' }} onChange={onSrtFile} />
            </label>
            <Link to="/image-video" style={{ textDecoration: 'none' }}>
              <button className="btn">
                <span>Tạo video AI từ ảnh</span>
              </button>
            </Link>
          </div>
        </div>

        {sttOpen && (
          <div className="segments-panel" style={{ marginTop: '0.75rem' }}>
            <div className="segments-header">
              <h2 className="app-title" style={{ fontSize: '1.125rem' }}>Tạo SRT từ Audio (Whisper)</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label className="btn-upload">
                <Upload className="icon-4" />
                <span className="btn-label">Chọn Audio</span>
                <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => setSttAudioFile(e.target.files?.[0] || null)} />
              </label>
              <input placeholder="OpenAI API Key (bỏ trống để dùng server tự host)" value={sttApiKey} onChange={(e) => setSttApiKey(e.target.value)} style={{ flex: '1 1 240px', minWidth: 200, padding: '0.5rem 0.75rem', borderRadius: '0.75rem', background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46' }} />
              <input placeholder="API Base (ví dụ: https://api.openai.com hoặc http://localhost:3000)" value={sttApiBase} onChange={(e) => setSttApiBase(e.target.value)} style={{ flex: '1 1 260px', minWidth: 240, padding: '0.5rem 0.75rem', borderRadius: '0.75rem', background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46' }} />
              <select value={sttModel} onChange={(e) => setSttModel(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.75rem', background: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46' }}>
                <option value="whisper-1">whisper-1</option>
              </select>
              <button className="btn" disabled={!sttAudioFile || sttLoading} onClick={async () => {
                if (!sttAudioFile) return; setSttLoading(true); setSttError(''); setSttResult('');
                try {
                  const form = new FormData();
                  form.append('file', sttAudioFile);
                  form.append('model', sttModel);
                  form.append('response_format', 'srt');
                  const base = sttApiBase.replace(/\/$/, '');
                  const res = await fetch(`${base}/v1/audio/transcriptions`, {
                    method: 'POST',
                    headers: sttApiKey ? { Authorization: `Bearer ${sttApiKey}` } : {},
                    body: form,
                  });
                  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                  const srtText = await res.text();
                  setSttResult(srtText);
                } catch (err) {
                  setSttError(String(err?.message || err));
                } finally {
                  setSttLoading(false);
                }
              }}>{sttLoading ? 'Đang nhận dạng…' : 'Tạo SRT'}</button>
              <button className="btn" disabled={!sttResult} onClick={() => {
                try {
                  const blob = new Blob([sttResult], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'transcript.srt';
                  document.body.appendChild(a); a.click();
                  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
                } catch {}
              }}>Tải SRT</button>
              <button className="btn" disabled={!sttResult} onClick={() => {
                try {
                  const obj = srtToSegments(sttResult);
                  setData(normalizeData(obj)); setSimTime(0);
                } catch (e) {
                  alert('SRT không hợp lệ');
                }
              }}>Nạp vào app</button>
              <button className="btn" disabled={!sttAudioFile || sttLoading} onClick={async () => {
                if (!sttAudioFile) return; setSttLoading(true); setSttError(''); setSttResult('');
                try {
                  if (!localTranscribePipeline) {
                    const { pipeline, env } = await import('@xenova/transformers');
                    env.useBrowserCache = true;
                    env.allowLocalModels = false;
                    env.HF_ENDPOINT = 'https://huggingface.co';
                    try { env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/'; } catch {}
                    localTranscribePipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', { quantized: true });
                  }
                  const arrayBuffer = await sttAudioFile.arrayBuffer();
                  const AC = window.AudioContext || window.webkitAudioContext;
                  const audioCtx = new AC();
                  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
                  const out = await localTranscribePipeline(decoded, {
                    chunk_length_s: 30,
                    stride_length_s: 5,
                    language: 'ja', // TODO: expose language select
                    return_timestamps: true,
                  });
                  // Xây SRT từ out.chunks
                  const toSrtTime = (s) => {
                    const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
                    const sec = Math.floor(s) % 60; const mm = Math.floor(s / 60) % 60; const hh = Math.floor(s / 3600);
                    const p2 = (n) => n.toString().padStart(2, '0');
                    return `${p2(hh)}:${p2(mm)}:${p2(sec)},${ms}`;
                  };
                  let idx = 1; const lines = [];
                  const segments = out.segments || out.chunks || [];
                  for (const c of segments) {
                    const ts = c.timestamp || c.timestamps || c.time_offset || [c.start ?? 0, c.end ?? ((c.start ?? 0) + 1)];
                    const start = Math.max(0, (Array.isArray(ts) ? ts[0] : c.start) || 0);
                    const end = Math.max(start, (Array.isArray(ts) ? ts[1] : c.end) || (start + 1));
                    const text = (c.text || c.chunk || '').trim();
                    if (!text) continue;
                    lines.push(String(idx++));
                    lines.push(`${toSrtTime(start)} --> ${toSrtTime(end)}`);
                    lines.push(text);
                    lines.push('');
                  }
                  const srtText = lines.join('\n');
                  setSttResult(srtText);
                } catch (err) {
                  const msg = String(err?.message || err);
                  if (msg.includes('Unexpected token') && msg.includes('<')) {
                    setSttError('Không tải được tệp mô hình (có thể mạng/HuggingFace bị chặn). Hãy kiểm tra kết nối hoặc thử lại sau.');
                  } else {
                    setSttError(msg);
                  }
                } finally {
                  setSttLoading(false);
                }
              }}>Local (no API)</button>
            </div>
            {sttError && (<div style={{ color: '#fca5a5', marginTop: '0.5rem' }}>Lỗi: {sttError}</div>)}
            {sttResult && (
              <div style={{ marginTop: '0.5rem', maxHeight: '12rem', overflow: 'auto', background: 'rgba(39,39,42,0.4)', padding: '0.5rem', borderRadius: '0.5rem', whiteSpace: 'pre-wrap' }}>
                {sttResult}
              </div>
            )}
          </div>
        )}

        {/* Player + Subtitle Panel */}
        <div className="layout">
          <div className="video-wrapper tiktok" ref={wrapperRef}>
            {videoURL ? (
              <video ref={videoRef} src={videoURL} controls playsInline loop={!!audioMainURL} muted={!!audioMainURL} onLoadedMetadata={() => { try { setMediaDuration(videoRef.current?.duration || 0); } catch {} }} onPlay={() => {
                setPlaying(true);
                const a = audioMainRef.current;
                if (a) { try { a.play(); } catch {} }
              }} onPause={() => {
                setPlaying(false);
                const a = audioMainRef.current;
                if (a) { try { a.pause(); } catch {} }
              }} />
            ) : imageURL ? (
              <img ref={bgImageRef} src={imageURL} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div className="video-placeholder">
                <div className="placeholder-text">
                  <p className="placeholder-title">Demo Mode (chưa chọn video)</p>
                  <p className="placeholder-desc">Nhấn Play để mô phỏng thời gian, hoặc bấm Upload Video.</p>
                </div>
              </div>
            )}
            {audioMainURL && (
              <audio ref={audioMainRef} src={audioMainURL} preload="auto" onLoadedMetadata={() => { try { setMediaDuration(audioMainRef.current?.duration || 0); } catch {} }} style={{ display: 'none' }} />
            )}

            {/* Sub overlay (mobile only) */}
            <div className={`subtitle-overlay ${subCentered ? 'center' : ''}`}>
              <div className="overlay-inner">
                {currentSeg && (
                  <div className="overlay-panel" style={{ backgroundColor: `rgba(0,0,0,${opacity})`, ['--sub-font-size']: `${subFontSize}px`, ['--sub-offset-y']: `${subOffsetY}px` }}>
                    <div className="subs-current" data-hl={highlightEnabled ? 'on' : 'off'}>
                      {(() => {
                        const viLines = splitViLines(currentSeg?.vi);
                        const sents = splitTokensBySentences(currentSeg.tokens);
                        return sents.map((line, li) => (
                          <div key={li} style={{ marginBottom: '6px' }}>
                            <div className="token-line">
                              <span className="speaker-tag">A:</span>
                              {line.map(([tk, i]) => {
                                const isHighlightable = !isPunctToken(tk);
                                const isActive = i === currentTokenIndex;
                                const active = highlightEnabled && isActive && isHighlightable;
                                return (
                                  <span
                                    key={i}
                                    className={`pos-token token-shell ${active ? 'token-active' : ''}`}
                                    data-pos={tk.pos}
                                    data-active={active ? 'true' : 'false'}
                                  >
                                    {showFurigana && !isPunctToken(tk) ? (
                                      <ruby className="[ruby-position:over]">
                                        <span className={`token-inner ${active ? 'token-ring' : ''}`}>{tk.surface}</span>
                                        <rt className="text-xs md:text-sm font-normal" style={{ color: '#e4e4e7' }}>{tk.reading}</rt>
                                      </ruby>
                                    ) : (
                                      <span className={`token-inner ${active ? 'token-ring' : ''}`}>{tk.surface}</span>
                                    )}
                                    {showRomaji && (
                                      <div className="token-romaji">{tk.romaji}</div>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                            {showVietnamese && viLines[li] && (
                              <div className="overlay-vi">{viLines[li]}</div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle side panel (desktop) - only current */}
          {/* <div className="hidden md:block md:col-span-8 lg:col-span-9">
            <div className="rounded-2xl bg-zinc-900/60 p-4">
              {currentSeg ? (
                <div className="space-y-1 leading-relaxed text-xl font-semibold">
                  {splitTokensBySentences(currentSeg.tokens).map((line, li) => (
                    <div key={li} className="flex flex-wrap items-end gap-x-2 gap-y-2">
                      {line.map(([tk, i]) => {
                        const active = i === currentTokenIndex;
                        const bg = posClass(tk.pos, posColors);
                        const softBg = `${bg}/40`;
                        return (
                          <span
                            key={i}
                            className={`pos-token px-1 rounded-xl transition-all duration-200 ${active ? 'text-white shadow ring-2 ring-white/80' : ''}`}
                            data-pos={tk.pos}
                            data-active={active ? 'true' : 'false'}
                          >
                            {showFurigana ? (
                              <ruby className="[ruby-position:over]">
                                <span className={`inline-block px-1 rounded-md transition-colors duration-200 bg-transparent`}>{tk.surface}</span>
                                <rt className="text-xs md:text-sm font-normal text-zinc-200">{tk.reading}</rt>
                              </ruby>
                            ) : (
                              <span className={`inline-block px-1 rounded-md transition-colors duration-200 bg-transparent`}>{tk.surface}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                  {showVietnamese && (
                    <div className="mt-2 text-sm md:text-base text-zinc-200/95 font-medium">{currentSeg.vi}</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-zinc-500 italic">—</div>
              )}
            </div>
          </div> */}
        </div>

        {/* Transport & Settings */}
        <div className="controls-row">
          <div className="controls-left">
            <button onClick={handlePlayPause} className="btn">
              {playing ? <Pause className="icon-4" /> : <Play className="icon-4" />}
              <span>{playing ? 'Pause' : 'Play'}</span>
            </button>
            <button onClick={() => {
              if (demo) { setSimTime(0); setPlaying(false); return; }
              if (videoRef.current && videoURL) {
                try { videoRef.current.pause(); videoRef.current.currentTime = 0; } catch {}
                setPlaying(false); setSimTime(0);
                return;
              }
              if (audioMainRef.current && !videoURL) {
                try { audioMainRef.current.pause(); audioMainRef.current.currentTime = 0; } catch {}
                setPlaying(false); setSimTime(0);
                return;
              }
            }} className="btn">
              <RefreshCw className="icon-4" />
              <span>Reset</span>
            </button>
            <button onClick={downloadSrt} className="btn">
              <DownloadIcon className="icon-4" />
              <span>Tải SRT</span>
            </button>
            <button onClick={recordVideoWithSub} className="btn" disabled={recording || (!videoURL && !imageURL)}>
              <DownloadIcon className="icon-4" />
              <span>{recording ? 'Đang ghi...' : 'Tải video + sub'}</span>
            </button>
          </div>

          <div className="controls-right">
            <div className="control-group">
              <Highlighter className="icon-4" />
              <span className="btn-label">Độ mờ nền</span>
              <input type="range" min={0.4} max={1} step={0.02} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="slider" />
            </div>
            <div className="control-group">
              <Settings2 className="icon-4" />
              <span className="btn-label">Tốc độ</span>
              <input type="range" min={0.5} max={2} step={0.05} value={rate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} className="slider" />
              <span className="rate-value">{rate.toFixed(2)}×</span>
            </div>
            <div className="control-group">
              <span className="btn-label">Cỡ chữ</span>
              <input type="range" min={12} max={36} step={1} value={subFontSize} onChange={(e) => setSubFontSize(parseInt(e.target.value))} className="slider" />
              <span className="rate-value">{subFontSize}px</span>
            </div>
            <div className="control-group">
              <span className="btn-label">Vị trí Y</span>
              <input type="range" min={-200} max={200} step={1} value={subOffsetY} onChange={(e) => setSubOffsetY(parseInt(e.target.value))} className="slider" />
              <span className="rate-value">{subOffsetY}px</span>
            </div>
            <div className="control-group">
              <span className="btn-label">Bù trễ highlight</span>
              <input type="range" min={-1} max={1} step={0.005} value={highlightOffset} onChange={(e) => setHighlightOffset(parseFloat(e.target.value))} className="slider" />
              <span className="rate-value">{highlightOffset.toFixed(3)}s</span>
            </div>
            <div className="control-group">
              <span className="btn-label">Token lead</span>
              <input type="range" min={-0.5} max={0.5} step={0.005} value={tokenLead} onChange={(e) => setTokenLead(parseFloat(e.target.value))} className="slider" />
              <span className="rate-value">{tokenLead.toFixed(3)}s</span>
            </div>
            <div className="control-group">
              <span className="btn-label">Skip dấu câu</span>
              <input type="range" min={0} max={0.2} step={0.005} value={punctSkip} onChange={(e) => setPunctSkip(parseFloat(e.target.value))} className="slider" />
              <span className="rate-value">{punctSkip.toFixed(3)}s</span>
            </div>
            <label className="check-label">
              <input type="checkbox" checked={highlightEnabled} onChange={(e) => setHighlightEnabled(e.target.checked)} />
              <span className="btn-label">Bật highlight</span>
            </label>
            <label className="check-label">
              <input type="checkbox" checked={showVocabTop} onChange={(e) => setShowVocabTop(e.target.checked)} />
              <span className="btn-label">Hiện từ vựng phía trên</span>
            </label>
            <label className="check-label">
              <input type="checkbox" checked={showFurigana} onChange={(e) => setShowFurigana(e.target.checked)} />
              <span className="btn-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Type className="icon-4" /> Furigana</span>
            </label>
            <label className="check-label">
              <input type="checkbox" checked={showRomaji} onChange={(e) => setShowRomaji(e.target.checked)} />
              <span className="btn-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Languages className="icon-4" /> Romaji</span>
            </label>
            <label className="check-label">
              <input type="checkbox" checked={showVietnamese} onChange={(e) => setShowVietnamese(e.target.checked)} />
              <span className="btn-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wand2 className="icon-4" /> Tiếng Việt</span>
            </label>
            <label className="check-label">
              <input type="checkbox" checked={subCentered} onChange={(e) => setSubCentered(e.target.checked)} />
              <span className="btn-label">Sub giữa màn hình</span>
            </label>
          </div>
        </div>

        {/* Segments list (seek) */}
        <div className="segments-panel">
          <div className="segments-header">
            <h2 className="app-title" style={{ fontSize: '1.125rem' }}>Danh sách câu</h2>
            <span className="now-badge">Now: {secondsToTimestamp(Math.max(0, simTime))}{mediaDuration ? ` / ${secondsToTimestamp(mediaDuration)}` : ''}</span>
          </div>
          <div className="segment-list">
            {data.segments.map((s, si) => (
              <div key={si} className={`segment-card ${si === currentSegIndex ? 'is-active' : ''}`}>
                <div className="segment-top">
                  <div>
                    <span className="font-mono">{secondsToTimestamp(s.start)}</span>
                    <span> → </span>
                    <span className="font-mono">{secondsToTimestamp(s.end)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => adjustSegOffset(si, -0.02)} className="btn-seek">-20ms</button>
                    <button onClick={() => adjustSegOffset(si, 0.02)} className="btn-seek">+20ms</button>
                    <button onClick={() => seekTo(si)} className="btn-seek">Seek</button>
                  </div>
                </div>
                <div className="seg-text">
                  <div className="seg-jp">{s.jp}</div>
                  <div className="seg-vi">{s.vi}</div>
                </div>
                <div className="segment-tokens">
                  {s.tokens.map((tk, ti) => (
                    <button key={ti} onClick={() => seekTo(si, ti)} className={`segment-token-btn ${ti === (si === currentSegIndex ? currentTokenIndex : -1) ? 'is-active' : ''}`}>
                      <span className="segment-token-content">
                        <span className="pos-dot" data-pos={tk.pos} />
                        <span className={`segment-token-label ${ti === (si === currentSegIndex ? currentTokenIndex : -1) ? 'is-active' : ''}`}>{tk.surface}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="legend-panel">
          <div className="legend-header">
            <Highlighter className="icon-5" />
            <h3 className="app-title" style={{ fontSize: '1rem' }}>Màu theo loại từ (POS)</h3>
          </div>
          <div className="legend-grid">
            {Object.keys(DEFAULT_POS_COLORS).map((k) => (
              <div key={k} className="legend-item">
                <span className="legend-swatch" data-pos={k} />
                <span className="legend-label">{k}</span>
              </div>
            ))}
          </div>
          <p className="legend-note">Bạn có thể mở rộng map màu trong mã (DEFAULT_POS_COLORS) để thêm loại từ khác (ví dụ: INTERJ, CONJ, DET…).</p>
        </div>

        {/* Vocab JP–VI for current segment */}
        <div className="legend-panel" style={{ marginTop: '0.75rem' }}>
          <div className="legend-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Highlighter className="icon-5" />
              <h3 className="app-title" style={{ fontSize: '1rem' }}>Từ vựng JP–VI (câu hiện tại)</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn" onClick={copyVocabCsv} disabled={!vocabEntries.length}>Copy CSV</button>
              <button className="btn" onClick={downloadVocabCsv} disabled={!vocabEntries.length}>Tải CSV</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '0.5rem' }}>
            <div className="legend-item" style={{ fontWeight: 700 }}>
              <span>JP</span>
            </div>
            <div className="legend-item" style={{ fontWeight: 700 }}>
              <span>Reading</span>
            </div>
            <div className="legend-item" style={{ fontWeight: 700 }}>
              <span>VI</span>
            </div>
            {vocabEntries.map((it, idx) => (
              <React.Fragment key={idx}>
                <div className="legend-item"><span>{it.surface}</span></div>
                <div className="legend-item"><span>{it.reading}</span></div>
                <div className="legend-item"><span>{it.vi}</span></div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Hướng dẫn nhanh */}
        <div className="info-panel">
          <h4 className="info-title">Cách dùng nhanh</h4>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Chuẩn bị <b>video (.mp4/.webm)</b> và <b>file JSON</b> theo schema ở đầu file.</li>
            <li>Nhấn <i>Upload Video</i> và <i>Upload JSON</i> để nạp dữ liệu.</li>
            <li>Bật/tắt <b>Furigana</b>, <b>Romaji</b>, <b>Tiếng Việt</b> bằng các nút trong thanh cài đặt.</li>
            <li>Chọn câu/từ trong danh sách để <b>seek</b> nhanh đến vị trí tương ứng.</li>
            <li>Nếu chưa có video, dùng <b>Demo Mode</b>: nhấn <b>Play</b> để mô phỏng thời gian.</li>
          </ol>
          <p style={{ marginTop: '0.5rem' }}>Gợi ý pipeline tạo JSON: tách câu từ SRT/ASS → chạy phân tách hình thái (MeCab/Sudachi/KUROMOJI) → ghép reading (kana) + romaji → gán POS + thời điểm <i>t</i> trong câu (từ mô hình align hoặc heuristic chia đều).</p>
        </div>
      </div>

      {/* TTS Panel */}
      <TTSPanel isOpen={ttsOpen} onClose={() => setTtsOpen(false)} />
      
      {/* Audio Files List */}
      <AudioFilesList isOpen={audioFilesOpen} onClose={() => setAudioFilesOpen(false)} />
      
      {/* YouTube Downloader */}
      <YouTubeDownloader isOpen={youtubeOpen} onClose={() => setYoutubeOpen(false)} />
      
      {/* STT Converter */}
      <STTConverter isOpen={sttOpen} onClose={() => setSttOpen(false)} />
      
      {/* YouTube Tester */}
      <YouTubeTester isOpen={youtubeTestOpen} onClose={() => setYoutubeTestOpen(false)} />
    </div>
  );
}
