import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AppText from '../components/AppText';
import WaveFooterBackground from '../components/WaveFooterBackground';
import WaveHeaderBackground from '../components/WaveHeaderBackground';
import { AuthContext } from '../context/AuthContext';
import ActionButton from '../components/ActionButton';
import { logo } from '../../public_assets/media';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showToast } from '../utils/toastService';
import apiClient from '../utils/apiClient';
import CustomStatusBar from '../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const { theme, isDark } = useContext(AuthContext);
  const [isChecked, setIsChecked] = useState(false);
  const [isloading, setisloading] = useState(false);

  const fetchCMSContentAndNavigate = async (type) => {
    try {
      const endpoint =
        type === 'terms'
          ? '/api/cms/dealertcRoutes/get_termsandconditions_by_dealer'
          : '/api/cms/dealerPrivacyPolicyRoutes/get_privacypolicies_by_dealer';

      const response = await apiClient.get(endpoint);
      const data = response?.data?.data;

      if (data) {
        navigation.navigate('CMSWebViewScreen', {
          title: data.title,
          htmlContent: data.description,
        });
      } else {
        showToast('error', '', `No ${type === 'terms' ? 'Terms' : 'Privacy'} content found.`);
      }
    } catch (error) {
      showToast('error', '', `Failed to load ${type === 'terms' ? 'Terms' : 'Privacy Policy'}.`);
    }
  };

const handleLogin = async () => {
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    showToast('error', '', 'Enter a valid 10-digit mobile number.');
    return;
  }

  if (!isChecked) {
    showToast('error', '', 'Please accept Terms and Conditions to continue.');
    return;
  }

  try {
    setisloading(true);
    const response = await apiClient.post('/api/dealer/auth/request-otp', {
      phone: mobile,
    });

    const {  appCode, message, data } = response.data;
    
    if ( appCode === 1000) {
      // ✅ OTP success
      const otpMatch = data?.message?.match(/\d{4,6}/);
      const otp = otpMatch ? otpMatch[0] : null;
      console.log('OTP:', otp);
      showToast('success', '', `OTP: ${otp}`);
      setisloading(false);
      navigation.navigate('OtpScreen', { mobileNumber: mobile });
    } else if (appCode === 1143) {
      // 🚨 Account deactivated
      showToast('error', '', message || 'Your account is deactivated.');
      setisloading(false);
      navigation.navigate('AccountStatusScreen', { mobileNumber: mobile });
    } else {
      // ❌ Other errors
      showToast('error', '', message || 'Something went wrong.');
    }
  } catch (error) {
    showToast('error', '', error.response?.data?.message || 'Network error, please try again.');
  } finally {
    setisloading(false);
  }
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar hidden={false} backgroundColor="#E6F2FE" />
      <CustomStatusBar backgroundColor="#E6F2FE" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.svgCurve}>
          <WaveHeaderBackground />
          <Image
            source={logo}
            style={{ width: wp('30%'), height: wp('25%'), position: 'absolute', bottom: wp('4'), marginLeft: wp('10%') }}
            resizeMode="contain"
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <AppText style={[styles.loginTitle, { color: theme.colors.themeIcon }]}>LOGIN</AppText>
              <AppText style={[styles.pagenavigate, { color: theme.colors.placeholder }]}>1/3</AppText>
            </View>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
            >
              <AppText style={{ color: theme.colors.text, fontSize: wp('4.2%'), marginRight: wp('1.5%') }}>
                +91
              </AppText>
              <TextInput
                value={mobile}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setMobile(cleaned.slice(0, 10));
                }}
                placeholder="Enter mobile number"
                style={[styles.input, { color: theme.colors.text, flex: 1 }]}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.placeholder}
                maxLength={10}
                paddingVertical={wp('0.5%')}
              />
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkbox}>
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      backgroundColor: isChecked ? theme.colors.Highlighterwords : 'transparent',
                      borderColor: theme.colors.placeholder,
                    },
                  ]}
                >
                  {isChecked && <Icon name="check" size={wp('3.2%')} color="#fff" />}
                </View>
              </TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <AppText style={[styles.termsText, { color: theme.colors.placeholder }]}>
                  By logging in, I agree{' '}
                </AppText>
                <TouchableOpacity onPress={() => fetchCMSContentAndNavigate('terms')}>
                  <AppText style={[styles.linkText, { color: theme.colors.Highlighterwords }]}>
                    Terms & Conditions
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            <ActionButton
              label="Get OTP"
              disabled={!isChecked}
              style={{
               
                backgroundColor: isChecked ? theme.colors.themeIcon : '#ccc',
              }}
              labelStyle={{
                color: isChecked ? '#fff' : '#888',
              }}
              onPress={() => handleLogin()}
              isLoading={isloading}
            />

            <TouchableOpacity style={styles.helpContainer} activeOpacity={0.7} onPress={()=>navigation.navigate('FAQScreen')}>
              <AppText style={[styles.helpText, { color: theme.colors.placeholder }]}>Need help ?</AppText>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <WaveFooterBackground>
            <View style={styles.footerTextContainer}>
              <AppText style={[styles.footerText, { color: theme.colors.text }]}>
                Your Next{' '}
                <AppText style={[styles.footerHighlight, { color: theme.colors.Highlighterwords }]}>
                  Ride
                </AppText>{' '}
                Awaits.
              </AppText>
            </View>
          </WaveFooterBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  svgCurve: {
    height: hp('25%'),
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('8%'),
    paddingTop: hp('6%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  loginTitle: {
    fontSize: wp('7%'),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pagenavigate: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  inputContainer: {
    borderRadius: wp('3%'),
    borderWidth: 1,
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.8%'),
    elevation: 2,
  },
  input: {
    fontSize: wp('4%'),
    fontWeight: '400',
    // paddingVertical: hp('2%'),
  },
  termsText: {
    fontSize: wp('3.8%'),
    lineHeight: wp('5.5%'),
    textAlign: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  helpContainer: {
    alignSelf: 'flex-start',
    marginTop: wp('3.8%'),
  },
  helpText: {
    fontSize: wp('4%'),
    textDecorationLine: 'underline',
  },
  footer: {
    height: hp('15%'),
    justifyContent: 'flex-end',
  },
  footerTextContainer: {
    alignItems: 'center',
    paddingBottom: hp('4%'),
    zIndex: 1,
  },
  footerText: {
    fontSize: wp('5%'),
    textAlign: 'center',
    fontWeight: '500',
  },
  footerHighlight: {
    fontWeight: '700',
    fontSize: wp('5.5%'),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    gap: wp('2%'),
  },
  checkbox: {
    width: wp('5%'),
    height: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBox: {
    width: wp('4.5%'),
    height: wp('4.5%'),
    borderWidth: 1,
    borderRadius: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
