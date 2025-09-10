import React from 'react';
import { StatusBar } from 'react-native';
import { View,  StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AppText from '../components/AppText';
const SplashScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../public_assets/media/images/watermark.png')} // Replace with your actual logo path
        style={styles.logo}
        resizeMode="contain"
      />
   <StatusBar
         hidden={true}
        />
      {/* Welcome AppText */}
      <View style={styles.textContainer}>
      
        <AppText style={styles.brandText}>
          <AppText style={styles.brandMain}>Driven by</AppText>
          <AppText style={styles.brandHighlight}> Trust.</AppText>
        </AppText>
        <AppText style={styles.brandText}>
          <AppText style={styles.brandMain}>Powered by</AppText>
          <AppText style={styles.brandHighlight}> Bharat.</AppText>
        </AppText>

        <View style={styles.bulletList}>
          
        </View>
      </View>
      {/* Get Started Button */}
    
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#034A87',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
  },
  logo: {
    width: wp('45%'),
    height: wp('45%'),
  },
  textContainer: {
    alignItems: 'center',
    width: '60%',
  },
  welcomeText: {
    fontSize: wp('4.5%'),
    color: '#fff',
    marginBottom: hp('1%'),
    alignSelf: 'flex-start',
  },
  brandText: {
    fontSize: wp('5.5%'),
    fontWeight: '500',
    // alignSelf: 'flex-start',
  },
  brandMain: {
    color: '#fff',
  },
  brandHighlight: {
    color: '#F5A623', // Orange shade
  },
  bulletList: {
    marginTop: hp('2%'),
    alignSelf: 'flex-start',
  },
  bulletText: {
    color: '#fff',
    fontSize: wp('5%'),
    marginVertical: hp('0.3%'),
  },
  getStartedButton: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('30%'),
    marginTop: hp('8%'),
  },
  buttonText: {
    color: '#034A87',
    fontSize: wp('4.2%'),
    fontWeight: '600',
  },
  footerText: {
    color: '#fff',
    fontSize: wp('3.8%'),
    marginTop: hp('2.5%'),
  },
});