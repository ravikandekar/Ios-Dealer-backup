// import React, { useContext } from 'react';
// import { createStackNavigator } from '@react-navigation/stack';

// import WelcomeRegistrationScreen from '../screens/WelcomeRegistrationScreen';
// import RegisterDealer from '../screens/RegisterDealer';
// import RegistrationACScreen from '../screens/RegistrationACScreen';
// import RegistrationBDScreen from '../screens/RegistrationBDScreen';
// import RegistrationScreen from '../screens/RegistrationScreen';

// import { AuthContext } from '../context/AuthContext';
// import CMSWebViewScreen from '../screens/CMSWebViewScreen';
// import CitySelectionScreen from '../screens/CitySelectionScreen';
// import CitySearchScreen from '../screens/CitySearchScreen';
// import FAQScreen from '../screens/FAQScreen';
// import AadharKycWebview from '../screens/AadharKycWebview';
// import AadhaarKycScreen from '../screens/AddharDigiKyc';

// const Stack = createStackNavigator();

// const RegisterStack = () => {
//   const { isAadharVerified, profileCompleted, isBussinessdetails, cityselected } = useContext(AuthContext);

//   return (
//     <Stack.Navigator
//       key={`${isAadharVerified}-${profileCompleted}-${isBussinessdetails}-${cityselected}`} // forces rebuild on context value change
//       screenOptions={{ headerShown: false }}
//     >
//       {(() => {
//         // Case 0: City not selected → force city flow
//         if (!cityselected) {
//           return (
//             <>
//               <Stack.Screen name="CitySelectionScreen" component={CitySelectionScreen} />
//               <Stack.Screen name="CitySearchScreen" component={CitySearchScreen} />
//               <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
//               <Stack.Screen name="FAQScreen" component={FAQScreen} />
//             </>
//           );
//         }

//         // Case 1: Aadhar not verified and profile not completed → full flow
//         if (!isAadharVerified && !profileCompleted) {
//           return (
//             <>
//               <Stack.Screen name="WelcomeRegistrationScreen" component={WelcomeRegistrationScreen} />
//               <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
//               <Stack.Screen name="AadhaarKycScreen" component={AadhaarKycScreen} options={{ headerShown: false }} />
//               <Stack.Screen name="AadharKycWebview" component={AadharKycWebview} options={{ headerShown: false }} />
//               <Stack.Screen name="RegistrationACScreen" component={RegistrationACScreen} />
//               <Stack.Screen name="RegistrationBDScreen" component={RegistrationBDScreen} />
//               <Stack.Screen name="RegisterDealer" component={RegisterDealer} />
//               <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
//             </>
//           );
//         }

//         // Case 2: Aadhar not verified but profile completed → start from Registration A
//         if (!isAadharVerified && profileCompleted) {
//           return (
//             <>
//               <Stack.Screen name="AadhaarKycScreen" component={AadhaarKycScreen} options={{ headerShown: false }} />
//               <Stack.Screen name="AadharKycWebview" component={AadharKycWebview} options={{ headerShown: false }} />
//               <Stack.Screen name="RegistrationACScreen" component={RegistrationACScreen} />
//               <Stack.Screen name="RegistrationBDScreen" component={RegistrationBDScreen} />
//               <Stack.Screen name="RegisterDealer" component={RegisterDealer} />
//               <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
//             </>
//           );
//         }

//         // Case 3: Aadhar verified and profile completed but business details not filled → start from Registration B
//         if (isAadharVerified && profileCompleted && !isBussinessdetails) {
//           return (
//             <>
//               <Stack.Screen name="RegistrationBDScreen" component={RegistrationBDScreen} />
//               <Stack.Screen name="RegisterDealer" component={RegisterDealer} />
//             </>
//           );
//         }

//         // Case 4: Everything completed → only show Register Dealer (confirmation screen)
//         if (isAadharVerified && profileCompleted && isBussinessdetails) {
//           return <Stack.Screen name="RegisterDealer" component={RegisterDealer} />;
//         }

//         // Fallback
//         return <Stack.Screen name="WelcomeRegistrationScreen" component={WelcomeRegistrationScreen} />;
//       })()}
//     </Stack.Navigator>
//   );
// };

// export default RegisterStack;


import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeRegistrationScreen from '../screens/WelcomeRegistrationScreen';
import RegisterDealer from '../screens/RegisterDealer';
import RegistrationACScreen from '../screens/RegistrationACScreen';
import RegistrationBDScreen from '../screens/RegistrationBDScreen';
import RegistrationScreen from '../screens/RegistrationScreen';

import { AuthContext } from '../context/AuthContext';
import CMSWebViewScreen from '../screens/CMSWebViewScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import CitySearchScreen from '../screens/CitySearchScreen';
import FAQScreen from '../screens/FAQScreen';
import AadharKycWebview from '../screens/AadharKycWebview';
import AadhaarKycScreen from '../screens/AddharDigiKyc';

const Stack = createStackNavigator();

const RegisterStack = () => {
  const { isAadharVerified, profileCompleted, isBussinessdetails, cityselected } = useContext(AuthContext);

  return (
    <Stack.Navigator
      key={`${isAadharVerified}-${profileCompleted}-${isBussinessdetails}-${cityselected}`} // forces rebuild on context value change
      screenOptions={{ headerShown: false }}
    >
      {(() => {
        // Case 0: City not selected → force city flow
        if (!cityselected) {
          return (
            <>
              <Stack.Screen name="CitySelectionScreen" component={CitySelectionScreen} />
              <Stack.Screen name="CitySearchScreen" component={CitySearchScreen} />
              <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
              <Stack.Screen name="FAQScreen" component={FAQScreen} />
            </>
          );
        }

        // Case 1: Aadhar not verified and profile not completed → full flow
        if (!isAadharVerified && !profileCompleted) {
          return (
            <>
              <Stack.Screen name="WelcomeRegistrationScreen" component={WelcomeRegistrationScreen} />
              <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
              <Stack.Screen name="AadhaarKycScreen" component={AadhaarKycScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AadharKycWebview" component={AadharKycWebview} options={{ headerShown: false }} />
              <Stack.Screen name="RegistrationACScreen" component={RegistrationACScreen} />
              <Stack.Screen name="RegistrationBDScreen" component={RegistrationBDScreen} />
              <Stack.Screen name="RegisterDealer" component={RegisterDealer} />
              <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
            </>
          );
        }

        // Case 2: Aadhar not verified but profile completed → start from Registration A
        if (!isAadharVerified && profileCompleted) {
          return (
            <>
              <Stack.Screen name="AadhaarKycScreen" component={AadhaarKycScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AadharKycWebview" component={AadharKycWebview} options={{ headerShown: false }} />
              <Stack.Screen name="RegistrationACScreen" component={RegistrationACScreen} />
              <Stack.Screen name="RegistrationBDScreen" component={RegistrationBDScreen} />
              <Stack.Screen name="RegisterDealer" component={RegisterDealer} />
              <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} />
            </>
          );
        }

        // Case 3: Aadhar verified and profile completed but business details not filled → start from Registration B
        if (isAadharVerified && profileCompleted && !isBussinessdetails) {
          return (
            <>
              <Stack.Screen name="RegistrationBDScreen" component={RegistrationBDScreen} />
              <Stack.Screen name="RegisterDealer" component={RegisterDealer} />
            </>
          );
        }

        // Case 4: Everything completed → only show Register Dealer (confirmation screen)
        if (isAadharVerified && profileCompleted && isBussinessdetails) {
          return <Stack.Screen name="RegisterDealer" component={RegisterDealer} />;
        }

        // Fallback
        return <Stack.Screen name="WelcomeRegistrationScreen" component={WelcomeRegistrationScreen} />;
      })()}
    </Stack.Navigator>
  );
};

export default RegisterStack;
