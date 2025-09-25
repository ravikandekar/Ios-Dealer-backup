import React, { useContext } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const LottieCompo = ({
  visible,
  lottieSource,
  title,
  description,
  buttonText = "OK",
  onClose,
}) => {
  const { theme } = useContext(AuthContext);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {lottieSource && (
            <LottieView
              source={lottieSource}
              autoPlay
              loop
              style={styles.lottie}
            />
          )}
          {title && (
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
          )}
          {description && (
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              {description}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LottieCompo;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
