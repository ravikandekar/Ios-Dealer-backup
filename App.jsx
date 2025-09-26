// App.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigation from './src/navigations/RootNavigation';
import SplashScreen from './src/screens/SplashScreen';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { useFormStore } from './src/store/formStore';
import { initApp } from './src/utils/appInitializer';
import PermissionSettingsModal from './src/components/PermissionSettingsModal';

import { navigationRef, processPendingNavigation } from './src/utils/NavigationService';

import messaging from '@react-native-firebase/messaging';

import InternetStatus from './src/components/InternetStatus';
import { requestPermission, setupNotificationListeners } from './src/utils/NotificationService';
import { handleNotificationData } from './src/utils/notifications';
import { Alert, AppState } from 'react-native';
import LottieCompo from './src/components/LottieCompo';
import { InteractionManager } from 'react-native';

const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showMarkAsSoldLottie, setShowMarkAsSoldLottie] = useState(false);

  const { updateForm } = useFormStore();
  const {
    checkToken,
    setUserID, setUserName, setregister, setcityselected,
    setProfileCompleted, setisAadharVerified, setBussinessdetails,
    setSelectedCategory, setIsAppInitialized, isAppInitialized,
    userID, selectedCategory
  } = useContext(AuthContext);

  // ✅ move initialize out so it can be reused (retry button)
  const initialize = useCallback(async () => {
    const isTokenValid = await checkToken();
    if (!isTokenValid) {
      console.log("❌ No valid token, skipping initApp");
      setIsAppReady(true);      // ✅ allow app to render login
      setIsAppInitialized(true);
      return;
    }

    const response = await initApp({
      setUserID,
      setUserName,
      setcityselected,
      setProfileCompleted,
      setisAadharVerified,
      setBussinessdetails,
      setregister,
      setSelectedCategory,
      updateForm,
    });

    if (response.success) {
      console.log("✅ Init success, response:", response.data);
    } else {
      console.error("❌ Init failed:", response.error);
      setShowMarkAsSoldLottie(true); // show retry animation
    }

    setIsAppInitialized(true);
    setIsAppReady(true);
  }, [checkToken, setUserID, setUserName, setcityselected, setProfileCompleted, setisAadharVerified, setBussinessdetails, setregister, setSelectedCategory, updateForm]);

  useEffect(() => {
    initialize();
  }, [initialize, selectedCategory]);

  if (!isAppReady || !isAppInitialized) return <SplashScreen />;

  return (
    <>
      {/* ✅ Put LottieCompo inside returned JSX */}
      <LottieCompo
        visible={showMarkAsSoldLottie}
        lottieSource={require('./public_assets/media/lottie/retry.json')}
        title="Initialization Failed"
        description="Something went wrong while setting up the app."
        buttonText="Retry"
        onClose={() => {
          setShowMarkAsSoldLottie(false);
          InteractionManager.runAfterInteractions(() => initialize()); // 🔁 retry init
        }}
      />
      <RootNavigation />
    </>
  );
};

const App = () => {
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);



  useEffect(() => {
    console.log('🚀 [App] Setting up notifications...');

    // 🔑 Ask permission on startup
    requestPermission(setSettingsModalVisible, setFcmToken);

    // 📡 Setup listeners
    const unsubscribe = setupNotificationListeners();
    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          processPendingNavigation();

          // Handle kill mode notification after navigation is ready
          if (global.initialNotificationData) {
            handleNotificationData(global.initialNotificationData);
            global.initialNotificationData = null;
          }
        }}
      >
        <AppContent />
        <InternetStatus />
        <PermissionSettingsModal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          title="Enable Notifications"
          message="To stay updated with important alerts and updates from Gadilo Bharat, please enable notifications in your device settings. This ensures you never miss out on critical information and offers."
          onRefresh={() => requestPermission(setSettingsModalVisible, setFcmToken)}
          refreshShow={true}
        />

      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
