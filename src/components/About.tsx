import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Briefcase, Award, MapPin, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const experience = [
    { company: "Moreld Apply", role: "Automation Engineer" },
    { company: "Red Rock", role: "Control Systems" },
    { company: "HMH", role: "PLC Programming" },
    { company: "Ocean Infinity Marine", role: "Systems Integration" },
    { company: "Kongsberg Maritime", role: "Marine Automation" },
    { company: "Rolls Royce Marine", role: "Engineering" },
    { company: "Optimar Stette", role: "Automation Solutions" },
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl drift-animation"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl drift-animation" style={{ animationDelay: '5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-md border border-primary/30 rounded-full px-6 py-2 mb-6 shimmer-effect">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('about.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">{t('about.subtitle')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('about.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Video and CV */}
          <div className="space-y-6">
            {/* YouTube Video Embed */}
            <Card className="glass-effect-strong tech-border-glow overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/LHXEMvQGN-E"
                    title="Portrait interview - Lars Jørgen Flem"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t('about.watchInterview')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download CV Button */}
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-6 text-lg group"
              onClick={() => window.open('https://maritime-automation.no/static/media/Lars_Flem_CV_english.eaafe9c5471611b22e36.pdf', '_blank')}
            >
              <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              {t('about.downloadCV')}
            </Button>
          </div>

          {/* Right side - Experience Timeline */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              {t('services.experience.title')}
            </h3>
            
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div 
                  key={exp.company}
                  className="flex items-center space-x-4 p-4 glass-effect hover-lift rounded-xl group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/40 group-hover:to-accent/40 transition-all duration-300">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {exp.company}
                    </h4>
                    <p className="text-sm text-muted-foreground">{exp.role}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="flex items-center space-x-3 p-4 glass-effect rounded-xl">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">{t('contact.info.address')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
