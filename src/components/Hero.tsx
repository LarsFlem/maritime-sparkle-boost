import { Button } from "@/components/ui/button";
import { ArrowRight, Waves, Zap, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/maritime-hero.jpg";

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/90"></div>
        {/* Aurora effect overlay */}
        <div className="absolute inset-0 aurora-bg opacity-30"></div>
      </div>

      {/* Animated blob elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl blob-animation"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tr from-accent/15 to-primary/10 rounded-full blur-3xl blob-animation" style={{ animationDelay: '-4s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl opacity-50"></div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-6 h-6 bg-primary/40 rounded-full float-animation glow-pulse-intense"></div>
        <div className="absolute top-32 right-[15%] w-8 h-8 bg-accent/50 rounded-full float-delayed-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-[15%] w-4 h-4 bg-primary/60 rounded-full float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-[20%] w-10 h-10 bg-accent/30 rounded-full float-delayed-animation blob-animation" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 left-[5%] w-3 h-3 bg-primary/70 rounded-full float-animation" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/4 right-[8%] w-5 h-5 bg-accent/40 rounded-full float-delayed-animation" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-md border border-primary/30 rounded-full px-6 py-2 mb-6 shimmer-effect relative overflow-hidden">
            <Waves className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('hero.title')}</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="gradient-text">
            {t('hero.title')}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse-intense text-lg px-8 py-6 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {t('hero.cta.services')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 text-lg px-8 py-6 backdrop-blur-sm transition-all duration-300"
          >
            {t('hero.cta.contact')}
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass-effect-strong rounded-xl p-6 tech-border-glow hover-lift group">
            <div className="relative">
              <Settings className="h-8 w-8 text-primary mx-auto mb-3 group-hover:rotate-90 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('hero.feature1.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('hero.feature1.desc')}</p>
          </div>
          <div className="glass-effect-strong rounded-xl p-6 tech-border-glow hover-lift group">
            <div className="relative">
              <Zap className="h-8 w-8 text-accent mx-auto mb-3 group-hover:scale-125 transition-transform duration-300" />
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('hero.feature2.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('hero.feature2.desc')}</p>
          </div>
          <div className="glass-effect-strong rounded-xl p-6 tech-border-glow hover-lift group">
            <div className="relative">
              <Waves className="h-8 w-8 text-primary mx-auto mb-3 wave-animation" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('hero.feature3.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('hero.feature3.desc')}</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-muted-foreground mt-2 opacity-60">Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;