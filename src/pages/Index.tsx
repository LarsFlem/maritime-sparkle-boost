import { Suspense } from "react";
import { lazyWithReload } from "@/lib/lazyWithReload";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import DemoHub from "@/components/DemoHub";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const ParticleBackground = lazyWithReload(() => import("@/components/ParticleBackground"));

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Decorative: if it fails to load, the page carries on without it. */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <ParticleBackground />
        </Suspense>
      </ErrorBoundary>
      <Navbar />
      <main>
        <Hero />
        <DemoHub />
        <Services />
        <About />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
