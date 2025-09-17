import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomIcon from './CustomIcon';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';

const InfoBanner = ({
  iconName = null,
  iconType = 'materailCI',
  title = 'Your Subscription is Expired.',
  subtitle = '',
  buttonText = '',
  bgColor = '#FFDADA',
  iconColor = '#242424',
  customStyle,
  onPress,
  useThemeColor = false,
  isDestructive = false,
  rightsideiconcolor,
  rightsideswitch = false, // ✅ toggle mode
  switchValue = false, // ✅ toggle state
  onSwitchChange = () => {}, // ✅ callback
  showRightSide = true, // ✅ NEW param (default true)
}) => {
  const { theme } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: bgColor }, customStyle]}
      activeOpacity={0.9}
    >
      {/* Left Icon */}
      <View style={styles.iconWrapper}>
        <CustomIcon
          iconType={iconType}
          iconName={iconName}
          size={hp('3%')}
          color={isDestructive ? '#FF2929' : iconColor}
          style={{ paddingLeft: wp('3%') }}
        />
      </View>

      {/* Title + Subtitle */}
      <View style={[styles.textWrapper, !subtitle && { justifyContent: 'center' }]}>
        <AppText
          style={[
            styles.title,
            !subtitle ? { fontSize: wp('4.5%') } : { fontSize: wp('3.3%') },
            useThemeColor && { color: isDestructive ? '#FF2929' : theme.colors.text },
          ]}
        >
          {title}
        </AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>

      {/* ✅ Right Side (conditionally visible) */}
      {showRightSide && (
        !rightsideswitch ? (
          // default button + arrow
          <View style={styles.buttonWrapper}>
            <AppText style={styles.buttonText}>{buttonText}</AppText>
            <CustomIcon
              iconType={"feather"}
              iconName={'chevron-right'}
              size={hp('3%')}
              color={isDestructive ? '#FF2929' : rightsideiconcolor}
            />
          </View>
        ) : (
          // ✅ Custom Toggle Switch with Icon
          <TouchableOpacity
            style={[styles.toggleContainer, switchValue ? styles.toggleOn : styles.toggleOff]}
            onPress={() => onSwitchChange(!switchValue)}
            activeOpacity={0.8}
          >
            <View style={[styles.toggleThumb, switchValue ? styles.thumbOn : styles.thumbOff]}>
              <CustomIcon
                iconType="feather"
                iconName={switchValue ? 'moon' : 'sun'} // 🌙 or ☀️
                size={hp('2.5%')}
                color={theme.colors.Highlighterwords} // theme highlight color
              />
            </View>
          </TouchableOpacity>
        )
      )}
    </TouchableOpacity>
  );
};

export default InfoBanner;

const styles = StyleSheet.create({
  container: {
    borderRadius: wp('1.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: hp('1.4%'),
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: hp('1.2%'),
    fontWeight: '400',
    color: '#000000',
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp('0%'),
  },
  buttonText: {
    color: '#055597',
    fontSize: hp('2.2%'),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ✅ Custom Toggle Styles
  toggleContainer: {
    width: wp('16%'),
    height: hp('4%'),
    borderRadius: hp('2%'),
    justifyContent: 'center',
    padding: 2,
  },
  toggleOn: {
    backgroundColor: '#333', // dark background
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#ddd', // light background
    alignItems: 'flex-start',
  },
  toggleThumb: {
    width: hp('3%'),
    height: hp('3%'),
    borderRadius: hp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbOn: {
    backgroundColor: '#555',
  },
  thumbOff: {
    backgroundColor: '#fff',
  },
});
