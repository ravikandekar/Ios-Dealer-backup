import { StyleSheet, Text, useColorScheme, View, Button, Switch } from 'react-native';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
const LoginExtra = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useContext(AuthContext);


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Login Screen</Text>

      {/* Theme toggle switch */}
      <View style={styles.toggleRow}>
        <Text style={{ color: theme.colors.text, marginRight: 10 }}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDark ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={isDark} 
        />
      </View>
      <Icon name="home" size={30} color="red" />
      <Button
        title="Login"
        onPress={() => navigation.navigate('InAppPurchase')}
        color={theme.colors.primary}
      />
      <Button
        title="IOS"
        onPress={() => navigation.navigate('SubscriptionScreenIOS')}
        color={theme.colors.primary}
      />
    </View>
  );
};

export default LoginExtra;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 22,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
});

