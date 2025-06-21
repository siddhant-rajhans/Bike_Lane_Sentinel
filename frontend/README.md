# Bike Lane Sentinel - Mobile App

This is the React Native mobile app for the Bike Lane Sentinel project, created with Expo.

## Features

- **Violation Feed**: Live list of detected bike lane violations
- **Map View**: Displays violations on a map with location markers
- **Evidence Viewer**: Shows snapshots/images from the detection system
- **Violation Details**: Detailed information about each violation
- **Settings**: User preferences and notification options

## Tech Stack

- **Framework**: React Native with Expo
- **UI Components**: React Native Paper
- **Maps**: react-native-maps
- **State Management**: Zustand
- **API Integration**: Axios
- **Notifications**: expo-notifications

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Expo CLI

### Installation

1. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server
   ```bash
   npx expo start
   ```

3. Open the app on your device:
   - Scan the QR code with the Expo Go app on your iOS or Android device
   - Press 'a' to open on Android emulator
   - Press 'i' to open on iOS simulator

## Project Structure

```
/frontend
├── App.js             # Main app component
├── app.json           # Expo configuration
├── assets/            # App icons, images, and fonts
├── components/        # Reusable UI components
│   ├── Header.js
│   ├── ViolationCard.js
│   └── ...
├── screens/           # App screens
│   ├── HomeScreen.js
│   ├── MapScreen.js
│   ├── ViolationDetailsScreen.js
│   └── SettingsScreen.js
└── services/          # API and utility services
    └── api.js
```

## Development Notes

- The app currently uses mock data for the hackathon demo
- To connect to a real backend, update the API endpoints in `services/api.js`
- Add your Google Maps API key in `app.json` for full map functionality
