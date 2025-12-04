@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.
echo Virtual environment activated!
echo Python location: 
where python
echo.
echo To start the backend server, run:
echo     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
cmd /k
