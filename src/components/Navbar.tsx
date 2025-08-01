import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Anchor } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Tjenester", href: "#services" },
    { label: "Portefølje", href: "#portfolio" },
    { label: "Om Meg", href: "#about" },
    { label: "Kontakt", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-pulse">
              <Anchor className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Maritime Automation
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
            <Button 
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse"
            >
              Få Tilbud
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-fade-in-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card/90 backdrop-blur-md rounded-lg mt-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2 text-foreground/80 hover:text-primary transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="px-3 py-2">
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Få Tilbud
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;