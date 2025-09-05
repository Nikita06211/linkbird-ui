'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeTest() {
  const { theme } = useTheme();
  
  return (
    <div className="p-4 border-2 border-red-500">
      <h3 className="text-lg font-bold mb-2">Theme Test - Current: {theme}</h3>
      
      {/* Test with Tailwind classes */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded mb-4">
        <p className="text-black dark:text-white">
          Tailwind: This should be black in light mode, white in dark mode
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 mt-2 rounded">
          <p className="text-gray-800 dark:text-gray-200">
            Tailwind: This should be dark gray in light mode, light gray in dark mode
          </p>
        </div>
      </div>

      {/* Test with custom CSS classes */}
      <div className="test-dark-mode p-4 rounded mb-4">
        <p>Custom CSS test - should be white background in light mode, dark gray in dark mode</p>
      </div>

      {/* Test with conditional rendering based on theme */}
      <div className={`p-4 rounded mb-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Conditional rendering test - should change based on theme state</p>
      </div>

      {/* Test current theme detection */}
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
        <p className="text-yellow-800 dark:text-yellow-200">
          Current HTML classes: {typeof window !== 'undefined' ? document.documentElement.className : 'SSR'}
        </p>
        <p className="text-yellow-800 dark:text-yellow-200">
          Theme context: {theme}
        </p>
      </div>

      {/* Simple color test */}
      <div className="p-4 rounded mb-4" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
        <p>Direct style test - should change based on theme state</p>
      </div>
    </div>
  );
}
