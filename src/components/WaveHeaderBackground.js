import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const WaveHeaderBackground = () => {
  return (
    <View style={styles.container}>
      {/* Bottom Darker Blue Wave */}
      <Svg
        width={width}
        height={270} // Increased height
        viewBox="-25 5 420 190"
        fill="none"
        style={styles.bottomWave}
      >
        <Path
          d="M402 0H0V160.5C0 160.5 91 215.453 199.5 136.5C308 57.5469 402 86 402 86V0Z"
          fill="#A3D2FF"
        />
      </Svg>

      {/* Top Light Blue Wave */}
      <Svg
        width={width}
        height={270} // Increased height
        viewBox="0 0 380 190"
        fill="none"
        style={styles.topWave}
      >
        <Path
          d="M402 0H0V163C0 163 89.5 210.5 202 126.5C314.5 42.5 402 67.5 402 67.5V0Z"
          fill="#E6F2FE"
        />
      </Svg>

      <Svg width={width} height={200} viewBox={`0 0 ${width} 200`} fill="none" style={{ position: 'relative', bottom: 4 }}>
        <Rect width={width} height={50} fill="#E6F2FE" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220, // Increase this to show more of both waves
    position: 'relative',
  },
  topWave: {
    position: 'absolute',
    top: 0,
  },
  bottomWave: {
    position: 'absolute',
    top: 20, // Slight offset to show layering
  },
});

export default WaveHeaderBackground;