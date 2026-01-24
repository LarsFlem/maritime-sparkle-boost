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
    <section id="services" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl drift-animation blob-animation"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl drift-animation blob-animation" style={{ animationDelay: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-md border border-primary/30 rounded-full px-6 py-2 mb-6 shimmer-effect">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('services.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">
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
              className="glass-effect-strong hover-lift transition-all duration-500 group tech-border-glow animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${service.color} p-1 group-hover:scale-110 transition-all duration-500 relative`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  {service.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex} 
                    className="flex items-start space-x-3 group/item hover:bg-primary/10 rounded-lg p-2 transition-all duration-300 hover:translate-x-1"
                  >
                    {getFeatureIcon(featureIndex)}
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 hover:from-primary/20 hover:to-accent/20 hover:border-primary/50 text-primary group/button transition-all duration-300"
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
          <div className="glass-effect-strong rounded-2xl p-8 tech-border-glow max-w-4xl mx-auto relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 gradient-animate"></div>
            
            <h3 className="text-2xl font-bold mb-6 text-foreground relative z-10">
              {t('services.experience.title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {["Moreld Apply", "Red Rock", "HMH", "Ocean Infinity Marine", "Kongsberg Maritime", "Rolls Royce Marine", "Optimar Stette"].map((company, index) => (
                <div 
                  key={company} 
                  className="text-center group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
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