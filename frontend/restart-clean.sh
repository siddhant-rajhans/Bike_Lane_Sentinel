#!/bin/bash
# Script to restart Expo with a clean cache

echo "🧹 Cleaning Expo cache and restarting 🧹"

# Navigate to the frontend directory
cd "$(dirname "$0")"

# Clear cache directories
echo "Clearing Expo cache..."
rm -rf node_modules/.cache/
rm -rf .expo/

# Start Expo with a clean cache
echo "Starting Expo with clean cache..."
npx expo start --clear

echo "✅ Done!"
