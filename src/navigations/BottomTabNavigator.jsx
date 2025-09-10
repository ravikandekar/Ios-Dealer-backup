import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import  FontAwesome5 from 'react-native-vector-icons/FontAwesome5';



import LoginScreen from '../screens/LoginScreen';
import CarDetailsScreen from '../screens/CarDetailsScreen';
import CarNameScreen from '../screens/CarNameScreen';
import CarsFuelAndTrans from '../screens/CarsFuelAndTrans';
import CarHistoryAndColor from '../screens/CarHistoryAndColor';
import RangeSelectorScreen from '../screens/RangeSelectorScreen';
import CarPhotoUploadScreen from '../screens/CarPhotoUploadScreen';
import PreviewScreen from '../screens/PreviewScreen';
import MyAssetsScreen from '../screens/MyAssetsScreen';
import HomeScreen from '../screens/HomeScreen';
import LeadsScreen from '../screens/LeadsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import TutorialScreen from '../screens/TutorialScreen';
import SupportTicketScreen from '../screens/SupportTicketScreen';
import LoginExtra from '../screens/LoginExtra';
import AccountScreen from '../screens/AccountScreen';
import WelcomeRegistrationScreen from '../screens/WelcomeRegistrationScreen';
import WelcomeLoginScreen from '../screens/WelcomeLoginScreen';
import AddharDigiKyc from '../screens/AddharDigiKyc';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
 tabBarIcon: ({ color, size }) => {
  if (route.name === 'Dashboard') {
    return <MaterialIcons name="dashboard" size={size} color={color} />;
  } else if (route.name === 'My Assets') {
    return <FontAwesome5 name="list-alt" size={size} color={color} />;
  } else if (route.name === 'Leads') {
    return <FontAwesome5 name="users" size={size} color={color} />;
  } else if (route.name === 'Account') {
    return <FontAwesome5 name="user-circle" size={size} color={color} />;
  }
},
      tabBarActiveTintColor: '#007aff',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={HomeScreen} />
    <Tab.Screen name="My Assets" component={MyAssetsScreen} />
    <Tab.Screen name="Leads" component={LeadsScreen} />
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;
