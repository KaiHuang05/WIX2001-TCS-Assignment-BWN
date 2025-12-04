# Smart Memento Booth 📸

A modern photo booth application with a React frontend and FastAPI backend.

## 📁 Project Structure

```
smart-memento-booth/
├── frontend/              # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/   # React components (shadcn/ui)
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── assets/       # Static assets
│   ├── public/           # Public assets
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.ts    # Vite configuration
│   └── README.md         # Frontend documentation
│
└── backend/              # FastAPI Python backend
    ├── app/
    │   ├── api/
    │   │   └── routes/   # API endpoints
    │   ├── core/         # Configuration
    │   ├── models/       # Database models
    │   ├── schemas/      # Pydantic schemas
    │   ├── services/     # Business logic
    │   ├── dependencies/ # FastAPI dependencies
    │   └── main.py       # Application entry point
    ├── requirements.txt  # Python dependencies
    ├── .env.example      # Environment variables template
    └── README.md         # Backend documentation
```

## 🚀 Quick Start

### Prerequisites

- **Frontend**: Node.js 18+ or Bun
- **Backend**: Python 3.9+

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run the backend
fastapi dev app/main.py
```

Backend will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (using npm)
npm install
# OR using bun
bun install

# Run development server
npm run dev
# OR
bun run dev
```

Frontend will be available at: **http://localhost:8080**

## 🎯 Features

### Frontend
- ✨ Modern React with TypeScript
- 🎨 shadcn/ui component library
- 🎭 Tailwind CSS for styling
- ⚡ Vite for fast development
- 📱 Responsive design
- 🎥 Audio/Video capture capabilities
- 📸 Photo processing features

### Backend
- 🚀 FastAPI framework
- 📊 Automatic API documentation
- ✅ Pydantic data validation
- 🔌 CORS enabled for frontend integration
- 🏗️ Modular architecture
- 📝 Type hints throughout
- 🧪 Ready for testing

## 🛠️ Development

### Frontend Development

```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend Development

```bash
cd backend
fastapi dev app/main.py  # Development mode with auto-reload
fastapi run app/main.py  # Production mode
pytest                   # Run tests
```

## 📡 API Integration

The frontend is configured to communicate with the backend API. Update the CORS settings in `backend/.env` if needed:

```env
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
```

## 🏗️ Architecture

### Frontend (React)
- **Component-based architecture**: Reusable UI components
- **Page routing**: React Router for navigation
- **State management**: React hooks
- **UI library**: shadcn/ui components
- **Styling**: Tailwind CSS utility-first

### Backend (FastAPI)
- **Layered architecture**:
  - **API Layer**: Route handlers
  - **Service Layer**: Business logic
  - **Schema Layer**: Data validation
  - **Model Layer**: Database models (future)
- **Dependency Injection**: FastAPI's DI system
- **Auto Documentation**: OpenAPI/Swagger

## 📦 Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Hook Form
- Zod validation

### Backend
- FastAPI
- Uvicorn
- Pydantic
- Python 3.9+

## 🔐 Environment Variables

### Backend (.env)
```env
APP_NAME=Smart Memento Booth API
DEBUG=True
CORS_ORIGINS=http://localhost:8080
HOST=0.0.0.0
PORT=8000
```

See `backend/.env.example` for all available options.

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

### Backend
- `fastapi dev app/main.py` - Start development server
- `fastapi run app/main.py` - Start production server
- `pytest` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Smart Memento Booth application.

## 🆘 Support

For issues and questions:
- Frontend: Check `frontend/README.md`
- Backend: Check `backend/README.md`
- API Docs: Visit http://localhost:8000/docs when backend is running

## 🎯 Next Steps

- [ ] Add database integration (PostgreSQL/SQLite)
- [ ] Implement authentication
- [ ] Add file upload handling
- [ ] Integrate photo processing
- [ ] Add real-time features
- [ ] Deploy to production

---

Built with ❤️ using React and FastAPI
