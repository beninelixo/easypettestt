import * as React from 'react';
import { cn } from '@/lib/utils';

interface SmoothScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  offset?: number;
  children: React.ReactNode;
}

export function SmoothScrollLink({ 
  to, 
  offset = 80, 
  children, 
  className,
  onClick,
  ...props 
}: SmoothScrollLinkProps) {
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const element = document.getElementById(to);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    onClick?.(e);
  }, [to, offset, onClick]);

  return (
    <a
      href={`#${to}`}
      className={cn(
        'cursor-pointer transition-colors duration-200 hover:text-primary',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

export default SmoothScrollLink;
