import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar } from 'react-native-paper';

const ViolationCard = ({ violation, onPress }) => {
  // Handle different types of image sources
  let imageSource;
  
  if (typeof violation.imageUrl === 'string') {
    // Add timestamp to prevent caching if it doesn't already have one
    const imageUrl = violation.imageUrl.includes('?t=') 
      ? violation.imageUrl 
      : `${violation.imageUrl}?t=${Date.now()}`;
    
    imageSource = { uri: imageUrl };
  } else {
    // If it's not a string, it might be an imported asset
    imageSource = violation.imageUrl;
  }
  
  console.log('Image source:', imageSource);
    
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Cover source={imageSource} style={styles.cardImage} />
      
      <Card.Content>
        <Title style={styles.title}>
          {violation.vehicleType} in Bike Lane
        </Title>
        
        <Paragraph style={styles.location}>
          {violation.locationName}
        </Paragraph>
        
        <Paragraph style={styles.timestamp}>
          {violation.date} at {violation.time}
        </Paragraph>
        
        <Chip 
          style={[
            styles.statusChip, 
            { backgroundColor: violation.status === 'Pending' ? '#FFC107' : '#4CAF50' }
          ]} 
          mode="flat"
        >
          {violation.status}
        </Chip>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 8,
    elevation: 4,
  },
  cardImage: {
    height: 200,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  location: {
    marginVertical: 4,
  },
  timestamp: {
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
});

export default ViolationCard;
