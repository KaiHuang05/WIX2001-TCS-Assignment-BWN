import torchaudio as ta
from chatterbox.tts import ChatterboxTTS
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize model once at module level
model = None

def initialize_model():
    """Initialize the Chatterbox TTS model"""
    global model
    if model is None:
        logger.info("Initializing Chatterbox TTS model...")
        model = ChatterboxTTS.from_pretrained(device="cpu")
        logger.info("Model initialized successfully")
    return model

def generate_voice(input_audio_path: str, text: str, output_path: str = "generated_voice.wav") -> str:
    """
    Generate voice using Chatterbox TTS with voice cloning
    
    Args:
        input_audio_path: Path to the audio file containing the voice sample
        text: Text to be spoken in Malay
        output_path: Path where the generated audio will be saved
    
    Returns:
        Path to the generated audio file
    """
    try:
        logger.info(f"Starting voice generation with input: {input_audio_path}")
        logger.info(f"Text to generate: {text}")
        
        # Ensure model is initialized
        tts_model = initialize_model()
        
        # Check if input file exists
        if not os.path.exists(input_audio_path):
            raise FileNotFoundError(f"Input audio file not found: {input_audio_path}")
        
        logger.info(f"Input file size: {os.path.getsize(input_audio_path)} bytes")
        
        # Try to load and validate input audio
        try:
            logger.info("Attempting to load input audio file...")
            input_audio, input_sr = ta.load(input_audio_path)
            logger.info(f"Input audio loaded: shape={input_audio.shape}, sample_rate={input_sr}")
        except Exception as audio_load_error:
            logger.error(f"Failed to load input audio: {str(audio_load_error)}")
            # If WebM can't be loaded directly, we might need conversion
            # For now, continue and let Chatterbox handle it
            logger.warning("Continuing with original file, Chatterbox may handle format conversion")
        
        # Generate audio with voice cloning
        # Note: ChatterboxTTS is designed for Malay/Malaysian languages by default
        logger.info("Calling Chatterbox generate method...")
        try:
            wav = tts_model.generate(text, audio_prompt_path=input_audio_path)
        except Exception as gen_error:
            logger.error(f"Chatterbox generate() failed: {str(gen_error)}", exc_info=True)
            raise Exception(f"Chatterbox generation error: {str(gen_error)}")
        
        logger.info(f"Audio generated successfully, type: {type(wav)}")
        if hasattr(wav, 'shape'):
            logger.info(f"Audio shape: {wav.shape}")
        
        logger.info(f"Saving audio to: {output_path}")
        # Save the generated audio
        try:
            ta.save(output_path, wav, tts_model.sr)
        except Exception as save_error:
            logger.error(f"Audio save failed: {str(save_error)}", exc_info=True)
            raise Exception(f"Audio save error: {str(save_error)}")
        
        logger.info(f"Audio saved successfully. File size: {os.path.getsize(output_path)} bytes")
        return output_path
    except Exception as e:
        logger.error(f"Voice generation failed: {str(e)}", exc_info=True)
        raise Exception(f"Voice generation failed: {str(e)}")