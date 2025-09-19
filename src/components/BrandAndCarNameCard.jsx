import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AppText from './AppText';
const BrandAndCarNameCard = ({ item, isSelected, onPress, theme }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        isSelected
          ? {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary,
              borderWidth: 1.5,
            }
          : {
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
               borderColor: theme.colors.cardborder,
              borderWidth: 0.5,
            },
      ]}
    >
      <AppText
        numberOfLines={3}
        ellipsizeMode="tail"
        style={[
          styles.cardText,
          {
            color: isSelected ? theme.colors.primary : theme.colors.text,
          },
        ]}
      >
        {item}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: wp('21%'),
    height: hp('9%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hp('0.5%'),
    elevation: 2,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    margin: hp('0.6%')
    
  },
  cardText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BrandAndCarNameCard;
