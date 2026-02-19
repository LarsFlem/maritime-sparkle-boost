import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, Wrench, Users, Cog, Zap, Database, Monitor, Shield, ArrowRight, Printer
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import engineeringIcon from "@/assets/engineering-real.png";
import supportIcon from "@/assets/commissioning-real.jpg";
import projectIcon from "@/assets/assistanse-real.jpg";

const Services = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t('services.package.title'),
      icon: engineeringIcon,
      description: t('services.package.description'),
      features: [
        t('services.package.feature1'), t('services.package.feature2'),
        t('services.package.feature3'), t('services.package.feature4')
      ],
    },
    {
      title: t('services.support.title'),
      icon: supportIcon,
      description: t('services.support.description'),
      features: [
        t('services.support.feature1'), t('services.support.feature2'),
        t('services.support.feature3'), t('services.support.feature4')
      ],
    },
    {
      title: t('services.project.title'),
      icon: projectIcon,
      description: t('services.project.description'),
      features: [
        t('services.project.feature1'), t('services.project.feature2'),
        t('services.project.feature3'), t('services.project.feature4')
      ],
    },
    {
      title: t('services.printing.title'),
      icon: null,
      description: t('services.printing.description'),
      features: [
        t('services.printing.feature1'), t('services.printing.feature2'),
        t('services.printing.feature3'), t('services.printing.feature4')
      ],
      useIcon: true,
    }
  ];

  const featureIcons = [Settings, Zap, Shield, Database, Monitor, Cog, Wrench, Users];

  return (
    <section id="services" className="py-24 relative">
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
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="glass-effect hover-lift group transition-all duration-400 animate-fade-in-up border-border/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden">
                  {service.useIcon ? (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Printer className="h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <img src={service.icon!} alt={service.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  {service.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {service.features.map((feature, fi) => {
                  const Icon = featureIcons[fi % featureIcons.length];
                  return (
                    <div key={fi} className="flex items-start space-x-2.5 p-1.5 rounded-md hover:bg-primary/5 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  );
                })}
                <div className="pt-3">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:bg-primary/8 text-xs group/btn"
                  >
                    {t('services.readMore')}
                    <ArrowRight className="ml-1.5 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Experience Section */}
        <div className="mt-20 text-center">
          <div className="glass-effect rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-6 text-foreground">
              {t('services.experience.title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Moreld Apply", "Red Rock", "HMH", "Ocean Infinity Marine", "Kongsberg Maritime", "Rolls Royce Marine", "Optimar Stette"].map((company) => (
                <div key={company} className="px-4 py-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <span className="text-xs font-medium text-muted-foreground">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
