// Mobile Filters Drawer - Bottom sheet for filters on mobile
import { ReactNode, useState } from 'react';
import { useIsMobile } from '@/utils/breakpoints';
import { Button } from '@/components/ui/button';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  component: ReactNode;
}

interface MobileFiltersDrawerProps {
  filters: FilterOption[];
  activeCount?: number;
  onClear?: () => void;
  onApply?: () => void;
  triggerLabel?: string;
  title?: string;
  className?: string;
  desktopContent?: ReactNode;
}

export const MobileFiltersDrawer = ({
  filters,
  activeCount = 0,
  onClear,
  onApply,
  triggerLabel = 'Filtros',
  title = 'Aplicar Filtros',
  className,
  desktopContent,
}: MobileFiltersDrawerProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Desktop: render inline filters or custom content
  if (!isMobile) {
    if (desktopContent) return <>{desktopContent}</>;
    
    return (
      <div className={cn("flex flex-wrap gap-4 items-end", className)}>
        {filters.map(filter => (
          <div key={filter.key} className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              {filter.label}
            </label>
            {filter.component}
          </div>
        ))}
      </div>
    );
  }

  // Mobile: drawer with filters
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between gap-2 min-h-[44px]",
            activeCount > 0 && "border-primary/50",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>{triggerLabel}</span>
          </div>
          {activeCount > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-primary/20 text-primary text-xs px-2"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="p-4 space-y-5 overflow-y-auto">
          {filters.map(filter => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {filter.label}
              </label>
              {filter.component}
            </div>
          ))}
        </div>
        
        <DrawerFooter className="border-t border-border/50 pt-4">
          <div className="flex gap-3 w-full">
            {onClear && (
              <Button 
                variant="outline" 
                className="flex-1 min-h-[44px]"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                Limpar
              </Button>
            )}
            <Button 
              className="flex-1 min-h-[44px]"
              onClick={() => {
                onApply?.();
                setOpen(false);
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
