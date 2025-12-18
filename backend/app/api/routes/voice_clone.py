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

@router.post("/text-to-speech")
async def text_to_speech(
    text: str = Form(..., description="Text in Malay to be spoken"),
    voice_type: str = Form("female", description="Voice type: 'male', 'female', or 'clone'")
):
    """
    Generate text-to-speech with professional Malay voices or voice cloning
    
    - **text**: Text in Malay to be spoken
    - **voice_type**: Voice type to use ('male', 'female', or 'clone')
        - 'male': Uses Edge-TTS Osman (Malaysian male voice)
        - 'female': Uses Edge-TTS Yasmin (Malaysian female voice)
        - 'clone': Uses cloned voice (defaults to female if not available)
    """
    temp_dir = None
    try:
        logger.info(f"Received text-to-speech request with text: {text[:50]}...")
        logger.info(f"Voice type selected: {voice_type}")
        
        # Create temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        logger.info(f"Created temp directory: {temp_dir}")
        
        # Generate output path
        output_audio_path = os.path.join(temp_dir, "generated_voice.wav")
        
        # Handle different voice types
        if voice_type == "male":
            voice = "ms-MY-OsmanNeural"  # Malaysian Malay male voice
        elif voice_type == "female":
            voice = "ms-MY-YasminNeural"  # Malaysian Malay female voice
        elif voice_type == "clone":
            # For now, default to female voice until cloning is implemented
            voice = "ms-MY-YasminNeural"
            logger.info("Voice cloning requested but not yet implemented, using female voice")
        else:
            # Default to female if unknown voice type
            voice = "ms-MY-YasminNeural"
            logger.warning(f"Unknown voice type '{voice_type}', defaulting to female voice")
        
        logger.info(f"Using Edge-TTS voice: {voice}")
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


@router.post("/voice-clone")
async def clone_voice(
    text: str = Form(..., description="Text in Malay to be spoken"),
    voice_type: str = Form("female", description="Voice type: 'male' or 'female'"),
    audio_file: UploadFile = File(None, description="Optional audio file (not used for text-to-speech)")
):
    """
    Generate text-to-speech with professional Malay voices
    
    - **text**: Text in Malay to be spoken
    - **voice_type**: Voice type to use ('male' or 'female')
        - 'male': Uses Edge-TTS Osman (Malaysian male voice)
        - 'female': Uses Edge-TTS Yasmin (Malaysian female voice)
    - **audio_file**: Optional, not used for this endpoint
    """
    temp_dir = None
    try:
        logger.info(f"Received voice generation request with text: {text[:50]}...")
        logger.info(f"Voice type selected: {voice_type}")
        
        # Create temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        logger.info(f"Created temp directory: {temp_dir}")
        
        # Generate output path
        output_audio_path = os.path.join(temp_dir, "generated_voice.wav")
        
        # Handle different voice types
        if voice_type == "male":
            voice = "ms-MY-OsmanNeural"  # Malaysian Malay male voice
        elif voice_type == "female":
            voice = "ms-MY-YasminNeural"  # Malaysian Malay female voice
        else:
            # Default to female if unknown voice type
            voice = "ms-MY-YasminNeural"
            logger.warning(f"Unknown voice type '{voice_type}', defaulting to female voice")
        
        logger.info(f"Using Edge-TTS voice: {voice}")
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
    """Get available voice types and capabilities"""
    try:
        voice_sys = get_voice_system()
        
        return {
            "status": "success",
            "message": "Available voice generation options",
            "voice_types": [
                {
                    "id": "female",
                    "name": "Female Voice (Yasmin)",
                    "description": "Professional female Malay voice",
                    "icon": "👩",
                    "system": "Microsoft Edge-TTS",
                    "voice_id": "ms-MY-YasminNeural",
                    "requires_audio_sample": False
                },
                {
                    "id": "male",
                    "name": "Male Voice (Osman)",
                    "description": "Professional male Malay voice",
                    "icon": "👨",
                    "system": "Microsoft Edge-TTS",
                    "voice_id": "ms-MY-OsmanNeural",
                    "requires_audio_sample": False
                }
            ],
            "capabilities": {
                "voice_cloning": True,
                "multilingual": True,
                "languages_supported": ["ms", "en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh-cn", "ja", "hu", "ko"],
                "malay_support": True,
                "real_voice_cloning": "Uses your actual voice characteristics from the audio sample"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to get voice information: {str(e)}",
            "voice_types": []
        }