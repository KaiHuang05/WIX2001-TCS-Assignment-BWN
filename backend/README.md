# Smart Memento Booth - Backend API

A FastAPI-based backend service for the Smart Memento Booth application that provides voice cloning and text-to-speech capabilities using Coqui TTS and Edge TTS.

## 🚀 Features

- **Real Voice Cloning**: Uses Coqui TTS XTTS v2 for authentic voice cloning
- **Fallback TTS**: Edge-TTS as backup for reliable text-to-speech
- **Malay Language Support**: Optimized for Malaysian Malay text-to-speech
- **RESTful API**: FastAPI with automatic documentation
- **CORS Support**: Configured for frontend integration

## 📋 Prerequisites

### ⚠️ Critical Requirement: Python 3.11 or Lower

**Important**: You **MUST** use Python 3.11 or lower. The Coqui TTS library does not support Python 3.12+.

Check your Python version:
```bash
python --version
```

If you have Python 3.12 or higher:
1. Install Python 3.11 from [python.org](https://www.python.org/downloads/)
2. Use `py -3.11` instead of `python` in all commands below

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone --branch frontend_enchanced https://github.com/Stevxhein/smart-memento-booth.git
cd smart-memento-booth/backend
```

### 2. Create Virtual Environment with Python 3.11

```bash
# Using Python 3.11 specifically (REQUIRED)
py -3.11 -m venv venv

# OR if Python 3.11 is your default:
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs all required packages including:
- FastAPI and Uvicorn (web server)
- Coqui TTS (voice cloning) - **Requires Python 3.11!**
- Edge-TTS (fallback TTS)
- PyTorch and audio processing libraries
- All other dependencies

### 5. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
# Application Settings
APP_NAME=Smart Memento Booth API
APP_VERSION=1.0.0
DEBUG=True

# CORS Settings (add your frontend URLs)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://localhost:8081"]

# Server Settings
HOST=0.0.0.0
PORT=8000
```

## 🚀 Running the Server

### Development Mode (Recommended)

```bash
# Make sure virtual environment is activated
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The server will start on: **http://localhost:8000**

## 📖 API Documentation

Once running, access interactive documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Root endpoint**: http://localhost:8000

## 🎯 API Endpoints

### Voice Cloning
- **POST** `/api/voice-clone`
  - Upload audio file + Malay text
  - Returns audio with your cloned voice

### Simple TTS
- **POST** `/api/simple-tts`
  - Provide Malay text
  - Returns audio with default voice

- **GET** `/health` - Server health status

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. "ModuleNotFoundError: No module named 'app'"
**Cause**: Not in the correct directory or virtual environment not activated.
**Solution**: 
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
python -m uvicorn app.main:app --reload
```

#### 2. "Weights only load failed" Error
**Cause**: PyTorch 2.9+ compatibility issue with TTS model loading.
**Solution**: This is automatically handled by our PyTorch compatibility fix. Restart the server if it persists.

#### 3. CORS Error from Frontend
**Cause**: Frontend URL not in allowed CORS origins.
**Solution**: Add your frontend URL to `.env`:
```env
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://localhost:8081","http://your-frontend-url"]
```

#### 4. Python 3.12+ Installation Issues
**Cause**: TTS library doesn't support Python 3.12+.
**Solution**: 
1. Install Python 3.11
2. Delete current `venv` folder
3. Create new environment: `py -3.11 -m venv venv`
4. Reinstall dependencies

#### 5. Voice Cloning Fails
**Causes & Solutions**:
- **Audio too small**: Use audio samples of at least 10 seconds
- **Wrong format**: Use WAV, MP3, or other common audio formats
- **System resources**: Voice cloning requires significant RAM/CPU

### Performance Tips

- **GPU Usage**: CUDA-compatible GPU automatically detected for faster processing
- **Audio Quality**: Higher quality input = better voice cloning results
- **File Size**: Keep audio files under 50MB for optimal performance

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/routes/          # API endpoints
│   │   ├── health.py        # Health checks
│   │   ├── items.py         # Example CRUD operations  
│   │   └── voice_clone.py   # Voice cloning endpoints
│   ├── core/
│   │   └── config.py        # App configuration & settings
│   ├── models/              # Database models (future use)
│   ├── schemas/             # Pydantic request/response schemas
│   ├── services/            # Business logic layer
│   └── main.py             # FastAPI application entry point
├── voice_cloning_coqui.py   # Voice cloning implementation
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── .env                    # Your environment configuration
├── setup_venv.bat          # Automated setup script (Windows)
├── activate_venv.bat       # Virtual env activation script (Windows)
└── README.md               # This file
```

## 📦 Key Dependencies

- `fastapi` - Modern web framework
- `uvicorn[standard]` - ASGI server
- `TTS>=0.22.0` - Coqui TTS for voice cloning
- `transformers==4.33.0` - ML transformers (fixed version for TTS compatibility)
- `edge-tts` - Microsoft Edge TTS fallback
- `torch` + `torchaudio` - PyTorch for ML operations
- `librosa` - Audio processing and analysis
- `pydantic-settings` - Configuration management

## 🔧 Configuration

The `.env` file supports these settings:

```env
# Application
APP_NAME=Smart Memento Booth API
APP_VERSION=1.0.0
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8000

# CORS (Frontend URLs that can access the API)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://localhost:8081"]

# Optional (for future features)
# DATABASE_URL=postgresql://user:password@localhost/dbname
# SECRET_KEY=your-secret-key-here
```

## 🚀 Quick Start Commands

After cloning the repo, run these commands:

```bash
# Navigate to backend
cd smart-memento-booth/backend

# Create virtual environment with Python 3.11
py -3.11 -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Start server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

✅ **Server running at**: http://localhost:8000  
✅ **API docs**: http://localhost:8000/docs

## 🧪 Testing the API

### Test Voice Cloning (curl example):
```bash
curl -X POST "http://localhost:8000/api/voice-clone" \
  -F "audio_file=@your_voice_sample.wav" \
  -F "text=Saya di Kuala Lumpur hari ini" \
  --output generated_voice.wav
```

### Test Simple TTS:
```bash
curl -X POST "http://localhost:8000/api/simple-tts" \
  -F "text=Selamat datang ke Smart Memento Booth" \
  --output simple_tts.wav
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Need help? 

1. Check the **Troubleshooting** section above
2. Review API docs at `/docs` when server is running
3. Check server logs for detailed error messages
4. Open a GitHub issue with:
   - Python version (`python --version`)
   - Complete error message
   - Steps to reproduce the issue

---

**🎯 Optimized for**: Malay language text-to-speech and voice cloning  
**🔧 Built with**: FastAPI, Coqui TTS, Edge-TTS, PyTorch  
**💡 Features**: Real voice cloning, fallback TTS, CORS support, automatic docs

```env
APP_NAME=Smart Memento Booth API
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
HOST=0.0.0.0
PORT=8000
```

## 📦 Dependencies

Core dependencies:
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **pydantic-settings**: Settings management

See `requirements.txt` for complete list.

## 🔐 Security (Future)

For production, uncomment and configure:
- Authentication (JWT tokens)
- Database connection
- Secret key management
- HTTPS/TLS

## 🗄️ Database Integration (Future)

To add database support:
1. Uncomment SQLAlchemy in `requirements.txt`
2. Create database models in `models/`
3. Set up database connection in `core/config.py`
4. Use Alembic for migrations

## 📝 License

Part of the Smart Memento Booth project.
