"""
generate_assets.py
Generates authentic musical MP3 audio files and vibrant album artwork for Pranesh Music Hub.
"""

import os
import math
import subprocess
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "static", "audio")
IMAGES_DIR = os.path.join(BASE_DIR, "static", "images")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

FFMPEG_PATH = r"C:\Users\Pranesh\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_PATH):
    import shutil
    FFMPEG_PATH = shutil.which("ffmpeg") or "ffmpeg"


def synthesize_melody(filename, style="lofi", duration=25.0):
    """
    Synthesize rich, pleasant polyphonic melodies and export as real 192kbps MP3.
    """
    out_mp3 = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(out_mp3) and os.path.getsize(out_mp3) > 10000:
        print(f"File {filename} already exists, skipping.")
        return

    sample_rate = 44100
    total_samples = int(sample_rate * duration)
    t = np.linspace(0, duration, total_samples, False)
    audio = np.zeros(total_samples, dtype=np.float32)

    # Styles configuration
    if style == "tamil_flute":
        # Carnatic / Tamil melody in Mohanam / Bhupali scale (C D E G A)
        scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]
        notes_pattern = [0, 1, 2, 4, 3, 2, 1, 0, 2, 4, 5, 4, 2, 1, 3, 0]
        step_len = duration / len(notes_pattern)
        for i, n in enumerate(notes_pattern):
            f = scale[n % len(scale)]
            t_s = i * step_len
            t_e = (i + 1) * step_len
            idx = (t >= t_s) & (t < t_e)
            t_seg = t[idx] - t_s
            env = np.sin(np.pi * t_seg / step_len) ** 0.4
            # Flute harmonics + vibrato
            vibrato = 1.0 + 0.015 * np.sin(2 * np.pi * 5.5 * t_seg)
            tone = np.sin(2 * np.pi * (f * vibrato) * t_seg)
            tone += 0.35 * np.sin(2 * np.pi * 2 * f * t_seg)
            tone += 0.15 * np.sin(2 * np.pi * 3 * f * t_seg)
            # Add drone / tanpura background
            drone = 0.12 * (np.sin(2 * np.pi * 130.81 * t_seg) + np.sin(2 * np.pi * 196.00 * t_seg))
            audio[idx] += (tone * env * 0.7) + drone

    elif style == "piano_chords":
        # Romantic / Emotional Piano chords (Am, F, C, G)
        chord_sets = [
            [220.0, 261.63, 329.63, 440.0],
            [174.61, 220.0, 261.63, 349.23],
            [130.81, 164.81, 196.0, 261.63],
            [196.0, 246.94, 293.66, 392.0]
        ]
        num_chords = len(chord_sets) * 2
        seg_len = duration / num_chords
        for i in range(num_chords):
            c = chord_sets[i % len(chord_sets)]
            t_s = i * seg_len
            t_e = (i + 1) * seg_len
            idx = (t >= t_s) & (t < t_e)
            t_seg = t[idx] - t_s
            env = np.exp(-3.5 * t_seg / seg_len)  # piano decay
            for f in c:
                audio[idx] += 0.2 * np.sin(2 * np.pi * f * t_seg) * env
                audio[idx] += 0.08 * np.sin(2 * np.pi * 2 * f * t_seg) * (env ** 1.5)

    elif style == "synthwave":
        # Retro 80s Synthwave bassline and lead
        bass_freqs = [110.0, 110.0, 130.81, 146.83, 110.0, 98.0, 110.0, 123.47]
        seg_len = duration / len(bass_freqs)
        for i, bf in enumerate(bass_freqs):
            t_s = i * seg_len
            t_e = (i + 1) * seg_len
            idx = (t >= t_s) & (t < t_e)
            t_seg = t[idx] - t_s
            saw_bass = 0.4 * (2 * (t_seg * bf - np.floor(0.5 + t_seg * bf)))
            lead = 0.25 * np.sin(2 * np.pi * bf * 4 * t_seg)
            audio[idx] += saw_bass + lead

    elif style == "lofi":
        # Chill Lofi chords with warm lowpass feel
        chords = [
            [164.81, 196.00, 246.94, 293.66],  # Em7
            [146.83, 185.00, 220.00, 277.18],  # Dmaj7
            [130.81, 164.81, 196.00, 246.94],  # Cmaj7
            [146.83, 174.61, 220.00, 261.63],  # Dm7
        ]
        seg_len = duration / len(chords)
        for i, c in enumerate(chords):
            t_s = i * seg_len
            t_e = (i + 1) * seg_len
            idx = (t >= t_s) & (t < t_e)
            t_seg = t[idx] - t_s
            env = np.sin(np.pi * t_seg / seg_len) ** 0.6
            for f in c:
                audio[idx] += 0.22 * np.sin(2 * np.pi * f * t_seg) * env
                audio[idx] += 0.05 * np.sin(2 * np.pi * 2 * f * t_seg) * env

    else:
        # Default gentle acoustic theme
        freqs = [261.63, 329.63, 392.00, 523.25]
        for f in freqs:
            audio += 0.2 * np.sin(2 * np.pi * f * t) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * t))

    # Add light reverb / delay echo
    echo_delay = int(sample_rate * 0.25)
    if total_samples > echo_delay:
        audio[echo_delay:] += 0.28 * audio[:-echo_delay]

    # Normalize audio
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = (audio / max_val) * 0.9

    raw_path = os.path.join(AUDIO_DIR, f"{filename}.raw")
    audio_int16 = (audio * 32767).astype(np.int16)
    audio_int16.tofile(raw_path)

    cmd = [
        FFMPEG_PATH, "-y",
        "-f", "s16le",
        "-ar", str(sample_rate),
        "-ac", "1",
        "-i", raw_path,
        "-b:a", "192k",
        out_mp3
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(raw_path):
        os.remove(raw_path)

    print(f"Synthesized {filename} ({os.path.getsize(out_mp3)} bytes)")


def generate_svg_cover(filename, title, subtitle, color1="#7c3aed", color2="#3b82f6"):
    """
    Generate vibrant, modern SVG album covers with dark gradients and glowing music graphics.
    """
    path = os.path.join(IMAGES_DIR, filename)
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{color1}" />
      <stop offset="100%" stop-color="{color2}" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="50%" stop-color="#1f2937" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="500" height="500" rx="36" fill="url(#bgGrad)" />

  <!-- Radial Glow -->
  <circle cx="250" cy="200" r="180" fill="url(#glowGrad)" />

  <!-- Vinyl Record Graphic -->
  <circle cx="250" cy="200" r="130" fill="url(#discGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="3" />
  <circle cx="250" cy="200" r="100" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
  <circle cx="250" cy="200" r="70" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
  
  <!-- Vinyl Center Badge -->
  <circle cx="250" cy="200" r="45" fill="{color1}" stroke="#ffffff" stroke-width="2.5" />
  <circle cx="250" cy="200" r="10" fill="#0b0817" />

  <!-- Animated Sound Wave Lines -->
  <g stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity="0.85">
    <line x1="160" y1="200" x2="160" y2="200" />
    <line x1="180" y1="185" x2="180" y2="215" />
    <line x1="200" y1="170" x2="200" y2="230" />
    <line x1="220" y1="155" x2="220" y2="245" />
    <line x1="280" y1="155" x2="280" y2="245" />
    <line x1="300" y1="170" x2="300" y2="230" />
    <line x1="320" y1="185" x2="320" y2="215" />
    <line x1="340" y1="200" x2="340" y2="200" />
  </g>

  <!-- Title & Subtitle Badge -->
  <rect x="30" y="360" width="440" height="105" rx="20" fill="rgba(10, 8, 23, 0.75)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
  <text x="50" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#ffffff">{title}</text>
  <text x="50" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#cbd5e1">{subtitle}</text>
  
  <!-- Pranesh Music Hub Watermark -->
  <text x="445" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="{color1}" text-anchor="end">PRANESH HUB</text>
</svg>'''
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated image: {filename}")


def main():
    songs = [
        # Only Friends & OST
        ("only_friends_theme.mp3", "only_friends_theme.svg", "Only Friends Theme", "Khaotung & Gawin", "synthwave", "#ec4899", "#8b5cf6"),
        ("lets_try_acoustic.mp3", "lets_try_acoustic.svg", "Let's Try (Melodic)", "Only Friends OST", "piano_chords", "#a855f7", "#3b82f6"),
        ("no_one_can_chill.mp3", "no_one_can_chill.svg", "No One Can (Chill)", "Gawin Caskey", "lofi", "#6366f1", "#06b6d4"),
        
        # Tamil Songs
        ("vaanathai_pola.mp3", "vaanathai_pola.svg", "Vaanathai Pola", "Friends Movie / Ilaiyaraaja", "tamil_flute", "#8b5cf6", "#ec4899"),
        ("rukku_rukku_remix.mp3", "rukku_rukku_remix.svg", "Rukku Rukku Melodic", "Friends Movie Special", "synthwave", "#f59e0b", "#ef4444"),
        ("tamil_melody_flute.mp3", "tamil_melody_flute.svg", "Thendral Breeze Flute", "Pranesh Carnatic Lab", "tamil_flute", "#10b981", "#3b82f6"),
        ("vaathi_groove.mp3", "vaathi_groove.svg", "Vaathi Kuthu Beat", "Anirudh Tribute Mix", "synthwave", "#f43f5e", "#8b5cf6"),
        
        # English Songs
        ("lofi_midnight_vibes.mp3", "lofi_midnight_vibes.svg", "Midnight City Lights", "Aura Dreamer", "lofi", "#6366f1", "#a855f7"),
        ("neon_horizon_80s.mp3", "neon_horizon_80s.svg", "Neon Horizon 80s", "Cyber Pulse", "synthwave", "#ec4899", "#3b82f6"),
        ("acoustic_breeze.mp3", "acoustic_breeze.svg", "Acoustic Breeze", "Sunset Strings", "piano_chords", "#14b8a6", "#3b82f6"),
        
        # Malayalam Songs
        ("kerala_monsoon_flute.mp3", "kerala_monsoon_flute.svg", "Kerala Monsoon Rains", "Malabar Ensemble", "tamil_flute", "#059669", "#0284c7"),
        ("malare_piano_cover.mp3", "malare_piano_cover.svg", "Malare Piano Serenade", "Premam Tribute", "piano_chords", "#7c3aed", "#ec4899"),
        ("alleppey_calm_stream.mp3", "alleppey_calm_stream.svg", "Alleppey Calm Waters", "Backwater Echoes", "lofi", "#0284c7", "#10b981"),
        
        # Instrumental Masterpieces
        ("cinematic_piano_dream.mp3", "cinematic_piano_dream.svg", "Cinematic Piano Dream", "Pranesh Orchestra", "piano_chords", "#3b82f6", "#8b5cf6"),
        ("chillhop_lofi_beat.mp3", "chillhop_lofi_beat.svg", "Chillhop Study Beats", "Coffee & Rain", "lofi", "#8b5cf6", "#f43f5e"),
        ("soundhelix_ambient.mp3", "soundhelix_ambient.svg", "SoundHelix Symphony", "Open Music Archive", "synthwave", "#6366f1", "#10b981"),
    ]

    for audio_name, img_name, title, artist, style, c1, c2 in songs:
        synthesize_melody(audio_name, style=style, duration=30.0)
        generate_svg_cover(img_name, title, artist, color1=c1, color2=c2)

    print("\nAll assets successfully generated!")


if __name__ == "__main__":
    main()
