import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Anchor } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, useLocation } from "react-router-dom";
import { QuoteModal } from "@/components/QuoteModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navItems = [
    { label: t('nav.home'), to: "/", type: "link" },
    { label: t('nav.services'), to: isHomePage ? "#services" : "/#services", type: isHomePage ? "anchor" : "link" },
    { label: t('nav.portfolio'), to: isHomePage ? "#portfolio" : "/#portfolio", type: isHomePage ? "anchor" : "link" },
    { label: t('nav.hmi'), to: "/hmi", type: "link" },
    { label: t('nav.dataAnalysis'), to: "/data-analysis", type: "link" },
    { label: t('nav.liveDemo'), to: "/live-demo", type: "link" },
    { label: t('nav.contact'), to: isHomePage ? "#contact" : "/#contact", type: isHomePage ? "anchor" : "link" },
  ];

  const handleNavClick = (item: any) => {
    if (item.label === t('nav.home') && isHomePage) {
      // If we're already on home page and clicking home, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-effect-strong border-b border-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
              onClick={() => {
                if (isHomePage) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-pulse-intense relative group-hover:scale-110 transition-transform duration-300">
                <Anchor className="h-6 w-6 text-white relative z-10" />
              </div>
              <span className="text-xl font-bold gradient-text">
                Maritime Automation
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                item.type === "link" ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium"
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.to}
                    className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium"
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                  </a>
                )
              ))}
              <LanguageSwitcher />
              <Button 
                size="sm"
                onClick={() => setIsQuoteModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse"
              >
                {t('nav.getQuote')}
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
                  item.type === "link" ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block px-3 py-2 text-foreground/80 hover:text-primary transition-colors duration-300"
                      onClick={() => handleNavClick(item)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      key={item.label}
                      href={item.to}
                      className="block px-3 py-2 text-foreground/80 hover:text-primary transition-colors duration-300"
                      onClick={() => handleNavClick(item)}
                    >
                      {item.label}
                    </a>
                  )
                ))}
                <div className="flex items-center justify-between px-3 py-2 gap-2">
                  <LanguageSwitcher />
                  <Button 
                    size="sm"
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {t('nav.getQuote')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <QuoteModal 
        open={isQuoteModalOpen} 
        onOpenChange={setIsQuoteModalOpen} 
      />
    </>
  );
};

export default Navbar;