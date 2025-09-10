// AppText.js
import { Text, StyleSheet } from 'react-native';
import React from 'react';

export default function AppText({ children, style, ...props }) {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Outfit-Medium', // Replace with your font
    color: '#000000', // Optional: you can also enforce a default color
  },
});
