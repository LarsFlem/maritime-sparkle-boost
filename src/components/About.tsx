import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Briefcase, Award, MapPin, GraduationCap, Globe, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const experience = [
    { company: "Maritime Automation - Flem", role: t('about.ceo'), period: "2024 - Present", highlight: true },
    { company: "Applica / Moreld Apply", role: "Senior Automasjonsingeniør", period: "2024 - 2026" },
    { company: "Red Rock AS", role: "Senior Automasjonsingeniør", period: "2023 - 2024" },
    { company: "HMH", role: "Control System Support Engineer", period: "2022 - 2023" },
    { company: "Ocean Infinity Marine", role: "Electro - Automation Engineer", period: "2022" },
    { company: "Red Rock AS", role: "Electro - Automation Engineer", period: "2019 - 2022" },
    { company: "Rolls-Royce Marine", role: "Test Engineer - Automation", period: "2010 - 2014" },
  ];

  const education = [
    { school: "Universitetet i Agder (UiA)", degree: t('education.uia'), years: t('education.uia.years') },
    { school: "NTNU", degree: t('education.ntnu'), years: t('education.ntnu.years') },
    { school: "Haram Videregående Skole", degree: t('education.haram'), years: t('education.haram.years') },
  ];

  const skills = [
    { name: t('skills.solidworks'), icon: Wrench },
    { name: t('skills.computer'), icon: Wrench },
    { name: t('skills.leadership'), icon: Award },
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

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left side - Video, CV and Skills */}
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

            {/* Skills */}
            <Card className="glass-effect-strong tech-border-glow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  {t('skills.title')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <div key={skill.name} className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20 hover:border-primary/50 transition-colors">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/20">
                    <span className="text-sm font-medium text-green-400">TwinCAT / Beckhoff</span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/20">
                    <span className="text-sm font-medium text-blue-400">PLC Programming</span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/20">
                    <span className="text-sm font-medium text-purple-400">HMI/SCADA</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="mt-6 pt-4 border-t border-primary/10">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('skills.languages')}
                  </h4>
                  <div className="flex gap-4">
                    <span className="text-sm text-foreground">{t('skills.norwegian')}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-foreground">{t('skills.english')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Experience and Education */}
          <div className="space-y-6">
            {/* Experience */}
            <Card className="glass-effect-strong tech-border-glow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t('services.experience.title')}
                </h3>
                <div className="space-y-3">
                  {experience.map((exp, index) => (
                    <div 
                      key={`${exp.company}-${index}`}
                      className={`flex items-center space-x-4 p-3 rounded-xl group animate-fade-in-up transition-all duration-300 ${
                        exp.highlight 
                          ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30' 
                          : 'hover:bg-primary/10'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        exp.highlight 
                          ? 'bg-gradient-to-br from-primary to-accent' 
                          : 'bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/40 group-hover:to-accent/40'
                      }`}>
                        <Briefcase className={`h-4 w-4 ${exp.highlight ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate ${exp.highlight ? 'text-primary' : 'text-foreground group-hover:text-primary'} transition-colors`}>
                          {exp.company}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{exp.role}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.period}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="glass-effect-strong tech-border-glow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  {t('education.title')}
                </h3>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div 
                      key={edu.school}
                      className="p-4 rounded-xl hover:bg-primary/10 transition-all duration-300 group animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {edu.school}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{edu.degree}</p>
                        </div>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                          {edu.years}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
