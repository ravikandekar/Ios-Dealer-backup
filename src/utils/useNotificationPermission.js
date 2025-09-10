import { useContext, useState, useCallback } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { AuthContext } from '../context/AuthContext';
import { getToken } from './storage';

import apiClient from './apiClient';
import { showToast } from './toastService';

export function useNotificationPermission() {
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendDeviceToken = useCallback(async (token, type) => {
    try {
      setLoading(true);

      const payload = { token, type }; // "android" or "ios"
      const res = await apiClient.post('/api/dealer/devicetokenRoute/devicetoken', payload);

      if (res?.data?.appCode !== 1000) {
        showToast('error', '', res?.data?.message || 'Failed to save device token');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const isTokenValid = await getToken();
    try {
      let granted = false;

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setSettingsModalVisible(true);
          return false;
        }

        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        granted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!granted) {
          setSettingsModalVisible(true);
        }
      } else {
        granted = true; // Android < 13
      }

      if (granted && isTokenValid) {
        const token = await messaging().getToken();
        setFcmToken(token);

        await sendDeviceToken(token, Platform.OS);
        await messaging().subscribeToTopic('allTopic');
        console.log('✅ Subscribed to topic: allTopic');
      }

      return granted;
    } catch (err) {
      console.warn('❌ Notification permission error:', err);
      return false;
    }
  }, [sendDeviceToken]);

  return {
    requestNotificationPermission,
    settingsModalVisible,
    setSettingsModalVisible,
    fcmToken,
    loading,
  };
}
