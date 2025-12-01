import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // This component is now integrated into sidebars, not floating
  return null;
};
