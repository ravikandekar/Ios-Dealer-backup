

import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
const ActionButton = ({ label, onPress, style, textcolor, disabled, isLoading = false }) => {
  const { theme } = useContext(AuthContext);

  const backgroundColor = disabled || isLoading
    ? theme.colors.btnDisabled || '#ccc'
    : theme.colors.btn || '#FF7300';

  const textColor = disabled || isLoading
    ? theme.colors.disabledText || '#888'
    : textcolor || '#fff';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          shadowColor: disabled ? 'transparent' : backgroundColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.Highlighterwords || '#FF7300'} />
      ) : (
        <AppText style={[styles.text, { color: textColor }]}>
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('3%'),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: wp('4.6%'),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ActionButton;
