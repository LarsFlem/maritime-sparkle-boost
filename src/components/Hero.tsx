import { Button } from "@/components/ui/button";
import { ArrowRight, Waves, Zap, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/maritime-hero.jpg";
import { lazy, Suspense } from "react";

const Ship3D = lazy(() => import("@/components/Ship3D"));

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section aria-label="Hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90"></div>
      </div>

      {/* Subtle ambient glow — reduced from 6+ orbs to 2 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tr from-accent/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-primary/8 border border-primary/15 rounded-full px-5 py-1.5 mb-6">
                <Waves className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium tracking-wide uppercase text-primary/90">{t('hero.title')}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up tracking-tight" style={{ animationDelay: '0.15s' }}>
              <span className="gradient-text">
                {t('hero.title')}
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 group shadow-lg shadow-primary/20"
              >
                {t('hero.cta.services')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/25 text-foreground hover:bg-primary/8 hover:border-primary/40 text-base px-8 py-6 transition-all duration-300"
              >
                {t('hero.cta.contact')}
              </Button>
            </div>
          </div>

          {/* 3D Ship Visualization */}
          <div className="hidden lg:block h-[500px] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            }>
              <Ship3D />
            </Suspense>
          </div>
        </div>

        {/* Features — cleaner cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto lg:mx-0 mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {[
            { icon: Settings, title: t('hero.feature1.title'), desc: t('hero.feature1.desc'), hoverClass: 'group-hover:rotate-90' },
            { icon: Zap, title: t('hero.feature2.title'), desc: t('hero.feature2.desc'), hoverClass: 'group-hover:scale-110' },
            { icon: Waves, title: t('hero.feature3.title'), desc: t('hero.feature3.desc'), hoverClass: '' },
          ].map((feat, i) => (
            <div key={i} className="glass-effect rounded-xl p-5 group hover:bg-card/80 transition-all duration-300 hover:-translate-y-1">
              <feat.icon className={`h-6 w-6 text-primary mb-3 transition-transform duration-500 ${feat.hoverClass}`} />
              <h3 className="font-semibold text-sm mb-1">{feat.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-50">
        <div className="flex flex-col items-center">
          <div className="w-5 h-8 border border-primary/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-primary/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
