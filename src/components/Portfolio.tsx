import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import portfolioBattery from "@/assets/portfolio-battery-swap.jpg";
import portfolioRacing from "@/assets/portfolio-align-racing.jpg";

const Portfolio = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const projects = [
    {
      id: 2,
      title: "Autonomous Battery Swapping – SHIFTR",
      category: "green",
      location: "Stavanger, Norway",
      year: "2024–2025",
      client: "Norled / Aarbakke",
      image: portfolioBattery,
      description: "Commissioning and testing support for autonomous battery-swapping system for high-speed ferries. Contributed to machine directive compliance, safety standards, and provided technical feedback to improve system design, reliability, and performance.",
      technologies: ["Machine Directives", "Safety Standards", "System Integration", "Battery Tech"],
      results: ["Autonomous battery swap for ferries", "Compliance with safety standards", "Improved system reliability"],
      teamSize: 8,
      duration: "Ongoing",
    },
    {
      id: 4,
      title: "Align Racing – Formula Student",
      category: "project",
      location: "Grimstad, Norway",
      year: "2018–2019",
      client: "UiA / Align Racing",
      image: portfolioRacing,
      description: "Chief Electronics Officer leading 13 students through designing, prototyping, manufacturing and tuning the full electronics suite of a formula student racecar. Ensured compliance with racing regulations and managed team motivation.",
      technologies: ["Embedded Systems", "PCB Design", "CAN Bus", "Team Leadership"],
      results: ["Full electronics suite delivered", "13-person team led", "Race regulation compliance"],
      teamSize: 13,
      duration: "12 months",
    },
  ];

  const categories = [
    { id: "all", label: t('portfolio.all') },
    { id: "offshore", label: t('portfolio.offshore') },
    { id: "green", label: "Green Tech" },
    { id: "project", label: "Projects" },
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
            {filteredProjects.map((project, index) => (
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
                      alt={project.title}
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
                        {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.duration}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.teamSize} {t('portfolio.engineers')}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                    <div>
                      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-primary" />{t('portfolio.technologies')}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-[10px] border-border/50 font-normal">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2">{t('portfolio.results')}</h4>
                      <ul className="space-y-1.5">
                        {project.results.map((result, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0"></div>
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-border/20">
                      <p className="text-xs text-muted-foreground">
                        {t('portfolio.client')}: <span className="text-primary font-medium">{project.client}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Portfolio;
