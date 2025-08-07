import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'no' : 'en');
  };

  const getLanguageLabel = (lang: Language) => {
    return lang === 'en' ? 'EN' : 'NO';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 glass-effect border-border/30 hover:bg-secondary/20"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {getLanguageLabel(language)}
      </span>
    </Button>
  );
};