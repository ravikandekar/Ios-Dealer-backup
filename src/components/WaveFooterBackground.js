// components/WaveFooterBackground.js

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const WaveFooterBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Back Darker Blue Wave */}
      <Svg
        width={width}
        height={65}
        viewBox="0 0 402 65"
        fill="none"
        style={styles.backWave}
      >
        <Path
          d="M0 64.5898H402V23.296C402 23.296 338.008 -8.69995 169.004 27.9449C0 64.5898 0 0.598007 0 0.598007V64.5898Z"
          fill="#A2D2FF"
        />
      </Svg>

      {/* Front Light Blue Wave */}
      <Svg
        width={width}
        height={72}
        viewBox="0 0 402 72"
        fill="none"
        style={styles.frontWave}
      >
        <Path
          d="M0 71.4922H402V25.0565C402 25.0565 374.927 -33.2466 207.016 28.0106C39.1061 89.2677 0 20.0799 0 20.0799V71.4922Z"
          fill="#E6F2FE"
        />
      </Svg>

      {/* Overlay content (like footer text) */}
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  backWave: {
    position: 'absolute',
    bottom: 0,
  },
  frontWave: {
    position: 'absolute',
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    bottom:18,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default WaveFooterBackground;
