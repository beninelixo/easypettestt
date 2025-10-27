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
import ClientDashboard from "./pages/ClientDashboard";
import PetShopDashboard from "./pages/PetShopDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NewAppointment from "./pages/NewAppointment";
import PetProfile from "./pages/PetProfile";
import NotFound from "./pages/NotFound";

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
          <Route path="/auth" element={<Auth />} />
          
          {/* Client Routes */}
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
          <Route path="/petshop-dashboard" element={
            <ProtectedRoute allowedRoles={["pet_shop"]}>
              <PetShopDashboard />
            </ProtectedRoute>
          } />
          
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
