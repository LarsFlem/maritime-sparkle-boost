import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import HMIDashboard from "./pages/HMIDashboard";
import DataAnalysis from "./pages/DataAnalysis";
import LiveDemo from "./pages/LiveDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const GlobalError = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-3">
      <p className="text-4xl font-bold text-primary/20">500</p>
      <p className="text-lg font-semibold text-foreground">Something went wrong</p>
      <p className="text-muted-foreground text-sm">Please refresh the page to try again.</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary fallback={<GlobalError />}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hmi" element={<HMIDashboard />} />
              <Route path="/data-analysis" element={<DataAnalysis />} />
              <Route path="/live-demo" element={<LiveDemo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
