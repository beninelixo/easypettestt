import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUserManagement, UserRole, UserWithRole } from "@/hooks/useUserManagement";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { BlockUserDialog } from "@/components/admin/BlockUserDialog";
import { ManageUserPlanDialog } from "@/components/admin/ManageUserPlanDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { 
  Mail, Shield, User, Clock, CheckCircle, History, UserPlus, Search, RefreshCw,
  MoreHorizontal, Ban, UserCheck, Trash2, Edit, Crown, Store
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
  pet_shop: "Pet Shop",
  client: "Cliente",
};

const roleColors: Record<UserRole, "destructive" | "default" | "secondary" | "outline"> = {
  admin: "destructive",
  super_admin: "destructive",
  pet_shop: "default",
  client: "secondary",
};

export default function UserManagement() {
  const { 
    users, invites, roleChanges, loading, total,
    sendAdminInvite, changeUserRole, removeUserRole, 
    blockUser, unblockUser, deleteUser, updateUserPlan,
    refresh, searchUsers 
  } = useUserManagement();
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Dialog states
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [blockUserData, setBlockUserData] = useState<{ id: string; email: string } | null>(null);
  const [planUser, setPlanUser] = useState<UserWithRole | null>(null);
  const [deleteUserData, setDeleteUserData] = useState<{ id: string; email: string; name: string } | null>(null);

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    
    setSending(true);
    await sendAdminInvite(inviteEmail);
    setInviteEmail("");
    setSending(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole === "none") {
      await removeUserRole(userId);
    } else {
      await changeUserRole(userId, newRole as UserRole);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2 || value.length === 0) {
      searchUsers(value || undefined);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter || (roleFilter === "none" && !user.role);
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários, roles e convites administrativos ({total} usuários)
          </p>
        </div>
        <Button onClick={refresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="users" className="gap-2">
            <User className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2">
            <Mail className="h-4 w-4" />
            Convites
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Todos os Usuários ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                Visualize, edite, bloqueie ou exclua usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os roles</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="pet_shop">Pet Shop</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="none">Sem role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando usuários...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                        user.is_blocked ? "border-destructive/50 bg-destructive/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium flex items-center gap-2">
                            {user.full_name}
                            {user.is_blocked && (
                              <Badge variant="destructive" className="text-xs">
                                <Ban className="h-3 w-3 mr-1" />
                                Bloqueado
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                          {user.last_sign_in_at && (
                            <div className="text-xs text-muted-foreground">
                              Último acesso: {format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {user.role && (
                            <Badge variant={roleColors[user.role]}>
                              {roleLabels[user.role]}
                            </Badge>
                          )}
                          {user.pet_shop && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Store className="h-3 w-3" />
                              {user.pet_shop.name}
                              {user.pet_shop.subscription_plan && (
                                <span className="ml-1 text-amber-600">
                                  ({user.pet_shop.subscription_plan})
                                </span>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Select
                          value={user.role || "none"}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Selecionar role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Remover role</SelectItem>
                            <SelectItem value="client">Cliente</SelectItem>
                            <SelectItem value="pet_shop">Pet Shop</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Usuário
                            </DropdownMenuItem>
                            
                            {user.pet_shop && (
                              <DropdownMenuItem onClick={() => setPlanUser(user)}>
                                <Crown className="h-4 w-4 mr-2" />
                                Gerenciar Plano
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {user.is_blocked ? (
                              <DropdownMenuItem onClick={() => unblockUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Desbloquear
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => setBlockUserData({ id: user.id, email: user.email })}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Bloquear
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteUserData({ 
                                id: user.id, 
                                email: user.email, 
                                name: user.full_name 
                              })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Usuário
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Enviar Convite Admin
              </CardTitle>
              <CardDescription>
                Convide novos administradores via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                />
                <Button onClick={handleSendInvite} disabled={sending || !inviteEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  {sending ? "Enviando..." : "Enviar Convite"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>
                Lista de todos os convites enviados e seu status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum convite enviado ainda
                  </div>
                ) : (
                  invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{invite.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Enviado em {format(new Date(invite.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expira em {format(new Date(invite.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      {invite.accepted ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Aceito
                        </Badge>
                      ) : new Date(invite.expires_at) < new Date() ? (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Expirado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Mudanças de Role
              </CardTitle>
              <CardDescription>
                Auditoria completa de todas as alterações de permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleChanges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma mudança de role registrada
                  </div>
                ) : (
                  roleChanges.map((change) => {
                    const user = users.find((u) => u.id === change.changed_user_id);
                    const changedBy = users.find((u) => u.id === change.changed_by);

                    return (
                      <div
                        key={change.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">
                            {user?.full_name || "Usuário desconhecido"} ({user?.email})
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {change.action === "added" && "Role adicionado: "}
                            {change.action === "removed" && "Role removido: "}
                            {change.action === "changed" && "Role alterado: "}
                            {change.old_role && (
                              <Badge variant="outline" className="mr-2">
                                {roleLabels[change.old_role]}
                              </Badge>
                            )}
                            {change.action === "changed" && "→ "}
                            <Badge variant={roleColors[change.new_role]}>
                              {roleLabels[change.new_role]}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Por: {changedBy?.full_name || "Sistema"} •{" "}
                            {format(new Date(change.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {editUser && (
        <EditUserDialog
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
          user={{
            id: editUser.id,
            email: editUser.email,
            full_name: editUser.full_name,
            phone: editUser.phone || "",
            role: editUser.role || "client",
          }}
          onSuccess={refresh}
        />
      )}

      {blockUserData && (
        <BlockUserDialog
          open={!!blockUserData}
          onOpenChange={(open) => !open && setBlockUserData(null)}
          userId={blockUserData.id}
          userEmail={blockUserData.email}
          onSuccess={refresh}
        />
      )}

      {planUser && planUser.pet_shop && (
        <ManageUserPlanDialog
          open={!!planUser}
          onOpenChange={(open) => !open && setPlanUser(null)}
          petShopId={planUser.pet_shop.id}
          petShopName={planUser.pet_shop.name}
          currentPlan={planUser.pet_shop.subscription_plan}
          currentExpiry={planUser.pet_shop.subscription_expires_at}
          onConfirm={updateUserPlan}
        />
      )}

      {deleteUserData && (
        <DeleteUserDialog
          open={!!deleteUserData}
          onOpenChange={(open) => !open && setDeleteUserData(null)}
          userId={deleteUserData.id}
          userEmail={deleteUserData.email}
          userName={deleteUserData.name}
          onConfirm={deleteUser}
        />
      )}
    </div>
  );
}
