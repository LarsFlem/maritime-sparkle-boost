import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Briefcase, Award, MapPin, GraduationCap, Globe, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const VIDEO_ID = "LHXEMvQGN-E";

const YoutubeEmbed = () => {
  const [active, setActive] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;

  if (active) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
        title="Portrait interview - Lars Jørgen Flem"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      className="relative w-full h-full flex items-center justify-center bg-black/60 group"
      onClick={() => setActive(true)}
      aria-label="Play interview video"
    >
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="relative z-10 w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
        <Play className="h-6 w-6 text-white ml-1" />
      </div>
    </button>
  );
};

const About = () => {
  const { t } = useLanguage();

  const experience = [
    { company: "Maritime Automation - Flem", role: t('about.ceo'), period: "Dec 2024 - Present", highlight: true },
    { company: "Moreld Apply / via Applica", role: t('about.role.moreld'), period: "Sep 2024 - Dec 2025" },
    { company: "Red Rock", role: t('about.role.redrock'), period: "Apr 2023 - Sep 2024" },
    { company: "HMH (Formerly MHWirth)", role: t('about.role.hmh'), period: "Sep 2022 - Apr 2023" },
    { company: "Ocean Infinity Marine", role: t('about.role.ocean'), period: "Jun 2019 - Sep 2022" },
    { company: "Kongsberg Maritime / Rolls-Royce Marine", role: t('about.role.kongsberg'), period: "Aug 2010 - Jun 2015" },
  ];

  const education = [
    { school: "Universitetet i Agder (UiA)", degree: t('education.uia'), years: t('education.uia.years') },
    { school: "NTNU", degree: t('education.ntnu'), years: t('education.ntnu.years') },
    { school: "Haram Videregående Skole", degree: t('education.haram'), years: t('education.haram.years') },
  ];

  return (
    <section id="about" aria-label="Om oss" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t('about.title')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t('about.subtitle')}</h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('about.description')}</p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left side */}
          <div className="space-y-5">
            <AnimatedSection delay={0.1}>
              <Card className="glass-effect overflow-hidden border-border/30">
                <CardContent className="p-0">
                  <div className="aspect-video">
                    <YoutubeEmbed />
                  </div>
                  <div className="p-3 bg-primary/5 border-t border-border/20">
                    <div className="flex items-center space-x-2">
                      <Play className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-foreground">{t('about.watchInterview')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5 group"
                onClick={() => window.open('https://maritime-automation.no/static/media/Lars_Flem_CV_english.eaafe9c5471611b22e36.pdf', '_blank')}
              >
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                {t('about.downloadCV')}
              </Button>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Card className="glass-effect border-border/30">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    {t('skills.title')}
                  </h3>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                  >
                    {[
                      "TwinCAT / Beckhoff", "PLC Programming", "HMI/SCADA",
                      t('skills.solidworks'), "IECEx / ATEX", t('skills.network'),
                      t('skills.leadership'), "SQL / HTML / CSS / JS",
                    ].map((skill) => (
                      <motion.span
                        key={skill}
                        className="px-3 py-1.5 bg-primary/8 rounded-full border border-primary/10 text-xs font-medium text-foreground/80"
                        variants={{
                          hidden: { opacity: 0, scale: 0.8 },
                          visible: { opacity: 1, scale: 1 },
                        }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>

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
            </AnimatedSection>
          </div>

          {/* Right side */}
          <div className="space-y-5">
            <AnimatedSection delay={0.15} direction="right">
              <Card className="glass-effect border-border/30">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    {t('services.experience.title')}
                  </h3>
                  <div className="space-y-1">
                    {experience.map((exp, index) => (
                      <motion.div
                        key={`${exp.company}-${index}`}
                        className={`flex items-center space-x-3 p-2.5 rounded-lg transition-colors ${
                          exp.highlight ? 'bg-primary/8 border border-primary/15' : 'hover:bg-primary/5'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                          exp.highlight ? 'bg-primary' : 'bg-primary/10'
                        }`}>
                          <Briefcase className={`h-3.5 w-3.5 ${exp.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate ${exp.highlight ? 'text-primary' : 'text-foreground'}`}>{exp.company}</h4>
                          <p className="text-[11px] text-muted-foreground truncate">{exp.role}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:block">{exp.period}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.25} direction="right">
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
                          <span className="text-[11px] text-primary bg-primary/8 px-2 py-0.5 rounded-full whitespace-nowrap">{edu.years}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.35} direction="right">
              <div className="flex items-center space-x-2.5 p-3.5 glass-effect rounded-xl">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t('contact.info.address')}</span>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
