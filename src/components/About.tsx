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

  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t('about.title')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('about.subtitle')}
          </h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('about.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left side */}
          <div className="space-y-5">
            {/* Video */}
            <Card className="glass-effect overflow-hidden border-border/30">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/LHXEMvQGN-E"
                    title="Portrait interview - Lars Jørgen Flem"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-3 bg-primary/5 border-t border-border/20">
                  <div className="flex items-center space-x-2">
                    <Play className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">{t('about.watchInterview')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download CV */}
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5 group"
              onClick={() => window.open('https://maritime-automation.no/static/media/Lars_Flem_CV_english.eaafe9c5471611b22e36.pdf', '_blank')}
            >
              <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
              {t('about.downloadCV')}
            </Button>

            {/* Skills */}
            <Card className="glass-effect border-border/30">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  {t('skills.title')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: t('skills.solidworks'), color: '' },
                    { name: t('skills.computer'), color: '' },
                    { name: t('skills.leadership'), color: '' },
                    { name: "TwinCAT / Beckhoff", color: '' },
                    { name: "PLC Programming", color: '' },
                    { name: "HMI/SCADA", color: '' },
                  ].map((skill) => (
                    <span key={skill.name} className="px-3 py-1.5 bg-primary/8 rounded-full border border-primary/10 text-xs font-medium text-foreground/80">
                      {skill.name}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border/20">
                  <h4 className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />{t('skills.languages')}
                  </h4>
                  <div className="flex gap-3 text-xs">
                    <span className="text-foreground/80">{t('skills.norwegian')}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-foreground/80">{t('skills.english')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side */}
          <div className="space-y-5">
            {/* Experience */}
            <Card className="glass-effect border-border/30">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  {t('services.experience.title')}
                </h3>
                <div className="space-y-1">
                  {experience.map((exp, index) => (
                    <div 
                      key={`${exp.company}-${index}`}
                      className={`flex items-center space-x-3 p-2.5 rounded-lg transition-colors ${
                        exp.highlight 
                          ? 'bg-primary/8 border border-primary/15' 
                          : 'hover:bg-primary/5'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                        exp.highlight ? 'bg-primary' : 'bg-primary/10'
                      }`}>
                        <Briefcase className={`h-3.5 w-3.5 ${exp.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium truncate ${exp.highlight ? 'text-primary' : 'text-foreground'}`}>
                          {exp.company}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">{exp.role}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{exp.period}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="glass-effect border-border/30">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {t('education.title')}
                </h3>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.school} className="p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground">{edu.school}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{edu.degree}</p>
                        </div>
                        <span className="text-[11px] text-primary bg-primary/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {edu.years}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <div className="flex items-center space-x-2.5 p-3.5 glass-effect rounded-xl">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t('contact.info.address')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
