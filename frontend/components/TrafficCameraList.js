import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Text } from 'react-native-paper';
import { fetchTrafficCameras, fetchCameraFeed } from '../services/api';

const TrafficCameraList = ({ onCameraSelect }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [cameraFeed, setCameraFeed] = useState(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const refreshIntervalRef = useRef(null);

  // Load all traffic cameras near bike lanes
  const loadCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const camerasData = await fetchTrafficCameras(true); // Only get cameras near bike lanes
      
      // Add timestamp to image URLs to prevent caching issues
      const camerasWithTimestamp = camerasData.map(camera => ({
        ...camera,
        imageUrl: camera.imageUrl ? `${camera.imageUrl}${camera.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : null
      }));
      
      setCameras(camerasWithTimestamp);
      console.log('Cameras loaded:', camerasWithTimestamp.length);
      
      // If there are cameras, select the first one and show its feed
      if (camerasWithTimestamp && camerasWithTimestamp.length > 0) {
        handleCameraSelect(camerasWithTimestamp[0]);
      }
    } catch (err) {
      console.error('Failed to load traffic cameras:', err);
      setError('Failed to load traffic cameras. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refreshing the camera list
  const onRefresh = () => {
    setRefreshing(true);
    loadCameras();
  };

  // Load the feed for a selected camera
  const handleCameraSelect = async (camera) => {
    try {
      setSelectedCamera(camera);
      setFeedLoading(true);
      
      const feed = await fetchCameraFeed(camera.id);
      
      // Add timestamp to image URL to prevent caching
      if (feed && feed.imageUrl) {
        feed.imageUrl = `${feed.imageUrl}${feed.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        console.log('Camera feed loaded with URL:', feed.imageUrl);
      } else {
        console.log('No image URL in feed, falling back to camera imageUrl:', camera.imageUrl);
      }
      
      setCameraFeed(feed);
      
      // Notify parent component if provided
      if (onCameraSelect) {
        onCameraSelect(camera, feed);
      }

      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up auto-refresh for camera feed every 2 seconds
      refreshIntervalRef.current = setInterval(async () => {
        try {
          const updatedFeed = await fetchCameraFeed(camera.id);
          
          // Add timestamp to image URL to prevent caching
          if (updatedFeed && updatedFeed.imageUrl) {
            updatedFeed.imageUrl = `${updatedFeed.imageUrl}${updatedFeed.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
          }
          
          setCameraFeed(updatedFeed);
          
          // Update the parent component if needed
          if (onCameraSelect) {
            onCameraSelect(camera, updatedFeed);
          }
        } catch (err) {
          console.error(`Auto-refresh failed for camera ${camera.id}:`, err);
        }
      }, 2000); // Update every 2 seconds
      
    } catch (err) {
      console.error(`Failed to load camera feed for ${camera.id}:`, err);
      setError(`Failed to load camera feed for ${camera.name}.`);
    } finally {
      setFeedLoading(false);
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadCameras();
  }, []);

  // Render a camera item
  const renderCameraItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCameraSelect(item)}>
      <Card 
        style={[styles.cameraCard, selectedCamera?.id === item.id && styles.selectedCard]}
      >
        <Card.Content>
          <Title style={styles.cameraTitle}>{item.name}</Title>
          <Paragraph>{item.area}</Paragraph>
          <View style={styles.statusIndicator}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: item.status === 'online' ? '#4CAF50' : '#F44336' }
              ]} 
            />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cameraListContainer}>
        <Title style={styles.sectionTitle}>Traffic Cameras</Title>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={loadCameras} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : (
          <FlatList
            data={cameras}
            renderItem={renderCameraItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
      
      {selectedCamera && (
        <View style={styles.cameraFeedContainer}>
          <Title style={styles.feedTitle}>{selectedCamera.name} Feed</Title>
          
          {feedLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : !cameraFeed ? (
            <Text>No feed available</Text>
          ) : (
            <View>
              <Image
                source={{ 
                  uri: cameraFeed?.imageUrl || selectedCamera?.imageUrl || '',
                  cache: 'reload'
                }}
                style={styles.cameraFeed}
                resizeMode="cover"
                onLoadStart={() => console.log("Image loading started:", cameraFeed?.imageUrl || selectedCamera?.imageUrl)}
                onLoad={() => console.log("Image loaded successfully")}
                onError={(e) => {
                  console.error("Image loading error:", e.nativeEvent.error);
                  console.error("Attempted image URL:", cameraFeed?.imageUrl || selectedCamera?.imageUrl);
                }}
              />
              {cameraFeed?.isFallback && (
                <View style={styles.fallbackBadge}>
                  <Text style={styles.fallbackText}>Using Demo Image</Text>
                </View>
              )}
              <Text style={styles.timestamp}>
                Last updated: {new Date(cameraFeed.timestamp).toLocaleString()}
              </Text>
              <Button 
                mode="contained" 
                style={styles.reportButton}
                onPress={() => {
                  if (onCameraSelect) {
                    onCameraSelect(selectedCamera, cameraFeed);
                  }
                }}
              >
                Check for Violations
              </Button>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraListContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 8,
  },
  cameraCard: {
    marginHorizontal: 8,
    width: 180,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  cameraTitle: {
    fontSize: 14,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
  },
  fallbackBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  fallbackText: {
    color: 'white',
    fontSize: 12,
  },
  cameraFeedContainer: {
    flex: 1,
    padding: 16,
  },
  feedTitle: {
    marginBottom: 16,
  },
  cameraFeed: {
    width: '100%',
    height: 240,
    borderRadius: 8,
  },
  timestamp: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
  },
  reportButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
});

export default TrafficCameraList;
