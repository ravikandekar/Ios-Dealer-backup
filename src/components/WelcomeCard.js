import React from 'react';
import { View,  StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import AppText from './AppText';
import { gadiloPhone } from '../../public_assets/media';
import { useNavigation } from '@react-navigation/native'; // ← for navigation
 
const GadiloWelcomeCard = ({
        headText='Welcome to GADILO Bharat',
        subTitleText='Tap to know more about GADILO Bharat.',
        buttonText='Lets Start',
        iconName='arrow-forward',
        imageName=gadiloPhone,
        
    }) => {
       const navigation = useNavigation();
  return (
    <View style={styles.cardContainer}>
      <View style={{ flex: 1 }}>
        <AppText style={styles.welcomeText}>{headText}</AppText>
        
        <AppText style={styles.subText}>{subTitleText}</AppText>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TutorialScreen')}>
          <AppText style={styles.buttonText}>{buttonText}</AppText>
          <Icon name={iconName} style={styles.arrow} />
          {/* <Image source={require('../../public_assets/media/icons/arrow_back_24dp_BB271A_FILL0_wght400_GRAD0_opsz24.png')} /> */}
        </TouchableOpacity>
      </View>

      <Image
        // source={gadiloPhone} 
        source={imageName} 
        style={styles.phoneImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    // width: wp('90%'),
    // height: hp('14%'),
    backgroundColor: '#FBE9D1',
    borderColor: '#DE7A00',
    borderWidth: 0.5,
    borderRadius: wp('2.5%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  welcomeText: {
   
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#F79338',
    marginBottom: hp('0.5%'),
  },
  subText: {
    fontSize: wp('3.2%'),
    color: '#000',
    marginBottom: hp('1.5%'),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  buttonText: {
    fontSize: wp('4%'),
    color: '#000',
  },
  arrow: {
    fontSize: wp('5%'),
    color: '#000',
    transform: [{ scaleX: -1 }],
  },
  phoneImage: {
    position: 'absolute',
    right: wp('-2%'),
    top: hp('-2%'),
    width: wp('25%'),
    height: hp('18%'),
  },
});

export default GadiloWelcomeCard;
