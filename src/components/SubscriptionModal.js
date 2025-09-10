// components/SubscriptionModal.js
import React, { useContext } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText'; // Custom text component or use Text
import { useTheme } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'; // Use your own responsive units
import { AuthContext } from '../context/AuthContext';

const SubscriptionModal = ({
  visible,
  onClose,
  onSubscribe,
  title = 'Subscription Required',
  message = 'You need to purchase a subscription to publish this product.',
  cancelLabel = 'Cancel',
  confirmLabel = 'Subscribe',
}) => {
 
 const { theme } = useContext(AuthContext);
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <AppText style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </AppText>

          <AppText style={[styles.message, { color: theme.colors.placeholder }]}>
            {message}
          </AppText>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.colors.primary }]}
              onPress={onClose}
            >
              <AppText style={{ color: theme.colors.primary,fontSize:wp('4.5%') }}>{cancelLabel}</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }]}
              onPress={onSubscribe}
            >
              <AppText style={{ color: theme.colors.background ,fontSize:wp('4.5%')}}>{confirmLabel}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubscriptionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: wp('85%'),
    borderRadius: 20,
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  title: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    marginBottom: hp('1.2%'),
    textAlign: 'center',
  },
  message: {
    fontSize: wp('4%'),
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: hp('2.8%'),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: wp('4%'),
  },
  cancelBtn: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  confirmBtn: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
