#!/bin/bash

# Social Media Platform Startup Script
echo "🚀 Starting Social Media Platform..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if MongoDB is running (optional)
if command_exists mongod; then
    echo "✅ MongoDB found"
else
    echo "⚠️  MongoDB not found locally. Make sure you have MongoDB Atlas configured."
fi

# Start backend in background
echo "📡 Starting backend server..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found. Please run npm install in backend directory."
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend server
npm run dev &
BACKEND_PID=$!
echo "✅ Backend server started (PID: $BACKEND_PID)"

# Go back to root directory
cd ..

# Start frontend
echo "🎨 Starting frontend server..."
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found. Please run npm install in root directory."
    kill $BACKEND_PID
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
npm start &
FRONTEND_PID=$!
echo "✅ Frontend server started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Social Media Platform is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup INT TERM

# Wait for both processes
wait
