import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { reportViolation } from '../services/api';

const ReportCameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef(null);
  
  // Request camera and location permissions
  useEffect(() => {
    (async () => {
      try {
        // Request camera permission
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(cameraStatus === 'granted');
        
        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Camera permission required', 
            'Please grant camera permissions to report violations.'
          );
        }
        
        // Request location permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (locationStatus === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude
          });
        }
      } catch (err) {
        console.error('Error requesting permissions:', err);
        Alert.alert('Error', 'Could not access camera or location. Please check your permissions.');
      }
    })();
  }, []);

  // Toggle between front and back camera
  const toggleCameraType = () => {
    setType(type === CameraType.back ? CameraType.front : CameraType.back);
  };
  
  // Take a photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          exif: true,
          skipProcessing: false
        });
        
        setPhoto(photo.uri);
        console.log('Photo taken:', photo.uri);
      } catch (err) {
        console.error('Error taking picture:', err);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };
  
  // Submit the violation report
  const submitReport = async () => {
    if (!photo) {
      Alert.alert('Error', 'No photo taken. Please take a photo first.');
      return;
    }
    
    setAnalyzing(true);
    
    // Simulate analysis progress for UX feedback
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 0.9) {
          clearInterval(progressInterval);
          return 0.9;
        }
        return prev + 0.1;
      });
    }, 500);
    
    try {
      // Create a form data object to submit
      const violationData = {
        image: {
          uri: photo,
          type: 'image/jpeg',
          name: 'violation.jpg'
        }
      };
      
      if (location) {
        violationData.location = location;
      }
      
      // Send to backend API
      const result = await reportViolation(violationData);
      
      clearInterval(progressInterval);
      setProgress(1);
      
      if (result && result.success) {
        // Check if a violation was actually detected
        if (result.data && result.data.hasCarsInBikeLane) {
          Alert.alert(
            'Violation Detected', 
            `${result.data.vehicleType || 'Vehicle'} detected in bike lane. Report submitted successfully!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          // No violation detected
          Alert.alert(
            'No Violation Detected', 
            'Our AI did not detect any vehicles in the bike lane. Please try again with a clearer photo.',
            [{ text: 'OK', onPress: () => setAnalyzing(false) }]
          );
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('Error submitting report:', err);
      
      Alert.alert(
        'Error', 
        'Failed to submit report. Please try again.',
        [{ text: 'OK', onPress: () => setAnalyzing(false) }]
      );
    }
  };
  
  // Reset and take another photo
  const retakePhoto = () => {
    setPhoto(null);
  };

  // If permissions haven't been determined yet, show a loading indicator
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Report Violation" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.text}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // If permissions denied, show an error message
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Report Violation" />
        </Appbar.Header>
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>No access to camera</Text>
          <Text style={styles.text}>
            Please grant camera permissions in your device settings to report violations.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={photo ? 'Review Photo' : 'Take Photo'} />
      </Appbar.Header>
      
      <View style={styles.contentContainer}>
        {analyzing ? (
          <View style={styles.analyzingContainer}>
            <Text style={styles.analyzingText}>Analyzing image...</Text>
            <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />
            <Text style={styles.text}>
              Using AI to detect bike lane violations...
            </Text>
          </View>
        ) : photo ? (
          // Photo review mode
          <View style={styles.reviewContainer}>
            <Image source={{ uri: photo }} style={styles.preview} />
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={retakePhoto}
                style={styles.button}
              >
                Retake
              </Button>
              <Button 
                mode="contained" 
                onPress={submitReport}
                style={styles.button}
              >
                Report Violation
              </Button>
            </View>
          </View>
        ) : (
          // Camera view mode
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              type={type}
              ref={cameraRef}
            >
              <View style={styles.cameraControlsContainer}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraType}
                >
                  <Text style={styles.flipText}>Flip</Text>
                </TouchableOpacity>
              </View>
            </Camera>
            
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              />
            </View>
            
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                Position camera to show vehicle in bike lane
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  camera: {
    flex: 1,
  },
  cameraControlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginRight: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
    borderRadius: 5,
  },
  flipText: {
    color: 'white',
    fontSize: 16,
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#4CAF50',
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
  },
  reviewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  preview: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    margin: 10,
    paddingHorizontal: 10,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBar: {
    width: '80%',
    height: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  errorText: {
    fontSize: 20,
    color: '#F44336',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ReportCameraScreen;
