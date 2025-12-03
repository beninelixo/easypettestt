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
import ScrollToTop from "./components/ScrollToTop";
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
const SystemMonitoring = lazy(() => import("./pages/SystemMonitoring"));
const SystemAnalysis = lazy(() => import("./pages/SystemAnalysis"));
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
const PaymentSuccess = lazy(() => import("./pages/professional/PaymentSuccess"));
const PaymentCancelled = lazy(() => import("./pages/professional/PaymentCancelled"));
const SystemOverview = lazy(() => import("./pages/SystemOverview"));
const RegenerateImages = lazy(() => import("./pages/admin/RegenerateImages"));
const RegenerateBlogImages = lazy(() => import("./pages/admin/RegenerateBlogImages"));
const ConsolidatedDashboard = lazy(() => import("./pages/multi-unit/ConsolidatedDashboard"));
const UnitsManagement = lazy(() => import("./pages/multi-unit/UnitsManagement"));
const Analytics = lazy(() => import("@/pages/petshop/Analytics"));
const SuccessStories = lazy(() => import("@/pages/SuccessStories"));
const SuccessStoriesManager = lazy(() => import("@/pages/admin/SuccessStoriesManager"));
const SubmitSuccessStory = lazy(() => import("@/pages/petshop/SubmitSuccessStory"));
const ConsolidatedSecurityDashboard = lazy(() => import("./pages/admin/ConsolidatedSecurityDashboard"));
const SecurityMonitoring = lazy(() => import("./pages/admin/SecurityMonitoring"));
const SecurityFixes = lazy(() => import("./pages/admin/SecurityFixes"));
const PerformanceDashboard = lazy(() => import("./pages/admin/PerformanceDashboard"));
const BackupManagement = lazy(() => import("./pages/admin/BackupManagement"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const EmailSystemTest = lazy(() => import("./pages/admin/EmailSystemTest"));
const EmailAnalyticsDashboard = lazy(() => import("./pages/admin/EmailAnalyticsDashboard"));
const ResendDomainSetup = lazy(() => import("./pages/admin/ResendDomainSetup"));
const GodModeDashboard = lazy(() => import("./pages/admin/GodModeDashboard"));
const IPWhitelist = lazy(() => import("./pages/admin/IPWhitelist"));
const LoginHistory = lazy(() => import("./pages/admin/LoginHistory"));
const SystemErrorLogs = lazy(() => import("./pages/admin/SystemErrorLogs"));
const SystemHealthDashboard = lazy(() => import("./pages/admin/SystemHealthDashboard"));
const FailedJobsManagement = lazy(() => import("./pages/admin/FailedJobsManagement"));
const PerformanceMetricsHistory = lazy(() => import("./pages/admin/PerformanceMetricsHistory"));
const ConsolidatedHealthDashboard = lazy(() => import("./pages/admin/ConsolidatedHealthDashboard"));
const WebhookManagement = lazy(() => import("./pages/admin/WebhookManagement"));
const SystemAnalysisDashboard = lazy(() => import("./pages/admin/SystemAnalysis"));
const UserAnalytics = lazy(() => import("./pages/admin/UserAnalytics"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AcceptInvite = lazy(() => import("./pages/admin/AcceptInvite"));
const MaintenanceDashboard = lazy(() => import("./pages/admin/MaintenanceDashboard"));
const Diagnostics = lazy(() => import("./pages/Diagnostics"));
const AuthMonitoring = lazy(() => import("./pages/admin/AuthMonitoring"));
const AuthMetricsDashboard = lazy(() => import("./pages/admin/AuthMetricsDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/admin/SuperAdminDashboard"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const DataExport = lazy(() => import("./pages/admin/DataExport"));
const ConnectionTest = lazy(() => import("./pages/admin/ConnectionTest"));

// Admin Layout
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

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
            <Route index element={<Navigate to="/professional/services" replace />} />
            <Route path="services" element={<ProfessionalServices />} />
            <Route path="calendar" element={<ProfessionalCalendar />} />
            <Route path="clients" element={<ProfessionalClients />} />
            <Route path="employees" element={<ProfessionalEmployees />} />
            <Route path="reports" element={<ProfessionalReports />} />
            <Route path="backup" element={<ProfessionalBackup />} />
            <Route path="settings" element={<ProfessionalSettings />} />
            <Route path="plans" element={<ProfessionalPlans />} />
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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="superadmin" element={<SuperAdminDashboard />} />
            <Route path="god-mode" element={<GodModeDashboard />} />
            <Route path="system-monitoring" element={<SystemMonitoring />} />
            <Route path="system-analysis" element={<SystemAnalysisDashboard />} />
            <Route path="auth-monitoring" element={<AuthMonitoring />} />
            <Route path="auth-monitor" element={<AuthMonitoring />} />
            <Route path="auth-metrics" element={<AuthMetricsDashboard />} />
            <Route path="data-integrity" element={<SystemHealth />} />
            <Route path="system-diagnostics" element={<SystemDiagnostics />} />
            <Route path="ai-monitor" element={<AIMonitorDashboard />} />
            <Route path="maintenance" element={<MaintenanceDashboard />} />
            <Route path="security" element={<ConsolidatedSecurityDashboard />} />
            <Route path="security-fixes" element={<SecurityFixes />} />
            <Route path="security-monitoring" element={<SecurityMonitoring />} />
            <Route path="backups" element={<BackupManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="email-test" element={<EmailSystemTest />} />
            <Route path="email-analytics" element={<EmailAnalyticsDashboard />} />
            <Route path="domain-setup" element={<ResendDomainSetup />} />
            <Route path="loops-domain-setup" element={<LoopsDomainSetup />} />
            <Route path="notifications" element={<NotificationQueue />} />
            <Route path="monitor" element={<SystemMonitor />} />
            <Route path="success-stories" element={<SuccessStoriesManager />} />
            <Route path="regenerate-images" element={<RegenerateImages />} />
            <Route path="regenerate-blog-images" element={<RegenerateBlogImages />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="ip-whitelist" element={<IPWhitelist />} />
            <Route path="login-history" element={<LoginHistory />} />
            <Route path="error-logs" element={<SystemErrorLogs />} />
            <Route path="system-health" element={<SystemHealthDashboard />} />
            <Route path="failed-jobs" element={<FailedJobsManagement />} />
            <Route path="performance-history" element={<PerformanceMetricsHistory />} />
            <Route path="health-dashboard" element={<ConsolidatedHealthDashboard />} />
            <Route path="webhooks" element={<WebhookManagement />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="user-analytics" element={<UserAnalytics />} />
            <Route path="notification-preferences" element={<NotificationPreferences />} />
            <Route path="data-export" element={<DataExport />} />
            <Route path="connection-test" element={<ConnectionTest />} />
          </Route>

          {/* Legacy Admin Routes - Redirect to new structure */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/god-mode-dashboard" element={<Navigate to="/admin/god-mode" replace />} />
          <Route path="/system-monitoring" element={<Navigate to="/admin/system-monitoring" replace />} />
          <Route path="/system-analysis" element={<Navigate to="/admin/system-analysis" replace />} />
          <Route path="/auth-monitoring" element={<Navigate to="/admin/auth-monitoring" replace />} />
          <Route path="/system-health" element={<Navigate to="/admin/system-health" replace />} />
          <Route path="/system-diagnostics" element={<Navigate to="/admin/system-diagnostics" replace />} />
          <Route path="/ai-monitor" element={<Navigate to="/admin/ai-monitor" replace />} />
          <Route path="/admin/email-system-test" element={<Navigate to="/admin/email-test" replace />} />
          <Route path="/admin/resend-domain-setup" element={<Navigate to="/admin/domain-setup" replace />} />
          <Route path="/system-overview" element={<SystemOverview />} />
          <Route path="/system-monitoring-dashboard" element={<SystemMonitoringDashboard />} />

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
