# Project Structure

This document provides a complete overview of the Smart Memento Booth project structure.

## Directory Tree

```
smart-memento-booth/
│
├── frontend/                          # React Frontend Application
│   ├── public/                       # Static public assets
│   │   ├── favicon.ico
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   │
│   ├── src/                          # Source code
│   │   ├── assets/                   # Images, fonts, etc.
│   │   │   └── event-logo.png
│   │   │
│   │   ├── components/               # React components
│   │   │   └── ui/                  # shadcn/ui components
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── toast.tsx
│   │   │       ├── toaster.tsx
│   │   │       └── ... (more UI components)
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── lib/                      # Utility functions
│   │   │   └── utils.ts
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── AudioCapture.tsx     # Audio capture page
│   │   │   ├── Capture.tsx          # Photo capture page
│   │   │   ├── NotFound.tsx         # 404 error page
│   │   │   ├── Processing.tsx       # Processing page
│   │   │   ├── Result.tsx           # Results display page
│   │   │   ├── VideoCapture.tsx     # Video capture page
│   │   │   └── Welcome.tsx          # Welcome/landing page
│   │   │
│   │   ├── App.tsx                   # Main App component
│   │   ├── main.tsx                  # Application entry point
│   │   ├── index.css                 # Global styles
│   │   └── vite-env.d.ts            # Vite type definitions
│   │
│   ├── bun.lockb                     # Bun lock file
│   ├── components.json               # shadcn/ui configuration
│   ├── eslint.config.js              # ESLint configuration
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Frontend dependencies
│   ├── package-lock.json             # NPM lock file
│   ├── postcss.config.js             # PostCSS configuration
│   ├── README.md                     # Frontend documentation
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── tsconfig.app.json             # TypeScript app config
│   ├── tsconfig.json                 # TypeScript base config
│   ├── tsconfig.node.json            # TypeScript node config
│   └── vite.config.ts                # Vite configuration
│
├── backend/                           # FastAPI Backend Application
│   ├── app/                          # Application source code
│   │   ├── api/                      # API layer
│   │   │   ├── routes/              # Route handlers
│   │   │   │   ├── __init__.py
│   │   │   │   ├── health.py        # Health check endpoints
│   │   │   │   └── items.py         # Item CRUD endpoints
│   │   │   └── __init__.py
│   │   │
│   │   ├── core/                     # Core configuration
│   │   │   ├── __init__.py
│   │   │   └── config.py            # Settings & configuration
│   │   │
│   │   ├── models/                   # Database models (future)
│   │   │   └── __init__.py
│   │   │
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   └── item.py              # Item schemas
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── __init__.py
│   │   │   └── item_service.py      # Item service
│   │   │
│   │   ├── dependencies/             # FastAPI dependencies
│   │   │   └── __init__.py
│   │   │
│   │   ├── __init__.py
│   │   └── main.py                   # Application entry point
│   │
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Backend gitignore
│   ├── README.md                     # Backend documentation
│   └── requirements.txt              # Python dependencies
│
├── .gitignore                         # Root gitignore
├── README.md                          # Root documentation
├── setup.bat                          # Windows setup script
└── setup.sh                           # Unix/Mac setup script
```

## Architecture Overview

### Frontend Architecture

```
User Interface (React Components)
         ↓
  Page Components (Routes)
         ↓
   Custom Hooks & Utils
         ↓
  shadcn/ui Components
         ↓
    Tailwind CSS
```

**Key Technologies:**
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- shadcn/ui component library
- Tailwind CSS for styling
- React Hook Form for forms
- Zod for validation

### Backend Architecture

```
    API Endpoints (FastAPI Routes)
            ↓
      APIRouter (Routing)
            ↓
    Pydantic Schemas (Validation)
            ↓
   Service Layer (Business Logic)
            ↓
    Models Layer (Database) - Future
```

**Key Technologies:**
- FastAPI framework
- Uvicorn ASGI server
- Pydantic for data validation
- pydantic-settings for configuration
- CORS middleware

## File Purposes

### Frontend Key Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.ts` | Tailwind CSS theming |
| `components.json` | shadcn/ui component config |
| `tsconfig.json` | TypeScript compiler options |
| `App.tsx` | Main application component |
| `main.tsx` | React application entry |
| `index.html` | HTML template |

### Backend Key Files

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application setup |
| `app/core/config.py` | Application settings |
| `app/api/routes/` | API endpoint definitions |
| `app/schemas/` | Request/response models |
| `app/services/` | Business logic |
| `requirements.txt` | Python dependencies |
| `.env.example` | Environment variable template |

## Module Descriptions

### Frontend Modules

- **`components/ui/`**: Reusable UI components from shadcn/ui
- **`pages/`**: Full-page components for routing
- **`hooks/`**: Custom React hooks for shared logic
- **`lib/`**: Utility functions and helpers
- **`assets/`**: Static assets (images, fonts)

### Backend Modules

- **`api/routes/`**: HTTP endpoint handlers
- **`core/`**: Configuration and settings
- **`schemas/`**: Pydantic models for validation
- **`services/`**: Business logic and data processing
- **`models/`**: Database models (for future implementation)
- **`dependencies/`**: Dependency injection functions

## Development Workflow

1. **Frontend Development**: Edit files in `frontend/src/`
2. **Backend Development**: Edit files in `backend/app/`
3. **API Integration**: Backend runs on port 8000, Frontend on 8080
4. **Hot Reload**: Both support automatic reload during development

## Configuration Files

### Frontend Configuration
- **TypeScript**: `tsconfig.*.json`
- **Vite**: `vite.config.ts`
- **Tailwind**: `tailwind.config.ts`
- **ESLint**: `eslint.config.js`
- **PostCSS**: `postcss.config.js`

### Backend Configuration
- **Environment**: `.env` (created from `.env.example`)
- **Settings**: `app/core/config.py`
- **Dependencies**: `requirements.txt`

## API Endpoints

Current endpoints (example):

```
GET  /                     # Root endpoint
GET  /health              # Health check
GET  /ping                # Ping endpoint
GET  /api/items           # Get all items
GET  /api/items/{id}      # Get item by ID
POST /api/items           # Create item
PUT  /api/items/{id}      # Update item
DELETE /api/items/{id}    # Delete item
GET  /docs                # Swagger UI
GET  /redoc               # ReDoc UI
```

## Next Steps for Development

1. **Database Integration**: Add SQLAlchemy models
2. **Authentication**: Implement JWT-based auth
3. **File Upload**: Add photo upload handling
4. **Photo Processing**: Integrate image processing
5. **Real-time Features**: Add WebSocket support
6. **Testing**: Add comprehensive test suites
7. **Deployment**: Configure for production

---

For detailed setup and usage instructions, see the main `README.md`.
