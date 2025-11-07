import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "./lib/tenant-context";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeToggle } from "./components/ThemeToggle";
import { PushNotificationButton } from "./components/PushNotificationButton";
import Index from "./pages/Index";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Funcionalidades from "./pages/Funcionalidades";
import Clinicas from "./pages/Clinicas";
import PetShops from "./pages/PetShops";
import BanhoTosa from "./pages/BanhoTosa";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import ClientDashboard from "./pages/ClientDashboard";
import PetShopDashboardLayout from "./pages/PetShopDashboardLayout";
import PetShopDashboard from "./pages/PetShopDashboard";
import Clientes from "./pages/petshop/Clientes";
import Calendario from "./pages/petshop/Calendario";
import Relatorios from "./pages/petshop/Relatorios";
import Configuracoes from "./pages/petshop/Configuracoes";
import Servicos from "./pages/petshop/Servicos";
import ServiceTemplates from "./pages/petshop/ServiceTemplates";
import WhatsAppSettings from "./pages/petshop/WhatsAppSettings";
import Estoque from "./pages/petshop/Estoque";
import Financeiro from "./pages/petshop/Financeiro";
import Fidelidade from "./pages/petshop/Fidelidade";
import Marketing from "./pages/petshop/Marketing";
import Funcionarios from "./pages/petshop/Funcionarios";
import AdminDashboard from "./pages/AdminDashboard";
import NewAppointment from "./pages/NewAppointment";
import PetProfile from "./pages/PetProfile";
import NotFound from "./pages/NotFound";
import PetShopSetup from "./pages/PetShopSetup";
import ClientSelectPetShop from "./pages/ClientSelectPetShop";
import ClientProfile from "./pages/ClientProfile";
import EditarPetshop from "./pages/petshop/EditarPetshop";
import ResetPassword from "./pages/ResetPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SystemMonitoring from "./pages/SystemMonitoring";
import SystemAnalysis from "./pages/SystemAnalysis";
import AuthMonitoring from "./pages/AuthMonitoring";
import SystemHealth from "./pages/SystemHealth";
import SystemDiagnostics from "./pages/SystemDiagnostics";
import SystemMonitoringDashboard from "./pages/SystemMonitoringDashboard";
import AIMonitorDashboard from "./pages/AIMonitorDashboard";
import { TenantDashboard } from "./features/tenant/pages/TenantDashboard";
import { FranchiseDashboard } from "./features/franchise/pages/FranchiseDashboard";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserProfile from "./pages/UserProfile";
import UserPrivacy from "./pages/UserPrivacy";
import PaymentHistory from "./pages/PaymentHistory";
import NotificationQueue from "./pages/admin/NotificationQueue";
import SystemMonitor from "./pages/admin/SystemMonitor";
import ClientLayout from "./pages/client/ClientLayout";
import ClientPets from "./pages/client/ClientPets";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientAppointments from "./pages/client/ClientAppointments";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ProfessionalLayout from "./pages/professional/ProfessionalLayout";
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ProfessionalCalendar from "./pages/professional/ProfessionalCalendar";
import ProfessionalServices from "./pages/professional/ProfessionalServices";
import ProfessionalClients from "./pages/professional/ProfessionalClients";
import ProfessionalReports from "./pages/professional/ProfessionalReports";
import ProfessionalProfile from "./pages/professional/ProfessionalProfile";
import ProfessionalPlans from "./pages/professional/ProfessionalPlans";
import SystemOverview from "./pages/SystemOverview";
import RegenerateImages from "./pages/admin/RegenerateImages";
import ConsolidatedDashboard from "./pages/multi-unit/ConsolidatedDashboard";
import UnitsManagement from "./pages/multi-unit/UnitsManagement";
import Analytics from "@/pages/petshop/Analytics";
import SuccessStories from "@/pages/SuccessStories";
import SuccessStoriesManager from "@/pages/admin/SuccessStoriesManager";
import SubmitSuccessStory from "@/pages/petshop/SubmitSuccessStory";

const queryClient = new QueryClient();

const App = () => {
  // Enforce temporary session cleanup on browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const isTemporary = localStorage.getItem('easypet_session_temporary') === 'true';
      if (isTemporary) {
        supabase.auth.signOut();
        localStorage.clear();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ThemeToggle />
            <BrowserRouter>
              <PushNotificationButton />
              <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/clinicas" element={<Clinicas />} />
            <Route path="/petshops" element={<PetShops />} />
            <Route path="/banho-tosa" element={<BanhoTosa />} />
            <Route path="/casos-de-sucesso" element={<SuccessStories />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/categoria/:category" element={<BlogCategory />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/system-overview" element={<SystemOverview />} />
            <Route path="/admin/regenerate-images" element={<RegenerateImages />} />
            
            {/* Multi-Unit Management Routes */}
            <Route path="/multi-unit/dashboard" element={
              <ProtectedRoute>
                <ConsolidatedDashboard />
              </ProtectedRoute>
            } />
            <Route path="/multi-unit/management" element={
              <ProtectedRoute>
                <UnitsManagement />
              </ProtectedRoute>
            } />
            
            {/* Tenant Dashboard */}
            <Route path="/tenant-dashboard" element={
              <ProtectedRoute>
                <TenantDashboard />
              </ProtectedRoute>
            } />
            
            {/* Franchise Dashboard */}
            <Route path="/franchise-dashboard" element={
              <ProtectedRoute>
                <FranchiseDashboard />
              </ProtectedRoute>
            } />
          
          {/* Client Routes */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route path="pets" element={<ClientPets />} />
            <Route path="schedule" element={<ClientSchedule />} />
            <Route path="appointments" element={<ClientAppointments />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Route>
          
          {/* Legacy Client Routes for backward compatibility */}
          <Route path="/select-petshop" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientSelectPetShop />
            </ProtectedRoute>
          } />
          <Route path="/client-dashboard" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/new-appointment" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <NewAppointment />
            </ProtectedRoute>
          } />
          <Route path="/pet/:petId" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PetProfile />
            </ProtectedRoute>
          } />
          <Route path="/user-profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/user-privacy" element={
            <ProtectedRoute>
              <UserPrivacy />
            </ProtectedRoute>
          } />
          <Route path="/payment-history" element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          } />
          
          {/* Professional Routes */}
          <Route path="/professional" element={
            <ProtectedRoute allowedRoles={["pet_shop"]}>
              <ProfessionalLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ProfessionalDashboard />} />
            <Route path="calendar" element={<ProfessionalCalendar />} />
            <Route path="services" element={<ProfessionalServices />} />
            <Route path="clients" element={<ProfessionalClients />} />
            <Route path="reports" element={<ProfessionalReports />} />
            <Route path="plans" element={<ProfessionalPlans />} />
            <Route path="profile" element={<ProfessionalProfile />} />
          </Route>
          
          {/* Legacy Pet Shop Routes for backward compatibility */}
          <Route path="/petshop-setup" element={
            <ProtectedRoute allowedRoles={["pet_shop"]}>
              <PetShopSetup />
            </ProtectedRoute>
          } />
          <Route path="/petshop-dashboard" element={
            <ProtectedRoute allowedRoles={["pet_shop"]}>
              <PetShopDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/professional/dashboard" replace />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="catalogo-servicos" element={<ServiceTemplates />} />
            <Route path="whatsapp" element={<WhatsAppSettings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="cliente/:clientId" element={<ClientProfile />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="fidelidade" element={<Fidelidade />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="editar-petshop" element={<EditarPetshop />} />
            <Route path="submit-success-story" element={<SubmitSuccessStory />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/system-monitoring" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemMonitoring />
            </ProtectedRoute>
          } />
          
          <Route path="/system-analysis" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemAnalysis />
            </ProtectedRoute>
          } />
          
          <Route path="/auth-monitoring" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthMonitoring />
            </ProtectedRoute>
          } />

          <Route path="/system-health" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemHealth />
            </ProtectedRoute>
          } />
          <Route path="/system-diagnostics" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemDiagnostics />
            </ProtectedRoute>
          } />
          <Route path="/god-mode-dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemMonitoringDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/ai-monitor" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AIMonitorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NotificationQueue />
            </ProtectedRoute>
          } />

          <Route path="/admin/monitor" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemMonitor />
            </ProtectedRoute>
          } />
          
          <Route path="/system-overview" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemOverview />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/success-stories" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SuccessStoriesManager />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/regenerate-images" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RegenerateImages />
            </ProtectedRoute>
          } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
