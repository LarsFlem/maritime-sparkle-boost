import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import DemoHub from "@/components/DemoHub";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <DemoHub />
        <About />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
