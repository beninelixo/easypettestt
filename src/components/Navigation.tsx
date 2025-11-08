import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useHasSuccessStories } from "@/hooks/useSuccessStories";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: hasSuccessStories } = useHasSuccessStories();

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
            <PawPrint className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-foreground">
            <span className="text-primary">EasyPet</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm">
              Cadastrar
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <PawPrint className="h-5 w-5" />
                  </div>
                  <span className="text-lg">Menu</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-primary/10"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="border-t border-border my-4" />
                
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
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
