import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Lightbulb, ChevronDown, ChevronUp, Copy, Check, ArrowRight, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getErrorTipFromMessage, ErrorTip } from '@/lib/error-tips';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  routePath: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  showTip: boolean;
  copied: boolean;
}

export class AdminRouteGuard extends Component<Props, State> {
  private maxRetries = 3;
  private tip: ErrorTip | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      showTip: true,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.logError(error, errorInfo);
    this.tip = getErrorTipFromMessage(error.message);
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

  private handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  private handleCopyError = async () => {
    const errorText = `
Erro: ${this.state.error?.message}
Rota: ${this.props.routePath}
Timestamp: ${new Date().toISOString()}
Stack: ${this.state.error?.stack || 'N/A'}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  private toggleTip = () => {
    this.setState(prev => ({ showTip: !prev.showTip }));
  };

  render() {
    if (this.state.hasError) {
      const tip = this.tip || getErrorTipFromMessage(this.state.error?.message || '');
      
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="max-w-lg w-full border-destructive/50">
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

              {/* Error Tip Section */}
              {tip && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                  <button
                    onClick={this.toggleTip}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900">
                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-medium text-sm">Como resolver este erro</span>
                      <Badge variant={
                        tip.severity === 'critical' || tip.severity === 'high' 
                          ? 'destructive' 
                          : tip.severity === 'medium' 
                            ? 'default' 
                            : 'secondary'
                      } className="text-xs">
                        {tip.category}
                      </Badge>
                    </div>
                    {this.state.showTip ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {this.state.showTip && (
                    <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-muted-foreground pl-9">
                        {tip.description}
                      </p>

                      <div className="pl-9">
                        <h4 className="text-sm font-medium mb-2">Passos para resolver:</h4>
                        <ol className="space-y-1.5">
                          {tip.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {tip.quickAction && (
                        <div className="pl-9 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = tip.quickAction!.route}
                            className="gap-1"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            {tip.quickAction.label}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {this.state.retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente ({this.maxRetries - this.state.retryCount})
                  </Button>
                )}
                <Button onClick={this.handleGoHome} size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-wrap gap-2 justify-center pt-2 border-t">
                <Button onClick={this.handleClearCache} variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Cache
                </Button>
                <Button onClick={this.handleCopyError} variant="ghost" size="sm">
                  {this.state.copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Erro
                    </>
                  )}
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
