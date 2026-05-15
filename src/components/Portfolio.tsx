import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Zap, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import portfolioCrane from "@/assets/portfolio-crane-3d.jpg";
import portfolioBattery from "@/assets/portfolio-battery-swap.jpg";
import portfolioRacing from "@/assets/portfolio-align-racing.jpg";
import portfolioKsService from "@/assets/portfolio-ks-service.png";
import portfolio3DPrint from "@/assets/h2c.jpeg";

const Portfolio = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const projects: Array<{
    id: number;
    key: string;
    category: "offshore" | "green" | "project";
    year: string;
    client: string;
    image: string;
    teamSize: number;
    downloads?: Array<{ labelKey: string; href: string }>;
  }> = [
    {
      id: 1,
      key: "crane",
      category: "offshore",
      year: "2023–2024",
      client: "Red Rock / IMECA",
      image: portfolioCrane,
      teamSize: 6,
    },
    {
      id: 2,
      key: "battery",
      category: "green",
      year: "2024–2025",
      client: "Norled / Aarbakke",
      image: portfolioBattery,
      teamSize: 8,
    },
    {
      id: 5,
      key: "ks",
      category: "project",
      year: "2025–2026",
      client: "KS-Service AS / Injeksjonsutstyr AS",
      image: portfolioKsService,
      teamSize: 2,
      downloads: [
        { labelKey: "portfolio.proj.ks.download.pdf", href: `${import.meta.env.BASE_URL}portfolio/ks-service-platekapp-sementtank.pdf` },
        { labelKey: "portfolio.proj.ks.download.step", href: `${import.meta.env.BASE_URL}portfolio/ks-service-sheetmetal-of-tank.step` },
      ],
    },
    {
      id: 6,
      key: "ks3d",
      category: "project",
      year: "2025–2026",
      client: "KS-Service AS",
      image: portfolio3DPrint,
      teamSize: 2,
    },
    {
      id: 4,
      key: "racing",
      category: "project",
      year: "2018–2019",
      client: "UiA / Align Racing",
      image: portfolioRacing,
      teamSize: 13,
    },
  ];

  const categories = [
    { id: "all", label: t('portfolio.all') },
    { id: "offshore", label: t('portfolio.cat.offshore') },
    { id: "green", label: t('portfolio.cat.green') },
    { id: "project", label: t('portfolio.cat.project') },
  ];

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="portfolio" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t('portfolio.title')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t('portfolio.title')}</h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('portfolio.description')}</p>
        </AnimatedSection>

        <AnimatedSection className="flex flex-wrap justify-center gap-2 mb-12" delay={0.1}>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`text-xs transition-all ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              }`}
            >
              {category.label}
            </Button>
          ))}
        </AnimatedSection>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            {filteredProjects.map((project, index) => {
              const title = t(`portfolio.proj.${project.key}.title`);
              const location = t(`portfolio.proj.${project.key}.location`);
              const duration = t(`portfolio.proj.${project.key}.duration`);
              const description = t(`portfolio.proj.${project.key}.description`);
              const technologies = t(`portfolio.proj.${project.key}.tech`).split("|");
              const results = t(`portfolio.proj.${project.key}.results`).split("|");

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="glass-effect hover-lift group overflow-hidden border-border/30 h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={title}
                        width={800}
                        height={512}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-background/70 backdrop-blur-md text-xs">{project.year}</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-background/70 backdrop-blur-md border-primary/30 text-primary text-xs">
                          {t(`portfolio.cat.${project.category}`)}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{duration}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.teamSize} {t('portfolio.engineers')}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                      <div>
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                          <Zap className="h-3 w-3 text-primary" />{t('portfolio.technologies')}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-[10px] border-border/50 font-normal">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold mb-2">{t('portfolio.results')}</h4>
                        <ul className="space-y-1.5">
                          {results.map((result, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0"></div>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {project.downloads && (
                        <div>
                          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <Download className="h-3 w-3 text-primary" />{t('portfolio.drawings')}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {project.downloads.map((d) => (
                              <a
                                key={d.href}
                                href={d.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border border-border/50 hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors"
                              >
                                <Download className="h-2.5 w-2.5" />
                                {t(d.labelKey)}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-3 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                          {t('portfolio.client')}: <span className="text-primary font-medium">{project.client}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Portfolio;
