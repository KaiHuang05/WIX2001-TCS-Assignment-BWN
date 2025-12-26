@echo off
REM Start FastAPI Backend Server

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Starting FastAPI server...
echo Server will be available at http://localhost:8000
echo API docs at http://localhost:8000/docs
echo.

cd /d %~dp0
fastapi dev app/main.py

pause
