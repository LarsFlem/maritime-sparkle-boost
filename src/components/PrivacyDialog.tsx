import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const POINTS = [
  "privacy.point.noTracking",
  "privacy.point.language",
  "privacy.point.forms",
  "privacy.point.youtube",
  "privacy.point.map",
  "privacy.point.hosting",
  "privacy.point.rights",
] as const;

/** Short privacy statement, opened from the footer. */
const PrivacyDialog = () => {
  const { t } = useLanguage();
  return (
    <Dialog>
      <DialogTrigger className="underline-offset-2 hover:underline hover:text-foreground transition-colors">
        {t("privacy.link")}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("privacy.title")}</DialogTitle>
          <DialogDescription>{t("privacy.intro")}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
          {POINTS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog;
