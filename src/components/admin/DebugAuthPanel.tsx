import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCw, User, Clock, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export const DebugAuthPanel = () => {
  const { user, userRole, loading, lastRoleUpdate, forceRefreshAuth } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    await forceRefreshAuth();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Live update do timestamp
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Debug Auth Panel
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleForceRefresh}
            disabled={isRefreshing || loading}
            className="h-7 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Force Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs font-mono">
        {/* User ID */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            User ID:
          </span>
          <Badge variant="outline" className="font-mono text-xs">
            {user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : 'null'}
          </Badge>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Email:</span>
          <Badge variant="outline" className="font-mono text-xs">
            {user?.email || 'null'}
          </Badge>
        </div>

        {/* Role */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Role:</span>
          <Badge 
            variant={userRole === 'admin' ? 'default' : 'secondary'}
            className="font-mono text-xs"
          >
            {userRole || 'null'}
          </Badge>
        </div>

        {/* Loading Status */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Loading:</span>
          <Badge 
            variant={loading ? 'destructive' : 'default'}
            className="font-mono text-xs"
          >
            {loading ? 'true' : 'false'}
          </Badge>
        </div>

        {/* Last Role Update */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last Update:
          </span>
          <Badge variant="outline" className="font-mono text-xs">
            {formatDistanceToNow(lastRoleUpdate, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </Badge>
        </div>

        {/* Timestamp Absoluto */}
        <div className="text-center pt-2 border-t border-dashed border-primary/20">
          <span className="text-muted-foreground text-[10px]">
            {new Date(lastRoleUpdate).toLocaleString('pt-BR')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
