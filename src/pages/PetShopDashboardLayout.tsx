import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PetShopSidebar } from "@/components/PetShopSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InteractiveOnboarding } from "@/components/onboarding/InteractiveOnboarding";
import logo from "@/assets/easypet-logo.png";

const PetShopDashboardLayout = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      // Load profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, user_code")
        .eq("id", user.id)
        .single();

      // Load pet shop data
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("name")
        .eq("owner_id", user.id)
        .single();

      if (profile) {
        const name = `${profile.full_name} ${profile.user_code || ""}`.trim();
        const fullDisplay = petShop ? `${name} (${petShop.name})` : name;
        setDisplayName(fullDisplay);
      } else if (user) {
        // Fallback to auth metadata if profile hasn't been created yet
        const metaName = (user.user_metadata?.full_name as string) || "";
        const fullDisplay = petShop ? `${metaName} (${petShop?.name})` : metaName;
        setDisplayName(fullDisplay);
      }
    };

    loadUserData();
  }, [user]);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <PetShopSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 gap-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2 flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt="EasyPet Logo" 
                  className="h-8 w-auto relative drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] hover:scale-110 transition-transform duration-300 object-contain"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{displayName || "EasyPet"}</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            <InteractiveOnboarding role="pet_shop" />
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PetShopDashboardLayout;