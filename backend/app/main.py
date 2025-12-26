"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health, items, voice_clone, style_guide, test_style, auto_vlog

# Create FastAPI application instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Smart Memento Booth - A photo booth application",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(items.router, prefix="/api", tags=["Items"])
app.include_router(voice_clone.router, prefix="/api", tags=["Voice Clone"])
app.include_router(style_guide.router, prefix="/api", tags=["Style Guide"])
app.include_router(test_style.router, prefix="/api", tags=["Testing"])
app.include_router(auto_vlog.router, prefix="/api", tags=["Auto Vlog"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Smart Memento Booth API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
