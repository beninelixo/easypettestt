import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  routePath: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class AdminRouteGuard extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to system_logs
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await supabase.from('system_logs').insert([{
        module: 'admin_route_guard',
        log_type: 'error',
        message: `Error in admin route: ${this.props.routePath}`,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
          componentStack: errorInfo.componentStack,
          routePath: this.props.routePath,
          timestamp: new Date().toISOString(),
        } as any,
      }]);

      // Create admin alert for critical errors
      await supabase.from('admin_alerts').insert([{
        alert_type: 'admin_route_error',
        severity: 'high',
        title: `Erro na Rota Admin: ${this.props.routePath}`,
        message: error.message,
        context: {
          routePath: this.props.routePath,
          errorStack: error.stack?.substring(0, 500),
        } as any,
      }]);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleGoHome = () => {
    window.location.href = '/admin/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="max-w-md w-full border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Erro na Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Ocorreu um erro ao carregar esta página. Nossa equipe foi notificada automaticamente.
              </p>
              
              {this.state.error && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                {this.state.retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente ({this.maxRetries - this.state.retryCount} restantes)
                  </Button>
                )}
                <Button onClick={this.handleGoHome} size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Rota: {this.props.routePath}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
