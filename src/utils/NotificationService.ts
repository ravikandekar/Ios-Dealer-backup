// src/utils/notificationService.ts
import { Platform, Alert } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
// import { navigate } from '../navigations/RootNavigation';

/**
 * 🔔 Display local notification
 */
export const displayLocalNotification = async (
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> => {
  console.log('🛠 [displayLocalNotification]', { title, body, data });

  try {
    await notifee.requestPermission({
      alert: true,
      sound: true,
      badge: true,
    });

    const channelId = await notifee.createChannel({
      id: 'default_channel',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          alert: true,
          sound: true,
          badge: true,
          banner: true,
          list: true,
        },
      },
    });

    console.log(`✅ [${Platform.OS}] Notification displayed!`);
  } catch (error) {
    console.error(`❌ [${Platform.OS}] Notification error:`, error);
  }
};

/**
 * 🔍 Extract notification data
 */
export const extractNotificationData = (msg: FirebaseMessagingTypes.RemoteMessage) => {
  console.log('🔍 [Extract] Raw message:', JSON.stringify(msg, null, 2));

  const title = msg.data?.notificationTitle || msg.notification?.title || 'New Notification';
  const body =
    msg.data?.notificationMessage || msg.notification?.body || 'You have a new message.';

  const customData: Record<string, string> = {};
  if (msg.data) {
    Object.entries(msg.data).forEach(([k, v]) => {
      customData[k] = String(v);
    });
  }
  customData.messageId = String(msg.messageId || '');
  customData.sentTime = String(msg.sentTime || '');

  console.log('🔍 [Extract] Parsed:', { title, body, customData });
  return { title, body, customData };
};

/**
 * 🎯 Handle tap actions
 */
export const handleNotificationAction = (data: Record<string, any>) => {
  console.log('🎯 [Action]', data);
  if (data.notificationType === 'car_launch') {
    Alert.alert('Car Launch', `New car: ${data.carName}`);
    // navigate('CitySelectionScreen');
  } else if (data.notificationType === 'test') {
    Alert.alert('Test', 'Test notification tapped!');
    // navigate('CitySelectionScreen');
  } else {
    Alert.alert('Notification', 'Notification tapped!');
    // navigate('CitySelectionScreen');
  }
};

/**
 * 🧪 Test local notification
 */
export const testLocalNotification = async () => {
  console.log('🧪 [Test] Triggering test notification');
  await displayLocalNotification(
    '🧪 Test Notification',
    'This is a test notification to verify setup',
    { test: 'true', notificationType: 'test', time: new Date().toISOString() }
  );
};

/**
 * 🔐 Request FCM + Notifee permissions
 */
export const requestPermission = async () => {
  console.log('🔑 [FCM] Requesting permissions...');
  try {
    if (Platform.OS === 'ios') {
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      console.log('📱 [iOS] Registered for remote:', isRegistered);
      if (!isRegistered) await messaging().registerDeviceForRemoteMessages();
    }

    const authStatus = await messaging().requestPermission({
      alert: true,
      sound: true,
      badge: true,
      announcement: true,
      criticalAlert: true,
    });
    console.log('🔐 [FCM] Auth status:', authStatus);

    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      const token = await messaging().getToken();
      console.log('🎫 [FCM] Token:', token);
      await messaging().subscribeToTopic('GlobalTopic');
      console.log('✅ [FCM] Subscribed to GlobalTopic');
    } else {
      console.warn('⚠️ [FCM] Permission not granted');
    }

    const nfPerm = await notifee.requestPermission();
    console.log('🔔 [Notifee] Permission:', nfPerm);
  } catch (err) {
    console.error('❌ [FCM] Permission error:', err);
  }
};

/**
 * 📲 Setup listeners
 */
export const setupNotificationListeners = () => {
  const unsubscribeForeground = messaging().onMessage(async msg => {
    console.log('🔥 [FOREGROUND] Message received!');
    const { title, body, customData } = extractNotificationData(msg);
    // @ts-ignore
    await displayLocalNotification(title, body, customData);
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(msg => {
    console.log('🔙 [Background->Foreground]', msg);
    if (msg) {
      const { customData } = extractNotificationData(msg);
      handleNotificationAction(customData);
    }
  });

  messaging()
    .getInitialNotification()
    .then(msg => {
      console.log('💀 [Killed->Foreground]', msg);
      if (msg) {
        const { customData } = extractNotificationData(msg);
        handleNotificationAction(customData);
      }
    });

  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    console.log('🎯 [Notifee Event]', type, detail);
    if (type === EventType.PRESS && detail.notification?.data) {
      handleNotificationAction(detail.notification.data);
    }
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('🌙 [Notifee Background]', type, detail);
  });

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
    unsubscribeNotifee();
  };
};
