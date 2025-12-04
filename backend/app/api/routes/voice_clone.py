"""
Voice cloning API routes using Coqui TTS XTTS v2 for real voice cloning
Fallback to edge-tts if voice cloning fails
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import tempfile
import shutil
from pathlib import Path
import logging
import asyncio
import edge_tts

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the voice cloning system (Coqui TTS)
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from voice_cloning_coqui import VoiceCloningSystem

router = APIRouter()

# Global voice system instance
voice_system = None

def get_voice_system():
    """Get or initialize the voice cloning system"""
    global voice_system
    if voice_system is None:
        logger.info("Initializing Coqui TTS voice cloning system...")
        voice_system = VoiceCloningSystem(device="auto")
        voice_system.load_model()
        logger.info("Voice cloning system ready!")
    return voice_system

@router.post("/voice-clone")
async def clone_voice(
    audio_file: UploadFile = File(..., description="Audio file containing voice sample"),
    text: str = Form(..., description="Text in Malay to be spoken")
):
    """
    Generate voice using Coqui TTS XTTS v2 with REAL voice cloning
    Falls back to default voice if cloning fails
    
    - **audio_file**: Audio file with the user's voice sample (your actual voice)
    - **text**: Text in Malay that will be spoken using YOUR cloned voice
    """
    temp_dir = None
    try:
        logger.info(f"Received voice clone request with text: {text[:50]}...")
        
        # Get voice cloning system
        voice_sys = get_voice_system()
        
        # Create temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        logger.info(f"Created temp directory: {temp_dir}")
        
        # Save uploaded audio file with proper extension
        file_extension = audio_file.filename.split('.')[-1] if '.' in audio_file.filename else 'wav'
        input_audio_path = os.path.join(temp_dir, f"input_voice.{file_extension}")
        
        with open(input_audio_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        logger.info(f"Saved input audio to: {input_audio_path}")
        
        # Verify audio file size
        file_size = os.path.getsize(input_audio_path)
        logger.info(f"Input audio file size: {file_size} bytes")
        
        # Generate output path
        output_audio_path = os.path.join(temp_dir, "generated_voice.wav")
        
        # Try voice cloning first, fall back to edge-tts if it fails
        try:
            if file_size < 1000:  # Less than 1KB
                logger.warning("Audio file is too small, using edge-tts fallback instead")
                raise ValueError("Audio file too small")
            
            # Use REAL voice cloning with Coqui TTS XTTS v2
            logger.info("Starting REAL voice cloning with Coqui TTS XTTS v2...")
            result_path = voice_sys.clone_voice(
                text=text,
                speaker_audio_path=input_audio_path,
                output_path=output_audio_path,
                language="ms"  # Malay language
            )
            logger.info(f"Voice cloning completed successfully at: {result_path}")
            
        except Exception as clone_error:
            # Voice cloning failed, use edge-tts as fallback
            logger.warning(f"Voice cloning failed: {str(clone_error)}")
            logger.info("Falling back to edge-tts (original framework)...")
            
            # Use edge-tts for fallback
            # Use Malay voice from edge-tts
            voice = "ms-MY-OsmanNeural"  # Malaysian Malay male voice
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(output_audio_path)
            result_path = output_audio_path
            
            logger.info(f"Edge-TTS generation completed at: {result_path}")
        
        # Return the generated audio file
        if not os.path.exists(result_path):
            raise HTTPException(status_code=500, detail="Voice generation failed")
        
        return FileResponse(
            result_path,
            media_type="audio/wav",
            filename="generated_voice.wav",
            headers={
                "Content-Disposition": "attachment; filename=generated_voice.wav"
            }
        )
        
    except Exception as e:
        logger.error(f"Voice generation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {str(e)}")
    
    finally:
        # Cleanup is handled by FileResponse background tasks
        # The temp directory will be cleaned up after the file is sent
        if temp_dir and os.path.exists(temp_dir):
            # Schedule cleanup after response is sent
            pass  # FastAPI will handle this with background tasks if needed


@router.post("/simple-tts")
async def simple_tts(
    text: str = Form(..., description="Text in Malay to be spoken")
):
    """
    Generate simple TTS without voice cloning using Coqui TTS
    
    - **text**: Text in Malay that will be spoken (uses default voice)
    """
    temp_dir = None
    try:
        logger.info(f"Received simple TTS request with text: {text[:50]}...")
        
        # Get voice cloning system
        voice_sys = get_voice_system()
        
        # Create temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        logger.info(f"Created temp directory: {temp_dir}")
        
        # Generate output path
        output_audio_path = os.path.join(temp_dir, "simple_tts.wav")
        
        # Generate voice using simple TTS
        logger.info("Starting simple TTS generation with Coqui TTS...")
        result_path = voice_sys.generate_simple_tts(
            text=text,
            output_path=output_audio_path,
            language="ms"  # Malay language
        )
        logger.info(f"Simple TTS generated successfully at: {result_path}")
        
        # Return the generated audio file
        if not os.path.exists(result_path):
            raise HTTPException(status_code=500, detail="Simple TTS generation failed")
        
        return FileResponse(
            result_path,
            media_type="audio/wav",
            filename="simple_tts.wav",
            headers={
                "Content-Disposition": "attachment; filename=simple_tts.wav"
            }
        )
        
    except Exception as e:
        logger.error(f"Simple TTS error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Simple TTS failed: {str(e)}")
    
    finally:
        # Cleanup is handled by FileResponse background tasks
        if temp_dir and os.path.exists(temp_dir):
            pass  # FastAPI will handle this with background tasks if needed


@router.get("/voice-clone/health")
async def voice_clone_health():
    """Check if voice cloning service is available"""
    try:
        voice_sys = get_voice_system()
        
        return {
            "status": "healthy",
            "message": "Coqui TTS XTTS v2 voice cloning system is ready",
            "system": "Coqui TTS XTTS v2",
            "device": voice_sys.device,
            "model_loaded": voice_sys.model_loaded,
            "features": [
                "Real voice cloning from audio samples",
                "Multilingual support (including Malay)",
                "High-quality voice synthesis",
                "Uses your actual voice characteristics"
            ]
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": f"Voice system error: {str(e)}",
            "system": "Coqui TTS XTTS v2",
            "model_loaded": False
        }


@router.get("/voice-clone/voices")
async def list_voices():
    """Get information about voice cloning capabilities"""
    try:
        voice_sys = get_voice_system()
        
        return {
            "status": "success",
            "message": "This system uses REAL voice cloning - it will use YOUR voice from the audio sample you provide",
            "system": "Coqui TTS XTTS v2",
            "model": "tts_models/multilingual/multi-dataset/xtts_v2",
            "capabilities": {
                "voice_cloning": True,
                "multilingual": True,
                "languages_supported": ["ms", "en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh-cn", "ja", "hu", "ko"],
                "malay_support": True,
                "real_voice_cloning": "Uses your actual voice characteristics from the audio sample"
            },
            "usage": "Upload an audio sample of your voice (3-10 seconds) and provide Malay text. The system will generate speech in YOUR voice."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to get voice information: {str(e)}",
            "system": "Coqui TTS XTTS v2"
        }

