import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Title, Paragraph, ActivityIndicator, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViolationCard from '../components/ViolationCard';
import { fetchViolations } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadViolations = async () => {
      try {
        // For hackathon demo, we'll use mock data
        const data = await fetchViolations();
        setViolations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load violations. Please try again later.');
        setLoading(false);
      }
    };

    loadViolations();
  }, []);

  const handleViolationPress = (violation) => {
    navigation.navigate('ViolationDetails', { violation });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Bike Lane Sentinel" />
      </Appbar.Header>

      <View style={styles.contentContainer}>
        <Title style={styles.title}>Recent Violations</Title>
        
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
  title: {
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
  },
  errorText: {
    color: 'red',
  },
});

export default HomeScreen;
