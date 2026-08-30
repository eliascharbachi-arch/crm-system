#!/bin/bash

echo "🚀 Startar CRM-systemet..."
echo ""

# Kolla om node är installerat
if ! command -v node &> /dev/null; then
    echo "❌ Node.js är inte installerat. Installera från: https://nodejs.org"
    exit 1
fi

# Backend
echo "📦 Installerar backend-dependencies..."
cd backend
npm install > /dev/null 2>&1
echo "✅ Backend klart"

# Frontend
echo "📦 Installerar frontend-dependencies..."
cd ../frontend
npm install > /dev/null 2>&1
echo "✅ Frontend klart"

cd ..

echo ""
echo "🎉 Allt är installerat! Startar systemet..."
echo ""
echo "Webbläsaren öppnas automatiskt på: http://localhost:3000"
echo ""
echo "🔗 Backend körs på: http://localhost:5000"
echo "⏹️  Tryck Ctrl+C för att stoppa"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!

# Give backend time to start
sleep 2

# Start frontend
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
