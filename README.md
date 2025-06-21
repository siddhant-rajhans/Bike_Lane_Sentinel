# Bike Lane Sentinel

## Overview
Bike Lane Sentinel is an innovative solution designed to monitor and report illegal vehicle encroachment into bike lanes across New York City. By leveraging computer vision and IoT technology, we aim to create safer streets for cyclists and improve enforcement of bike lane regulations.

## The Problem
Illegally parked vehicles in bike lanes force cyclists into traffic, creating dangerous situations and undermining cycling infrastructure. Current reporting methods are manual, time-consuming, and inefficient.

## Our Solution
Bike Lane Sentinel automates the detection and reporting process through:
- Camera-based monitoring systems at key bike lane locations
- Real-time vehicle detection using computer vision
- Automated reporting to NYC Department of Transportation (DOT)
- Data analytics dashboard for identifying violation hotspots

## Features
- **Real-time Detection**: Identifies vehicles in bike lanes using image recognition
- **Automated Reporting**: Generates violation reports with photos, timestamp, and location data
- **Alert System**: Notifies relevant authorities of persistent violations
- **Data Dashboard**: Visualizes violation patterns to inform enforcement strategies
- **Mobile Integration**: Allows cyclists to report violations through a companion app

## Technology Stack

### Computer Vision
- TensorFlow/OpenCV for vehicle detection
- Moondream inference for image analysis

### Hardware
- Raspberry Pi with camera modules
- Edge computing for real-time processing

### Backend
- Python with FastAPI
- RESTful endpoints for violation data
- WebSocket support for real-time updates

### Data Storage
- MongoDB for violation records and analytics
- Cloud storage for violation images

### Frontend Dashboard
- React.js for web dashboard
- Data visualization with D3.js/Chart.js

### Mobile App
- React Native for cross-platform mobile experience
- Features:
  - Violation feed with real-time updates
  - Map view showing violation hotspots
  - Evidence viewer with camera snapshots
  - Detailed violation information
  - Optional user reporting functionality

## Mobile Architecture
Our React Native mobile implementation provides:

- **Cross-platform compatibility** (iOS/Android)
- **Real-time violation monitoring** on the go
- **Interactive maps** showing violation patterns
- **Push notifications** for nearby or high-priority violations
- **Integration with backend API** for data synchronization

### Mobile Tech Stack
| Component | Technology |
|-----------|------------|
| Framework | React Native with Expo |
| UI Components | React Native Paper |
| Maps | react-native-maps |
| State Management | Zustand |
| API Integration | Axios |
| Notifications | expo-notifications |

## Project Status
This project is currently in development as part of the NYC Urban Tech Hackathon.

## Team Members
- [Team Member 1]


## Getting Started

### Prerequisites
- Node.js 14+
- Python 3.8+
- MongoDB
- Expo CLI (for mobile development)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/siddhant-rajhans/Bike_Lane_Sentinel.git
   cd bike-lane-sentinel
   ```
