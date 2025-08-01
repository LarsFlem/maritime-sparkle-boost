import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Clock, Award } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section id="contact" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl float-animation"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-accent/10 rounded-full blur-2xl float-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2 mb-6">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Kontakt Meg</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">La Oss Diskutere</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ditt Prosjekt
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Er du klar for å ta ditt maritime prosjekt til neste nivå? 
            Kontakt meg for en uforpliktende samtale om hvordan jeg kan bidra til din suksess.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-effect tech-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>Kontaktinformasjon</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">E-post</p>
                    <p className="text-sm text-muted-foreground">post@maritime-automation.no</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telefon</p>
                    <p className="text-sm text-muted-foreground">+47 XXX XX XXX</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Lokasjon</p>
                    <p className="text-sm text-muted-foreground">Norge</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect tech-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Responstid</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Jeg svarer vanligvis innen 24 timer på alle henvendelser.
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Tilgjengelig for nye prosjekter</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect tech-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Sertifikasjoner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Innehaver nødvendige sertifikat og attester for arbeid på sjøen og på rig.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-effect tech-border">
              <CardHeader>
                <CardTitle>Send Meg en Melding</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Navn *</Label>
                      <Input 
                        id="name" 
                        placeholder="Ditt navn"
                        className="bg-card/50 border-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-post *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="din@epost.no"
                        className="bg-card/50 border-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Bedrift</Label>
                      <Input 
                        id="company" 
                        placeholder="Bedriftsnavn"
                        className="bg-card/50 border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        placeholder="+47 XXX XX XXX"
                        className="bg-card/50 border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Emne *</Label>
                    <Input 
                      id="subject" 
                      placeholder="Hva gjelder henvendelsen?"
                      className="bg-card/50 border-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Melding *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Beskriv ditt prosjekt eller hva du trenger hjelp med..."
                      rows={6}
                      className="bg-card/50 border-primary/20 focus:border-primary resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-pulse group"
                  >
                    <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Send Melding
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