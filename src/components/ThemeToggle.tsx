import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        size="icon"
        variant="outline"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl border-2 bg-background hover:scale-110 transition-all duration-300"
        disabled
      >
        <Sun className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="outline"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl border-2 bg-background hover:scale-110 transition-all duration-300 hover:shadow-glow"
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-6 w-6 text-primary animate-in zoom-in duration-300" />
      ) : (
        <Moon className="h-6 w-6 text-primary animate-in zoom-in duration-300" />
      )}
    </Button>
  );
};
