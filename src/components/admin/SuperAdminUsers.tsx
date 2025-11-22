import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserCheck, UserX, Eye, Mail, ChevronLeft, ChevronRight, Edit, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditUserDialog } from "./EditUserDialog";
import { BlockUserDialog } from "./BlockUserDialog";
import { ImpersonateUserDialog } from "./ImpersonateUserDialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  profiles: {
    full_name: string;
    phone: string;
  };
  user_roles: Array<{
    role: string;
  }>;
}

const USERS_PER_PAGE = 50;

export const SuperAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [blockingUser, setBlockingUser] = useState<{ id: string; email: string } | null>(null);
  const [impersonatingUser, setImpersonatingUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setRateLimitReached(false);

      // Check rate limit
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: rateLimitOk, error: rateLimitError } = await supabase
          .rpc('check_admin_rate_limit', {
            p_admin_id: userData.user.id,
            p_endpoint: 'list_users',
            p_max_requests: 100,
            p_window_minutes: 5
          });

        if (rateLimitError || !rateLimitOk) {
          setRateLimitReached(true);
          toast({
            title: "Rate Limit Atingido",
            description: "Muitas requisições. Aguarde 5 minutos.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        page: currentPage,
        perPage: USERS_PER_PAGE
      });
      
      if (authError) throw authError;

      setHasMore(authUsers.users.length === USERS_PER_PAGE);

      const userIds = authUsers.users.map(u => u.id);
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const enrichedUsers = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || '',
        profiles: profiles?.find(p => p.id === user.id) || { full_name: '', phone: '' },
        user_roles: roles?.filter(r => r.user_id === user.id) || []
      }));

      setUsers(enrichedUsers);
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
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Página {currentPage} - Exibindo até {USERS_PER_PAGE} usuários por página
          {rateLimitReached && (
            <Badge variant="destructive" className="ml-2">Rate Limit Atingido</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : rateLimitReached ? (
          <div className="text-center py-8 text-destructive">
            Limite de requisições atingido. Aguarde 5 minutos antes de tentar novamente.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.profiles.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.user_roles.map((r, i) => (
                      <Badge key={i} variant="outline" className="mr-1">
                        {r.role}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                      : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setEditingUser(user)}
                        title="Editar usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setImpersonatingUser({ id: user.id, email: user.email, name: user.profiles.full_name })}
                        title="Impersonar usuário"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
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
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        )}

        {/* Paginação */}
        {!loading && !rateLimitReached && users.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Página {currentPage}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasMore}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Dialogs */}
        {editingUser && (
          <EditUserDialog
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
            user={editingUser}
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
