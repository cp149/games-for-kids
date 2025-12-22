#!/bin/bash
# Test runner for Path Race ACO algorithm

echo "🧪 Path Race - ACO Algorithm Test Suite"
echo "========================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install
    echo ""
fi

# Run tests
echo "🚀 Running tests..."
echo ""
npm test

echo ""
echo "✅ Test run complete!"
