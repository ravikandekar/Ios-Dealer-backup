import React from 'react';
import { StatusBar } from 'react-native';
import { View,  StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AppText from '../components/AppText';
const WelcomeLoginScreen = ({ navigation }) => {
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
        <AppText style={styles.welcomeText}>Welcome to</AppText>
        <AppText style={styles.brandText}>
          <AppText style={styles.brandMain}>GADILO</AppText>
          <AppText style={styles.brandHighlight}> Bharat</AppText>
        </AppText>

        <View style={styles.bulletList}>
          <AppText style={styles.bulletText}>• List</AppText>
          <AppText style={styles.bulletText}>• Sell</AppText>
          <AppText style={styles.bulletText}>• Grow</AppText>
        </View>
      </View>
      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={() => navigation.navigate('LoginScreen')}>
        <AppText style={styles.buttonText}>Get Started</AppText>
      </TouchableOpacity>
      {/* Footer AppText */}
      <AppText style={styles.footerText}>
        Your next vehicle is just a tap away
      </AppText>
    </View>
  );
};

export default WelcomeLoginScreen;

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
    marginBottom: hp('4%'),
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
    fontSize: wp('6%'),
    fontWeight: 'bold',
    alignSelf: 'flex-start',
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
