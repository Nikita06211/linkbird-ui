"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme && (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    
    setTheme(initialTheme);
    
    // Immediately apply the theme to HTML element
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light', 'dark');
    htmlElement.classList.add(initialTheme);
    
    // Apply theme to body as well
    document.body.classList.remove('light', 'dark', 'bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white');
    document.body.classList.add(initialTheme);
    if (initialTheme === 'dark') {
      document.body.classList.add('bg-gray-900', 'text-white');
    } else {
      document.body.classList.add('bg-white', 'text-gray-900');
    }
    
    console.log('Initial theme set to:', initialTheme);
    console.log('Initial HTML classes:', htmlElement.classList.toString());
    console.log('Initial body classes:', document.body.classList.toString());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Update the html element class and save to localStorage
    const htmlElement = document.documentElement;
    
    // Force remove all theme classes first
    htmlElement.classList.remove('light', 'dark');
    
    // Add the new theme class
    htmlElement.classList.add(theme);
    
    // Remove conflicting theme classes from body
    document.body.classList.remove('light', 'dark', 'theme-changed', 'bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white');
    
    // Add the theme class and appropriate colors to body
    document.body.classList.add(theme);
    if (theme === 'dark') {
      document.body.classList.add('bg-gray-900', 'text-white');
    } else {
      document.body.classList.add('bg-white', 'text-gray-900');
    }
    
    localStorage.setItem('theme', theme);
    
    // Debug: Check if classes are applied
    console.log('Theme changed to:', theme);
    console.log('HTML Classes:', htmlElement.classList.toString());
    console.log('Body classes:', document.body.classList.toString());
    
    // Force a re-render by toggling a class
    setTimeout(() => {
      document.body.classList.toggle('theme-changed');
    }, 10);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
