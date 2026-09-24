import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-primary/20">404</p>
        <h1 className="text-3xl font-bold text-foreground">{t('notFound.title')}</h1>
        <p className="text-muted-foreground">{t('notFound.message')}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">{t('notFound.returnHome')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
