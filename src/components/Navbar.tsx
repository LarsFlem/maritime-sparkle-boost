import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Zap, Crosshair, Construction, Flame, Gauge, LineChart, LayoutGrid, Phone } from "lucide-react";
import logoImg from "@/assets/maritime-automation-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { QuoteModal } from "@/components/QuoteModal";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled((prev) => {
          const next = window.scrollY > 20;
          return prev === next ? prev : next;
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('nav.home'), to: "/", type: "link" },
    { label: t('nav.services'), to: isHomePage ? "#services" : "/", type: isHomePage ? "anchor" : "link" },
    { label: t('nav.portfolio'), to: isHomePage ? "#portfolio" : "/", type: isHomePage ? "anchor" : "link" },
    { label: t('nav.contact'), to: isHomePage ? "#contact" : "/", type: isHomePage ? "anchor" : "link" },
  ];

  const demoItems = [
    { label: t('nav.pms'), to: "/pms", icon: Zap },
    { label: t('nav.dp'), to: "/dp", icon: Crosshair },
    { label: t('nav.liveDemo'), to: "/live-demo", icon: Construction },
    { label: t('nav.engine'), to: "/engine-room", icon: Flame },
    { label: t('nav.hmi'), to: "/hmi", icon: Gauge },
    { label: t('nav.dataAnalysis'), to: "/data-analysis", icon: LineChart },
  ];
  const onDemoPage = demoItems.some((d) => d.to === location.pathname);

  const goToAllDemos = () => {
    setIsOpen(false);
    if (isHomePage) {
      document.getElementById("demos")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => document.getElementById("demos")?.scrollIntoView({ behavior: "smooth" }), 350);
    }
  };

  const handleNavClick = (item: { label: string; to: string; type: string }, e?: React.MouseEvent) => {
    if (item.label === t('nav.home') && isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (item.type === "anchor" && e) {
      e.preventDefault();
      const id = item.to.replace("#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
            <Link 
              to="/" 
              className="flex items-center space-x-2.5 group"
              onClick={() => { if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <span className="flex items-center justify-center bg-white/90 rounded-full p-0.5 backdrop-blur-sm">
                <img
                  src={logoImg}
                  alt="Maritime Automation"
                  width={36}
                  height={36}
                  decoding="async"
                  fetchPriority="high"
                  className="h-9 w-9 object-contain group-hover:scale-110 transition-transform duration-300 logo-img"
                />
              </span>
              <span className="logo-text ml-3 whitespace-nowrap">Maritime Automation</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.slice(0, 3).map((item) => {
                const className = "px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-primary/5";
                return item.type === "link" ? (
                  <Link key={item.label} to={item.to} className={className} onClick={() => handleNavClick(item)}>{item.label}</Link>
                ) : (
                  <a key={item.label} href={item.to} className={className} onClick={(e) => handleNavClick(item, e)}>{item.label}</a>
                );
              })}

              {/* Demos dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors duration-200 rounded-md hover:bg-primary/5 ${
                    onDemoPage ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t('nav.demos')}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 z-50">
                  <div className="w-64 rounded-lg border border-border/40 bg-card/95 backdrop-blur-xl shadow-xl shadow-background/40 p-1.5">
                    {demoItems.map((demo) => (
                      <Link
                        key={demo.to}
                        to={demo.to}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                          location.pathname === demo.to
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                        }`}
                      >
                        <demo.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                        {demo.label}
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-border/40" />
                    <button
                      onClick={goToAllDemos}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                    >
                      <LayoutGrid className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      {t('nav.allDemos')}
                    </button>
                  </div>
                </div>
              </div>

              {navItems.slice(3).map((item) => {
                const className = "px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-primary/5";
                return item.type === "link" ? (
                  <Link key={item.label} to={item.to} className={className} onClick={() => handleNavClick(item)}>{item.label}</Link>
                ) : (
                  <a key={item.label} href={item.to} className={className} onClick={(e) => handleNavClick(item, e)}>{item.label}</a>
                );
              })}
              <div className="ml-2 pl-2 border-l border-border/50 flex items-center space-x-2">
                <LanguageSwitcher />
                <Button size="sm" onClick={() => setIsQuoteModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4">
                  {t('nav.getQuote')}
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="lg:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-xl rounded-lg mt-2 border border-border/30">
                  {navItems.slice(0, 3).map((item) => {
                    const className = "block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors";
                    return item.type === "link" ? (
                      <Link key={item.label} to={item.to} className={className} onClick={() => handleNavClick(item)}>{item.label}</Link>
                    ) : (
                      <a key={item.label} href={item.to} className={className} onClick={(e) => handleNavClick(item, e)}>{item.label}</a>
                    );
                  })}

                  {/* Demos group */}
                  <div className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-primary/70">
                    {t('nav.demos')}
                  </div>
                  {demoItems.map((demo) => (
                    <Link
                      key={demo.to}
                      to={demo.to}
                      className="flex items-center gap-2.5 pl-5 pr-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <demo.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      {demo.label}
                    </Link>
                  ))}

                  {navItems.slice(3).map((item) => {
                    const className = "block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors";
                    return item.type === "link" ? (
                      <Link key={item.label} to={item.to} className={className} onClick={() => handleNavClick(item)}>{item.label}</Link>
                    ) : (
                      <a key={item.label} href={item.to} className={className} onClick={(e) => handleNavClick(item, e)}>{item.label}</a>
                    );
                  })}
                  <a
                    href="tel:+4791798722"
                    className="flex items-center gap-2.5 mx-3 mt-3 mb-1 px-3 py-3 rounded-md bg-primary/10 border border-primary/20 text-sm font-medium text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {t('nav.call')}
                  </a>
                  <div className="flex items-center justify-between px-3 py-2 gap-2">
                    <LanguageSwitcher />
                    <Button size="sm" onClick={() => setIsQuoteModalOpen(true)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      {t('nav.getQuote')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      
      <QuoteModal open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen} />
    </>
  );
};

export default Navbar;
