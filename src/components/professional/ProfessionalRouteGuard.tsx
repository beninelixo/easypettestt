import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

export class ProfessionalRouteGuard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Professional route error:", error, errorInfo);
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to backend
    this.logError(error, errorInfo);
  }

  async logError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      await supabase.from('system_logs' as any).insert([{
        level: 'error',
        module: 'professional_route_guard',
        message: `Professional route crashed: ${error.message}`,
        context: {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          retryCount: this.state.retryCount
        }
      }]);

      await supabase.from('admin_alerts').insert([{
        alert_type: 'professional_route_crash',
        severity: 'high',
        title: 'Erro em rota profissional',
        message: `Uma página profissional apresentou erro: ${error.message}`,
        metadata: {
          error: error.message,
          retryCount: this.state.retryCount
        }
      }]);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState(prev => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/professional/services';
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < MAX_RETRIES;

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-destructive/50 bg-destructive/5">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Ops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro ao carregar esta página. Nossa equipe foi notificada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground font-mono break-all">
                  {this.state.error.message}
                </div>
              )}
              
              <div className="flex gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente ({MAX_RETRIES - this.state.retryCount} restantes)
                  </Button>
                )}
                <Button 
                  onClick={this.handleGoHome}
                  variant={canRetry ? "ghost" : "default"}
                  className={canRetry ? "" : "flex-1"}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao início
                </Button>
              </div>

              {this.state.retryCount > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Tentativa {this.state.retryCount} de {MAX_RETRIES}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
