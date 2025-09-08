# downloadytd.py
# -*- coding: utf-8 -*-
import subprocess
import sys
import shutil
import os
from pathlib import Path

# =============== CẤU HÌNH ===============
VIDEO_URL = "https://youtu.be/1dV0plXMO9Y?si=gy1dgwUtnuum1Jqv"  # ← Đổi link tại đây
BASE_FILENAME = "youtube_audio"  # tên gốc cho MP4/MP3 và phụ đề
OUTPUT_DIR = "subs"              # thư mục chứa phụ đề
LANG = "ja"                      # 'ja' (tiếng Nhật). Nếu cần: 'vi', 'en', ...
MODEL = None                     # ví dụ "large-v3" hoặc None để dùng mặc định
BITRATE = "192k"                 # bitrate MP3 khi trích từ video
MONO = False                     # True để ép mono (-ac 1); False giữ nguyên kênh

# =============== TIỆN ÍCH CHUNG ===============
def run(cmd):
    """Chạy lệnh và hiển thị rõ ràng."""
    print(">", " ".join([str(c) for c in cmd]))
    subprocess.run(cmd, check=True)

def found(cmd_name):
    """Trả về đường dẫn thực thi nếu có trong PATH, ngược lại None."""
    return shutil.which(cmd_name)

def ensure(cmd_name, hint):
    """Bắt buộc có công cụ; báo đường dẫn nếu thấy."""
    p = found(cmd_name)
    if not p:
        print(f"❌ Thiếu '{cmd_name}'. {hint}")
        sys.exit(1)
    print(f"✅ Found {cmd_name} at: {p}")
    return p

def resolve_whisper():
    """
    Trả về mảng lệnh để gọi Whisper:
    - Nếu có 'whisper' trong PATH → dùng trực tiếp.
    - Nếu không → dùng Python hiện tại: '<python> -m whisper'
    """
    exe = found("whisper")
    if exe:
        print(f"✅ Found whisper at: {exe}")
        return [exe]
    print("ℹ️  'whisper' không có trong PATH. Dùng fallback: 'py -m whisper' (hoặc sys.executable -m whisper).")
    py = sys.executable if sys.executable else "py"
    return [py, "-m", "whisper"]

# =============== MAIN ===============
def main():
    # Đường dẫn file
    video_file = f"{BASE_FILENAME}.mp4"
    audio_file = f"{BASE_FILENAME}.mp3"
    out_dir = Path(OUTPUT_DIR)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) Kiểm tra công cụ bắt buộc
    ensure("yt-dlp", "Cài: pip install -U yt-dlp")
    ensure("ffmpeg", "Windows: winget install Gyan.FFmpeg (xong mở lại PowerShell) | macOS: brew install ffmpeg")
    whisper_cmd = resolve_whisper()  # không bắt buộc có 'whisper' trong PATH

    # 2) Tải VIDEO MP4 (best video + best audio) → merge mp4
    print("🎬 Đang tải VIDEO (MP4) bằng yt-dlp...")
    run([
        "yt-dlp",
        "-f", "bv*+ba/best",
        "--merge-output-format", "mp4",
        "-o", video_file,
        VIDEO_URL
    ])

    # 3) Trích AUDIO MP3 từ chính video (đảm bảo đồng bộ timecode)
    print("🎵 Đang trích audio MP3 từ video bằng ffmpeg...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", video_file,
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", BITRATE,
    ]
    if MONO:
        ffmpeg_cmd += ["-ac", "1"]
    ffmpeg_cmd += [audio_file]
    run(ffmpeg_cmd)

    # 4) Chạy Whisper → TXT/SRT/VTT
    print("🧠 Đang chạy Whisper để tạo phụ đề (txt/srt/vtt)...")
    base_args = [
        *whisper_cmd,
        audio_file,
        "--language", LANG,
        "--task", "transcribe",
        "--output_dir", str(out_dir),
    ]
    if MODEL:
        base_args += ["--model", MODEL]

    # Gọi 3 lần để tương thích mọi bản whisper
    for fmt in ["txt", "srt", "vtt"]:
        run(base_args + ["--output_format", fmt])

    # 5) Hoàn tất
    print("\n✅ Hoàn tất! File đã tạo:")
    print(f" - {video_file} (MP4)")
    print(f" - {audio_file} (MP3)")
    print(f" - {out_dir / (BASE_FILENAME + '.txt')}")
    print(f" - {out_dir / (BASE_FILENAME + '.srt')}")
    print(f" - {out_dir / (BASE_FILENAME + '.vtt')}")

if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        print("\n💥 Lỗi khi chạy lệnh:", e)
        print("• Kiểm tra mạng (yt-dlp), quyền ghi file, hoặc PATH của ffmpeg/whisper.")
        print("• Với Whisper: nếu 'whisper' không có trong PATH, script đã fallback sang 'py -m whisper'.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️ Đã hủy theo yêu cầu.")
        sys.exit(1)
