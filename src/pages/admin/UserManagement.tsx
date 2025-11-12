import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUserManagement, UserRole } from "@/hooks/useUserManagement";
import { Mail, Shield, User, Clock, CheckCircle, XCircle, History, UserPlus, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  pet_shop: "Pet Shop",
  client: "Cliente",
};

const roleColors: Record<UserRole, string> = {
  admin: "destructive",
  pet_shop: "default",
  client: "secondary",
};

export default function UserManagement() {
  const { users, invites, roleChanges, loading, sendAdminInvite, changeUserRole, removeUserRole, refresh } = useUserManagement();
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    
    setSending(true);
    await sendAdminInvite(inviteEmail);
    setInviteEmail("");
    setSending(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await changeUserRole(userId, newRole as UserRole);
  };

  const handleRemoveRole = async (userId: string) => {
    await removeUserRole(userId);
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários, roles e convites administrativos
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
                Visualize e modifique roles de todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                        {user.role && (
                          <Badge variant={roleColors[user.role] as any}>
                            {roleLabels[user.role]}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role || "none"}
                          onValueChange={(value) => {
                            if (value === "none") {
                              handleRemoveRole(user.id);
                            } else {
                              handleRoleChange(user.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Selecionar role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Remover role</SelectItem>
                            <SelectItem value="client">Cliente</SelectItem>
                            <SelectItem value="pet_shop">Pet Shop</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <Badge variant={roleColors[change.new_role] as any}>
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
    </div>
  );
}