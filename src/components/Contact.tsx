import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Clock, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl float-animation blob-animation"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl float-delayed-animation blob-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-md border border-primary/30 rounded-full px-6 py-2 mb-6 shimmer-effect">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('contact.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">{t('contact.subtitle')}</span>
            <br />
            <span className="gradient-text">
              {t('contact.subtitle')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-effect-strong tech-border-glow hover-lift animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>{t('contact.info.email')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform relative">
                    <Mail className="h-5 w-5 text-white relative z-10" />
                    <div className="absolute inset-0 rounded-lg bg-primary/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('contact.info.email')}</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Lars@Maritime-Automation.no</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform relative">
                    <Phone className="h-5 w-5 text-white relative z-10" />
                    <div className="absolute inset-0 rounded-lg bg-accent/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('contact.info.phone')}</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">+47 917 98 722</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform relative">
                    <MapPin className="h-5 w-5 text-white relative z-10" />
                    <div className="absolute inset-0 rounded-lg bg-primary/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('contact.info.location')}</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Rennesøygata 14A, 4014 Stavanger</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect-strong tech-border-glow hover-lift animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{t('contact.info.responseTime')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('contact.info.responseTimeValue')}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full glow-pulse-intense relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm font-medium text-green-400">{t('contact.info.responseTimeValue')}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect-strong tech-border-glow hover-lift animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>{t('contact.info.certifications')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('contact.info.certificationsValue')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card className="glass-effect-strong tech-border-glow">
              <CardHeader>
                <CardTitle>{t('contact.form.message')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.form.name')} *</Label>
                      <Input 
                        id="name" 
                        placeholder={t('contact.form.name')}
                        className="bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.form.email')} *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder={t('contact.form.email')}
                        className="bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">{t('contact.form.company')}</Label>
                      <Input 
                        id="company" 
                        placeholder={t('contact.form.company')}
                        className="bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                      <Input 
                        id="phone" 
                        placeholder={t('contact.form.phone')}
                        className="bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.form.subject')} *</Label>
                    <Input 
                      id="subject" 
                      placeholder={t('contact.form.subject')}
                      className="bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.form.message')} *</Label>
                    <Textarea 
                      id="message" 
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={6}
                      className="bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 resize-none transition-all duration-300"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse-intense group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {t('contact.form.submit')}
                    </span>
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