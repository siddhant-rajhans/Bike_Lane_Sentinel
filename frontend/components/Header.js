import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Title } from 'react-native-paper';

const Header = ({ title, showBack = false, navigation, rightIcon, onRightIconPress }) => {
  return (
    <Appbar.Header style={styles.header}>
      {showBack && (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}
      <Appbar.Content title={title} />
      {rightIcon && (
        <Appbar.Action icon={rightIcon} onPress={onRightIconPress} />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4CAF50',
  },
});

export default Header;
