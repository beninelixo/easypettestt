import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Funcionalidades from "./pages/Funcionalidades";
import Clinicas from "./pages/Clinicas";
import PetShops from "./pages/PetShops";
import BanhoTosa from "./pages/BanhoTosa";
import ClientDashboard from "./pages/ClientDashboard";
import PetShopDashboardLayout from "./pages/PetShopDashboardLayout";
import PetShopDashboard from "./pages/PetShopDashboard";
import Clientes from "./pages/petshop/Clientes";
import Calendario from "./pages/petshop/Calendario";
import Relatorios from "./pages/petshop/Relatorios";
import Configuracoes from "./pages/petshop/Configuracoes";
import Servicos from "./pages/petshop/Servicos";
import ServiceTemplates from "./pages/petshop/ServiceTemplates";
import AdminDashboard from "./pages/AdminDashboard";
import NewAppointment from "./pages/NewAppointment";
import PetProfile from "./pages/PetProfile";
import NotFound from "./pages/NotFound";
import PetShopSetup from "./pages/PetShopSetup";
import ClientSelectPetShop from "./pages/ClientSelectPetShop";
import ClientProfile from "./pages/ClientProfile";
import EditarPetshop from "./pages/petshop/EditarPetshop";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />
          <Route path="/clinicas" element={<Clinicas />} />
          <Route path="/petshops" element={<PetShops />} />
          <Route path="/banho-tosa" element={<BanhoTosa />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
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
            <Route path="calendario" element={<Calendario />} />
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
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
