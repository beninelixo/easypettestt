import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, PawPrint } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative flex items-center justify-center">
            <h1 className="text-9xl font-black bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent">
              404
            </h1>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <PawPrint className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Oops! Página não encontrada
          </h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Parece que esse pet fugiu... A página que você procura não existe ou foi movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              Voltar para o Início
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="gap-2">
              <Search className="h-5 w-5" />
              Falar com Suporte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
