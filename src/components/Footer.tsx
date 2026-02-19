import { Anchor, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Anchor className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Maritime <span className="text-primary">Automation</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Professional maritime automation, engineering og konsulentvirksomhet. 
              Spesialisert på elektriske systemer, PLC-programmering og offshore løsninger.
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Mail, text: "post@maritime-automation.no" },
                { icon: Phone, text: "+47 917 98 722" },
                { icon: MapPin, text: "Stavanger, Norge" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Icon className="h-3.5 w-3.5 text-primary/70" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">{t('services.package.title')}</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">{t('services.support.title')}</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">{t('services.project.title')}</li>
            </ul>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer.expertise')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">TwinCAT Programming</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Beckhoff PLC</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">IECEx & ATEX</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">SQL Databaser</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">CCTV Systemer</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Maritime Automation. {t('footer.copyright')}
            </p>
            <p className="text-xs text-muted-foreground mt-2 md:mt-0">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
