"""
Voice cloning system using Coqui TTS
Supports Malay text-to-speech with voice cloning
"""
import os
import logging
import torch
import torchaudio
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
import tempfile

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceCloningSystem:
    def __init__(self, device: str = "auto"):
        """
        Initialize the voice cloning system
        
        Args:
            device: Device to use ("cpu", "cuda", or "auto")
        """
        self.device = self._get_device(device)
        self.tts = None
        self.model_loaded = False
        
    def _get_device(self, device: str) -> str:
        """Determine the best device to use"""
        if device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return device
    
    def load_model(self, model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2"):
        """
        Load the TTS model
        
        Args:
            model_name: Name of the TTS model to use
        """
        try:
            from TTS.api import TTS
            
            logger.info(f"Loading TTS model: {model_name}")
            logger.info(f"Using device: {self.device}")
            
            # Initialize TTS with the multilingual model that supports voice cloning
            self.tts = TTS(model_name, progress_bar=True).to(self.device)
            self.model_loaded = True
            
            logger.info("TTS model loaded successfully!")
            
        except ImportError:
            raise ImportError(
                "Coqui TTS not installed. Please install with: pip install TTS"
            )
        except Exception as e:
            logger.error(f"Failed to load TTS model: {str(e)}")
            raise
    
    def preprocess_audio(self, audio_path: str, target_sr: int = 22050) -> str:
        """
        Preprocess audio file for voice cloning
        
        Args:
            audio_path: Path to the input audio file
            target_sr: Target sample rate
            
        Returns:
            Path to the preprocessed audio file
        """
        try:
            logger.info(f"Preprocessing audio: {audio_path}")
            
            # Load audio
            waveform, sample_rate = torchaudio.load(audio_path)
            
            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)
                logger.info("Converted stereo to mono")
            
            # Resample if necessary
            if sample_rate != target_sr:
                resampler = torchaudio.transforms.Resample(sample_rate, target_sr)
                waveform = resampler(waveform)
                logger.info(f"Resampled from {sample_rate}Hz to {target_sr}Hz")
            
            # Normalize audio
            waveform = waveform / torch.max(torch.abs(waveform))
            
            # Save preprocessed audio
            output_path = audio_path.replace('.wav', '_preprocessed.wav')
            torchaudio.save(output_path, waveform, target_sr)
            
            logger.info(f"Audio preprocessed and saved to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Audio preprocessing failed: {str(e)}")
            raise
    
    def clone_voice(self, text: str, speaker_audio_path: str, output_path: str = "cloned_voice.wav", language: str = "ms") -> str:
        """
        Generate speech with voice cloning
        
        Args:
            text: Text to speak (in Malay)
            speaker_audio_path: Path to the reference voice audio
            output_path: Path to save the generated audio
            language: Language code (ms for Malay)
            
        Returns:
            Path to the generated audio file
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            logger.info(f"Cloning voice for text: '{text}'")
            logger.info(f"Using speaker audio: {speaker_audio_path}")
            
            # Check if input file exists
            if not os.path.exists(speaker_audio_path):
                raise FileNotFoundError(f"Speaker audio file not found: {speaker_audio_path}")
            
            # Preprocess the speaker audio
            processed_audio_path = self.preprocess_audio(speaker_audio_path)
            
            # Generate speech with voice cloning
            logger.info("Generating speech with voice cloning...")
            
            # Use XTTS v2 for voice cloning
            self.tts.tts_to_file(
                text=text,
                speaker_wav=processed_audio_path,
                language=language,
                file_path=output_path
            )
            
            logger.info(f"Voice cloning completed! Audio saved to: {output_path}")
            
            # Clean up preprocessed file
            if os.path.exists(processed_audio_path) and processed_audio_path != speaker_audio_path:
                os.remove(processed_audio_path)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Voice cloning failed: {str(e)}")
            raise
    
    def generate_simple_tts(self, text: str, output_path: str = "simple_tts.wav", language: str = "ms") -> str:
        """
        Generate simple TTS without voice cloning (uses default voice)
        
        Args:
            text: Text to speak
            output_path: Path to save the generated audio
            language: Language code
            
        Returns:
            Path to the generated audio file
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            logger.info(f"Generating simple TTS with default voice for: '{text}'")
            
            # For XTTS v2, we need a reference speaker even for simple TTS
            # Use a default speaker from the model's available speakers
            # If that's not available, we'll use the tts_to_file with language only
            try:
                # Try to get default speakers from the model
                if hasattr(self.tts, 'speakers') and self.tts.speakers:
                    default_speaker = self.tts.speakers[0]
                    logger.info(f"Using default speaker: {default_speaker}")
                    self.tts.tts_to_file(
                        text=text,
                        speaker=default_speaker,
                        language=language,
                        file_path=output_path
                    )
                else:
                    # Fallback: use language-only generation
                    logger.info("No default speakers available, using language-only generation")
                    self.tts.tts_to_file(
                        text=text,
                        language=language,
                        file_path=output_path
                    )
            except Exception as speaker_error:
                # If speaker-based TTS fails, try basic TTS
                logger.warning(f"Speaker-based TTS failed: {str(speaker_error)}, trying basic TTS")
                self.tts.tts_to_file(
                    text=text,
                    language=language,
                    file_path=output_path
                )
            
            logger.info(f"Simple TTS completed! Audio saved to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Simple TTS failed: {str(e)}")
            raise


# Convenience functions for easy use
def initialize_voice_system(device: str = "auto") -> VoiceCloningSystem:
    """Initialize and load the voice cloning system"""
    system = VoiceCloningSystem(device=device)
    system.load_model()
    return system

def create_voice_clone(text: str, speaker_audio_path: str, output_path: str = "cloned_voice.wav") -> str:
    """
    Quick function to create a voice clone
    
    Args:
        text: Malay text to speak
        speaker_audio_path: Path to the reference voice audio
        output_path: Path to save the generated audio
        
    Returns:
        Path to the generated audio file
    """
    system = initialize_voice_system()
    return system.clone_voice(text, speaker_audio_path, output_path)


if __name__ == "__main__":
    # Test the voice cloning system
    print("Testing Voice Cloning System...")
    
    try:
        # Initialize system
        voice_system = initialize_voice_system()
        
        # Test simple TTS first
        test_text = "Selamat datang ke sistem kloning suara kami"
        simple_output = voice_system.generate_simple_tts(test_text, "test_simple.wav")
        print(f"Simple TTS test completed: {simple_output}")
        
        # For voice cloning test, you would need a sample audio file
        # voice_clone_output = voice_system.clone_voice(test_text, "sample_voice.wav", "test_clone.wav")
        # print(f"Voice cloning test completed: {voice_clone_output}")
        
    except Exception as e:
        print(f"Test failed: {str(e)}")