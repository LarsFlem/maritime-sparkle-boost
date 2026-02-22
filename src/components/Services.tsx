import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Cog, Bell, Shield, Cpu,
  Rocket, Wrench, Network, FileText,
  ClipboardList, RefreshCw, SearchCheck, Monitor,
  Box, Layers, Ruler, ShoppingCart,
  ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import engineeringIcon from "@/assets/engineering-real.png";
import supportIcon from "@/assets/commissioning-real.jpg";
import projectIcon from "@/assets/assistanse-real.jpg";
import printingIcon from "@/assets/3d-printing-collage.png";

const Services = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services = [
  {
    title: t('services.package.title'),
    icon: engineeringIcon,
    description: t('services.package.description'),
    features: [
    t('services.package.feature1'), t('services.package.feature2'),
    t('services.package.feature3'), t('services.package.feature4')]

  },
  {
    title: t('services.support.title'),
    icon: supportIcon,
    description: t('services.support.description'),
    features: [
    t('services.support.feature1'), t('services.support.feature2'),
    t('services.support.feature3'), t('services.support.feature4')]

  },
  {
    title: t('services.project.title'),
    icon: projectIcon,
    description: t('services.project.description'),
    features: [
    t('services.project.feature1'), t('services.project.feature2'),
    t('services.project.feature3'), t('services.project.feature4')]

  },
  {
    title: t('services.printing.title'),
    icon: printingIcon,
    description: t('services.printing.description'),
    features: [
    t('services.printing.feature1'), t('services.printing.feature2'),
    t('services.printing.feature3'), t('services.printing.feature4')]

  }];


  // Per-service icons matched to feature descriptions
  const serviceFeatureIcons = [
    [Cog, Bell, Shield, Cpu],           // Engineering: automation, alarms, standards, PLC
    [Rocket, Wrench, Network, FileText], // Support: startup, troubleshooting, network, docs
    [ClipboardList, RefreshCw, SearchCheck, Monitor], // Project: mgmt, software, FMEA, tools
    [Box, Layers, Ruler, ShoppingCart],  // 3D Printing: components, filament, models, procurement
  ];
  const active = selectedService !== null ? services[selectedService] : null;

  return (
    <section id="services" aria-label="Tjenester" className="py-24 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-primary/4 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t('services.title')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('services.title')}
          </h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) =>
          <Card
            key={service.title}
            className="glass-effect hover-lift group transition-all duration-400 animate-fade-in-up border-border/30"
            style={{ animationDelay: `${index * 0.1}s` }}>

              <div className="relative w-full overflow-hidden rounded-t-lg -mt-[1px] -mx-[1px] mb-0 bg-black/20" style={{ width: 'calc(100% + 2px)' }}>
                <img
                src={service.icon}
                alt={service.title}
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy" />

                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              </div>
              <CardHeader className="text-center pb-3 pt-4">
                <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  {service.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {service.features.map((feature, fi) => {
                const Icon = serviceFeatureIcons[index][fi];
                return (
                  <div key={fi} className="flex items-start space-x-2.5 p-1.5 rounded-md hover:bg-primary/5 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>);

              })}
                <div className="pt-3">
                  <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-primary hover:bg-primary/8 text-xs group/btn"
                  onClick={() => setSelectedService(index)}>

                    {t('services.readMore')}
                    <ArrowRight className="ml-1.5 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Service Detail Modal */}
        <Dialog open={selectedService !== null} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden glass-effect border-border/30">
            {active &&
            <>
                <div className="relative w-full overflow-hidden bg-black/20">
                  <img
                  src={active.icon}
                  alt={active.title}
                  className="w-full h-auto object-contain" />

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-foreground drop-shadow-lg">
                        {active.title}
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                    {active.description}
                  </DialogDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {active.features.map((feature, fi) => {
                    const Icon = serviceFeatureIcons[selectedService!][fi];
                    return (
                      <div key={fi} className="flex items-start space-x-3 p-3 rounded-lg bg-primary/5">
                          <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>);

                  })}
                  </div>
                  <div className="pt-2">
                    <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedService(null);
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}>

                      {t('services.cta')}
                    </Button>
                  </div>
                </div>
              </>
            }
          </DialogContent>
        </Dialog>

        {/* Experience Section */}
        <div className="mt-20 text-center">
          











        </div>
      </div>
    </section>);

};

export default Services;