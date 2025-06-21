import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const violation1 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vehicle in Bike Lane</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 200,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default violation1;
