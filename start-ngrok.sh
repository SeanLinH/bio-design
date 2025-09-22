#!/bin/bash

# Script to start frontend for ngrok deployment
# This ensures proper host binding for ngrok accessibility

echo "🚀 Starting AI Agent Frontend for ngrok..."

# Ensure we're in the frontend directory
cd "$(dirname "$0")"

# Set environment variables for ngrok compatibility
export HOST=0.0.0.0
export PORT=3002
export REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
export REACT_APP_ENVIRONMENT=ngrok

echo "📝 Configuration:"
echo "  HOST: $HOST"
echo "  PORT: $PORT"
echo "  API URL: $REACT_APP_API_BASE_URL"

# Copy ngrok environment file
cp .env.ngrok .env

echo "✅ Starting React development server..."
echo "📌 Make sure your backend is running on localhost:8080"
echo "📌 ngrok command: ngrok http 3002"
echo ""

# Start the development server
npm start