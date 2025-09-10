// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import AppStack from './AppStack';
// import AuthStack from './AuthStack';
// import RegisterStack from './RegisterStack';
// import { View, StatusBar, ActivityIndicator } from 'react-native';
// import { ToastProvider } from '../utils/toastService';
// import { AuthContext } from '../context/AuthContext';
// import InternetStatus from '../components/InternetStatus';
// import { navigationRef, processPendingNavigation } from '../utils/NavigationService';

// const RootNavigation = () => {
//   const { isDark, isAuthenticated, register, cityselected, isAppInitialized } = useContext(AuthContext);

//   if (!isAppInitialized) {
//     // Prevent rendering anything before initialization completes
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* <NavigationContainer ref={navigationRef} onReady={processPendingNavigation}> */}
//         <StatusBar
//           barStyle={isDark ? 'light-content' : 'dark-content'}
//           backgroundColor="#E6F2FE"
//         />

//         {!isAuthenticated || !cityselected ? (
//           <AuthStack />

//         ) : !register ? (
//           <RegisterStack />
//         ) : (
//           <AppStack />
//         )}
//       {/* </NavigationContainer> */}

//       <InternetStatus />
//       <ToastProvider />
//     </View>
//   );
// };

// export default RootNavigation;


// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import AppStack from './AppStack';
// import AuthStack from './AuthStack';
// import RegisterStack from './RegisterStack';
// import { View, StatusBar, ActivityIndicator } from 'react-native';
// import { ToastProvider } from '../utils/toastService';
// import { AuthContext } from '../context/AuthContext';
// import InternetStatus from '../components/InternetStatus';
// import { navigationRef, processPendingNavigation } from '../utils/NavigationService';

// const RootNavigation = () => {
//   const { isDark, isAuthenticated, register, cityselected, isAppInitialized } = useContext(AuthContext);

//   if (!isAppInitialized) {
//     // Prevent rendering anything before initialization completes
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* <NavigationContainer ref={navigationRef} onReady={processPendingNavigation}> */}
//         <StatusBar
//           barStyle={isDark ? 'light-content' : 'dark-content'}
//           backgroundColor="#E6F2FE"
//         />

//         {!isAuthenticated || !cityselected ? (
//           <AuthStack />

//         ) : !register ? (
//           <RegisterStack />
//         ) : (
//           <AppStack />
//         )}
//       {/* </NavigationContainer> */}

//       <InternetStatus />
//       <ToastProvider />
//     </View>
//   );
// };

// export default RootNavigation;





import React, { useContext, useEffect, useState } from 'react';
import { View, StatusBar, InteractionManager } from 'react-native';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import RegisterStack from './RegisterStack';
import { ToastProvider } from '../utils/toastService';
import { AuthContext } from '../context/AuthContext';
import InternetStatus from '../components/InternetStatus';
import Loader from '../components/Loader';

const RootNavigation = () => {
  const { isDark, isAuthenticated, register, isAppInitialized } =
    useContext(AuthContext);

  const [readyAfterAuth, setReadyAfterAuth] = useState(false);

  // useEffect(() => {
  //   let timeoutId;
  //   let interactionHandle;

  //   if (isAuthenticated) {
  //     if (register) {
  //       setReadyAfterAuth(true);
  //     } else {
  //       // Run after interactions to avoid iOS UI freeze
  //       interactionHandle = InteractionManager.runAfterInteractions(() => {
  //         timeoutId = setTimeout(() => setReadyAfterAuth(true), 2000);
  //       });
  //     }
  //   } else {
  //     setReadyAfterAuth(false);
  //   }

  //   return () => {
  //     if (timeoutId) clearTimeout(timeoutId);
  //     if (interactionHandle) interactionHandle.cancel?.();
  //   };
  // }, [isAuthenticated, register]);

  // if (!isAppInitialized || (isAuthenticated && !readyAfterAuth)) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Loader />
  //     </View>
  //   );
  // }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="#E6F2FE"
        hidden={true}
      />

      {!isAuthenticated ? (
        <AuthStack />
      ) : !register ? (
        <RegisterStack />
      ) : (
        <AppStack />
      )}

      <InternetStatus />
      <ToastProvider />
    </View>
  );
};

export default RootNavigation;
