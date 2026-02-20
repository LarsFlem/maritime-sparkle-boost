import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoText from "@/assets/logo-text.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, useLocation } from "react-router-dom";
import { QuoteModal } from "@/components/QuoteModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2.5 group"
              onClick={() => {
                if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img src={logoText} alt="Maritime Automation" className="h-8 group-hover:scale-105 transition-transform duration-300 brightness-0 invert" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const className = "px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-primary/5";
                return item.type === "link" ? (
                  <Link key={item.label} to={item.to} className={className} onClick={() => handleNavClick(item)}>
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.to} className={className} onClick={() => handleNavClick(item)}>
                    {item.label}
                  </a>
                );
              })}
              <div className="ml-2 pl-2 border-l border-border/50 flex items-center space-x-2">
                <LanguageSwitcher />
                <Button 
                  size="sm"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4"
                >
                  {t('nav.getQuote')}
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden animate-fade-in-up">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-xl rounded-lg mt-2 border border-border/30">
                {navItems.map((item) => {
                  const className = "block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors";
                  return item.type === "link" ? (
                    <Link key={item.label} to={item.to} className={className} onClick={() => handleNavClick(item)}>
                      {item.label}
                    </Link>
                  ) : (
                    <a key={item.label} href={item.to} className={className} onClick={() => handleNavClick(item)}>
                      {item.label}
                    </a>
                  );
                })}
                <div className="flex items-center justify-between px-3 py-2 gap-2">
                  <LanguageSwitcher />
                  <Button 
                    size="sm"
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
