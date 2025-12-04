@echo off
echo Setting up Smart Memento Booth...

REM Backend setup
echo.
echo Setting up Backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment and install dependencies
echo Installing backend dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Create .env file
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created. Please update it with your configuration.
)

cd ..

REM Frontend setup
echo.
echo Setting up Frontend...
cd frontend

REM Check if bun is available, otherwise use npm
where bun >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Installing frontend dependencies with bun...
    bun install
) else (
    echo Installing frontend dependencies with npm...
    npm install
)

cd ..

echo.
echo Setup complete!
echo.
echo To start the application:
echo.
echo Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   fastapi dev app/main.py
echo.
echo Frontend:
echo   cd frontend
echo   npm run dev
echo.
pause
