# Bike Lane Sentinel - Quick Start Guide

This guide covers how to run the Bike Lane Sentinel application for the hackathon.

## Prerequisites

- Node.js 14+ installed
- Expo CLI (for mobile app): `npm install -g expo-cli`
- A Moondream API key (sign up at [moondream.ai](https://moondream.ai))

## Running the Application

### Option 1: Using the Start Script (Recommended)

We've created a helper script to set up and run both backend and frontend:

```bash
# Make the script executable (if not already)
chmod +x start-hackathon.sh

# Run the script
./start-hackathon.sh
```

The script will:
1. Check if `.env` exists in the backend folder and create it from `env.example` if needed
2. Setup the frontend `.env` file with your local IP address automatically
3. Install dependencies if needed
4. Build the backend TypeScript files
5. Start both backend and frontend in separate terminal windows

**The script automatically configures network connectivity between your backend and mobile app by detecting your local IP address.**

### Option 2: Manual Setup

If you prefer to run each component separately:

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Copy example env file and update with your Moondream API key
cp env.example .env
# Edit .env and add your MOONDREAM_API_KEY

# Install dependencies
npm install

# Build TypeScript files
npm run build

# Run the server
npm start
```

The backend API will be available at http://localhost:3000/api

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Create a .env file with your computer's local IP address
# Replace 192.168.1.10 with your actual local IP address
echo "EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api" > .env

# Install dependencies
npm install

# Start the Expo development server
npm start
```

Follow the instructions in the terminal to run on your device or simulator.

**IMPORTANT**: You need to use your computer's actual local IP address (not localhost) for the mobile app to connect to your backend. You can find your IP address by running `ifconfig` on Mac/Linux or `ipconfig` on Windows.

## Using the Application

1. Once both servers are running, you'll be able to:
   - View the live NYC traffic camera feeds in the app
   - Analyze camera frames for bike lane violations
   - View violation reports
   - Select different cameras to monitor
   - Report violations using your device's camera

2. The camera feed will refresh every 2 seconds to show near real-time footage.

3. To report a new violation:
   - Tap the "Report" button in the header or the floating action button
   - Select "Take Photo" to use your device's camera
   - The app will automatically analyze the photo to detect vehicles in bike lanes
   - If a violation is found, you can submit the report which will appear in your violations list

4. If you encounter any network errors, the application will fall back to using demo data.

## Fallback Mode & Demo Features

The app has been specially designed for hackathon demonstrations with a robust fallback system:

- If the backend server is unreachable, the app will automatically switch to using static demo data
- If the NYC DOT camera API is unavailable, the backend will use stored camera sample data
- All core app features will continue to work even without network connectivity

This allows you to reliably demonstrate the app concept even in environments with limited connectivity.

## Troubleshooting

- **"Network Error" messages**: Check that your frontend `.env` file has the correct IP address
- **Backend Connection Issues**: Make sure the backend server is running on port 3000
- **API Errors**: Check that your Moondream API key is valid in the `.env` file
- **Camera Feed Not Showing**: The NYC DOT API may be unavailable - the app will fall back to static data
- **Expo Connection Issues**: Make sure your phone/emulator is on the same network as your development machine
- **Camera Permission Denied**: Go to your device settings to grant the app camera permission
- **Camera Not Working**: If you see "Cannot read property 'back' of undefined" error, restart the app
- **Location Services**: For precise violation reporting, enable location services on your device

## Technology Used

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React Native, Expo
- **Computer Vision**: Moondream.ai for violation detection
- **Data Source**: NYC DOT Traffic Camera API
- **Hardware Access**: Expo Camera and Location APIs for violation reporting
