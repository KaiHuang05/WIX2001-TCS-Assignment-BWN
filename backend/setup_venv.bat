@echo off
echo ========================================
echo Setting up Backend Virtual Environment
echo ========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11 and add it to PATH
    pause
    exit /b 1
)

REM Check Python version
python -c "import sys; ver=sys.version_info; exit(0 if ver.major==3 and ver.minor<=11 else 1)" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Python 3.11 or lower is required for Coqui TTS
    echo Current Python version:
    python --version
    echo Please install Python 3.11
    pause
    exit /b 1
)

echo Creating virtual environment...
if exist venv (
    echo Virtual environment already exists, skipping creation
) else (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully!
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo Installing Coqui TTS (this may take a while)...
pip install TTS>=0.22.0

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To activate the virtual environment in the future, run:
echo     cd backend
echo     venv\Scripts\activate
echo.
echo To start the server:
echo     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
pause
