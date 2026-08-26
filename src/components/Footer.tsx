import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImg from "@/assets/maritime-automation-logo.png";
import { AnimatedSection } from "@/components/AnimatedSection";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center bg-white/90 rounded-full p-0.5">
                  <img
                    src={logoImg}
                    alt="Maritime Automation"
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 object-contain"
                  />
                </span>
                <span className="logo-text whitespace-nowrap">Maritime Automation</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
                {t('footer.about')}
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: Mail, text: "Lars@Maritime-Automation.no", href: "mailto:Lars@Maritime-Automation.no" },
                  { icon: Phone, text: "+47 917 98 722", href: "tel:+4791798722" },
                  { icon: MapPin, text: "Jørpeland, Norge", href: null },
                ].map(({ icon: Icon, text, href }) => {
                  const body = (
                    <>
                      <Icon className="h-3.5 w-3.5 text-primary/70" />
                      <span>{text}</span>
                    </>
                  );
                  return href ? (
                    <a key={text} href={href} className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">{body}</a>
                  ) : (
                    <div key={text} className="flex items-center space-x-2 text-sm text-muted-foreground">{body}</div>
                  );
                })}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer.services')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors">{t('services.package.title')}</li>
                <li className="hover:text-foreground transition-colors">{t('services.support.title')}</li>
                <li className="hover:text-foreground transition-colors">{t('services.project.title')}</li>
              </ul>
            </div>

            {/* Expertise */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer.expertise')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors">{t('footer.exp.twincat')}</li>
                <li className="hover:text-foreground transition-colors">Beckhoff PLC</li>
                <li className="hover:text-foreground transition-colors">IECEx & ATEX</li>
                <li className="hover:text-foreground transition-colors">{t('footer.exp.sql')}</li>
                <li className="hover:text-foreground transition-colors">{t('footer.exp.cctv')}</li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        <div className="border-t border-border/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Maritime Automation. {t('footer.copyright')}
            </p>
            <p className="text-xs text-muted-foreground mt-2 md:mt-0">{t('footer.tagline')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
