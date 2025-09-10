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
import { AppState ,LogBox} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import { getApp } from 'firebase/app';
import { useNotificationPermission } from './src/utils/useNotificationPermission';
import { removeToken } from './src/utils/storage';
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
    // removeToken();
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



  return (
    <AuthProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={async () => {
          processPendingNavigation();

          // Handle kill mode notification after navigation is ready
          if (global.initialNotificationData) {
            handleNotificationData(global.initialNotificationData);
            global.initialNotificationData = null;
          }

          // Track the initial route
          const currentRoute = navigationRef.getCurrentRoute();
          if (currentRoute?.name) {
            await analytics().logScreenView({
              screen_name: currentRoute.name,
              screen_class: currentRoute.name,
            });
          }
        }}
        onStateChange={async () => {
          // Track screen changes automatically
          const currentRoute = navigationRef.getCurrentRoute();
          if (currentRoute?.name) {
            await analytics().logScreenView({
              screen_name: currentRoute.name,
              screen_class: currentRoute.name,
            });
          }
        }}
      >
        <AppContent />
 
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
