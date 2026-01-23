import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import NewMember from "./pages/NewMember";
import EditMember from "./pages/EditMember";
import MemberDetail from "./pages/MemberDetail";
import Contributions from "./pages/Contributions";
import NewContribution from "./pages/NewContribution";
import ExceptionalContributions from "./pages/ExceptionalContributions";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NewsManagement from "./pages/NewsManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/membres" element={
              <ProtectedRoute><Members /></ProtectedRoute>
            } />
            <Route path="/membres/nouveau" element={
              <ProtectedRoute><NewMember /></ProtectedRoute>
            } />
            <Route path="/membres/:id" element={
              <ProtectedRoute><MemberDetail /></ProtectedRoute>
            } />
            <Route path="/membres/:id/modifier" element={
              <ProtectedRoute><EditMember /></ProtectedRoute>
            } />
            <Route path="/cotisations" element={
              <ProtectedRoute><Contributions /></ProtectedRoute>
            } />
            <Route path="/cotisations/nouveau" element={
              <ProtectedRoute><NewContribution /></ProtectedRoute>
            } />
            <Route path="/cotisations/exceptionnelles" element={
              <ProtectedRoute><ExceptionalContributions /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><Notifications /></ProtectedRoute>
            } />
            <Route path="/rapports" element={
              <ProtectedRoute><Reports /></ProtectedRoute>
            } />
            <Route path="/parametres" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="/actualites" element={
              <ProtectedRoute><NewsManagement /></ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
