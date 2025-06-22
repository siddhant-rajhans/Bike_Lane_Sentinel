#!/bin/bash
# Test script for Bike Lane Sentinel camera reporting flow

echo "🔍 Testing Bike Lane Sentinel Camera Reporting Flow 🔍"

# Version check function
get_expo_camera_version() {
    cd frontend && npm list expo-camera | grep expo-camera | awk '{print $2}' | sed 's/[^0-9\.]//g'
}

echo "Checking Expo Camera version..."
CAMERA_VERSION=$(get_expo_camera_version)
echo "Found expo-camera version: $CAMERA_VERSION"

# Check if backend is running
if nc -z localhost 3000; then
  echo "✅ Backend server is running"
else
  echo "❌ Backend server is not running on port 3000"
  echo "Please start the backend server first:"
  echo "cd backend && npm start"
  exit 1
fi

# Check if required packages are installed
echo "Checking required packages..."

# Check for expo-camera
if cd frontend && npm list expo-camera | grep -q "expo-camera"; then
  echo "✅ expo-camera is installed"
else
  echo "❌ expo-camera is not installed"
  echo "Installing expo-camera..."
  cd frontend && npm install expo-camera
fi

# Check for expo-location
if cd frontend && npm list expo-location | grep -q "expo-location"; then
  echo "✅ expo-location is installed"
else
  echo "❌ expo-location is not installed"
  echo "Installing expo-location..."
  cd frontend && npm install expo-location
fi

echo ""
echo "🚲 Camera Reporting Flow Test Instructions 🚲"
echo "1. Open the app on your device"
echo "2. Tap on the 'Report' button in the header or the floating action button"
echo "3. Select 'Take Photo'"
echo "4. Allow camera permissions if prompted"
echo "5. Take a photo of a vehicle in a bike lane"
echo "6. The app should analyze the image and show detection results"
echo "7. If a violation is detected, the app will navigate back to the home screen"
echo "8. The violation should appear in the list with a success notification"
echo ""
echo "✅ Test complete. Follow the instructions above to manually verify the camera reporting flow."
