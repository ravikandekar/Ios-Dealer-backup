// import Toast from 'react-native-toast-message';

// export const showToast = (type, message, description = '') => {
//   Toast.show({
//     type: type, // 'success', 'error', 'info'
//     text1: message,
//     text2: description,
//     position: 'top',
//     visibilityTime: 4000,
//     autoHide: true,
//     topOffset: 50,
//   });
// };

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { CheckCircle, XCircle } from 'lucide-react-native'; // Success & Error Icons
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
export const showToast = (type, message, description = '') => {
  Toast.show({
    type,
    text1: description,
    text2: description,
    // position: 'center',
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 70,
  });
};

const toastConfig = {
  success: ({ text1 }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#49ba7c' }]}>
      <CheckCircle size={23} color="white" />
      <Text style={styles.toastText}>{text1}</Text>
      <TouchableOpacity onPress={Toast.hide}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  ),
  error: ({ text1 }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#db6565' }]}>
      <XCircle size={23} color="white" />
      <Text style={styles.toastText}>{text1}</Text>
      <TouchableOpacity onPress={Toast.hide}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#49ba7c' }]}>
      <CheckCircle size={23} color="white" />
      <Text style={styles.toastText}>{text1}</Text>
      <TouchableOpacity onPress={Toast.hide}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4'),
    paddingVertical: wp('4'),
    borderRadius: 8,
    marginHorizontal: wp('9'),
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    justifyContent:"center"
  },
  toastText: {
    color: 'white',
    fontSize: wp('4'),
    flex: 1,
    marginLeft: wp('4'),
  },
  closeText: {
    color: 'white',
    fontSize: wp('4.5'),
    marginLeft: wp('4'),
    fontWeight:"bold"
  },
});

export const ToastProvider = () => <Toast config={toastConfig} />;
