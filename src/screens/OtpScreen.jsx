import React, { useState, useContext, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import WaveHeaderBackground from '../components/WaveHeaderBackground';
import WaveFooterBackground from '../components/WaveFooterBackground';
import ActionButton from '../components/ActionButton';
import { logo } from '../../public_assets/media';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import { getToken, storeRefreshToken } from '../utils/storage';
import AppText from '../components/AppText';
import { initApp } from '../utils/appInitializer';
import { useFormStore } from '../store/formStore';

const { width } = Dimensions.get('window');

const OtpScreen = ({ navigation, route }) => {
  const {
    theme,
    login,
    setUserID,
    setUserName,
    setcityselected,
    setProfileCompleted,
    setisAadharVerified,
    setBussinessdetails,
    setregister,
    setSelectedCategory,
    setIsAppInitialized,
  } = useContext(AuthContext);

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef(null);
  const inputRefs = useRef([]);
  const mobileNumber = route.params?.mobileNumber;
  const { updateForm } = useFormStore();

  const handleOtpChange = (text, index) => {
    if (!/^[0-9]?$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    resendIntervalRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    setOtp(['', '', '', '']);
    setResendLoading(true);
    try {
      const response = await apiClient.post('/api/dealer/auth/request-otp', { phone: mobileNumber });
      if (response.data.success) {
        showToast('success', '', 'OTP sent successfully');
        startResendTimer();
      } else {
        showToast('error', '', response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      showToast('error', '', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleConfirm = async () => {
    const finalOtp = otp.join('');
    if (finalOtp.length !== 4) {
      showToast('error', '', 'Please enter valid 4-digit OTP');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await apiClient.post('/api/dealer/auth/verify-otp', {
        phone: mobileNumber,
        enteredOtp: finalOtp,
      });

      const { success, appCode, data, message } = response.data;

      if (success && appCode === 1000) {
        const { accessToken, refreshToken, dealer } = data;
         await login(accessToken);
        const token = await getToken();
 
        await initApp({
          setUserID,
          setUserName,
          setcityselected,
          setProfileCompleted,
          setisAadharVerified,
          setBussinessdetails,
          setregister,
          setSelectedCategory,
          updateForm,
          setIsAppInitialized,
        });

        storeRefreshToken(refreshToken);
        showToast('success', '', 'OTP Verified Successfully');
        setUserID(dealer?._id);
      } else if (appCode === 1018) {
        showToast('error', '', 'Your OTP has expired or already been used.');
      } else if (appCode === 1021) {
        showToast('error', '', 'Incorrect OTP entered. Please try again.');
      } else {
        showToast('error', '', message || 'Invalid OTP, please try again.');
      }
    } catch (error) {
      const apiError = error.response?.data;
      showToast('error', '', apiError?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.svgCurve}>
          <WaveHeaderBackground />
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <AppText style={[styles.loginTitle, { color: theme.colors.themeIcon }]}>VERIFY</AppText>
              <AppText style={[styles.pagenavigate, { color: theme.colors.placeholder }]}>2/3</AppText>
            </View>

            <View style={styles.mobileRow}>
              <AppText style={[styles.mobileInfo, { color: theme.colors.text }]}>
                OTP sent to {mobileNumber}{' '}
              </AppText>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <AppText style={[styles.linkText, { color: theme.colors.Highlighterwords }]}>Edit</AppText>
              </TouchableOpacity>
            </View>

            <AppText style={[styles.infoNote, { color: theme.colors.text }]}>
              Do not share the OTP with anyone.
            </AppText>

            {/* OTP Boxes */}
            <View style={styles.otpContainer}>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.inputBackground,
                      color: theme.colors.text,
                    },
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={value}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleBackspace(index, e)}
                  secureTextEntry={true}
                />
              ))}
            </View>

            <ActionButton
              label={loading ? 'Verifying...' : 'Confirm'}
              onPress={handleConfirm}
              disabled={loading}
              style={{ backgroundColor: theme.colors.themeIcon }}
              isLoading={loading}
            />

            {/* Resend OTP */}
            <View style={styles.bottomRow}>
              {resendTimer > 0 ? (
                <AppText style={[styles.resendText, { color: theme.colors.placeholder }]}>
                  Resend OTP in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer} sec
                </AppText>
              ) : (
                <TouchableOpacity onPress={resendOtp} disabled={resendLoading}>
                  <AppText style={[styles.linkText, { color: theme.colors.Highlighterwords }]}>
                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                  </AppText>
                </TouchableOpacity>
              )}

              <TouchableOpacity>
                <AppText style={[styles.helpText, { color: theme.colors.placeholder }]}>Need help ?</AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <View style={styles.footer}>
          <WaveFooterBackground>
            <View style={styles.footerTextContainer}>
              <AppText style={[styles.footerText, { color: theme.colors.text }]}>
                Your Next <AppText style={[styles.footerHighlight, { color: theme.colors.Highlighterwords }]}>Ride</AppText> Awaits.
              </AppText>
            </View>
          </WaveFooterBackground>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  svgCurve: {
    height: hp('25%'),
    justifyContent: 'flex-end',
  },
  logo: {
    width: wp('28%'),
    height: wp('28%'),
    position: 'absolute',
    bottom: wp('4%'),
    marginLeft: wp('10%'),
  },
  scrollContent: {
    flexGrow: 1,
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
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  mobileInfo: {
    fontSize: wp('3.8%'),
  },
  infoNote: {
    fontSize: wp('3.5%'),
    marginBottom: hp('2.5%'),
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
  },
  otpInput: {
    width: wp('15%'),
    height: wp('15%'),
    borderWidth: 1,
    borderRadius: wp('2%'),
    textAlign: 'center',
    fontSize: wp('6%'),
    fontWeight: '600',
  },
  bottomRow: {
    marginTop: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendText: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '500',
    fontSize: wp('4%'),
  },
  helpText: {
    fontSize: wp('3.5%'),
    textDecorationLine: 'underline',
  },
  footer: {
    height: hp('15%'),
    justifyContent: 'flex-end',
  },
  footerTextContainer: {
    alignItems: 'center',
    paddingBottom: hp('6%'),
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
});
