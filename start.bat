@echo off
echo 🚀 Starting Social Media Platform...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

:: Check if backend directory exists
if not exist "backend\" (
    echo ❌ Backend directory not found.
    pause
    exit /b 1
)

:: Start backend server
echo 📡 Starting backend server...
cd backend

:: Install backend dependencies if needed
if not exist "node_modules\" (
    echo 📦 Installing backend dependencies...
    npm install
)

:: Start backend server in background
start "Backend Server" cmd /c "npm run dev"
echo ✅ Backend server started

:: Go back to root directory
cd ..

:: Install frontend dependencies if needed
if not exist "node_modules\" (
    echo 📦 Installing frontend dependencies...
    npm install
)

:: Start frontend server
echo 🎨 Starting frontend server...
start "Frontend Server" cmd /c "npm start"
echo ✅ Frontend server started

echo.
echo 🎉 Social Media Platform is running!
echo 📱 Frontend: http://localhost:3000
echo 🔗 Backend: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
