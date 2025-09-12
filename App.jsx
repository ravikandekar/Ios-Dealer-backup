// App.js
import React, { useState, useEffect, useContext } from 'react';
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

const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { updateForm } = useFormStore();
  const {
    checkToken,
    setUserID, setUserName, setregister, setcityselected,
    setProfileCompleted, setisAadharVerified, setBussinessdetails,
    setSelectedCategory, setIsAppInitialized, isAppInitialized,
    userID, selectedCategory
  } = useContext(AuthContext);

  useEffect(() => {
    const initialize = async () => {
      try {
        const isTokenValid = await checkToken();
        if (isTokenValid) {
          await initApp({
            setUserID, setUserName, setcityselected, setProfileCompleted,
            setisAadharVerified, setBussinessdetails, setregister,
            setSelectedCategory, setIsAppInitialized, updateForm
          });
        }
      } catch (error) {
        console.error('❌ App initialization failed:', error.message);
      } finally {
        setIsAppInitialized(true);
        setIsAppReady(true);
      }
    };
    initialize();
  }, [selectedCategory, userID]);

  if (!isAppReady || !isAppInitialized) return <SplashScreen />;
  return <RootNavigation />;
};

const App = () => {



  useEffect(() => {
    console.log('🚀 [App] Setting up notifications...');
    requestPermission();

    const testTimer = setTimeout(() => {
     // testLocalNotification();
    }, 3000);

    const unsubscribe = setupNotificationListeners();

    return () => {
      clearTimeout(testTimer);
      unsubscribe();
    };
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
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
