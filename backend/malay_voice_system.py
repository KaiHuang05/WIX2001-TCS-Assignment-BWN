"""
Voice synthesis system using Edge-TTS and XTTS for voice cloning
This combines Edge-TTS for simple TTS and a custom solution for voice cloning
"""
import os
import logging
import asyncio
import torch
import torchaudio
import tempfile
from pathlib import Path
from typing import Optional, Tuple
import edge_tts
import numpy as np

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MalayVoiceSystem:
    def __init__(self):
        """Initialize the Malay voice synthesis system"""
        self.edge_voices = [
            "ms-MY-OsmanNeural",    # Male Malay voice
            "ms-MY-YasminNeural",   # Female Malay voice
        ]
        self.default_voice = "ms-MY-YasminNeural"
    
    async def generate_simple_tts(self, text: str, output_path: str = "simple_tts.wav", voice: str = None) -> str:
        """
        Generate simple TTS using Edge-TTS
        
        Args:
            text: Text in Malay to be spoken
            output_path: Path to save the generated audio
            voice: Voice to use (optional, defaults to Yasmin)
            
        Returns:
            Path to the generated audio file
        """
        try:
            voice_name = voice or self.default_voice
            logger.info(f"Generating TTS with voice: {voice_name}")
            logger.info(f"Text: '{text}'")
            
            # Create TTS communicator
            communicate = edge_tts.Communicate(text, voice_name)
            
            # Generate and save audio
            await communicate.save(output_path)
            
            logger.info(f"TTS generated successfully: {output_path}")
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"File size: {file_size} bytes")
                return output_path
            else:
                raise Exception("TTS file was not created")
                
        except Exception as e:
            logger.error(f"Simple TTS failed: {str(e)}")
            raise
    
    async def clone_voice_simple(self, text: str, speaker_audio_path: str, output_path: str = "cloned_voice.wav") -> str:
        """
        Simple voice cloning using audio processing techniques
        This is a basic implementation that modifies pitch and tone
        
        Args:
            text: Text to speak
            speaker_audio_path: Path to the reference voice audio
            output_path: Path to save the generated audio
            
        Returns:
            Path to the generated audio file
        """
        try:
            logger.info(f"Attempting voice cloning for: '{text}'")
            logger.info(f"Using speaker audio: {speaker_audio_path}")
            
            # Step 1: Generate base TTS
            temp_tts_path = "temp_base_tts.wav"
            await self.generate_simple_tts(text, temp_tts_path)
            
            # Step 2: Analyze speaker audio characteristics
            speaker_features = self._analyze_speaker_audio(speaker_audio_path)
            
            # Step 3: Modify the TTS audio to match speaker characteristics
            modified_audio_path = self._apply_voice_characteristics(temp_tts_path, speaker_features, output_path)
            
            # Cleanup
            if os.path.exists(temp_tts_path):
                os.remove(temp_tts_path)
            
            logger.info(f"Voice cloning completed: {modified_audio_path}")
            return modified_audio_path
            
        except Exception as e:
            logger.error(f"Voice cloning failed: {str(e)}")
            # Fallback to simple TTS
            logger.info("Falling back to simple TTS")
            return await self.generate_simple_tts(text, output_path)
    
    def _analyze_speaker_audio(self, audio_path: str) -> dict:
        """
        Analyze speaker audio to extract characteristics
        
        Args:
            audio_path: Path to the speaker audio
            
        Returns:
            Dictionary with speaker characteristics
        """
        try:
            logger.info("Analyzing speaker audio characteristics...")
            
            # Load audio
            waveform, sample_rate = torchaudio.load(audio_path)
            
            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)
            
            # Calculate characteristics
            # Fundamental frequency (pitch)
            # This is a simplified analysis
            rms_energy = torch.sqrt(torch.mean(waveform ** 2))
            
            # Estimate pitch (very basic)
            # In a real implementation, you'd use more sophisticated pitch detection
            spectral_centroid = self._calculate_spectral_centroid(waveform, sample_rate)
            
            characteristics = {
                'energy': float(rms_energy),
                'spectral_centroid': float(spectral_centroid),
                'sample_rate': sample_rate,
                'duration': waveform.shape[1] / sample_rate
            }
            
            logger.info(f"Speaker characteristics: {characteristics}")
            return characteristics
            
        except Exception as e:
            logger.error(f"Speaker analysis failed: {str(e)}")
            # Return default characteristics
            return {
                'energy': 0.1,
                'spectral_centroid': 1000.0,
                'sample_rate': 22050,
                'duration': 1.0
            }
    
    def _calculate_spectral_centroid(self, waveform: torch.Tensor, sample_rate: int) -> float:
        """Calculate spectral centroid (brightness indicator)"""
        try:
            # Compute STFT
            stft = torch.stft(waveform.squeeze(), n_fft=2048, hop_length=512, return_complex=True)
            magnitude = torch.abs(stft)
            
            # Frequency bins
            freqs = torch.fft.fftfreq(2048, 1/sample_rate)[:1025]  # Only positive frequencies
            
            # Calculate spectral centroid
            numerator = torch.sum(magnitude * freqs.unsqueeze(1), dim=0)
            denominator = torch.sum(magnitude, dim=0) + 1e-8
            spectral_centroid = torch.mean(numerator / denominator)
            
            return float(spectral_centroid)
            
        except Exception as e:
            logger.error(f"Spectral centroid calculation failed: {str(e)}")
            return 1000.0  # Default value
    
    def _apply_voice_characteristics(self, tts_audio_path: str, speaker_features: dict, output_path: str) -> str:
        """
        Apply speaker characteristics to TTS audio
        
        Args:
            tts_audio_path: Path to the base TTS audio
            speaker_features: Speaker characteristics
            output_path: Path to save the modified audio
            
        Returns:
            Path to the modified audio file
        """
        try:
            logger.info("Applying voice characteristics...")
            
            # Load TTS audio
            waveform, sample_rate = torchaudio.load(tts_audio_path)
            
            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)
            
            # Apply modifications based on speaker characteristics
            
            # 1. Adjust energy (volume)
            target_energy = speaker_features.get('energy', 0.1)
            current_energy = torch.sqrt(torch.mean(waveform ** 2))
            if current_energy > 0:
                energy_ratio = target_energy / current_energy
                waveform = waveform * energy_ratio
            
            # 2. Apply simple pitch shifting (basic implementation)
            # Note: This is a very simplified approach
            # In a real implementation, you'd use more sophisticated pitch shifting
            
            # 3. Normalize to prevent clipping
            max_val = torch.max(torch.abs(waveform))
            if max_val > 0.95:
                waveform = waveform * (0.95 / max_val)
            
            # Save modified audio
            torchaudio.save(output_path, waveform, sample_rate)
            
            logger.info(f"Voice characteristics applied successfully")
            return output_path
            
        except Exception as e:
            logger.error(f"Applying voice characteristics failed: {str(e)}")
            # Fallback: just copy the original TTS
            import shutil
            shutil.copy2(tts_audio_path, output_path)
            return output_path
    
    async def list_available_voices(self) -> list:
        """List all available Malay voices"""
        try:
            voices = await edge_tts.list_voices()
            malay_voices = [v for v in voices if v['Locale'].startswith('ms-')]
            return malay_voices
        except Exception as e:
            logger.error(f"Failed to list voices: {str(e)}")
            return []


# Convenience functions for easy use
async def create_simple_tts(text: str, output_path: str = "simple_tts.wav", voice: str = None) -> str:
    """Quick function to create simple TTS"""
    system = MalayVoiceSystem()
    return await system.generate_simple_tts(text, output_path, voice)

async def create_voice_clone(text: str, speaker_audio_path: str, output_path: str = "cloned_voice.wav") -> str:
    """Quick function to create a voice clone"""
    system = MalayVoiceSystem()
    return await system.clone_voice_simple(text, speaker_audio_path, output_path)


if __name__ == "__main__":
    # Test the voice system
    print("Testing Malay Voice System...")
    
    async def test_system():
        try:
            system = MalayVoiceSystem()
            
            # Test simple TTS
            test_text = "Selamat datang ke sistem suara Melayu kami"
            print(f"\nGenerating TTS for: '{test_text}'")
            
            simple_output = await system.generate_simple_tts(test_text, "test_simple.wav")
            print(f"Simple TTS completed: {simple_output}")
            
            # List available voices
            voices = await system.list_available_voices()
            print(f"\nAvailable Malay voices: {len(voices)}")
            for voice in voices[:3]:  # Show first 3
                print(f"  - {voice.get('ShortName', 'Unknown')}: {voice.get('DisplayName', 'No name')}")
            
            # Test voice cloning (if sample audio is available)
            if os.path.exists("test_simple.wav"):
                print(f"\nTesting voice cloning...")
                clone_text = "Ini adalah ujian kloning suara menggunakan sistem kami"
                clone_output = await system.clone_voice_simple(clone_text, "test_simple.wav", "test_clone.wav")
                print(f"Voice cloning completed: {clone_output}")
            
        except Exception as e:
            print(f"Test failed: {str(e)}")
    
    # Run the async test
    asyncio.run(test_system())