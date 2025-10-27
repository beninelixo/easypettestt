import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PawPrint } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement authentication logic
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted to-background p-4">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl transition-transform group-hover:scale-110">
              <PawPrint className="h-8 w-8" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Bem-vindo ao Bointhosa</h1>
          <p className="text-muted-foreground">Entre ou crie sua conta para começar</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="text-right">
                    <Button variant="link" className="px-0 text-sm" type="button">
                      Esqueceu a senha?
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Criar Conta</CardTitle>
                  <CardDescription>Preencha os dados abaixo para criar sua conta gratuitamente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" type="text" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business">Nome do Pet Shop</Label>
                    <Input id="business" type="text" placeholder="Nome do seu negócio" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input id="register-password" type="password" placeholder="Mínimo 8 caracteres" required />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar Conta Grátis"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
