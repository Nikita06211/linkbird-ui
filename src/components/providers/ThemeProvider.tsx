'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setMounted } = useThemeStore();

  useEffect(() => {
    setMounted(true);
    
    // Apply theme to HTML element
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light', 'dark');
    htmlElement.classList.add(theme);
    
    // Apply theme to body
    document.body.classList.remove('light', 'dark', 'bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white');
    document.body.classList.add(theme);
    if (theme === 'dark') {
      document.body.classList.add('bg-gray-900', 'text-white');
    } else {
      document.body.classList.add('bg-white', 'text-gray-900');
    }
  }, [theme, setMounted]);

  return <>{children}</>;
}
