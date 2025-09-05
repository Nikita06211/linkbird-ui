"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeDebug() {
  const { theme, toggleTheme } = useTheme();
  const [documentClasses, setDocumentClasses] = useState<string>("");

  useEffect(() => {
    const updateClasses = () => {
      setDocumentClasses(document.documentElement.classList.toString());
    };
    
    updateClasses();
    const interval = setInterval(updateClasses, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Theme Debug</h3>
      <div className="space-y-2">
        <p><strong>Current Theme:</strong> {theme}</p>
        <p><strong>Document Classes:</strong> {documentClasses}</p>
        <p><strong>LocalStorage:</strong> {typeof window !== 'undefined' ? localStorage.getItem('theme') : 'N/A'}</p>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}
