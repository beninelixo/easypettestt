import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserX, ChevronLeft, ChevronRight, Edit, Shield, RefreshCw, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditUserDialog } from "./EditUserDialog";
import { BlockUserDialog } from "./BlockUserDialog";
import { ImpersonateUserDialog } from "./ImpersonateUserDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
  roles: string[];
}

const USERS_PER_PAGE = 20;

export const SuperAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [blockingUser, setBlockingUser] = useState<{ id: string; email: string } | null>(null);
  const [impersonatingUser, setImpersonatingUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Use edge function instead of admin API (which requires service_role)
      const { data, error } = await supabase.functions.invoke('list-users-admin', {
        body: { 
          page: currentPage, 
          perPage: USERS_PER_PAGE, 
          search: searchTerm || undefined
        }
      });

      if (error) {
        console.error('Error calling list-users-admin:', error);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar a lista de usuários",
          variant: "destructive"
        });
        return;
      }

      if (data?.users) {
        setUsers(data.users);
        setTotalUsers(data.total || data.users.length);
      }
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, toast]);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>;
    }
    if (roles.includes('pet_shop')) {
      return <Badge variant="default" className="gap-1">Profissional</Badge>;
    }
    return <Badge variant="secondary">Cliente</Badge>;
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              {totalUsers} usuários cadastrados no sistema
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.profile?.full_name || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.roles || [])}</TableCell>
                      <TableCell className="text-sm">
                        {user.created_at 
                          ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.last_sign_in_at 
                          ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setEditingUser(user)}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setImpersonatingUser({ 
                              id: user.id, 
                              email: user.email, 
                              name: user.profile?.full_name || 'Usuário' 
                            })}
                            title="Impersonar usuário"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setBlockingUser({ id: user.id, email: user.email })}
                            className="text-destructive hover:text-destructive"
                            title="Bloquear usuário"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        {editingUser && (
          <EditUserDialog
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
            user={{
              id: editingUser.id,
              email: editingUser.email,
              full_name: editingUser.profile?.full_name || '',
              phone: editingUser.profile?.phone || '',
              role: editingUser.roles?.[0] || 'client',
            }}
            onSuccess={loadUsers}
          />
        )}
        
        {blockingUser && (
          <BlockUserDialog
            open={!!blockingUser}
            onOpenChange={(open) => !open && setBlockingUser(null)}
            userId={blockingUser.id}
            userEmail={blockingUser.email}
            onSuccess={loadUsers}
          />
        )}

        {impersonatingUser && (
          <ImpersonateUserDialog
            open={!!impersonatingUser}
            onOpenChange={(open) => !open && setImpersonatingUser(null)}
            userId={impersonatingUser.id}
            userEmail={impersonatingUser.email}
            userName={impersonatingUser.name}
          />
        )}
      </CardContent>
    </Card>
  );
};
