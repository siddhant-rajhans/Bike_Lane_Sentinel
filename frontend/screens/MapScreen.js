import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Title, Appbar, Button, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import { fetchViolations } from '../services/api';

const MapScreen = ({ navigation }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    const loadViolations = async () => {
      try {
        const data = await fetchViolations();
        setViolations(data);
        setLoading(false);
        
        // If we have violations, center the map on the first one
        if (data.length > 0) {
          setRegion({
            latitude: data[0].location.lat,
            longitude: data[0].location.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error('Error loading violation data:', error);
        setLoading(false);
      }
    };

    loadViolations();
  }, []);

  const handleMarkerPress = (violation) => {
    navigation.navigate('ViolationDetails', { violation });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {violations.map((violation) => (
            <Marker
              key={violation.id}
              coordinate={{
                latitude: violation.location.lat,
                longitude: violation.location.lng,
              }}
              title={`Violation #${violation.id}`}
              description={violation.timestamp}
              pinColor="#4CAF50"
              onPress={() => handleMarkerPress(violation)}
            />
          ))}
        </MapView>

        <FAB
          style={styles.fab}
          icon="crosshairs"
          onPress={() => {
            // In a real app, we would get the user's current location
            // and center the map on it
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default MapScreen;
