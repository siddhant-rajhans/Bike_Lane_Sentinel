import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Title, Paragraph, ActivityIndicator, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ViolationCard from '../components/ViolationCard';
import { fetchViolations, reportViolation } from '../services/api';

const HomeScreen = ({ navigation, route }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Function to load violations
  const loadViolations = async () => {
    try {
      setLoading(true);
      const data = await fetchViolations();
      setViolations(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load violations. Please try again later.');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadViolations();
  }, []);
  
  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Check if returning from a successful report
      if (route.params?.reportSuccess) {
        setSnackbarMessage('Violation reported successfully!');
        setSnackbarVisible(true);
        loadViolations(); // Reload violations to include the new one
        
        // Clear the params to prevent showing the message again
        navigation.setParams({ reportSuccess: undefined, violationId: undefined });
      }
      return () => {};
    }, [route.params])
  );

  const handleViolationPress = (violation) => {
    navigation.navigate('ViolationDetails', { violation });
  };
  
  // Function to handle the report button press
  const handleReportPress = () => {
    // We'll use launchCamera function in a real app
    // For the hackathon demo, let's show an alert with options
    Alert.alert(
      'Report Violation',
      'How would you like to report a bike lane violation?', 
      [
        {
          text: 'Take Photo',
          onPress: () => {
            // Navigate to our camera screen
            navigation.navigate('ReportCamera');
          }
        },
        {
          text: 'Select from Camera Feed',
          onPress: () => navigation.navigate('Map') // Navigate to the camera selection screen
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Title style={styles.title}>Recent Violations</Title>
          <Button 
            mode="contained" 
            icon="camera" 
            onPress={handleReportPress}
            style={styles.reportButton}
          >
            Report
          </Button>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : error ? (
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        ) : (
          <FlatList
            data={violations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ViolationCard 
                violation={item} 
                onPress={() => handleViolationPress(item)} 
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
      
      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  errorText: {
    color: 'red',
  },
});

export default HomeScreen;
