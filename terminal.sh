#!/bin/bash

echo "🔧 Accessing Expo Container Terminal"

# Check if container is running
if ! docker compose ps expo | grep -q "Up"; then
    echo "📦 Container not running. Starting it..."
    docker compose up -d
    sleep 3
fi

echo "🚀 Entering container terminal..."
echo "💡 Once inside, run: npx expo start --tunnel --clear"
echo ""

# Attach to container with interactive terminal
docker compose exec expo bash