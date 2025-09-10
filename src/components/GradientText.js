// GradientText.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import AppText from './AppText';
export const GradientText = ({ text = 'OneAuto', style = {} }) => {
  return (
    <View style={styles.container}>
      <MaskedView
        maskElement={
          <AppText style={[styles.text, style]}>
            {text}
          </AppText>
        }
      >
        <LinearGradient
          colors={['#005BE5', '#42A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <AppText style={[styles.text, style, { opacity: 0 }]}>
            {text}
          </AppText>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: '700',
    color: 'black', // Not visible due to mask
  },
});
