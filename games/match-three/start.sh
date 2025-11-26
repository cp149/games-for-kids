#!/bin/bash
# Quick start script for Match Three game

echo "Starting Match Three Game..."
echo ""
echo "Opening in browser: http://localhost:8000/games/match-three/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try python3 first
if command -v python3 &> /dev/null; then
    cd /home/wxcd/mgame
    python3 -m http.server 8000
# Fall back to python
elif command -v python &> /dev/null; then
    cd /home/wxcd/mgame
    python -m http.server 8000
# Try node http-server
elif command -v npx &> /dev/null; then
    cd /home/wxcd/mgame
    npx http-server -p 8000
else
    echo "Error: No suitable web server found"
    echo "Please install Python 3 or Node.js"
    exit 1
fi
