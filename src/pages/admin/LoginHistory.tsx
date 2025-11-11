import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Search, User, Calendar, MapPin, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  attempt_time: string;
}

interface TimelineData {
  date: string;
  successful: number;
  failed: number;
}

export default function LoginHistory() {
  const [email, setEmail] = useState('');
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const searchHistory = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, insira um email para buscar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email.toLowerCase())
        .order('attempt_time', { ascending: false })
        .limit(100);

      if (error) throw error;

      setAttempts(data || []);

      // Process timeline data
      const timeline = processTimelineData(data || []);
      setTimelineData(timeline);

      if (data?.length === 0) {
        toast({
          title: 'Nenhum registro encontrado',
          description: `Não há tentativas de login registradas para ${email}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar histórico',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processTimelineData = (data: LoginAttempt[]): TimelineData[] => {
    const groupedByDate = data.reduce((acc, attempt) => {
      const date = new Date(attempt.attempt_time).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = { successful: 0, failed: 0 };
      }
      if (attempt.success) {
        acc[date].successful++;
      } else {
        acc[date].failed++;
      }
      return acc;
    }, {} as Record<string, { successful: number; failed: number }>);

    return Object.entries(groupedByDate)
      .map(([date, counts]) => ({
        date,
        successful: counts.successful,
        failed: counts.failed,
      }))
      .reverse()
      .slice(-30); // Last 30 days
  };

  const stats = {
    total: attempts.length,
    successful: attempts.filter((a) => a.success).length,
    failed: attempts.filter((a) => a.success === false).length,
    uniqueIPs: new Set(attempts.map((a) => a.ip_address).filter(Boolean)).size,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Login por Usuário</h1>
        <p className="text-muted-foreground">
          Visualize padrões de acesso e tentativas de login de usuários individuais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Histórico</CardTitle>
          <CardDescription>Digite o email do usuário para visualizar seu histórico completo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email do Usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchHistory()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchHistory} disabled={loading} className="gap-2">
                <Search className="h-4 w-4" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && attempts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Tentativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Logins Bem-sucedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.successful}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tentativas Falhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats.uniqueIPs}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo de Acessos</CardTitle>
              <CardDescription>Padrão de login dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="successful" stroke="#10b981" name="Bem-sucedidos" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Falhados" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tentativas Recentes</CardTitle>
              <CardDescription>Últimas 100 tentativas de login</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className={`p-4 border rounded-lg ${
                      attempt.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{attempt.email}</span>
                          {attempt.success ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Sucesso</span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Falha</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(attempt.attempt_time).toLocaleString('pt-BR')}
                          </div>
                          {attempt.ip_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="font-mono">{attempt.ip_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {searched && attempts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
            <p className="text-muted-foreground text-center">
              Não há tentativas de login registradas para o email <span className="font-mono">{email}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
