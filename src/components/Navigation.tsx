import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg transition-transform group-hover:scale-110">
            <PawPrint className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-foreground">
            Bointhosa <span className="text-primary">Pet System</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Início
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Sobre
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Planos
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-primary hover:bg-primary-light">
              Começar Grátis
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
