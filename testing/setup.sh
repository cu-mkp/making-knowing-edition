#!/bin/bash

# Setup script for image testing dependencies
# This script installs Playwright and its browser dependencies

echo "🔧 Setting up image testing dependencies..."

# Create dependencies directory if it doesn't exist
if [ ! -d "../dependencies" ]; then
    echo "📁 Creating dependencies directory..."
    mkdir -p ../dependencies
fi

# Check if package.json exists in dependencies
if [ ! -f "../dependencies/package.json" ]; then
    echo "❌ dependencies/package.json not found!"
    echo "Please ensure the dependencies directory is properly set up."
    exit 1
fi

# Navigate to dependencies directory
cd ../dependencies

echo "📦 Installing Playwright..."
npm install

echo "🌐 Installing browser dependencies..."
npx playwright install

echo "✅ Setup complete!"
echo ""
echo "You can now run image tests from the testing directory:"
echo "  cd ../testing"
echo "  node test-images-standalone.js"
echo ""
echo "For a quick test without browser dependencies:"
echo "  node test-images-simple.js"