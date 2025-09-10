import React, { useEffect, useState, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const InternetStatus = () => {
  const { theme } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkConnection(); // Initial check

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      handleConnectionChange(connected);
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    const connected = state.isConnected && state.isInternetReachable;
    handleConnectionChange(connected);
  };

  const handleConnectionChange = (connected) => {
    setIsConnected(connected);
    setModalVisible(!connected);
  };

  return (
    <Modal transparent visible={modalVisible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <LottieView
            source={require('../../public_assets/media/lottie/No-Internet.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            No Internet Connection
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Please check your internet and try again.
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={checkConnection}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default InternetStatus;

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
