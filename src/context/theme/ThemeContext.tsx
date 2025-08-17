import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../../hooks/browser/useLocalStorage';

export type Theme = 'boy' | 'girl' | 'neutral';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'neutral' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>('selected-theme', defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
