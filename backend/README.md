# Smart Memento Booth - Backend

FastAPI backend for the Smart Memento Booth application.

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/           # API route handlers
│   │       ├── health.py     # Health check endpoints
│   │       └── items.py      # Item CRUD endpoints
│   ├── core/
│   │   └── config.py         # Application configuration
│   ├── models/               # Database models (SQLAlchemy)
│   ├── schemas/              # Pydantic schemas
│   │   └── item.py          # Item request/response schemas
│   ├── services/             # Business logic layer
│   │   └── item_service.py  # Item service
│   ├── dependencies/         # FastAPI dependencies
│   └── main.py              # Application entry point
├── .env.example             # Environment variables template
└── requirements.txt         # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configurations.

### Running the Application

**Development mode (with auto-reload):**
```bash
fastapi dev app/main.py
```

**Production mode:**
```bash
fastapi run app/main.py
```

**Alternative using uvicorn:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger UI): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Available Endpoints

#### Health Check
- `GET /health` - Health check endpoint
- `GET /ping` - Simple ping endpoint

#### Items (Example CRUD)
- `GET /api/items` - Get all items
- `GET /api/items/{item_id}` - Get specific item
- `POST /api/items` - Create new item
- `PUT /api/items/{item_id}` - Update item
- `DELETE /api/items/{item_id}` - Delete item

## 🧪 Testing

Run tests using pytest:
```bash
pytest
```

## 🏛️ Architecture

This backend follows FastAPI best practices:

### Layered Architecture
- **API Layer** (`api/routes/`): HTTP request handling
- **Service Layer** (`services/`): Business logic
- **Schema Layer** (`schemas/`): Data validation (Pydantic)
- **Model Layer** (`models/`): Database models (for future use)

### Key Features
- ✅ Modular design with APIRouter
- ✅ Pydantic for data validation
- ✅ Settings management with pydantic-settings
- ✅ CORS middleware for frontend integration
- ✅ Automatic API documentation
- ✅ Type hints throughout

## 🔧 Configuration

Edit `.env` file to configure:

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
