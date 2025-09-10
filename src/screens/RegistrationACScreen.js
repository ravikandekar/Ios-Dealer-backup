import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView, 
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import ActionButton from '../components/ActionButton';
import AppText from '../components/AppText';
import { showToast } from '../utils/toastService';
import apiClient from '../utils/apiClient';
import Loader from '../components/Loader';

const RegistrationACScreen = ({ navigation }) => {
  const { theme, userID } = useContext(AuthContext);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);
  const [requestId, setRequestId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    if (!userID) {
      showToast('error', '', 'User ID not found. Please login again.');
    }
  }, [userID]);

  useEffect(() => {
    let interval = null;
    if (resendDisabled) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendDisabled]);
  // Format Aadhaar input
  const handleAadhaarChange = (text) => {
    // remove all non-digits
    let cleaned = text.replace(/\D/g, "");

    // limit to 12 digits
    if (cleaned.length > 12) {
      cleaned = cleaned.slice(0, 12);
    }

    // insert space after every 4 digits
    let formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");

    setAadhaar(formatted);
  };
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      if (index > 0) inputRefs.current[index - 1].focus();
    }
  };

 const handleSendOtp = async () => {
  if (!userID) {
    showToast('error', '', 'User ID missing. Cannot send OTP.');
    return;
  }

  // remove spaces for validation & API
  const cleanedAadhaar = aadhaar.replace(/\s/g, "");

  if (!cleanedAadhaar || cleanedAadhaar.length !== 12) {
    showToast('error', '', 'Aadhaar number must be 12 digits');
    return;
  }

  try {
    setLoading(true);
    const response = await apiClient.post(
      "/api/dealer/aadhaarRoutes/aadhaar/send-otp",
      {
        customer_aadhaar_number: cleanedAadhaar, // ✅ clean Aadhaar
        dealerId: userID,
      }
    );

    const data = response.data?.data?.data;
    setRequestId(data?.request_id);
    setTaskId(data?.task_id);
    setOtp(["", "", "", ""]); // Clear old OTP
    setOtpSent(true); // ✅ Enable OTP section
    showToast("success", "", data?.note || "OTP sent");
    setTimer(60);
    setResendDisabled(true);
  } catch (error) {
    const msg =
      error?.response?.data?.data?.message ||
      error?.response?.data?.message ||
      "Failed to send OTP";
    showToast("error", "", msg);
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async () => {
  if (!userID) {
    showToast('error', '', 'User ID missing. Cannot verify OTP.');
    return;
  }
  if (otp.join('').length !== 4) {
    showToast('error', '', 'Please enter 4-digit OTP');
    return;
  }

  try {
    setLoading(true);

    const cleanedAadhaar = aadhaar.replace(/\s/g, ""); // ✅ strip spaces

    const response = await apiClient.post(
      "/api/dealer/aadhaarRoutes/aadhaar/verify-otp",
      {
        customer_aadhaar_number: cleanedAadhaar, // ✅ clean Aadhaar
        dealerId: userID,
        otp: otp.join(""),
        task_id: taskId,
        request_id: requestId,
      }
    );

    const { appCode, message ,data} = response.data;

    if (appCode === 1000) {
      showToast("success", "", message || "Aadhaar verified");
      navigation.navigate("RegistrationBDScreen");
    } else {
      showToast("error", "", data?.message || "Verification failed");
    }
  } catch (error) {
    const msg =
      error?.response?.data?.data?.message ||
      error?.response?.data?.message ||
      "OTP verification failed";
    showToast("error", "", msg);
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <DetailsHeader
        rightType="steps"
        stepText="2/4"
        stepTextColor="#999"
        stepTextBg={theme.colors.background}
        divider={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <AppText style={[styles.inputHeader, { color: theme.colors.text }]}>Enter your Aadhaar number</AppText>
          <AppText style={styles.subText}>(OTP will be sent to Aadhaar-linked mobile number.)</AppText>
          <TextInput
            style={[
              styles.inputBox,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#999"
            value={aadhaar}
            onChangeText={handleAadhaarChange}
            keyboardType="number-pad"
            maxLength={14} // 12 digits + 2 spaces
          />


          <ActionButton
            label={'Send OTP'}
            style={{ height: hp('6%'), width: wp('90%') }}
            onPress={handleSendOtp}
            disabled={loading}
          />

          {otpSent && (
            <>
              <AppText style={[styles.inputHeader, { color: theme.colors.text }]}>Enter OTP</AppText>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    placeholder="x"
                    placeholderTextColor="#aaa"
                    ref={ref => (inputRefs.current[index] = ref)}
                    style={[styles.otpInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={text => handleOtpChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                  />
                ))}
              </View>

              <ActionButton
                label={'Verify OTP'}
                style={{ height: hp('6%'), width: wp('90%'), backgroundColor: theme.colors.btn || '#FF7300' }}
                onPress={handleVerifyOtp}
                disabled={loading}
              />

              <TouchableOpacity onPress={handleSendOtp} disabled={resendDisabled} style={{ alignItems: 'flex-start' }}>
                <AppText style={styles.resendText}>
                  <AppText style={[styles.resendLink, { color: resendDisabled ? theme.colors.placeholder : theme.colors.Highlighterwords }]}>Resend OTP</AppText>{' '}
                  {resendDisabled ? `00:${timer < 10 ? `0${timer}` : timer} secs` : ''}
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <Loader visible={loading} />
    </SafeAreaView>
  );
};

export default RegistrationACScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: wp('4%'),
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp('2%'),
  },
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  inputHeader: {
    fontSize: hp('2.5%'),
    fontWeight: '500',
    marginTop: hp('3%'),
    marginBottom: hp('1%'),
  },
  subText: {
    fontSize: hp('1.6%'),
    color: '#777',
    marginBottom: hp('1.5%'),
  },
  inputBox: {
    width: wp('90%'),
    height: hp('5.8%'),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    fontSize: hp('2%'),
    marginBottom: hp('2%'),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: wp('90%'),
    marginBottom: hp('2%'),
    gap: hp('2%'),
  },
  otpInput: {
    width: wp('12%'),
    height: wp('12%'),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    fontSize: hp('2.2%'),
    textAlign: 'center',
  },
  resendText: {
    fontSize: hp('1.7%'),
    color: '#888',
    marginTop: hp('1%'),
  },
  resendLink: {
    fontWeight: '500',
  },
});
