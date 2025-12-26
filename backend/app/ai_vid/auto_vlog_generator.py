"""
Auto Vlog Generator Module
Refactored from auto_vlog.py to be importable as a function
"""
import os
import random
import numpy as np
from pathlib import Path
from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    CompositeVideoClip,
    concatenate_videoclips,
    vfx
)
import requests
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

# Config
load_dotenv()

FPS = 24
CLIPS_PER_IMAGE = 2   # Number of clips to create from each image (if only one image)
BASE_DURATION = 2.5   # seconds per clip
VARIANCE = 1.0        # duration randomness
TRANSITION = 0.5      # crossfade duration

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Categorized free music library (royalty-free from Bensound)
MUSIC_LIBRARY = {
    "upbeat": [
        "https://www.bensound.com/bensound-music/bensound-ukulele.mp3",
        "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
        "https://www.bensound.com/bensound-music/bensound-happyrock.mp3",
    ],
    "calm": [
        "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
        "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
        "https://www.bensound.com/bensound-music/bensound-memories.mp3",
    ],
    "cinematic": [
        "https://www.bensound.com/bensound-music/bensound-epic.mp3",
        "https://www.bensound.com/bensound-music/bensound-rumble.mp3",
        "https://www.bensound.com/bensound-music/bensound-actionable.mp3",
    ],
    "corporate": [
        "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
        "https://www.bensound.com/bensound-music/bensound-betterdays.mp3",
        "https://www.bensound.com/bensound-music/bensound-inspire.mp3",
    ],
    "asian": [
        "https://www.bensound.com/bensound-music/bensound-tokyo.mp3",
        "https://www.bensound.com/bensound-music/bensound-oriental.mp3",
    ],
    "acoustic": [
        "https://www.bensound.com/bensound-music/bensound-acoustic.mp3",
        "https://www.bensound.com/bensound-music/bensound-folkround.mp3",
    ],
    "electronic": [
        "https://www.bensound.com/bensound-music/bensound-evolution.mp3",
        "https://www.bensound.com/bensound-music/bensound-energy.mp3",
    ],
}

DEFAULT_MUSIC_URLS = MUSIC_LIBRARY["upbeat"]


# Motion & Effects
def zoom_in_slow(clip):
    """Slow zoom in effect"""
    return clip.resize(1.08)


def zoom_out_slow(clip):
    """Slow zoom out effect"""
    return clip.resize(0.95)


def zoom_in_medium(clip):
    """Medium zoom in effect"""
    return clip.resize(1.12)


def pan_left(clip):
    """Pan left effect"""
    return clip.resize(1.1)


def pan_right(clip):
    """Pan right effect"""
    return clip.resize(1.1)


def no_motion(clip):
    """Static image"""
    return clip


def rotate_subtle(clip):
    """Subtle rotation"""
    return clip.rotate(2)


# Color grading effects
def warm_tone(clip):
    """Warm color tone"""
    return clip.fx(vfx.colorx, 1.03)


def cool_tone(clip):
    """Cool color tone"""
    return clip.fx(vfx.colorx, 0.97)


def soft_contrast(clip):
    """Soft contrast increase"""
    return clip.fx(vfx.lum_contrast, 0, 10, 127)


def brightness_up(clip):
    """Slightly brighter"""
    return clip.fx(vfx.colorx, 1.05)


def brightness_down(clip):
    """Slightly darker"""
    return clip.fx(vfx.colorx, 0.95)


def saturated(clip):
    """Slightly more saturated"""
    return clip.fx(vfx.colorx, 1.08)


MOTIONS = [zoom_in_slow, zoom_out_slow, zoom_in_medium, pan_left, pan_right, no_motion, rotate_subtle]
COLOR_EFFECTS = [warm_tone, cool_tone, soft_contrast, brightness_up, brightness_down, saturated, lambda x: x]


def analyze_images_with_gemini(image_files):
    """Use Gemini to analyze images and suggest music category"""
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("⚠ No Gemini API key found. Using default music category: upbeat")
        return "upbeat"
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        images_to_analyze = image_files[:3] if len(image_files) > 3 else image_files
        
        print(f"\n🤖 Analyzing {len(images_to_analyze)} image(s) with Gemini AI...")
        
        prompt = f"""Analyze these {len(images_to_analyze)} image(s) and suggest the most suitable background music category.

Consider:
- Subject matter (people, nature, architecture, food, etc.)
- Mood and atmosphere (happy, calm, dramatic, professional, cultural)
- Cultural context (Asian, European, American, ancient, modern)
- Setting (indoor/outdoor, urban/rural, formal/casual)

Available music categories:
- upbeat: Happy, energetic, fun (parties, celebrations, joyful moments)
- calm: Peaceful, relaxing, gentle (nature, meditation, quiet moments)
- cinematic: Epic, dramatic, powerful (landscapes, achievements, storytelling)
- corporate: Professional, motivational, clean (business, presentations, modern)
- asian: Oriental, traditional Asian influences (Asian culture, temples, festivals)
- acoustic: Folk, guitar, organic (authentic, intimate, personal)
- electronic: Modern, digital, energetic (tech, urban, contemporary)

Respond with ONLY ONE category name from the list above. No explanations, just the category."""

        pil_images = []
        for img_file in images_to_analyze:
            try:
                pil_img = Image.open(img_file)
                if max(pil_img.size) > 1024:
                    pil_img.thumbnail((1024, 1024))
                pil_images.append(pil_img)
                print(f"  • Loaded: {img_file.name}")
            except Exception as e:
                print(f"  ⚠ Could not load {img_file.name}: {e}")
        
        if not pil_images:
            print("  ⚠ No images could be loaded")
            return "upbeat"
        
        response = model.generate_content([prompt] + pil_images)
        suggested_category = response.text.strip().lower()
        
        if suggested_category in MUSIC_LIBRARY:
            print(f"  ✓ Suggested category: {suggested_category.upper()}")
            return suggested_category
        else:
            print(f"  ⚠ Invalid category '{suggested_category}', using default: upbeat")
            return "upbeat"
            
    except Exception as e:
        print(f"  ⚠ Gemini analysis failed: {e}")
        print("  Using default music category: upbeat")
        return "upbeat"


def download_free_music(music_urls, audio_path):
    """Download free background music if not exists"""
    if audio_path.exists():
        print(f"✓ Music already exists: {audio_path}")
        return True
    
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    
    for url in music_urls:
        try:
            print(f"Downloading music from {url}...")
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                with open(audio_path, 'wb') as f:
                    f.write(response.content)
                print(f"✓ Music downloaded: {audio_path}")
                return True
        except Exception as e:
            print(f"Failed to download from {url}: {e}")
            continue
    
    print("⚠ Could not download music, video will have no audio")
    return False


def generate_vlog(input_dir: Path, output_dir: Path, music_category: str = None):
    """
    Generate auto vlog from images in input_dir
    
    Args:
        input_dir: Directory containing input images
        output_dir: Directory for output video
        music_category: Optional music category (auto-selects if None)
    
    Returns:
        Path to generated video file
    """
    # Find all image files
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp', '*.bmp']:
        image_files.extend(input_dir.glob(ext))
    
    image_files = [f for f in image_files if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']]
    image_files = sorted(image_files)
    
    if not image_files:
        raise ValueError(f"No images found in {input_dir}")
    
    print(f"Found {len(image_files)} image(s)")
    
    # AI-powered music selection or use provided category
    if music_category and music_category != "auto":
        print(f"📀 Using provided music category: {music_category.upper()}")
    else:
        music_category = analyze_images_with_gemini(image_files)
    
    selected_music_urls = MUSIC_LIBRARY.get(music_category, DEFAULT_MUSIC_URLS)
    
    # Determine clips per image
    if len(image_files) == 1:
        clips_per_image = CLIPS_PER_IMAGE
        print(f"Creating {clips_per_image} clips with various effects")
    else:
        clips_per_image = 1
        print(f"Creating 1 clip per image")
    
    # Build clips
    clips = []
    for img_file in image_files:
        for i in range(clips_per_image):
            duration = max(1.5, BASE_DURATION + random.uniform(-VARIANCE, VARIANCE))
            clip = ImageClip(str(img_file)).set_duration(duration)
            
            # Apply random effects
            motion = random.choice(MOTIONS)
            clip = motion(clip)
            
            color = random.choice(COLOR_EFFECTS)
            clip = color(clip)
            
            fade_duration = random.uniform(0.2, 0.5)
            clip = clip.fx(vfx.fadein, fade_duration).fx(vfx.fadeout, fade_duration)
            
            clips.append(clip)
            
            if clips_per_image > 1:
                print(f"  {img_file.name} - Clip {i+1}/{clips_per_image}: {motion.__name__} + {color.__name__} ({duration:.1f}s)")
            else:
                print(f"  {img_file.name}: {motion.__name__} + {color.__name__} ({duration:.1f}s)")
    
    print(f"\nTotal clips created: {len(clips)}")
    
    # Concatenate with transitions
    video = concatenate_videoclips(clips, method="compose", padding=-TRANSITION)
    
    # Add audio
    audio_path = output_dir / "background_music.mp3"
    print("\nAdding background music...")
    download_free_music(selected_music_urls, audio_path)
    
    if audio_path.exists():
        try:
            audio = AudioFileClip(str(audio_path))
            if audio.duration < video.duration:
                loops_needed = int(video.duration / audio.duration) + 1
                from moviepy.audio.AudioClip import concatenate_audioclips
                audio = concatenate_audioclips([audio] * loops_needed)
            audio = audio.subclip(0, video.duration)
            audio = audio.volumex(0.7)
            video = video.set_audio(audio)
            print(f"✓ Audio added ({audio.duration:.1f}s)")
        except Exception as e:
            print(f"⚠ Could not add audio: {e}")
    
    # Render
    output_path = output_dir / "auto_vlog.mp4"
    print(f"\nRendering video ({video.duration:.1f}s)...")
    video.write_videofile(
        str(output_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        preset="medium",
        ffmpeg_params=["-pix_fmt", "yuv420p"]
    )
    
    print(f"\n✅ Auto vlog created: {output_path}")
    print(f"   Duration: {video.duration:.1f}s")
    print(f"   Clips: {len(clips)}")
    print(f"   Resolution: {video.size}")
    
    return str(output_path)
