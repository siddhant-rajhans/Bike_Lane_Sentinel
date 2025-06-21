import React from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { Title, Paragraph, Card, Chip, Divider, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ViolationDetailsScreen = ({ route, navigation }) => {
  const { violation } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Violation #${violation.id}`} />
        <Appbar.Action icon="share" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>          <Card.Cover 
            source={
              typeof violation.imageUrl === 'string' && violation.imageUrl.startsWith('data:')
                ? { uri: violation.imageUrl }
                : typeof violation.imageUrl === 'string'
                  ? { uri: violation.imageUrl }
                  : violation.imageUrl
            } 
            style={styles.image}
          />
          
          <Card.Content>
            <Title style={styles.title}>Violation Details</Title>
            
            <View style={styles.chipContainer}>
              <Chip icon="calendar" style={styles.chip}>{violation.date}</Chip>
              <Chip icon="clock" style={styles.chip}>{violation.time}</Chip>
              <Chip icon="map-marker" style={styles.chip}>{violation.locationName}</Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <Title style={styles.sectionTitle}>Vehicle Information</Title>
            <View style={styles.detailRow}>
              <Paragraph style={styles.label}>Type:</Paragraph>
              <Paragraph>{violation.vehicleType}</Paragraph>
            </View>
            <View style={styles.detailRow}>
              <Paragraph style={styles.label}>License Plate:</Paragraph>
              <Paragraph>{violation.licensePlate || 'Not available'}</Paragraph>
            </View>
            
            <Divider style={styles.divider} />
            
            <Title style={styles.sectionTitle}>Location</Title>
            <Paragraph>{violation.address}</Paragraph>
            
            <Divider style={styles.divider} />
            
            <Title style={styles.sectionTitle}>Status</Title>
            <Chip 
              icon="check-circle" 
              style={[styles.statusChip, { backgroundColor: violation.status === 'Pending' ? '#FFC107' : '#4CAF50' }]}
            >
              {violation.status}
            </Chip>
            
            {violation.notes && (
              <>
                <Divider style={styles.divider} />
                <Title style={styles.sectionTitle}>Notes</Title>
                <Paragraph>{violation.notes}</Paragraph>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  image: {
    height: 200,
  },
  title: {
    fontSize: 22,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
});

export default ViolationDetailsScreen;
