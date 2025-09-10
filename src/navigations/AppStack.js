
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import InAppPurchase from '../screens/InAppPurchase';
import SubscriptionScreenIOS from '../screens/SubscriptionScreenIOS';
import BottomTabNavigator from './BottomTabNavigator';
import CarDetailsScreen from '../screens/CarDetailsScreen';
import CarNameScreen from '../screens/CarNameScreen';
import CarsFuelAndTrans from '../screens/CarsFuelAndTrans';
import CarHistoryAndColor from '../screens/CarHistoryAndColor';
import RangeSelectorScreen from '../screens/RangeSelectorScreen';
import CarPhotoUploadScreen from '../screens/CarPhotoUploadScreen';
import PreviewScreen from '../screens/PreviewScreen';
import MyAssetsScreen from '../screens/MyAssetsScreen';
import LeadsScreen from '../screens/LeadsScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import FAQScreen from '../screens/FAQScreen';
import WelcomeRegistrationScreen from '../screens/WelcomeRegistrationScreen';
import RegisterDealer from '../screens/RegisterDealer';
import RegistrationACScreen from '../screens/RegistrationACScreen';
import RegistrationBDScreen from '../screens/RegistrationBDScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import TicketListScreen from '../screens/TicketListScreen';
import ViewTicketScreen from '../screens/ViewTicketScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import CitySearchScreen from '../screens/CitySearchScreen';
import WelcomeLoginScreen from '../screens/WelcomeLoginScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SupportTicketScreen from '../screens/SupportTicketScreen';
import LoginExtra from '../screens/LoginExtra';
import TutorialScreen from '../screens/TutorialScreen';
import CMSWebViewScreen from '../screens/CMSWebViewScreen';
import SplashScreen from '../screens/SplashScreen';
import BikeTypeSelection from '../screens/BikeTypeSelection';
import AssetsPreviewScreen from '../screens/AssetsPreviewScreen';
import SpareTypeSelection from '../screens/SpareTypeSelection';
import SpareBrandScreen from '../screens/SpareBrandScreen';
import SparePartName from '../screens/SparePartName';
import SpareDecriptionScreen from '../screens/SpareDescriptionScreen';
import SpareDescriptionScreen from '../screens/SpareDescriptionScreen';
import SpareUploadScreen from '../screens/SpareUploadScreen';
import SparePreviewScreen from '../screens/SparePreviewScreen';
import AadharKycWebview from '../screens/AadharKycWebview';
import AccountStatusScreen from '../screens/AccountStatusScreen';

const Stack = createStackNavigator();

const AppStack = () => (
  <Stack.Navigator initialRouteName='BottomTabNavigator' screenOptions={{ headerShown: false }}>
    {/* <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} /> */}
    <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="InAppPurchase" component={InAppPurchase} options={{ headerShown: false }} />
    <Stack.Screen name="SubscriptionScreenIOS" component={SubscriptionScreenIOS} options={{ headerShown: false }} />
    <Stack.Screen name="CarDetailsScreen" component={CarDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CarNameScreen" component={CarNameScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CarsFuelAndTrans" component={CarsFuelAndTrans} options={{ headerShown: false }} />
    <Stack.Screen name="CarHistoryAndColor" component={CarHistoryAndColor} options={{ headerShown: false }} />
    <Stack.Screen name="RangeSelectorScreen" component={RangeSelectorScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CarPhotoUploadScreen" component={CarPhotoUploadScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PreviewScreen" component={PreviewScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MyAssetsScreen" component={MyAssetsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LeadsScreen" component={LeadsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProfileDetailsScreen" component={ProfileDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="InventoryScreen" component={InventoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LoginExtra" component={LoginExtra} options={{ headerShown: false }} />
    <Stack.Screen name="NewTicketScreen" component={NewTicketScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TicketListScreen" component={TicketListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ViewTicketScreen" component={ViewTicketScreen} options={{ headerShown: false }} />
    <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SupportTicketScreen" component={SupportTicketScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TutorialScreen" component={TutorialScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CMSWebViewScreen" component={CMSWebViewScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BikeTypeSelection" component={BikeTypeSelection} options={{ headerShown: false }} />
    <Stack.Screen name="AssetsPreviewScreen" component={AssetsPreviewScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AccountStatusScreen" component={AccountStatusScreen} options={{ headerShown: false }} />
    
  
  
  {/* spare screens */}
    <Stack.Screen name="SpareTypeSelection" component={SpareTypeSelection} options={{ headerShown: false }} />
    <Stack.Screen name="SpareBrandScreen" component={SpareBrandScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SparePartName" component={SparePartName} options={{ headerShown: false }} />
    <Stack.Screen name="SpareDescriptionScreen" component={SpareDescriptionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SpareUploadScreen" component={SpareUploadScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SparePreviewScreen" component={SparePreviewScreen} options={{ headerShown: false }} />





  </Stack.Navigator>
);
export default AppStack;