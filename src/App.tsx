import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/LoadingScreen";
import WhatsAppButton from "@/components/WhatsAppButton";
import { UpdateNotification } from "@/components/UpdateNotification";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";

// Configuração otimizada de cache para performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo de cache (antigo cacheTime)
      refetchOnWindowFocus: false, // Não refetch ao focar janela
      refetchOnReconnect: true, // Refetch ao reconectar
      retry: 1, // Apenas 1 tentativa em caso de erro
    },
  },
});
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "./lib/tenant-context";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppAuthRedirectGate } from "./components/AppAuthRedirectGate";
import { ThemeToggle } from "./components/ThemeToggle";
import { PushNotificationButton } from "./components/PushNotificationButton";
import { LoadingFallback } from "./components/LoadingFallback";
import { ScrollToTop } from "./components/ui/scroll-to-top";
import { lazy, Suspense, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorMonitoring } from "./hooks/useErrorMonitoring";
import { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";
import { useAppVersion } from "./hooks/useAppVersion";

// Eagerly load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
const ClientAppointmentHistory = lazy(() => import("./pages/client/ClientAppointmentHistory"));
const ProfessionalEmployees = lazy(() => import("./pages/petshop/Funcionarios"));
const LoopsDomainSetup = lazy(() => import("./pages/admin/LoopsDomainSetup"));
const NewAppointment = lazy(() => import("./pages/NewAppointment"));
const PetProfile = lazy(() => import("./pages/PetProfile"));
const PetShopSetup = lazy(() => import("./pages/PetShopSetup"));
const ClientSelectPetShop = lazy(() => import("./pages/ClientSelectPetShop"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const EditarPetshop = lazy(() => import("./pages/petshop/EditarPetshop"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SystemDiagnostics = lazy(() => import("./pages/SystemDiagnostics"));
const TenantDashboard = lazy(() => import("./features/tenant/pages/TenantDashboard").then(m => ({ default: m.TenantDashboard })));
const FranchiseDashboard = lazy(() => import("./features/franchise/pages/FranchiseDashboard").then(m => ({ default: m.FranchiseDashboard })));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const UserPrivacy = lazy(() => import("./pages/UserPrivacy"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const NotificationPreferences = lazy(() => import("./pages/admin/NotificationPreferences"));
const ClientLayout = lazy(() => import("./pages/client/ClientLayout"));
const ClientPets = lazy(() => import("./pages/client/ClientPets"));
const ClientSchedule = lazy(() => import("./pages/client/ClientSchedule"));
const ClientAppointments = lazy(() => import("./pages/client/ClientAppointments"));
const ClientProfilePage = lazy(() => import("./pages/client/ClientProfilePage"));
const ProfessionalLayout = lazy(() => import("./pages/professional/ProfessionalLayout"));
const ProfessionalDashboard = lazy(() => import("./pages/professional/ProfessionalDashboard"));
const ProfessionalCalendar = lazy(() => import("./pages/professional/ProfessionalCalendar"));
const ProfessionalServices = lazy(() => import("./pages/professional/ProfessionalServices"));
const ProfessionalSettings = lazy(() => import("./pages/professional/ProfessionalSettings"));
const ProfessionalClients = lazy(() => import("./pages/professional/ProfessionalClientsVirtual"));
const ProfessionalReports = lazy(() => import("./pages/professional/ProfessionalReports"));
const ProfessionalBackup = lazy(() => import("./pages/professional/ProfessionalBackup"));
const ProfessionalProfile = lazy(() => import("./pages/professional/ProfessionalProfile"));
const ProfessionalPlans = lazy(() => import("./pages/professional/ProfessionalPlans"));
const ProfessionalSubscription = lazy(() => import("./pages/professional/ProfessionalSubscription"));
const ProfessionalBilling = lazy(() => import("./pages/professional/ProfessionalBilling"));
const PaymentSuccess = lazy(() => import("./pages/professional/PaymentSuccess"));
const PaymentCancelled = lazy(() => import("./pages/professional/PaymentCancelled"));
const SystemOverview = lazy(() => import("./pages/SystemOverview"));
const ImageManagement = lazy(() => import("./pages/admin/ImageManagement"));
const SystemAnalysis = lazy(() => import("./pages/admin/SystemAnalysis"));
const ConsolidatedDashboard = lazy(() => import("./pages/multi-unit/ConsolidatedDashboard"));
const UnitsManagement = lazy(() => import("./pages/multi-unit/UnitsManagement"));
const Analytics = lazy(() => import("@/pages/petshop/Analytics"));
const SuccessStories = lazy(() => import("@/pages/SuccessStories"));
const SuccessStoriesManager = lazy(() => import("@/pages/admin/SuccessStoriesManager"));
const SubmitSuccessStory = lazy(() => import("@/pages/petshop/SubmitSuccessStory"));
const ConsolidatedSecurityDashboard = lazy(() => import("./pages/admin/ConsolidatedSecurityDashboard"));
const PerformanceDashboard = lazy(() => import("./pages/admin/PerformanceDashboard"));
const BackupManagement = lazy(() => import("./pages/admin/BackupManagement"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const IPWhitelist = lazy(() => import("./pages/admin/IPWhitelist"));
const SystemHealthDashboard = lazy(() => import("./pages/admin/SystemHealthDashboard"));
const FailedJobsManagement = lazy(() => import("./pages/admin/FailedJobsManagement"));
const WebhookManagement = lazy(() => import("./pages/admin/WebhookManagement"));
const UserAnalytics = lazy(() => import("./pages/admin/UserAnalytics"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AcceptInvite = lazy(() => import("./pages/admin/AcceptInvite"));
const MaintenanceDashboard = lazy(() => import("./pages/admin/MaintenanceDashboard"));
const Diagnostics = lazy(() => import("./pages/Diagnostics"));
const AuthMonitoring = lazy(() => import("./pages/admin/AuthMonitoring"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const DataExport = lazy(() => import("./pages/admin/DataExport"));
const ConnectionTest = lazy(() => import("./pages/admin/ConnectionTest"));

// Admin Layout
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const UnifiedAdminDashboard = lazy(() => import("./pages/admin/UnifiedAdminDashboard"));

const App = () => {
  // Enable error and performance monitoring
  useErrorMonitoring();
  usePerformanceMonitoring();
  
  // Automatic cache and version management
  useAppVersion();
  
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
      <LoadingScreen />
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <ThemeToggle />
            <UpdateNotification />
            <BrowserRouter>
              <AppAuthRedirectGate />
              <PushNotificationButton />
              <WhatsAppButton />
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
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/system-overview" element={<SystemOverview />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            
            <Route path="/admin/accept-invite" element={<AcceptInvite />} />
            
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
            <Route index element={<Navigate to="/client/pets" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="pets" element={<ClientPets />} />
            <Route path="pets/:petId" element={<PetProfile />} />
            <Route path="schedule" element={<ClientSchedule />} />
            <Route path="select-petshop" element={<ClientSelectPetShop />} />
            <Route path="appointments" element={<ClientAppointments />} />
            <Route path="history" element={<ClientAppointmentHistory />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Route>
          
          {/* Legacy Client Routes - redirect to new routes */}
          <Route path="/client-dashboard" element={<Navigate to="/client/dashboard" replace />} />
          <Route path="/select-petshop" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientSelectPetShop />
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
            <Route index element={<Navigate to="/petshop-dashboard" replace />} />
            <Route path="dashboard" element={<ProfessionalDashboard />} />
            <Route path="services" element={<ProfessionalServices />} />
            <Route path="calendar" element={<ProfessionalCalendar />} />
            <Route path="clients" element={<ProfessionalClients />} />
            <Route path="employees" element={<ProfessionalEmployees />} />
            <Route path="reports" element={<ProfessionalReports />} />
            <Route path="backup" element={<ProfessionalBackup />} />
            <Route path="settings" element={<ProfessionalSettings />} />
            <Route path="billing" element={<ProfessionalBilling />} />
            <Route path="plans" element={<Navigate to="/professional/billing" replace />} />
            <Route path="subscription" element={<Navigate to="/professional/billing" replace />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-cancelled" element={<PaymentCancelled />} />
            <Route path="profile" element={<ProfessionalProfile />} />
          </Route>
          
          {/* Legacy Pet Shop Routes */}
          <Route path="/petshop-setup" element={<Navigate to="/professional/services" replace />} />
          
          {/* Protected Pet Shop Dashboard - Only accessible after settings password verification */}
          <Route 
            path="/petshop-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["pet_shop"]}>
                <ProfessionalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfessionalDashboard />} />
          </Route>
          
          {/* Admin Routes - Nested under AdminLayout */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<UnifiedAdminDashboard />} />
            {/* Legacy routes - redirect to unified dashboard */}
            <Route path="superadmin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="god-mode" element={<UnifiedAdminDashboard />} />
            {/* System routes */}
            <Route path="system-health" element={<SystemHealthDashboard />} />
            <Route path="system-monitoring" element={<Navigate to="/admin/system-health" replace />} />
            <Route path="system-analysis" element={<SystemAnalysis />} />
            <Route path="health-dashboard" element={<Navigate to="/admin/system-health" replace />} />
            <Route path="data-integrity" element={<Navigate to="/admin/system-health" replace />} />
            <Route path="system-diagnostics" element={<SystemDiagnostics />} />
            <Route path="ai-monitor" element={<Navigate to="/admin/system-analysis" replace />} />
            <Route path="maintenance" element={<MaintenanceDashboard />} />
            {/* Security routes */}
            <Route path="security" element={<ConsolidatedSecurityDashboard />} />
            <Route path="security-fixes" element={<Navigate to="/admin/security" replace />} />
            <Route path="security-monitoring" element={<Navigate to="/admin/security" replace />} />
            <Route path="auth-monitoring" element={<AuthMonitoring />} />
            <Route path="auth-monitor" element={<Navigate to="/admin/auth-monitoring" replace />} />
            <Route path="auth-metrics" element={<Navigate to="/admin/auth-monitoring" replace />} />
            <Route path="login-history" element={<Navigate to="/admin/auth-monitoring" replace />} />
            <Route path="backups" element={<BackupManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            {/* Users */}
            <Route path="user-management" element={<UserManagement />} />
            <Route path="user-analytics" element={<UserAnalytics />} />
            {/* Settings */}
            <Route path="notification-preferences" element={<NotificationPreferences />} />
            <Route path="webhooks" element={<WebhookManagement />} />
            <Route path="images" element={<ImageManagement />} />
            <Route path="regenerate-images" element={<Navigate to="/admin/images" replace />} />
            <Route path="regenerate-blog-images" element={<Navigate to="/admin/images?tab=blog" replace />} />
            <Route path="data-export" element={<DataExport />} />
            <Route path="connection-test" element={<ConnectionTest />} />
            <Route path="success-stories" element={<SuccessStoriesManager />} />
            {/* Performance */}
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="performance-history" element={<Navigate to="/admin/performance" replace />} />
            {/* Additional routes with redirects */}
            <Route path="ip-whitelist" element={<IPWhitelist />} />
            <Route path="failed-jobs" element={<FailedJobsManagement />} />
            <Route path="error-logs" element={<Navigate to="/admin/system-diagnostics" replace />} />
            <Route path="notifications" element={<Navigate to="/admin/notification-preferences" replace />} />
            <Route path="monitor" element={<Navigate to="/admin/system-health" replace />} />
            <Route path="email-test" element={<Navigate to="/admin/connection-test" replace />} />
            <Route path="email-analytics" element={<Navigate to="/admin/performance" replace />} />
            <Route path="domain-setup" element={<Navigate to="/admin/connection-test" replace />} />
            <Route path="loops-domain-setup" element={<Navigate to="/admin/connection-test" replace />} />
          </Route>

          {/* Legacy Admin Routes - Redirect to new structure */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/god-mode-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/system-monitoring" element={<Navigate to="/admin/system-health" replace />} />
          <Route path="/system-analysis" element={<Navigate to="/admin/system-health" replace />} />
          <Route path="/auth-monitoring" element={<Navigate to="/admin/auth-monitoring" replace />} />
          <Route path="/system-health" element={<Navigate to="/admin/system-health" replace />} />
          <Route path="/system-diagnostics" element={<Navigate to="/admin/system-diagnostics" replace />} />
          <Route path="/ai-monitor" element={<Navigate to="/admin/system-diagnostics" replace />} />
          <Route path="/system-overview" element={<SystemOverview />} />
          <Route path="/system-monitoring-dashboard" element={<Navigate to="/admin/system-health" replace />} />

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
