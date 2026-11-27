import { Suspense } from "react";
import { lazyWithReload } from "@/lib/lazyWithReload";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollManager from "@/components/ScrollManager";
import Index from "./pages/Index";

// Lazy routes reload the page once if their chunk has gone missing after a deploy.
const lazyRoute = lazyWithReload;

const HMIDashboard = lazyRoute(() => import("./pages/HMIDashboard"));
const DataAnalysis = lazyRoute(() => import("./pages/DataAnalysis"));
const LiveDemo = lazyRoute(() => import("./pages/LiveDemo"));
const PMSDemo = lazyRoute(() => import("./pages/PMSDemo"));
const DPDemo = lazyRoute(() => import("./pages/DPDemo"));
const EngineRoom = lazyRoute(() => import("./pages/EngineRoom"));
const NotFound = lazyRoute(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const GlobalError = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-3">
      {/* Rendered outside LanguageProvider, so it carries both languages. */}
      <p className="text-lg font-semibold text-foreground">Noe gikk galt · Something went wrong</p>
      <p className="text-muted-foreground text-sm">Last inn siden på nytt · Please reload the page</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex items-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Last inn på nytt · Reload
      </button>
    </div>
  </div>
);

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
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
            <ScrollManager />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/hmi" element={<HMIDashboard />} />
                <Route path="/data-analysis" element={<DataAnalysis />} />
                <Route path="/live-demo" element={<LiveDemo />} />
                <Route path="/pms" element={<PMSDemo />} />
                <Route path="/dp" element={<DPDemo />} />
                <Route path="/engine-room" element={<EngineRoom />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
