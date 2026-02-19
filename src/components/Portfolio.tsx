import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, MapPin, Users, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Portfolio = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const projects = [
    {
      id: 1, title: "Offshore Wind Platform Automation", category: "offshore",
      location: "North Sea, Norway", year: "2024", client: "Equinor ASA",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&q=80",
      description: "Complete automation system for offshore wind maintenance vessel including dynamic positioning, cargo handling, and weather routing systems.",
      technologies: ["PLC Control", "SCADA", "Dynamic Positioning", "Weather Routing"],
      results: ["40% reduction in operational costs", "99.8% system uptime achieved", "Zero safety incidents during implementation"],
      teamSize: 12, duration: "8 months"
    },
    {
      id: 2, title: "Cargo Ship Bridge Integration", category: "commercial",
      location: "Bergen, Norway", year: "2023", client: "Wilhelmsen Ship Management",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
      description: "Integrated bridge management system with AI-powered navigation assistance and automated collision avoidance for container vessels.",
      technologies: ["AI Navigation", "Radar Integration", "ECDIS", "AIS Systems"],
      results: ["30% fuel efficiency improvement", "Enhanced safety protocols", "Reduced crew workload by 25%"],
      teamSize: 8, duration: "6 months"
    },
    {
      id: 3, title: "Research Vessel Automation", category: "research",
      location: "Tromsø, Norway", year: "2023", client: "University of Tromsø",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&q=80",
      description: "Scientific equipment automation and data collection systems for Arctic research vessel with remote monitoring capabilities.",
      technologies: ["IoT Sensors", "Remote Monitoring", "Data Analytics", "Scientific Equipment"],
      results: ["Automated 24/7 data collection", "Real-time research data transmission", "50% increase in research efficiency"],
      teamSize: 6, duration: "4 months"
    },
    {
      id: 4, title: "Ferry Fleet Management System", category: "passenger",
      location: "Lofoten Islands, Norway", year: "2022", client: "Torghatten Nord AS",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
      description: "Centralized fleet management and passenger information system for inter-island ferry operations with predictive maintenance.",
      technologies: ["Fleet Management", "Passenger Systems", "Predictive Maintenance", "Mobile Apps"],
      results: ["15% reduction in maintenance costs", "Improved passenger satisfaction", "Real-time schedule optimization"],
      teamSize: 10, duration: "5 months"
    },
    {
      id: 5, title: "Fishing Vessel Optimization", category: "fishing",
      location: "Ålesund, Norway", year: "2022", client: "Pelagic AS",
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&q=80",
      description: "Fish processing automation and catch optimization system with real-time market integration and quality control.",
      technologies: ["Process Automation", "Quality Control", "Market Integration", "Cold Chain Management"],
      results: ["25% increase in catch value", "Automated quality grading", "Reduced processing time by 40%"],
      teamSize: 7, duration: "3 months"
    }
  ];

  const categories = [
    { id: "all", label: t('portfolio.all') },
    { id: "offshore", label: t('portfolio.offshore') },
    { id: "commercial", label: t('portfolio.commercial') },
    { id: "research", label: t('portfolio.research') },
    { id: "passenger", label: t('portfolio.passenger') },
    { id: "fishing", label: t('portfolio.fishing') }
  ];

  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <section id="portfolio" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t('portfolio.title')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('portfolio.title')}
          </h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('portfolio.description')}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <Card
              key={project.id}
              className="glass-effect hover-lift group animate-fade-in-up overflow-hidden border-border/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
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
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
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

                <div className="pt-3 border-t border-border/20 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {t('portfolio.client')}: <span className="text-primary font-medium">{project.client}</span>
                  </p>
                  <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/5 h-7 px-2">
                    <ExternalLink className="h-3 w-3 mr-1" />{t('portfolio.viewCase')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-3">{t('portfolio.cta.title')}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">{t('portfolio.cta.description')}</p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('portfolio.cta.button')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
