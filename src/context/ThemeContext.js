import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../constants/themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Current theme object
  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
 