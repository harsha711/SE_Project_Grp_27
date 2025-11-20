#!/bin/bash
# Quick start script for Price-Based Recommendations testing
# Run this from the Proj_2 directory

echo "==================================="
echo "Howl2Go - Testing Quick Start"
echo "==================================="
echo ""

# Check if we're in the correct directory
if [ ! -d "Howl2Go_backend" ] || [ ! -d "Howl2Go_frontend" ]; then
    echo "Error: Please run this script from the Proj_2 directory"
    echo "   cd Proj_2 && ./start-testing.sh"
    exit 1
fi

echo "Starting Backend Server..."
cd Howl2Go_backend
gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -e "npm run dev" 2>/dev/null || \
echo "   Manual start required: cd Howl2Go_backend && npm run dev"
cd ..

sleep 2

echo "Starting Frontend Server..."
cd Howl2Go_frontend  
gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -e "npm run dev" 2>/dev/null || \
echo "   Manual start required: cd Howl2Go_frontend && npm run dev"
cd ..

echo ""
echo "Servers starting..."
echo ""
echo "Backend:  http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Manual Testing Guide: ./MANUAL_TESTING_GUIDE.md"
echo ""
echo "Run automated tests:"
echo "   cd Howl2Go_frontend && npm test"
echo ""
echo "Press Ctrl+C to stop servers when done"
