import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "./lib/tenant-context";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeToggle } from "./components/ThemeToggle";
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
import SystemMonitoring from "./pages/SystemMonitoring";
import SystemAnalysis from "./pages/SystemAnalysis";
import AuthMonitoring from "./pages/AuthMonitoring";
import SystemHealth from "./pages/SystemHealth";
import SystemDiagnostics from "./pages/SystemDiagnostics";
import { TenantDashboard } from "./features/tenant/pages/TenantDashboard";
import { FranchiseDashboard } from "./features/franchise/pages/FranchiseDashboard";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ThemeToggle />
          <BrowserRouter>
            <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/clinicas" element={<Clinicas />} />
            <Route path="/petshops" element={<PetShops />} />
            <Route path="/banho-tosa" element={<BanhoTosa />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/categoria/:category" element={<BlogCategory />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
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
          
          {/* Pet Shop Routes */}
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
            <Route index element={<PetShopDashboard />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="catalogo-servicos" element={<ServiceTemplates />} />
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

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
