import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Clock, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      company ? `Company: ${company}` : "",
      phone ? `Phone: ${phone}` : "",
      email ? `Reply-to: ${email}` : "",
      "",
      message,
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:Lars@Maritime-Automation.no?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" aria-label="Kontakt" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-primary/4 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t('contact.title')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('contact.subtitle')}
          </h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-4">
            {[
              { icon: Mail, label: t('contact.info.email'), value: "Lars@Maritime-Automation.no" },
              { icon: Phone, label: t('contact.info.phone'), value: "+47 917 98 722" },
              { icon: MapPin, label: t('contact.info.location'), value: "Jørpeland, Rogaland, Norge" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center space-x-3 p-4 glass-effect rounded-xl group hover:bg-card/80 transition-all cursor-pointer">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}

            <div className="p-4 glass-effect rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('contact.info.responseTime')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">{t('contact.info.responseTimeValue')}</span>
              </div>
            </div>

            <div className="p-4 glass-effect rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('contact.info.certifications')}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('contact.info.certificationsValue')}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Card className="glass-effect border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">{t('contact.form.message')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">{t('contact.form.name')} *</Label>
                      <Input id="name" placeholder={t('contact.form.name')} className="bg-card/50 border-border/40 text-sm" required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">{t('contact.form.email')} *</Label>
                      <Input id="email" type="email" placeholder={t('contact.form.email')} className="bg-card/50 border-border/40 text-sm" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-xs">{t('contact.form.company')}</Label>
                      <Input id="company" placeholder={t('contact.form.company')} className="bg-card/50 border-border/40 text-sm" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">{t('contact.form.phone')}</Label>
                      <Input id="phone" placeholder={t('contact.form.phone')} className="bg-card/50 border-border/40 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs">{t('contact.form.subject')} *</Label>
                      <Input id="subject" placeholder={t('contact.form.subject')} className="bg-card/50 border-border/40 text-sm" required value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">{t('contact.form.message')} *</Label>
                    <Textarea id="message" placeholder={t('contact.form.messagePlaceholder')} rows={5} className="bg-card/50 border-border/40 resize-none text-sm" required value={message} onChange={(e) => setMessage(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group">
                    <Send className="mr-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    {t('contact.form.submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
