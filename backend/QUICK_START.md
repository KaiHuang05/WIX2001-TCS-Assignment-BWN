# Quick Start Guide - Backend Setup

## Errors Fixed

### 1. Frontend Errors:
- ❌ `ERR_FILE_NOT_FOUND` for blob URL
- ✅ **Fixed**: Changed blob URL to data URL for proper storage in sessionStorage

### 2. Backend Errors:
- ❌ `500 Internal Server Error` from `/api/voice-clone`
- ✅ **Fixed**: TTS library enabled in requirements.txt
- ✅ **Fixed**: Created virtual environment setup scripts

## Setup Instructions

### Step 1: Check Python Version
You **MUST** use Python 3.11 or lower (Coqui TTS doesn't support Python 3.12+)

```powershell
python --version
```

If you have Python 3.12 or higher:
1. Install Python 3.11 from https://www.python.org/downloads/
2. Use `py -3.11` instead of `python` in commands below

### Step 2: Setup Virtual Environment

Run the automated setup script:

```powershell
cd backend
.\setup_venv.bat
```

This will:
- Create a virtual environment
- Install all dependencies
- Install Coqui TTS library
- Activate the environment

### Step 3: Activate Virtual Environment (for future use)

Whenever you work on the backend, activate the environment first:

```powershell
cd backend
.\activate_venv.bat
```

Or manually:

```powershell
cd backend
venv\Scripts\activate
```

### Step 4: Start the Backend Server

With the virtual environment activated:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Verify Server is Running

Open browser to: http://localhost:8000/docs

You should see the FastAPI Swagger documentation.

## Testing Voice Clone Endpoint

1. Go to http://localhost:8000/api/voice-clone/health
2. You should see:
```json
{
  "status": "healthy",
  "message": "Coqui TTS XTTS v2 voice cloning system is ready",
  "system": "Coqui TTS XTTS v2",
  "model_loaded": true
}
```

## Common Issues

### Issue: "Module 'TTS' not found"
**Solution**: The virtual environment is not activated
```powershell
cd backend
venv\Scripts\activate
```

### Issue: "Python 3.12+ detected"
**Solution**: Use Python 3.11
```powershell
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install TTS>=0.22.0
```

### Issue: Backend takes long to start
**Reason**: First time initialization downloads TTS models (~1GB)
**Solution**: Wait for download to complete (only happens once)

## Frontend Setup

If frontend isn't running:

```powershell
cd frontend
npm install  # or: bun install
npm run dev  # or: bun run dev
```

Frontend will run on: http://localhost:5173

## Complete System Check

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Virtual environment activated
4. ✅ TTS library installed
5. ✅ Blob URL issue fixed in frontend

## Next Steps

Test the voice cloning:
1. Open frontend: http://localhost:5173
2. Select "Audio Memento"
3. Record your voice
4. Enter Malay text
5. Process and listen to cloned voice

## Troubleshooting

If errors persist:
1. Check backend logs for detailed error messages
2. Verify Python version: `python --version`
3. Verify TTS installed: `pip show TTS`
4. Check if models downloaded in `~/.local/share/tts/`
