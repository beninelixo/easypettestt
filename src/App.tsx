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
import { LoadingFallback } from "./components/LoadingFallback";
import ScrollToTop from "./components/ScrollToTop";
import { lazy, Suspense, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Eager load critical routes
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TestCaptcha from "./pages/TestCaptcha";

// Lazy load all other routes
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Funcionalidades = lazy(() => import("./pages/Funcionalidades"));
const Clinicas = lazy(() => import("./pages/Clinicas"));
const PetShops = lazy(() => import("./pages/PetShops"));
const BanhoTosa = lazy(() => import("./pages/BanhoTosa"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const PetShopDashboardLayout = lazy(() => import("./pages/PetShopDashboardLayout"));
const PetShopDashboard = lazy(() => import("./pages/PetShopDashboard"));
const Clientes = lazy(() => import("./pages/petshop/Clientes"));
const Calendario = lazy(() => import("./pages/petshop/Calendario"));
const Relatorios = lazy(() => import("./pages/petshop/Relatorios"));
const Configuracoes = lazy(() => import("./pages/petshop/Configuracoes"));
const Servicos = lazy(() => import("./pages/petshop/Servicos"));
const ServiceTemplates = lazy(() => import("./pages/petshop/ServiceTemplates"));
const WhatsAppSettings = lazy(() => import("./pages/petshop/WhatsAppSettings"));
const Estoque = lazy(() => import("./pages/petshop/Estoque"));
const Financeiro = lazy(() => import("./pages/petshop/Financeiro"));
const Fidelidade = lazy(() => import("./pages/petshop/Fidelidade"));
const Marketing = lazy(() => import("./pages/petshop/Marketing"));
const Funcionarios = lazy(() => import("./pages/petshop/Funcionarios"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NewAppointment = lazy(() => import("./pages/NewAppointment"));
const PetProfile = lazy(() => import("./pages/PetProfile"));
const PetShopSetup = lazy(() => import("./pages/PetShopSetup"));
const ClientSelectPetShop = lazy(() => import("./pages/ClientSelectPetShop"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const EditarPetshop = lazy(() => import("./pages/petshop/EditarPetshop"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SystemMonitoring = lazy(() => import("./pages/SystemMonitoring"));
const SystemAnalysis = lazy(() => import("./pages/SystemAnalysis"));
const AuthMonitoring = lazy(() => import("./pages/AuthMonitoring"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const SystemDiagnostics = lazy(() => import("./pages/SystemDiagnostics"));
const SystemMonitoringDashboard = lazy(() => import("./pages/SystemMonitoringDashboard"));
const AIMonitorDashboard = lazy(() => import("./pages/AIMonitorDashboard"));
const TenantDashboard = lazy(() => import("./features/tenant/pages/TenantDashboard").then(m => ({ default: m.TenantDashboard })));
const FranchiseDashboard = lazy(() => import("./features/franchise/pages/FranchiseDashboard").then(m => ({ default: m.FranchiseDashboard })));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const UserPrivacy = lazy(() => import("./pages/UserPrivacy"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const NotificationQueue = lazy(() => import("./pages/admin/NotificationQueue"));
const SystemMonitor = lazy(() => import("./pages/admin/SystemMonitor"));
const ClientLayout = lazy(() => import("./pages/client/ClientLayout"));
const ClientPets = lazy(() => import("./pages/client/ClientPets"));
const ClientSchedule = lazy(() => import("./pages/client/ClientSchedule"));
const ClientAppointments = lazy(() => import("./pages/client/ClientAppointments"));
const ClientProfilePage = lazy(() => import("./pages/client/ClientProfilePage"));
const ProfessionalLayout = lazy(() => import("./pages/professional/ProfessionalLayout"));
const ProfessionalDashboard = lazy(() => import("./pages/professional/ProfessionalDashboard"));
const ProfessionalCalendar = lazy(() => import("./pages/professional/ProfessionalCalendar"));
const ProfessionalServices = lazy(() => import("./pages/professional/ProfessionalServices"));
const ProfessionalClients = lazy(() => import("./pages/professional/ProfessionalClients"));
const ProfessionalReports = lazy(() => import("./pages/professional/ProfessionalReports"));
const ProfessionalProfile = lazy(() => import("./pages/professional/ProfessionalProfile"));
const ProfessionalPlans = lazy(() => import("./pages/professional/ProfessionalPlans"));
const SystemOverview = lazy(() => import("./pages/SystemOverview"));
const RegenerateImages = lazy(() => import("./pages/admin/RegenerateImages"));
const ConsolidatedDashboard = lazy(() => import("./pages/multi-unit/ConsolidatedDashboard"));
const UnitsManagement = lazy(() => import("./pages/multi-unit/UnitsManagement"));
const Analytics = lazy(() => import("@/pages/petshop/Analytics"));
const SuccessStories = lazy(() => import("@/pages/SuccessStories"));
const SuccessStoriesManager = lazy(() => import("@/pages/admin/SuccessStoriesManager"));
const SubmitSuccessStory = lazy(() => import("@/pages/petshop/SubmitSuccessStory"));
const ConsolidatedSecurityDashboard = lazy(() => import("./pages/admin/ConsolidatedSecurityDashboard"));
const SecurityMonitoring = lazy(() => import("./pages/admin/SecurityMonitoring"));
const PerformanceDashboard = lazy(() => import("./pages/admin/PerformanceDashboard"));
const BackupManagement = lazy(() => import("./pages/admin/BackupManagement"));

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
              <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/test-captcha" element={<TestCaptcha />} />
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
          
          <Route path="/admin/security" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ConsolidatedSecurityDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/security-monitoring" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SecurityMonitoring />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/backups" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BackupManagement />
            </ProtectedRoute>
          } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
              </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
