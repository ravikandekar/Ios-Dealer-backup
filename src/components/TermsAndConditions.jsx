import React from 'react';
import { View,  StyleSheet } from 'react-native';
import AppText from './AppText';
const TermsAndConditions = () => {
  return (
    <View style={styles.termsContainer}>
      <AppText style={styles.byContinuingText}>
        By continuing, you agree to our
      </AppText>
      <AppText style={styles.termsText}>
        Terms and Conditions {'  '} Privacy Policy
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  byContinuingText: {
    fontSize: 14,
    fontWeight: '500', // Slightly bold text for "By continuing"
    color: '#666', // Slightly lighter color for "By continuing"
    textAlign: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#888', // Less black for "Terms and Conditions" and "Privacy Policy"
    textAlign: 'center',
  },
});

export default TermsAndConditions;
