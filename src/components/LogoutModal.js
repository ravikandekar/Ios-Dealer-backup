import React, { useRef, useEffect, useContext } from 'react';
import {
  View,

  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import ActionButton from './ActionButton';
import AppText from './AppText';
const { height } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onConfirm }) => {
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const { theme } = useContext(AuthContext);

  useEffect(() => {
    Animated.timing(modalAnimation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const translateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
                backgroundColor: theme.colors.card,
              }
            ]}>
              <View style={styles.modalHeader}>
                <View style={[styles.warningIconContainer, { backgroundColor: theme.colors.danger }]}>
                  <Icon name="logout" size={32} color="#fff" />
                </View>
                <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Logout
                </AppText>
              </View>

              <View style={styles.modalBody}>
                <AppText style={[styles.modalText, { color: theme.colors.text }]}>
                  Are you sure you want to logout? You will need to login again to access your account.
                </AppText>
              </View>

              <View style={styles.modalFooter}>

                <View>
                  <ActionButton label="Cancel" onPress={handleCancel} style={{ backgroundColor: theme.colors.placeholder }} textcolor={theme.colors.buttonText} />

                </View>
                <View>
                  <ActionButton label="Logout" onPress={onConfirm} style={{ backgroundColor: theme.colors.danger }} textcolor={theme.colors.buttonText} />

                </View>

              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogoutModal;
