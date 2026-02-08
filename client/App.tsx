import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ResourcePool from "./pages/ResourcePool";
import AddResource from "./pages/AddResource";
import EditResource from "./pages/EditResource";
import Engagements from "./pages/Engagements";
import EngagementDetails from "./pages/EngagementDetails";
import OpenRoleDetails from "./pages/OpenRoleDetails";
import Contracts from "./pages/Contracts";
import Profile from "./pages/Profile";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Manuals from "./pages/Manuals";
import SupplierApplication from "./pages/SupplierApplication";
import DebugAPI from "./pages/DebugAPI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<About />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/index" element={<Index />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/manuals" element={<Manuals />} />
                <Route path="/supplier-application" element={<SupplierApplication />} />
                <Route path="/debug-api" element={<DebugAPI />} />

                {/* All Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/engagements" element={<Engagements />} />
                <Route path="/engagement/:id" element={<EngagementDetails />} />
                <Route path="/open-role/:id" element={<OpenRoleDetails />} />
                <Route path="/resources" element={<ResourcePool />} />
                <Route path="/resource-pool" element={<ResourcePool />} />
                <Route path="/add-resource" element={<AddResource />} />
                <Route path="/edit-resource/:id" element={<EditResource />} />
                <Route path="/profile" element={<Profile />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
