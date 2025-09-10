import React from 'react';
import { Platform, View, StatusBar, StyleSheet } from 'react-native';

const CustomStatusBar = ({ backgroundColor, barStyle }) => {
  return (
    <>
      {/* Fake status bar background for iOS only */}
      {Platform.OS === 'ios' && (
        <View style={[styles.statusBarIOS, { backgroundColor }]} />
      )}

      {/* Native StatusBar - actual content control */}
      <StatusBar
        barStyle={barStyle || 'light-content'}
        translucent
        backgroundColor="#E6F2FE" // ignored on iOS
      />
    </>
  );
};

const styles = StyleSheet.create({
  statusBarIOS: {
    height: '10%', // Default height for iOS notch area
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 999,
  },
});

export default CustomStatusBar;
