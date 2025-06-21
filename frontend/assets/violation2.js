import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const violation2 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Taxi in Bike Lane</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 200,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default violation2;
