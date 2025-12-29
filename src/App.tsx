import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { AuthGuard } from "@/components/members/AuthGuard";
import { AdminGuard } from "@/components/members/AdminGuard";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Members from "./pages/Members";
import ModulePage from "./pages/ModulePage";
import LessonPage from "./pages/LessonPage";
import Upgrade from "./pages/Upgrade";
import Admin from "./pages/Admin";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import IACopy from "./pages/IACopy";
import IACriativo from "./pages/IACriativo";
import AnalistaCampanha from "./pages/AnalistaCampanha";
import AnalistaAtendimento from "./pages/AnalistaAtendimento";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteSettingsProvider>
          <TooltipProvider>
            <div className="dark">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/setup" element={<Setup />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/members" element={<AuthGuard><Members /></AuthGuard>} />
                  <Route path="/members/module/:moduleId" element={<AuthGuard><ModulePage /></AuthGuard>} />
                  <Route path="/members/lesson/:lessonId" element={<AuthGuard><LessonPage /></AuthGuard>} />
                  <Route path="/members/ia/copy" element={<AuthGuard><IACopy /></AuthGuard>} />
                  <Route path="/members/ia/criativo" element={<AuthGuard><IACriativo /></AuthGuard>} />
                  <Route path="/members/ia/campanha" element={<AuthGuard><AnalistaCampanha /></AuthGuard>} />
                  <Route path="/members/ia/atendimento" element={<AuthGuard><AnalistaAtendimento /></AuthGuard>} />
                  <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
