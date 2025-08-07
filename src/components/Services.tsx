import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Wrench, 
  Users, 
  Cog, 
  Zap, 
  Database,
  Monitor,
  Shield,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import engineeringIcon from "@/assets/engineering-icon.png";
import supportIcon from "@/assets/support-icon.png";
import projectIcon from "@/assets/project-icon.png";

const Services = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t('services.package.title'),
      icon: engineeringIcon,
      description: t('services.package.description'),
      features: [
        t('services.package.feature1'),
        t('services.package.feature2'),
        t('services.package.feature3'),
        t('services.package.feature4')
      ],
      color: "from-primary to-blue-500"
    },
    {
      title: t('services.support.title'),
      icon: supportIcon,
      description: t('services.support.description'),
      features: [
        t('services.support.feature1'),
        t('services.support.feature2'),
        t('services.support.feature3'),
        t('services.support.feature4')
      ],
      color: "from-accent to-green-500"
    },
    {
      title: t('services.project.title'),
      icon: projectIcon,
      description: t('services.project.description'),
      features: [
        t('services.project.feature1'),
        t('services.project.feature2'),
        t('services.project.feature3'),
        t('services.project.feature4')
      ],
      color: "from-purple-500 to-primary"
    }
  ];

  const getFeatureIcon = (index: number) => {
    const icons = [Settings, Zap, Shield, Database, Monitor, Cog, Wrench, Users];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="h-4 w-4 text-primary flex-shrink-0" />;
  };

  return (
    <section id="services" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl drift-animation"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl drift-animation" style={{ animationDelay: '10s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2 mb-6">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('services.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('services.title')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="glass-effect hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 tech-border"
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${service.color} p-4 group-hover:scale-110 transition-transform duration-300 glow-pulse`}>
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {service.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3 group/item hover:bg-primary/5 rounded-lg p-2 transition-colors">
                    {getFeatureIcon(featureIndex)}
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:from-primary/20 hover:to-accent/20 text-primary group/button"
                    variant="outline"
                  >
                    {t('services.readMore')}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Experience Section */}
        <div className="mt-20 text-center">
          <div className="glass-effect rounded-2xl p-8 tech-border max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-foreground">
              {t('services.experience.title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["Moreld Apply", "Red Rock", "HMH", "Ocean Infinity Marine", "Kongsberg Maritime", "Rolls Royce Marine", "Optimar Stette"].map((company, index) => (
                <div key={company} className="text-center group">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {company}
                    </span>
                  </div>
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