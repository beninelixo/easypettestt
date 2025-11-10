import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative group">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`pr-12 ${className || ''}`}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent transition-all duration-300 group-hover:text-primary"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          ) : (
            <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
          <span className="sr-only">
            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          </span>
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
