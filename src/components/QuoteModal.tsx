import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ship, Users, Settings, Zap } from "lucide-react";

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_FORM = {
  // Contact information
  fullName: "",
  email: "",
  phone: "",
  company: "",
  position: "",

  // Project details
  projectType: "",
  vesselType: "",
  projectScope: [] as string[],
  timeline: "",
  budget: "",

  // Technical requirements
  systemType: "",
  certificationRequirements: "",

  // Additional information
  projectDescription: "",
  urgency: "",
  preferredContact: "",
};

type Option = { value: string; label: string };

export const QuoteModal = ({ open, onOpenChange }: QuoteModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const projectTypes: Option[] = [
    { value: "new-installation", label: t("quote.projectType.new") },
    { value: "upgrade", label: t("quote.projectType.upgrade") },
    { value: "maintenance", label: t("quote.projectType.maintenance") },
    { value: "consultation", label: t("quote.projectType.consultation") },
    { value: "commissioning", label: t("quote.projectType.commissioning") },
    { value: "integration", label: t("quote.projectType.integration") },
  ];

  const vesselTypes: Option[] = [
    { value: "cruise", label: t("quote.vessel.cruise") },
    { value: "cargo", label: t("quote.vessel.cargo") },
    { value: "offshore", label: t("quote.vessel.offshore") },
    { value: "tanker", label: t("quote.vessel.tanker") },
    { value: "ferry", label: t("quote.vessel.ferry") },
    { value: "fishing", label: t("quote.vessel.fishing") },
    { value: "naval", label: t("quote.vessel.naval") },
    { value: "yacht", label: t("quote.vessel.yacht") },
  ];

  const scopeOptions: Option[] = [
    { value: "automation", label: t("quote.scope.automation") },
    { value: "control", label: t("quote.scope.control") },
    { value: "monitoring", label: t("quote.scope.monitoring") },
    { value: "electrical", label: t("quote.scope.electrical") },
    { value: "communication", label: t("quote.scope.communication") },
    { value: "safety", label: t("quote.scope.safety") },
    { value: "navigation", label: t("quote.scope.navigation") },
    { value: "propulsion", label: t("quote.scope.propulsion") },
  ];

  const timelines: Option[] = [
    { value: "immediate", label: t("quote.timeline.immediate") },
    { value: "short", label: t("quote.timeline.short") },
    { value: "medium", label: t("quote.timeline.medium") },
    { value: "long", label: t("quote.timeline.long") },
    { value: "planning", label: t("quote.timeline.planning") },
  ];

  const budgets: Option[] = [
    { value: "under-50k", label: t("quote.budget.under50k") },
    { value: "50k-100k", label: t("quote.budget.50k100k") },
    { value: "100k-250k", label: t("quote.budget.100k250k") },
    { value: "250k-500k", label: t("quote.budget.250k500k") },
    { value: "500k-1m", label: t("quote.budget.500k1m") },
    { value: "over-1m", label: t("quote.budget.over1m") },
    { value: "discuss", label: t("quote.budget.discuss") },
  ];

  const urgencies: Option[] = [
    { value: "low", label: t("quote.urgency.low") },
    { value: "medium", label: t("quote.urgency.medium") },
    { value: "high", label: t("quote.urgency.high") },
    { value: "urgent", label: t("quote.urgency.urgent") },
  ];

  const contactMethods: Option[] = [
    { value: "email", label: t("quote.contactMethod.email") },
    { value: "phone", label: t("quote.contactMethod.phone") },
    { value: "video", label: t("quote.contactMethod.video") },
    { value: "meeting", label: t("quote.contactMethod.meeting") },
  ];

  // The e-mail should carry what the visitor actually picked, not the internal value codes.
  const labelOf = (options: Option[], value: string) =>
    options.find((o) => o.value === value)?.label || value;

  const handleScopeChange = (scopeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      projectScope: checked
        ? [...prev.projectScope, scopeId]
        : prev.projectScope.filter((id) => id !== scopeId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.company || !formData.projectType) {
      toast({
        title: t("quote.toast.missing.title"),
        description: t("quote.toast.missing.description"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const na = t("quote.mail.na");
      const or = (v: string) => v || na;
      const line = (key: string, value: string) => `${t(key)}: ${or(value)}\n`;

      const scopeText = formData.projectScope.map((id) => labelOf(scopeOptions, id)).join(", ");
      const projectTypeLabel = labelOf(projectTypes, formData.projectType);

      const subject = encodeURIComponent(`${t("quote.mail.subject")}: ${projectTypeLabel} - ${formData.company}`);
      const body = encodeURIComponent(
        `${t("quote.mail.heading")}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${t("quote.mail.contact")}\n` +
        line("quote.field.fullName", formData.fullName) +
        line("quote.field.email", formData.email) +
        line("quote.field.phone", formData.phone) +
        line("quote.field.company", formData.company) +
        line("quote.field.position", formData.position) + `\n` +
        `${t("quote.mail.project")}\n` +
        line("quote.field.projectType", projectTypeLabel) +
        line("quote.field.vesselType", formData.vesselType && labelOf(vesselTypes, formData.vesselType)) +
        line("quote.field.scopeShort", scopeText) +
        line("quote.field.timeline", formData.timeline && labelOf(timelines, formData.timeline)) +
        line("quote.field.budget", formData.budget && labelOf(budgets, formData.budget)) +
        line("quote.field.urgency", formData.urgency && labelOf(urgencies, formData.urgency)) + `\n` +
        `${t("quote.mail.technical")}\n` +
        line("quote.field.systems", formData.systemType) +
        line("quote.field.certification", formData.certificationRequirements) + `\n` +
        `${t("quote.mail.description")}\n` +
        `${or(formData.projectDescription)}\n\n` +
        line("quote.field.preferredContact", formData.preferredContact && labelOf(contactMethods, formData.preferredContact))
      );

      window.location.href = `mailto:Lars@Maritime-Automation.no?subject=${subject}&body=${body}`;

      // Nothing is sent from here: the visitor's mail client opens with the request filled in,
      // and it only goes once they press send there. Say so, rather than "submitted".
      toast({
        title: t("quote.toast.opened.title"),
        description: t("quote.toast.opened.description"),
      });

      setFormData(EMPTY_FORM);
      onOpenChange(false);
    } catch (error) {
      console.error("Error opening quote request e-mail:", error);
      toast({
        title: t("quote.toast.error.title"),
        description: t("quote.toast.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectField = (
    id: keyof typeof EMPTY_FORM,
    labelKey: string,
    placeholderKey: string,
    options: Option[],
    required = false,
  ) => (
    <div>
      <Label htmlFor={`quote-${id}`}>{t(labelKey)}{required ? " *" : ""}</Label>
      <Select
        value={formData[id] as string}
        onValueChange={(value) => setFormData((prev) => ({ ...prev, [id]: value }))}
      >
        <SelectTrigger id={`quote-${id}`}>
          <SelectValue placeholder={t(placeholderKey)} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Ship className="h-6 w-6 text-primary" />
            {t("quote.title")}
          </DialogTitle>
          <DialogDescription>{t("quote.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("quote.section.contact")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quote-fullName">{t("quote.field.fullName")} *</Label>
                <Input
                  id="quote-fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder={t("quote.placeholder.fullName")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quote-position">{t("quote.field.position")}</Label>
                <Input
                  id="quote-position"
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                  placeholder={t("quote.placeholder.position")}
                />
              </div>
              <div>
                <Label htmlFor="quote-email">{t("quote.field.email")} *</Label>
                <Input
                  id="quote-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={t("quote.placeholder.email")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quote-phone">{t("quote.field.phone")}</Label>
                <Input
                  id="quote-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+47 XXX XX XXX"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="quote-company">{t("quote.field.company")} *</Label>
                <Input
                  id="quote-company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder={t("quote.placeholder.company")}
                  required
                />
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t("quote.section.project")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectField("projectType", "quote.field.projectType", "quote.placeholder.projectType", projectTypes, true)}
              {selectField("vesselType", "quote.field.vesselType", "quote.placeholder.vesselType", vesselTypes)}
              {selectField("timeline", "quote.field.timeline", "quote.placeholder.timeline", timelines)}
              {selectField("budget", "quote.field.budget", "quote.placeholder.budget", budgets)}
            </div>

            <div>
              <Label>{t("quote.field.scope")}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {scopeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`quote-scope-${option.value}`}
                      checked={formData.projectScope.includes(option.value)}
                      onCheckedChange={(checked) => handleScopeChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={`quote-scope-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t("quote.section.technical")}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="quote-systemType">{t("quote.field.systems")}</Label>
                <Textarea
                  id="quote-systemType"
                  value={formData.systemType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, systemType: e.target.value }))}
                  placeholder={t("quote.placeholder.systems")}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="quote-certificationRequirements">{t("quote.field.certification")}</Label>
                <Input
                  id="quote-certificationRequirements"
                  value={formData.certificationRequirements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, certificationRequirements: e.target.value }))}
                  placeholder={t("quote.placeholder.certification")}
                />
              </div>
            </div>
          </div>

          {/* Project description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("quote.section.description")}</h3>
            <div>
              <Label htmlFor="quote-projectDescription">{t("quote.field.projectDescription")}</Label>
              <Textarea
                id="quote-projectDescription"
                value={formData.projectDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, projectDescription: e.target.value }))}
                placeholder={t("quote.placeholder.projectDescription")}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectField("urgency", "quote.field.urgency", "quote.placeholder.urgency", urgencies)}
              {selectField("preferredContact", "quote.field.preferredContact", "quote.placeholder.preferredContact", contactMethods)}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("quote.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isLoading ? t("quote.submitting") : t("quote.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
