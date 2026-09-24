import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/maritime-hero.jpg";
import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";

const Ship3D = lazy(() => import("@/components/Ship3D"));

const Hero = () => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  // Only mount the WebGL canvas on desktop viewports — `hidden lg:block`
  // alone keeps it in the React tree, which still downloads Three.js and
  // spins up a hidden GL context on phones.
  const [showShip, setShowShip] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setShowShip(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return (
    <section aria-label="Hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90"></div>
      </div>

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tr from-accent/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={reduceMotion ? false : { opacity: 0, x: -20 }}
              animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-xs font-medium tracking-widest uppercase text-primary/70">{t('hero.eyebrow')}</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter leading-[1.04] text-balance mb-6"
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="gradient-text">{t('hero.title')}</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 group shadow-lg shadow-primary/20 border border-primary/20"
                onClick={() => document.getElementById("demos")?.scrollIntoView({ behavior: "smooth" })}
              >
                {t('hero.cta.demos')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/40 text-foreground hover:bg-primary/8 hover:border-primary/60 text-base px-8 py-6 transition-all duration-300"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                {t('hero.cta.contact')}
              </Button>
            </motion.div>
          </div>

          {/* 3D Ship Visualization */}
          {showShip && (
            <motion.div
              className="hidden lg:block h-[500px]"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={reduceMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ErrorBoundary>
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                }>
                  <Ship3D />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          )}
        </div>

        {/* Proof strip — deliberately not a repeat of the services section below */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/40 border-y border-border/40 max-w-3xl mx-auto lg:mx-0 mt-14"
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? {} : "visible"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.7 } },
          }}
        >
          {[
            { label: t('hero.proof1.label'), value: t('hero.proof1.value') },
            { label: t('hero.proof2.label'), value: t('hero.proof2.value') },
            { label: t('hero.proof3.label'), value: t('hero.proof3.value') },
          ].map((item) => (
            <motion.div
              key={item.label}
              className="bg-background/50 backdrop-blur-sm px-4 py-4 text-center sm:text-left"
              variants={reduceMotion ? {} : {
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-1.5">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-50"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? {} : { opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="flex flex-col items-center">
          <div className="w-5 h-8 border border-primary/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-primary/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
