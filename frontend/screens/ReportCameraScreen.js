import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
// Import directly from expo-camera
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, ActivityIndicator, Banner } from 'react-native-paper';
import { reportViolation } from '../services/api';

// Define camera type constants for the specific version of Expo we're using
const CAMERA_TYPE_BACK = 'back';
const CAMERA_TYPE_FRONT = 'front';

const ReportCameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CAMERA_TYPE_BACK);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        // Request camera permissions
        try {
          const { status } = await Camera.requestCameraPermissionsAsync();
          console.log('Camera permissions granted:', status === 'granted');
          setHasPermission(status === 'granted');
        } catch (cameraErr) {
          console.error('Error requesting camera permissions:', cameraErr);
          setHasPermission(false);
        }
        // Request location permissions
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(locationStatus === 'granted');
        
        // If location permission is granted, get the current location
        if (locationStatus === 'granted') {
          try {
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setLocation(currentLocation.coords);
          } catch (locationErr) {
            setLocationError('Could not get your location. Reports will still work without location data.');
            console.error('Error getting location:', locationErr);
          }
        }
      } catch (err) {
        console.error('Error in permission setup:', err);
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setLoading(true);
      // Take the photo with higher quality
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false, // We'll use the URI instead
        exif: true,
        skipProcessing: false
      });
      
      // Process the captured image
      console.log('Photo captured successfully');
      
      // Inform user we're analyzing the image
      Alert.alert(
        'Analyzing image...',
        'Looking for vehicles in bike lanes',
        [{ text: 'OK' }]
      );
      
      try {
        // Prepare the request with image and location if available
        const reportData = { 
          image: { uri: photo.uri }
        };
        
        // Add location data if available
        if (location) {
          reportData.location = {
            lat: location.latitude,
            lng: location.longitude
          };
        }
        
        // Call the API with the image and location data
        const response = await reportViolation(reportData);
        
        setLoading(false);
        
        // Check if a violation was detected
        if (response.success && response.data && response.data.hasCarsInBikeLane) {
          Alert.alert(
            'Violation Detected',
            `${response.data.vehicleType || 'Vehicle'} detected in bike lane. Report has been submitted.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to home screen with success message and violation ID
                  navigation.navigate('Main', {
                    screen: 'Home',
                    params: { 
                      reportSuccess: true, 
                      violationId: response.data.violationId 
                    }
                  });
                }
              }
            ]
          );
        } else {
          // No violation was detected
          Alert.alert(
            'No Violation Detected',
            'No vehicles were detected in the bike lane.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error reporting violation:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to report violation. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {locationError && (
        <Banner
          visible={true}
          icon="map-marker-off"
          actions={[
            {
              label: 'OK',
              onPress: () => setLocationError(null),
            },
          ]}
        >
          {locationError}
        </Banner>
      )}
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Close button */}
          <IconButton
            icon="close"
            size={30}
            color="white"
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          />
          
          {/* Capture button */}
          <View style={styles.controlsContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={handleCapture}
                activeOpacity={0.6}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Flip camera button */}
          <IconButton
            icon="camera-flip"
            size={30}
            color="white"
            style={styles.flipButton}
            onPress={() => {
              setType(currentType => 
                currentType === CAMERA_TYPE_BACK ? CAMERA_TYPE_FRONT : CAMERA_TYPE_BACK
              );
            }}
          />
        </View>
      </Camera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  flipButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
});

export default ReportCameraScreen;
