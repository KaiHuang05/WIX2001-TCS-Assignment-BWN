# Quick Reference Guide

Quick commands and references for Smart Memento Booth development.

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh
./setup.sh
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
```

**Frontend:**
```bash
cd frontend
npm install    # or: bun install
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
fastapi dev app/main.py
```
🌐 Backend at: http://localhost:8000
📚 API Docs: http://localhost:8000/docs

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev    # or: bun run dev
```
🌐 Frontend at: http://localhost:8080

### Production Mode

**Backend:**
```bash
cd backend
fastapi run app/main.py
# or
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📦 Package Management

### Frontend

```bash
# Install packages
npm install <package>
bun add <package>

# Update packages
npm update
bun update

# Remove packages
npm uninstall <package>
bun remove <package>
```

### Backend

```bash
# Install package
pip install <package>

# Install from requirements
pip install -r requirements.txt

# Freeze dependencies
pip freeze > requirements.txt

# Upgrade pip
python -m pip install --upgrade pip
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest tests/test_items.py      # Run specific test
pytest -v                       # Verbose mode
pytest --cov=app                # With coverage
```

## 🔍 Code Quality

### Frontend

```bash
cd frontend

# Linting
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues

# Type checking
npm run type-check

# Format code
npm run format            # If configured
```

### Backend

```bash
cd backend

# Type checking
mypy app/                 # If mypy installed

# Format code
black app/                # If black installed
isort app/                # If isort installed

# Linting
flake8 app/               # If flake8 installed
```

## 📝 Common Tasks

### Add a New API Endpoint

1. Create route in `backend/app/api/routes/`
2. Create schema in `backend/app/schemas/`
3. Create service in `backend/app/services/`
4. Register router in `backend/app/main.py`

```python
# Example: backend/app/api/routes/photos.py
from fastapi import APIRouter

router = APIRouter(prefix="/photos", tags=["photos"])

@router.get("/")
async def get_photos():
    return {"photos": []}
```

### Add a New Frontend Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`

```tsx
// Example: frontend/src/pages/Gallery.tsx
export default function Gallery() {
  return <div>Gallery Page</div>
}

// In App.tsx
import Gallery from './pages/Gallery'
// Add to routes
<Route path="/gallery" element={<Gallery />} />
```

### Add a New UI Component

```bash
cd frontend

# Using shadcn/ui CLI
npx shadcn-ui@latest add <component-name>

# Example
npx shadcn-ui@latest add dropdown-menu
```

## 🐛 Debugging

### Backend Debugging

```bash
# Enable debug mode in .env
DEBUG=True

# Run with verbose output
fastapi dev app/main.py --log-level debug

# Python debugger
# Add to code: import pdb; pdb.set_trace()
```

### Frontend Debugging

```bash
# Enable source maps (already in vite.config.ts)
# Use browser DevTools
# Check console for errors

# React DevTools
# Install browser extension for better debugging
```

## 📊 View Logs

### Backend Logs
```bash
# Console logs appear in terminal where fastapi is running
# Add custom logging:
# import logging
# logger = logging.getLogger(__name__)
# logger.info("Message")
```

### Frontend Logs
```bash
# Browser console (F12)
# or check terminal where vite is running
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/your-feature

# Pull latest
git pull origin main
```

## 🌐 Environment Variables

### Backend (.env)
```env
APP_NAME=Smart Memento Booth API
DEBUG=True
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
HOST=0.0.0.0
PORT=8000
```

### Frontend (if needed)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## 📚 Documentation

### View API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Generate OpenAPI Schema
```bash
# Access at http://localhost:8000/openapi.json
# Or save to file:
curl http://localhost:8000/openapi.json > openapi.json
```

## 🔧 Troubleshooting

### Port Already in Use

**Backend:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Frontend:**
```bash
# Change port in vite.config.ts or:
npm run dev -- --port 3000
```

### Module Not Found

**Backend:**
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**Frontend:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

Update `backend/.env`:
```env
CORS_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000
```

## 🎯 Useful Endpoints

| Endpoint | Purpose |
|----------|---------|
| `http://localhost:8000` | Backend API root |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc UI |
| `http://localhost:8000/health` | Health check |
| `http://localhost:8080` | Frontend app |

## 📱 Mobile Testing

```bash
# Find your local IP
# Windows: ipconfig
# macOS/Linux: ifconfig

# Update CORS in backend/.env
CORS_ORIGINS=http://<YOUR_IP>:8080

# Access from mobile
http://<YOUR_IP>:8080
```

## 🚢 Deployment Checklist

- [ ] Set `DEBUG=False` in backend
- [ ] Update `CORS_ORIGINS` for production domain
- [ ] Set secure `SECRET_KEY` if using auth
- [ ] Build frontend: `npm run build`
- [ ] Set environment variables on hosting platform
- [ ] Test production build locally
- [ ] Set up database (if needed)
- [ ] Configure HTTPS/SSL
- [ ] Set up monitoring and logging

---

For detailed information, see `README.md` and `STRUCTURE.md`
