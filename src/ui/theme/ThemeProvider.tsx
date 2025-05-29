import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, themes, createStyle, StyleHelpers, createTheme } from './theme';
import { ColorScheme } from './colors';
import { storage } from '../../platform/storageUtils';

const THEME_STORAGE_KEY = 'weilang_theme_preference';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  setColorScheme: (scheme: ColorScheme | 'auto') => void;
  styles: StyleHelpers;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialColorScheme?: ColorScheme | 'auto';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialColorScheme = 'auto' 
}) => {
  const systemColorScheme = useColorScheme();
  const [userPreference, setUserPreference] = useState<ColorScheme | 'auto'>('auto');
  
  // Determine effective color scheme
  const effectiveColorScheme: ColorScheme = 
    userPreference === 'auto' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : userPreference;
  
  const theme = themes[effectiveColorScheme];
  const styles = createStyle(theme);
  const isDark = effectiveColorScheme === 'dark';

  // Load saved preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await storage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
          setUserPreference(saved as ColorScheme | 'auto');
        } else {
          setUserPreference(initialColorScheme);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        setUserPreference(initialColorScheme);
      }
    };
    
    loadThemePreference();
  }, [initialColorScheme]);

  // Save preference when it changes
  const setColorScheme = async (scheme: ColorScheme | 'auto') => {
    try {
      setUserPreference(scheme);
      await storage.setItem(THEME_STORAGE_KEY, scheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Toggle between light and dark (ignoring auto)
  const toggleTheme = () => {
    const newScheme = effectiveColorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
  };

  const contextValue: ThemeContextType = {
    theme,
    colorScheme: effectiveColorScheme,
    isDark,
    setColorScheme,
    styles,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for creating theme-aware styles
export const useThemedStyles = <T extends Record<string, any>>(
  createStylesFn: (theme: Theme, styles: StyleHelpers) => T
): T => {
  const { theme, styles } = useTheme();
  return createStylesFn(theme, styles);
};

// Hook for accessing theme colors directly
export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

// Hook for accessing theme spacing/layout
export const useLayout = () => {
  const { theme } = useTheme();
  return {
    spacing: theme.spacing,
    layout: theme.layout,
    borderRadius: theme.borderRadius,
    dimensions: theme.dimensions,
  };
};

// Hook for accessing typography
export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
}; 