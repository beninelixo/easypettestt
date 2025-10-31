import { useState } from 'react';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMultiUnit } from '@/shared/hooks/useMultiUnit';
import { cn } from '@/lib/utils';

export const UnitSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { 
    currentUnit, 
    franchises, 
    switchUnit,
    loading 
  } = useMultiUnit();

  if (loading) {
    return <div className="h-10 w-[240px] animate-pulse bg-muted rounded" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{currentUnit?.name || 'Selecione uma unidade'}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Buscar unidade..." />
          <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
          <CommandList>
            {franchises.map((franchise) => (
              <CommandGroup 
                key={franchise.id} 
                heading={franchise.name}
              >
                {franchise.units?.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={unit.id}
                    onSelect={() => {
                      switchUnit(unit.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentUnit?.id === unit.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{unit.name}</span>
                      {unit.alerts && unit.alerts > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {unit.alerts}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem>
              <Building2 className="mr-2 h-4 w-4" />
              Adicionar Unidade
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
