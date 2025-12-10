import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/members/AuthGuard";
import { AdminGuard } from "@/components/members/AdminGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Members from "./pages/Members";
import ModulePage from "./pages/ModulePage";
import LessonPage from "./pages/LessonPage";
import Upgrade from "./pages/Upgrade";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/members" element={<AuthGuard><Members /></AuthGuard>} />
              <Route path="/members/module/:moduleId" element={<AuthGuard><ModulePage /></AuthGuard>} />
              <Route path="/members/lesson/:lessonId" element={<AuthGuard><LessonPage /></AuthGuard>} />
              <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
