// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import OtpScreen from '../screens/OtpScreen';
// import LoginScreen from '../screens/LoginScreen';
// import CitySelectionScreen from '../screens/CitySelectionScreen';
// import CitySearchScreen from '../screens/CitySearchScreen';
// import WelcomeLoginScreen from '../screens/WelcomeLoginScreen';
// import WelcomeRegistrationScreen from '../screens/WelcomeRegistrationScreen';
// import RegisterDealer from '../screens/RegisterDealer';
// import RegistrationACScreen from '../screens/RegistrationACScreen';
// import RegistrationBDScreen from '../screens/RegistrationBDScreen';
// import RegistrationScreen from '../screens/RegistrationScreen';

// const Stack = createStackNavigator();
// const AuthStack = () => (

//   <Stack.Navigator initialRouteName='WelcomeLoginScreen'>
//     <Stack.Screen name="WelcomeLoginScreen" component={WelcomeLoginScreen} options={{ headerShown: false }} />
//     <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
//     <Stack.Screen name="OtpScreen" component={OtpScreen} options={{ headerShown: false }} />
//     <Stack.Screen name="CitySelectionScreen" component={CitySelectionScreen} options={{ headerShown: false }} />
//     <Stack.Screen name="CitySearchScreen" component={CitySearchScreen} options={{ headerShown: false }} />
//   </Stack.Navigator>
// );
// export default AuthStack;

import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

import WelcomeLoginScreen from '../screens/WelcomeLoginScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import CitySearchScreen from '../screens/CitySearchScreen';
import CMSWebViewScreen from '../screens/CMSWebViewScreen';
import FAQScreen from '../screens/FAQScreen';
import AccountStatusScreen from '../screens/AccountStatusScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Stack.Navigator
      key={`${isAuthenticated}`} // rebuilds stack on state change
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="WelcomeLoginScreen" component={WelcomeLoginScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OtpScreen" component={OtpScreen} />
      <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
      <Stack.Screen name="FAQScreen" component={FAQScreen} />
      <Stack.Screen name="AccountStatusScreen" component={AccountStatusScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
