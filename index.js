/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Background message handler - IMPORTANT for handling messages when app is in background
// Handle background & quit state messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🌙 [BACKGROUND HANDLER] Message:', remoteMessage);

  const channelId = await notifee.createChannel({
    id: 'default_channel',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || remoteMessage.data?.notificationTitle || 'Background Notification',
    body: remoteMessage.notification?.body || remoteMessage.data?.notificationMessage || 'You have a new message.',
    android: {
      channelId,
      pressAction: { id: 'default' }, // 👈 Required for tap
      smallIcon: 'ic_launcher',
    },
    data: remoteMessage.data, // 👈 Pass custom data (important for navigation!)
  });
});

AppRegistry.registerComponent(appName, () => App);
