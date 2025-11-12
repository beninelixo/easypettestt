import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

/**
 * WhatsApp Business Floating Button
 * Opens direct WhatsApp chat with business number (21) 95926-2880
 */
const WhatsAppButton = () => {
  const whatsappNumber = "5521959262880";
  const defaultMessage = "Olá! Gostaria de saber mais sobre o EasyPet";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 animate-fade-in"
      aria-label="Falar no WhatsApp"
    >
      <Button
        size="lg"
        className="h-16 w-16 rounded-full shadow-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white hover:scale-110 transition-all duration-300 group"
      >
        <MessageSquare className="h-7 w-7 group-hover:scale-110 transition-transform" />
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 whitespace-nowrap">
          <p className="text-sm font-medium">Fale conosco no WhatsApp</p>
          <p className="text-xs text-muted-foreground">(21) 95926-2880</p>
        </div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
