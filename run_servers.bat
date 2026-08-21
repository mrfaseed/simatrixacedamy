@echo off
echo ===============================================
echo Server running module - Developed by @mrfxseed 
echo ===============================================

echo Starting Backend Server (Flask) in a new window...
start cmd /k "cd backend && call venv\Scripts\activate.bat && python -m src.seed && python app.py"

echo Starting Frontend Server (Vite) in a new window...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting!
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo You can close this window now.
pause
