import React, { createContext, useState, useEffect } from 'react';
import { storeToken, getToken, removeToken } from '../utils/storage';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../constants/themes';
import { setLogoutCallback } from '../utils/LogoutFunction';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [register, setregister] = useState(false);
  const [cityselected, setcityselected] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isAadharVerified, setisAadharVerified] = useState(false);
  const [isBussinessdetails, setBussinessdetails] = useState(false);
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [userID, setUserID] = useState('');
  const [userName, setUserName] = useState('');
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  console.log('🔐 AuthProvider initialized with isDark:', register, cityselected, profileCompleted, isAadharVerified, isBussinessdetails, selectedCategory);

  const login = async (token) => {
    console.log('🔐 Logging in with token:', token);
    await storeToken(token);
    setIsAuthenticated(true);
    console.log('✅ Authenticated set to true');
  };

  const checkToken = async () => {
    const token = await getToken();
    const authStatus = !!token;
    setIsAuthenticated(authStatus);
    console.log('🔎 Token checked:', token);
    console.log('🔐 Authenticated:', authStatus);
    return authStatus;

  };


  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  useEffect(() => {
    setLogoutCallback(logout); // register globally
  }, []);
  const logout = async () => {
    console.log('🚪 Logging out...');
    await removeToken();
    setIsAuthenticated(false);
    console.log('✅ Token removed and user data cleared');
    console.log('🔒 User logged out');
  };
  // Current theme object
  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated, setIsAuthenticated,
        login,
        checkToken,
        theme,
        isDark,
        toggleTheme,
        logout,
        setLogoutCallback: (callback) => setLogoutCallback(callback),
        selectedCategory, setSelectedCategory,
        register, setregister,
        cityselected, setcityselected,
        profileCompleted, setProfileCompleted,
        isAadharVerified, setisAadharVerified,
        userID, setUserID,
        isBussinessdetails, setBussinessdetails,
        userName, setUserName,
        isAppInitialized, setIsAppInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
