// src/components/BackgroundWrapper.js
import React, { useContext } from 'react';
import { View, ImageBackground, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext'; // adjust path as needed
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const BackgroundWrapper = ({
  children,
  backgroundImage = null,
  overlayColor,
  overlayOpacity = 0.7,
  style = {},
}) => {
  const { theme } = useContext(AuthContext);

  const finalOverlayColor = overlayColor || theme.colors.overlay || theme.colors.background;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ImageBackground
        source={backgroundImage}
        style={[styles.background, style, { backgroundColor: theme.colors.background }]}
        imageStyle={{ opacity: overlayOpacity }}
        resizeMode="cover">
      <View style={[styles.overlay, { backgroundColor: finalOverlayColor, opacity: overlayOpacity }]} />
      {children}
    </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: wp('3%'),
    marginTop: Platform.OS === 'android' ? hp('3%') : 0, // Adjust for Android status bar
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default BackgroundWrapper;
