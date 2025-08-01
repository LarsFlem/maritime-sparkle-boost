import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, MapPin, Users, Zap } from "lucide-react";

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const projects = [
    {
      id: 1,
      title: "Offshore Wind Platform Automation",
      category: "offshore",
      location: "North Sea, Norway",
      year: "2024",
      client: "Equinor ASA",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&q=80",
      description: "Complete automation system for offshore wind maintenance vessel including dynamic positioning, cargo handling, and weather routing systems.",
      technologies: ["PLC Control", "SCADA", "Dynamic Positioning", "Weather Routing"],
      results: [
        "40% reduction in operational costs",
        "99.8% system uptime achieved",
        "Zero safety incidents during implementation"
      ],
      teamSize: 12,
      duration: "8 months"
    },
    {
      id: 2,
      title: "Cargo Ship Bridge Integration",
      category: "commercial",
      location: "Bergen, Norway",
      year: "2023",
      client: "Wilhelmsen Ship Management",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
      description: "Integrated bridge management system with AI-powered navigation assistance and automated collision avoidance for container vessels.",
      technologies: ["AI Navigation", "Radar Integration", "ECDIS", "AIS Systems"],
      results: [
        "30% fuel efficiency improvement",
        "Enhanced safety protocols",
        "Reduced crew workload by 25%"
      ],
      teamSize: 8,
      duration: "6 months"
    },
    {
      id: 3,
      title: "Research Vessel Automation",
      category: "research",
      location: "Tromsø, Norway",
      year: "2023",
      client: "University of Tromsø",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&q=80",
      description: "Scientific equipment automation and data collection systems for Arctic research vessel with remote monitoring capabilities.",
      technologies: ["IoT Sensors", "Remote Monitoring", "Data Analytics", "Scientific Equipment"],
      results: [
        "Automated 24/7 data collection",
        "Real-time research data transmission",
        "50% increase in research efficiency"
      ],
      teamSize: 6,
      duration: "4 months"
    },
    {
      id: 4,
      title: "Ferry Fleet Management System",
      category: "passenger",
      location: "Lofoten Islands, Norway",
      year: "2022",
      client: "Torghatten Nord AS",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
      description: "Centralized fleet management and passenger information system for inter-island ferry operations with predictive maintenance.",
      technologies: ["Fleet Management", "Passenger Systems", "Predictive Maintenance", "Mobile Apps"],
      results: [
        "15% reduction in maintenance costs",
        "Improved passenger satisfaction",
        "Real-time schedule optimization"
      ],
      teamSize: 10,
      duration: "5 months"
    },
    {
      id: 5,
      title: "Fishing Vessel Optimization",
      category: "fishing",
      location: "Ålesund, Norway",
      year: "2022",
      client: "Pelagic AS",
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&q=80",
      description: "Fish processing automation and catch optimization system with real-time market integration and quality control.",
      technologies: ["Process Automation", "Quality Control", "Market Integration", "Cold Chain Management"],
      results: [
        "25% increase in catch value",
        "Automated quality grading",
        "Reduced processing time by 40%"
      ],
      teamSize: 7,
      duration: "3 months"
    }
  ];

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "offshore", label: "Offshore" },
    { id: "commercial", label: "Commercial" },
    { id: "research", label: "Research" },
    { id: "passenger", label: "Passenger" },
    { id: "fishing", label: "Fishing" }
  ];

  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Project Portfolio
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our successful maritime automation implementations across diverse vessel types and operational environments
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`transition-all duration-300 ${
                selectedCategory === category.id 
                  ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse" 
                  : "hover:border-primary/50"
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <Card
              key={project.id}
              className="glass-effect hover:scale-[1.02] transition-all duration-500 tech-border group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {project.year}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/30">
                    {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {project.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {project.teamSize} engineers
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>

                {/* Technologies */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Technologies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div>
                  <h4 className="font-semibold mb-3">Key Results</h4>
                  <ul className="space-y-2">
                    {project.results.map((result, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Client */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-medium">
                    Client: <span className="text-primary">{project.client}</span>
                  </p>
                </div>

                {/* Action Button */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-primary/50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Case Study
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our growing list of satisfied clients who have transformed their maritime operations with our cutting-edge automation solutions.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse"
            >
              Start Your Project
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;