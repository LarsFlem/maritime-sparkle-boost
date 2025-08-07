import { Anchor, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="relative py-16 border-t border-primary/20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-background/50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-pulse">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Maritime Automation
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Professional maritime automation, engineering og konsulentvirksomhet. 
              Spesialisert på elektriske systemer, PLC-programmering og offshore løsninger.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>post@maritime-automation.no</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+47 XXX XX XXX</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Norge</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">{t('services.package.title')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('services.support.title')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('services.project.title')}</li>
            </ul>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.expertise')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">TwinCAT Programming</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Beckhoff PLC</li>
              <li className="hover:text-primary transition-colors cursor-pointer">IECEx & ATEX</li>
              <li className="hover:text-primary transition-colors cursor-pointer">SQL Databaser</li>
              <li className="hover:text-primary transition-colors cursor-pointer">CCTV Systemer</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Maritime Automation. {t('footer.copyright')}
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;