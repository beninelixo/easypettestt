import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/easypet-logo.png";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt="EasyPet Logo" 
                  className="h-10 w-auto relative drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] object-contain"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EasyPet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestão inteligente para pet shops, clínicas e banho & tosa. Simplifique seu negócio.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Produto</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/funcionalidades"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/blog"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                contato@easypet.com.br
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a 
                  href="https://wa.me/5521959262880" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  (21) 95926-2880
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                São Paulo, SP
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 EasyPet. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
