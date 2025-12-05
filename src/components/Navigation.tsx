import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useHasSuccessStories } from "@/hooks/useSuccessStories";
import { useShrinkOnScroll } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/utils";
import logo from "@/assets/easypet-logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: hasSuccessStories } = useHasSuccessStories();
  const isScrolled = useShrinkOnScroll(50);

  const baseLinks = [
    { to: "/", label: "Início" },
    { to: "/funcionalidades", label: "Funcionalidades" },
    { to: "/pricing", label: "Planos" },
    { to: "/about", label: "Sobre" },
    { to: "/faq", label: "FAQ" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contato" },
  ];

  const successStoriesLink = { to: "/casos-de-sucesso", label: "Casos de Sucesso" };

  const navLinks = hasSuccessStories
    ? [
        baseLinks[0],
        baseLinks[1],
        successStoriesLink,
        ...baseLinks.slice(2)
      ]
    : baseLinks;

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl border-b border-border shadow-lg py-2" 
          : "bg-background/80 backdrop-blur-md border-b border-transparent py-4"
      )}
    >
      {/* Skip to main content - Acessibilidade WCAG 2.1 AA */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          <img 
            src={logo} 
            alt="EasyPet Logo" 
            className={cn(
              "relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_0_12px_rgba(0,200,150,0.5)] object-contain",
              isScrolled ? "h-10" : "h-14"
            )}
          />
          <span className={cn(
            "font-bold text-foreground relative transition-all duration-500",
            isScrolled ? "text-lg" : "text-xl"
          )}>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EasyPet</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 py-2 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.label}
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full rounded-full" />
              {/* Glow effect on hover */}
              <span className="absolute inset-0 -z-10 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button 
              variant="outline" 
              size={isScrolled ? "sm" : "default"}
              className="font-semibold relative overflow-hidden group transition-all duration-300"
            >
              <span className="relative z-10">Entrar</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              size={isScrolled ? "sm" : "default"}
              className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
            >
              <span className="relative z-10">Cadastrar</span>
              <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 relative group" aria-label="Abrir menu">
                <Menu className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                <span className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img 
                    src={logo} 
                    alt="EasyPet Logo" 
                    className="h-8 w-auto drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] object-contain"
                  />
                  <span className="text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Menu</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/10 hover:translate-x-2 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="border-t border-border my-4" />
                
                <Link to="/auth" onClick={() => setIsOpen(false)} className="animate-fade-in" style={{ animationDelay: "350ms" }}>
                  <Button variant="outline" className="w-full justify-center">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)} className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                  <Button className="w-full justify-center">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;