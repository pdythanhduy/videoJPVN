import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function parseSrtTimecode(tc) {
  const m = String(tc).trim().match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})/)
  if (!m) return 0
  const hh = parseInt(m[1], 10) || 0
  const mm = parseInt(m[2], 10) || 0
  const ss = parseInt(m[3], 10) || 0
  const ms = parseInt((m[4] + '000').slice(0, 3), 10) || 0
  return hh * 3600 + mm * 60 + ss + ms / 1000
}

function looksJapanese(s) {
  return /[\u3040-\u30FF\u4E00-\u9FFF]/u.test(String(s || ''))
}

function parseSRT(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
  const cues = []
  let i = 0
  while (i < lines.length) {
    if (/^\d+$/.test(lines[i].trim())) i++
    const tc = lines[i] || ''
    const mt = tc.match(/-->/)
    if (!mt) { i++; continue }
    const [left, right] = tc.split(/-->/)
    const start = parseSrtTimecode(left || '')
    const end = parseSrtTimecode(right || '')
    i++
    const textLines = []
    while (i < lines.length && lines[i].trim() !== '') {
      textLines.push(lines[i])
      i++
    }
    while (i < lines.length && lines[i].trim() === '') i++
    const jpLines = []
    const viLines = []
    for (const ln of textLines) {
      const s = String(ln || '').trim()
      if (!s) continue
      if (looksJapanese(s)) jpLines.push(s); else viLines.push(s)
    }
    cues.push({ start, end, jp: jpLines.join(' '), vi: viLines.join(' ') })
  }
  return cues
}

export default function ImageVideo() {
  const canvasRef = useRef(null)
  const audioRef = useRef(null)
  const animReq = useRef(0)
  const [image, setImage] = useState(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [cues, setCues] = useState([])
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [duration, setDuration] = useState(0)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [audioUrl, setAudioUrl] = useState(null)
  const [srtOffset, setSrtOffset] = useState(0)
  const [srtEnd, setSrtEnd] = useState(0)

  // Load image
  function onImageFile(e) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = url
  }

  // Load SRT
  function onSrtFile(e) {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const list = parseSRT(String(reader.result || ''))
      setCues(list)
      const d = list.length ? list[list.length - 1].end : 0
      setSrtEnd(d)
      // Prefer audio duration when available; otherwise use SRT end
      const a = audioRef.current
      const aDur = a && isFinite(a.duration) ? a.duration : 0
      setDuration(Math.max(d, aDur))
      setT(0)
    }
    reader.readAsText(f, 'utf-8')
  }

  function onAudioFile(e) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    setAudioUrl(url)
  }

  // Audio metadata and ended handling
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onMeta = () => {
      const aDur = isFinite(a.duration) ? a.duration : 0
      setDuration((prev) => Math.max(prev, Math.max(srtEnd, aDur)))
    }
    const onEnded = () => { setPlaying(false) }
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnded)
    }
  }, [audioUrl, srtEnd])

  // Keep duration synced when SRT changes and audio is already loaded
  useEffect(() => {
    const a = audioRef.current
    const aDur = a && isFinite(a.duration) ? a.duration : 0
    setDuration((prev) => Math.max(prev, Math.max(srtEnd, aDur)))
  }, [srtEnd])

  // Text wrapping helpers
  function wrapTextByWords(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean)
    if (words.length === 0) return []
    const lines = []
    let line = words[0]
    for (let i = 1; i < words.length; i++) {
      const test = line + ' ' + words[i]
      if (ctx.measureText(test).width <= maxWidth) {
        line = test
      } else {
        lines.push(line)
        line = words[i]
      }
    }
    lines.push(line)
    return lines
  }

  function wrapTextByChars(ctx, text, maxWidth) {
    const s = String(text || '')
    if (!s) return []
    const lines = []
    let line = ''
    for (const ch of Array.from(s)) {
      const test = line + ch
      if (ctx.measureText(test).width <= maxWidth || line.length === 0) {
        line = test
      } else {
        lines.push(line)
        line = ch
      }
    }
    if (line) lines.push(line)
    return lines
  }

  function wrapSmart(ctx, text, maxWidth) {
    const s = String(text || '')
    if (!s) return []
    const hasSpace = /\s/.test(s)
    return hasSpace ? wrapTextByWords(ctx, s, maxWidth) : wrapTextByChars(ctx, s, maxWidth)
  }

  // Simple Ken Burns animation based on t [0..duration]
  function draw(now) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    if (image) {
      const s = duration > 0 ? Math.min(1, Math.max(0, t / duration)) : 0
      const zoom = 1.05 + 0.15 * s // 1.05 -> 1.20
      const panX = (s - 0.5) * 0.15 // -0.075 .. 0.075 of width
      const panY = Math.sin(s * Math.PI * 2) * 0.05 // playful

      // Fit image to cover canvas, then apply zoom and pan
      const imgW = imgSize.w || image.naturalWidth
      const imgH = imgSize.h || image.naturalHeight
      const scale = Math.max(W / imgW, H / imgH) * zoom
      const drawW = imgW * scale
      const drawH = imgH * scale
      const dx = (W - drawW) / 2 + panX * W
      const dy = (H - drawH) / 2 + panY * H
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, dx, dy, drawW, drawH)
    }

    // Subtitle box and current cue (JP + VI stacked, with wrapping)
    const cueTime = t + srtOffset
    const cue = cues.find(c => cueTime >= c.start && cueTime <= c.end)
    if (cue) {
      const padX = 14, padY = 6
      const innerGap = 4
      const lineGap = 2
      const boxW = W - 24
      const x = 12
      const bottomMargin = 28

      // Prepare fonts and wrap separately
      const jpText = String(cue.jp || cue.text || '')
      const viText = String(cue.vi || '')

      const jpFontSize = 10
      const viFontSize = 10
      const fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial'

      ctx.textBaseline = 'top'
      ctx.textAlign = 'center'
      const centerX = x + boxW / 2

      ctx.font = `700 ${jpFontSize}px ${fontFamily}`
      const jpLines = wrapSmart(ctx, jpText, boxW - 2 * padX)
      const jpBlockH = jpLines.length > 0 ? (jpLines.length * jpFontSize + (jpLines.length - 1) * lineGap) : 0

      ctx.font = `500 ${viFontSize}px ${fontFamily}`
      const viLines = wrapSmart(ctx, viText, boxW - 2 * padX)
      const viBlockH = viLines.length > 0 ? (viLines.length * viFontSize + (viLines.length - 1) * lineGap) : 0

      const boxH = padY + jpBlockH + (jpBlockH && viBlockH ? innerGap : 0) + viBlockH + padY
      const y = H - boxH - bottomMargin

      // Background
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(x, y, boxW, boxH)

      // JP lines
      ctx.fillStyle = '#f4f4f5'
      ctx.font = `700 ${jpFontSize}px ${fontFamily}`
      let cursorY = y + padY
      for (let i = 0; i < jpLines.length; i++) {
        ctx.fillText(jpLines[i], centerX, cursorY)
        cursorY += jpFontSize + lineGap
      }

      // VI lines
      if (viLines.length) {
        if (jpLines.length) cursorY += innerGap - lineGap
        ctx.fillStyle = '#e4e4e7'
        ctx.font = `500 ${viFontSize}px ${fontFamily}`
        for (let i = 0; i < viLines.length; i++) {
          ctx.fillText(viLines[i], centerX, cursorY)
          cursorY += viFontSize + lineGap
        }
      }
    }
  }

  // Play/Pause timeline; drive from audio currentTime if audio present
  useEffect(() => {
    if (!playing) return
    let id = 0
    const audio = audioRef.current
    const useAudio = !!(audio && audioUrl)
    let last = performance.now()
    const step = (now) => {
      if (useAudio) {
        setT(isFinite(audio.currentTime) ? audio.currentTime : 0)
        if (audio.ended) { id && cancelAnimationFrame(id); return }
      } else {
        const dt = (now - last) / 1000; last = now
        setT((prev) => {
          const nx = prev + dt
          return duration > 0 ? (nx > duration ? duration : nx) : nx
        })
      }
      draw(now)
      id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, duration, image, cues, audioUrl])

  // Redraw when t changes while paused
  useEffect(() => { draw(performance.now()) }, [t, image, cues])

  function togglePlay() {
    setPlaying((p) => {
      const next = !p
      const audio = audioRef.current
      if (next) {
        if (audio && audioUrl) { try { audio.currentTime = t; audio.play() } catch {} }
      } else {
        if (audio) { try { audio.pause() } catch {} }
      }
      return next
    })
  }

  function stopPlayback() {
    setPlaying(false)
    const audio = audioRef.current
    if (audio) { try { audio.pause(); audio.currentTime = 0 } catch {} }
    setT(0)
  }

  // Recording canvas + optional audio (timeline driven by audio when available)
  async function startRecording() {
    const canvas = canvasRef.current
    if (!canvas) { alert('Chưa có canvas.'); return }
    const stream = canvas.captureStream(30)

    // Attach audio track if provided
    let mixedStream = stream
    if (audioUrl) {
      try {
        const audio = audioRef.current
        if (audio) {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
          const source = audioCtx.createMediaElementSource(audio)
          const dest = audioCtx.createMediaStreamDestination()
          source.connect(dest)
          source.connect(audioCtx.destination)
          const audioTrack = dest.stream.getAudioTracks()[0]
          if (audioTrack) {
            const comp = new MediaStream([...stream.getVideoTracks(), audioTrack])
            mixedStream = comp
          }
        }
      } catch {}
    }

    const mimeCandidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ]
    let mime = ''
    for (const m of mimeCandidates) { if (MediaRecorder.isTypeSupported(m)) { mime = m; break } }
    try {
      const mr = new MediaRecorder(mixedStream, { mimeType: mime || undefined, videoBitsPerSecond: 4_000_000 })
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'image_video.webm'
        document.body.appendChild(a); a.click()
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 0)
        setRecording(false)
      }

      // Ensure deterministic render during recording; drive by audio if present
      let last = performance.now()
      let tLocal = 0
      function drawForRecord(now) {
        const a = audioRef.current
        if (a && audioUrl) {
          setT(isFinite(a.currentTime) ? a.currentTime : 0)
        } else {
          const dt = (now - last) / 1000; last = now
          tLocal += dt
          setT(tLocal)
        }
        draw(now)
        if (a && audioUrl && a.ended) { try { mr.stop() } catch {}; return }
        if ((!a || !audioUrl) && duration > 0 && tLocal >= duration) { try { mr.stop() } catch {}; return }
        animReq.current = requestAnimationFrame(drawForRecord)
      }
      setRecording(true)
      mr.start(400)
      if (audioRef.current && audioUrl) { try { audioRef.current.currentTime = 0; audioRef.current.play() } catch {} }
      animReq.current = requestAnimationFrame(drawForRecord)
    } catch (e) {
      alert('Không thể bắt đầu ghi: ' + (e?.message || e))
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current
    if (mr && mr.state !== 'inactive') { try { mr.stop() } catch {} }
    if (animReq.current) cancelAnimationFrame(animReq.current)
    setRecording(false)
  }

  return (
    <div style={{ minHeight: '100vh', color: '#e5e7eb', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Tạo video AI từ ảnh (SRT + audio)</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '0.5rem 1rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7', border: 'none', cursor: 'pointer' }}>← Quay về</button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7', cursor: 'pointer' }}>
          <span>Ảnh</span>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageFile} />
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7', cursor: 'pointer' }}>
          <span>SRT</span>
          <input type="file" accept=".srt,text/plain,application/x-subrip" style={{ display: 'none' }} onChange={onSrtFile} />
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7', cursor: 'pointer' }}>
          <span>Audio (tùy chọn)</span>
          <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={onAudioFile} />
        </label>
      </div>

      <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ width: 'min(480px, 100%)', aspectRatio: '9 / 16', background: '#000', borderRadius: '1rem', overflow: 'hidden', marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
            <canvas ref={canvasRef} width={480} height={853} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={togglePlay} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7', border: 'none', cursor: 'pointer' }}>{playing ? 'Pause' : 'Play'}</button>
            <button onClick={stopPlayback} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7', border: 'none', cursor: 'pointer' }}>Reset</button>
            {!recording ? (
              <button onClick={startRecording} disabled={!image || !cues.length} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', background: image && cues.length ? '#27272a' : '#3f3f46', color: '#e4e4e7', border: 'none', cursor: image && cues.length ? 'pointer' : 'not-allowed' }}>Ghi video</button>
            ) : (
              <button onClick={stopRecording} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>Dừng ghi</button>
            )}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '1rem', background: '#27272a', color: '#e4e4e7' }}>
              <span>Offset SRT</span>
              <input type="range" min={-1} max={1} step={0.01} value={srtOffset} onChange={(e) => setSrtOffset(parseFloat(e.target.value))} />
              <span style={{ width: 64, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{srtOffset.toFixed(2)}s</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
            Thời lượng: {duration.toFixed(2)}s — t: {t.toFixed(2)}s
          </div>
        </div>
        <div style={{ borderRadius: '1rem', background: 'rgba(24,24,27,0.6)', padding: '0.75rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Cues</div>
          <div style={{ maxHeight: '16rem', overflow: 'auto' }}>
            {cues.map((c, i) => (
              <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(39,39,42,0.4)', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{c.start.toFixed(2)} → {c.end.toFixed(2)}</div>
                {c.jp ? <div style={{ marginTop: '0.25rem', color: '#e5e7eb', fontWeight: 600 }}>{c.jp}</div> : null}
                {c.vi ? <div style={{ marginTop: '0.25rem', color: '#a1a1aa' }}>{c.vi}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl || undefined} preload="auto" style={{ display: 'none' }} />
    </div>
  )
}


