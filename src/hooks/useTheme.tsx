import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved theme or default to dark IMMEDIATELY
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme || 'dark';
    
    // Apply theme to document BEFORE any render
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Update document class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    toggleTheme,
    mounted,
  };
};
