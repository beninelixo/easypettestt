import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const userEditSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  role: z.enum(['client', 'pet_shop', 'admin', 'super_admin']),
});

type UserEditForm = z.infer<typeof userEditSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
  };
  onSuccess?: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: (user.role as any) || 'client',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (open && user) {
      form.reset({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: (user.role as any) || 'client',
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: UserEditForm) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('update-user-admin', {
        body: {
          userId: user.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          role: data.role,
          action: 'update'
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar usuário');
      }

      // Check for errors in the response
      if (result && typeof result === 'object' && 'error' in result) {
        throw new Error((result as any).error || 'Erro ao atualizar usuário');
      }

      toast({
        title: "✅ Usuário Atualizado",
        description: `Dados de ${data.full_name} foram atualizados com sucesso`,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Parse error message for better UX
      let errorMessage = error.message || 'Erro desconhecido ao atualizar usuário';
      
      if (errorMessage.includes('Permission denied')) {
        errorMessage = 'Você não tem permissão para atualizar este usuário';
      } else if (errorMessage.includes('god user')) {
        errorMessage = 'Não é possível alterar o usuário god';
      } else if (errorMessage.includes('not found')) {
        errorMessage = 'Usuário não encontrado';
      } else if (errorMessage.includes('validation')) {
        errorMessage = 'Dados inválidos. Verifique os campos e tente novamente';
      }
      
      toast({
        title: "❌ Erro ao Atualizar Usuário",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere os dados do usuário. Todas as mudanças serão registradas nos logs de auditoria.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@email.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Alterar o email enviará uma confirmação para o novo endereço
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil/Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="pet_shop">Profissional PetShop</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    ⚠️ Alterar o role pode afetar as permissões do usuário
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
