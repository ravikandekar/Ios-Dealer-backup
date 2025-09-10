import React from 'react';
import { View,  StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../components/AppText';
const WelcomeRegistrationScreen = () => {
  const navigation = useNavigation();

  const handleCompleteRegistration = () => {
    navigation.navigate('RegistrationScreen'); // replace with your route name
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <StatusBar
          hidden={true}
        />
      </View>

      <View style={styles.container}>
        <AppText style={styles.welcomeText}>Welcome to</AppText>

        <AppText style={styles.brandText}>
          <AppText style={styles.gadiloText}>GADILO </AppText>
          <AppText style={styles.bharatText}>Bharat</AppText>
        </AppText>

        <AppText style={styles.messageText}>
          We are excited to have you with us as partner. Soon you'll have the
          access to list your product on our platform
        </AppText>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCompleteRegistration}
          activeOpacity={0.8}>
          <AppText style={styles.buttonText}>
            Complete your Registration Now
          </AppText>
          <Icon name="arrow-forward-ios" size={16} color="#055597" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeRegistrationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#055597',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
  },
  welcomeText: {
    color: 'white',
    fontSize: wp('5%'),
    marginBottom: hp('1%'),
    fontWeight: '400',
  },
  brandText: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    marginBottom: hp('3%'),
  },
  gadiloText: {
    color: 'white',
  },
  bharatText: {
    color: '#F7941D',
  },
  messageText: {
    color: 'white',
    fontSize: wp('4%'),
    textAlign: 'center',
    marginBottom: hp('6%'),
    lineHeight: hp('2.8%'),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('2%'),
    elevation: 2,
  },
  buttonText: {
    color: '#055597',
    fontSize: wp('4%'),
    fontWeight: '600',
    marginRight: wp('2%'),
  },
});
