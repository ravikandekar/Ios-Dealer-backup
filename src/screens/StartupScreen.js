import React from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';

const StartupScreen = ({ isLoading, hasError, onRetry }) => {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginBottom: 15, fontSize: 16 }}>
          Failed to load app configuration. Check internet and try again.
        </Text>
        <Button title="Retry" onPress={onRetry} />
      </View>
    );
  }

  return null;
};

export default StartupScreen;
