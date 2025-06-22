#!/bin/bash
# Script to clear React Native and Expo caches for Bike Lane Sentinel

echo "🧹 Clearing React Native and Expo caches 🧹"

# Navigate to the frontend directory
cd frontend

# Clear React Native caches
echo "Clearing React Native caches..."
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
watchman watch-del-all

# Clear Expo caches
echo "Clearing Expo caches..."
rm -rf node_modules/.cache/babel-loader
rm -rf .expo
rm -rf .rn_temp

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear derived data (for iOS)
echo "Clearing iOS derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "✅ Cache cleared"
echo "🔄 Now reinstalling dependencies..."

# Reinstall dependencies
npm install

echo "✅ Done! Now restart the Expo server with:"
echo "cd frontend && npm start"
