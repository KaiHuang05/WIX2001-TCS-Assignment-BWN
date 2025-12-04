# Audio Memento Workflow Documentation

## Overview
This document describes the complete workflow for the Audio Memento feature, which uses Chatterbox TTS to generate voice-cloned audio in Malay.

## Workflow Steps

### 1. Frontend - Audio Recording Page (`/audio-capture`)

**File**: `frontend/src/pages/AudioCapture.tsx`

**User Actions**:
1. User clicks on "Audio Memento" from the home page
2. User is redirected to `/audio-capture`
3. User records their voice by:
   - Clicking "Tap to Record" button
   - Speaking a short phrase (e.g., "I'm here at the community fair!")
   - Clicking "Stop Recording"
4. User can preview the recording by clicking "Play Recording"
5. User can re-record if needed by clicking "Re-record"
6. User clicks "Use This Voice" to proceed

### 2. Frontend - Text Input

**User Actions**:
1. After confirming the voice recording, a text input form appears
2. User enters their desired text in Malay (Bahasa Melayu)
3. User clicks "Generate Voice" button

**Data Handling**:
- Audio file is stored in session storage as base64 data
- Malay text is stored in session storage
- User is redirected to `/processing`

### 3. Frontend - Processing Page (`/processing`)

**File**: `frontend/src/pages/Processing.tsx`

**Process**:
1. Retrieves the captured audio and Malay text from session storage
2. Converts base64 audio to blob
3. Creates FormData with:
   - `audio_file`: The user's voice sample (webm format)
   - `text`: The Malay text to be spoken
4. Sends POST request to `http://localhost:8000/api/voice-clone`
5. Receives generated audio (WAV format) from backend
6. Stores generated audio URL in session storage
7. Redirects to `/result`

**Status Updates**:
- "Converting your audio..."
- "Generating voice with Chatterbox..."
- "Complete! Redirecting..."

### 4. Backend - Voice Clone API

**File**: `backend/app/api/routes/voice_clone.py`

**Endpoint**: `POST /api/voice-clone`

**Process**:
1. Receives audio file and text via multipart/form-data
2. Saves uploaded audio to temporary directory
3. Calls `generate_voice()` function from `voice2voice.py`
4. Returns generated audio file as WAV

**Parameters**:
- `audio_file`: UploadFile (user's voice sample)
- `text`: Form field (Malay text to speak)

**Response**: Audio file (WAV format)

### 5. Backend - Voice Generation Service

**File**: `backend/voice2voice.py`

**Function**: `generate_voice(input_audio_path, text, output_path)`

**Process**:
1. Initializes Chatterbox TTS model (if not already loaded)
2. Uses voice cloning with the user's audio sample
3. Generates speech in Malay (`language_id="ms"`)
4. Saves output as WAV file
5. Returns path to generated audio

**Model**: ChatterboxTTS (CPU mode)

### 6. Frontend - Result Page (`/result`)

**File**: `frontend/src/pages/Result.tsx`

**Display**:
- Shows the generated audio with a play button
- Displays audio player UI with play/pause controls
- Provides download and share options

**User Actions**:
- Play the generated voice audio
- Download the audio file (WAV format)
- Share the audio memento
- Create another memento

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Records    │
│   Voice     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  AudioCapture   │
│  - Record audio │
│  - Enter text   │
└──────┬──────────┘
       │ (base64 audio + text)
       ▼
┌─────────────────┐
│   Processing    │
│  - Convert to   │
│    blob         │
│  - Send to API  │
└──────┬──────────┘
       │ (FormData)
       ▼
┌─────────────────┐
│  Backend API    │
│  /voice-clone   │
└──────┬──────────┘
       │ (audio file + text)
       ▼
┌─────────────────┐
│  Chatterbox TTS │
│  - Voice clone  │
│  - Generate     │
│    speech       │
└──────┬──────────┘
       │ (WAV audio)
       ▼
┌─────────────────┐
│   Result Page   │
│  - Play audio   │
│  - Download     │
│  - Share        │
└─────────────────┘
```

## Session Storage Keys

- `mementoType`: "audio"
- `capturedAudio`: Base64 encoded audio (user's voice sample)
- `malayText`: Text in Malay to be spoken
- `generatedAudio`: Blob URL of the generated audio

## API Endpoints

### Voice Clone
- **URL**: `/api/voice-clone`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `audio_file`: Audio file (webm)
  - `text`: String (Malay text)
- **Response**: Audio file (WAV)

### Health Check
- **URL**: `/api/voice-clone/health`
- **Method**: GET
- **Response**: JSON with model status

## File Formats

- **Input Audio**: WebM (from browser MediaRecorder)
- **Output Audio**: WAV (from Chatterbox TTS)

## Dependencies

### Frontend
- React Router for navigation
- Browser MediaRecorder API for audio recording
- FormData for multipart uploads

### Backend
- FastAPI for API server
- Chatterbox TTS for voice generation
- torchaudio for audio processing
- torch for deep learning

## Error Handling

### Frontend
- Microphone permission errors
- Recording errors
- Processing/API errors
- Missing data validation

### Backend
- File upload errors
- Voice generation failures
- Temporary file cleanup

## Future Enhancements

1. Support for multiple languages
2. Voice quality selection
3. Audio preview before generation
4. Batch processing
5. User voice profile storage
6. Advanced audio effects
