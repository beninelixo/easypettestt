import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Heart, ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { WaveBackground } from "@/components/ui/wave-background";
import { cn } from "@/lib/utils";
import logo from "@/assets/easypet-logo.png";

const Footer = () => {
  const footerReveal = useScrollReveal({ threshold: 0.1 });

  const productLinks = [
    { to: "/funcionalidades", label: "Funcionalidades" },
    { to: "/pricing", label: "Planos e Preços" },
    { to: "/about", label: "Sobre Nós" },
  ];

  const resourceLinks = [
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contato" },
  ];

  const contactInfo = [
    { icon: Mail, href: "mailto:easypetc@gmail.com", label: "easypetc@gmail.com" },
    { icon: Phone, href: "https://wa.me/5521959262880", label: "(21) 95926-2880", external: true },
    { icon: MapPin, href: null, label: "São Paulo, SP" },
  ];

  return (
    <footer className="bg-muted border-t border-border mt-20 relative overflow-hidden">
      {/* Animated wave at top */}
      <WaveBackground 
        position="top" 
        color="hsl(var(--primary))" 
        opacity={0.1} 
        speed="slow"
        flip
      />
      
      <div 
        ref={footerReveal.ref}
        className={cn(
          "container mx-auto px-4 py-12 relative z-10",
          "scroll-reveal scroll-reveal-up",
          footerReveal.isVisible ? "visible" : ""
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt="EasyPet Logo" 
                  className="h-10 w-auto relative drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EasyPet</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Gestão inteligente para pet shops, clínicas e banho & tosa. Simplifique seu negócio.
            </p>
            {/* Made with love */}
            <p className="text-xs text-muted-foreground flex items-center gap-1 group cursor-default">
              Feito com 
              <Heart className="h-3 w-3 text-red-500 group-hover:scale-125 group-hover:animate-pulse transition-all" /> 
              para amantes de pets
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Produto</h3>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li 
                  key={link.to}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center gap-1 group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Recursos</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link, index) => (
                <li 
                  key={link.to}
                  style={{ animationDelay: `${(index + 3) * 50}ms` }}
                >
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center gap-1 group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contato</h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li 
                  key={item.label} 
                  className="flex items-center gap-2 text-sm text-muted-foreground group"
                  style={{ animationDelay: `${(index + 6) * 50}ms` }}
                >
                  <item.icon className="h-4 w-4 text-primary group-hover:scale-125 transition-transform duration-300" />
                  {item.href ? (
                    <a 
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {item.label}
                      {item.external && <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            &copy; 2025 EasyPet. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              to="/terms" 
              className="hover:text-primary transition-colors relative group"
            >
              Termos de Uso
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <span className="text-border">•</span>
            <Link 
              to="/privacy" 
              className="hover:text-primary transition-colors relative group"
            >
              Política de Privacidade
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
