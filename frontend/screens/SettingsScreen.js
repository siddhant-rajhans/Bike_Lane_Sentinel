import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Switch, 
  List, 
  Divider,
  Button, 
  RadioButton, 
  TextInput,
  Appbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [radius, setRadius] = useState('1mile');
  const [email, setEmail] = useState('');
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>App Settings</Title>
        
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Enable Notifications"
            description="Get alerts about new violations in your area"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
          
          <Divider />
          
          <List.Subheader>Monitoring Area</List.Subheader>
          <RadioButton.Group onValueChange={value => setRadius(value)} value={radius}>
            <RadioButton.Item label="0.5 mile radius" value="0.5mile" />
            <RadioButton.Item label="1 mile radius" value="1mile" />
            <RadioButton.Item label="3 mile radius" value="3mile" />
            <RadioButton.Item label="All NYC" value="allCity" />
          </RadioButton.Group>
          
          <Divider />
          
          <List.Subheader>Report Delivery</List.Subheader>
          <View style={styles.inputContainer}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              keyboardType="email-address"
            />
            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.button}
            >
              Save
            </Button>
          </View>
          
          <Divider />
          
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0 (Beta)"
            left={props => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => {}}
          />
        </List.Section>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  inputContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  textInput: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
  },
});

export default SettingsScreen;
