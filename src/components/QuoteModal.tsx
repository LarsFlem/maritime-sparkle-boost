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
import { Ship, Calendar, Users, Settings, Zap, Phone, Mail, MapPin, Clock } from "lucide-react";

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuoteModal = ({ open, onOpenChange }: QuoteModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Contact Information
    fullName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    
    // Project Details
    projectType: "",
    vesselType: "",
    projectScope: [],
    timeline: "",
    budget: "",
    
    // Technical Requirements
    systemType: "",
    certificationRequirements: "",
    
    // Additional Information
    projectDescription: "",
    urgency: "",
    preferredContact: "",
    
  });

  const projectTypes = [
    { value: "new-installation", label: "New System Installation" },
    { value: "upgrade", label: "System Upgrade/Modernization" },
    { value: "maintenance", label: "Maintenance & Support" },
    { value: "consultation", label: "Technical Consultation" },
    { value: "commissioning", label: "Commissioning & Startup" },
    { value: "integration", label: "System Integration" }
  ];

  const vesselTypes = [
    { value: "cruise", label: "Cruise Ship" },
    { value: "cargo", label: "Cargo Vessel" },
    { value: "offshore", label: "Offshore Platform" },
    { value: "tanker", label: "Tanker" },
    { value: "ferry", label: "Ferry" },
    { value: "fishing", label: "Fishing Vessel" },
    { value: "naval", label: "Naval Vessel" },
    { value: "yacht", label: "Yacht/Private Vessel" }
  ];

  const scopeOptions = [
    { id: "automation", label: "Automation Systems" },
    { id: "control", label: "Control Systems" },
    { id: "monitoring", label: "Monitoring & HMI" },
    { id: "electrical", label: "Electrical Systems" },
    { id: "communication", label: "Communication Systems" },
    { id: "safety", label: "Safety Systems" },
    { id: "navigation", label: "Navigation Equipment" },
    { id: "propulsion", label: "Propulsion Control" }
  ];

  const handleScopeChange = (scopeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      projectScope: checked 
        ? [...prev.projectScope, scopeId]
        : prev.projectScope.filter(id => id !== scopeId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.company || !formData.projectType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const scopeText = formData.projectScope.map(id => 
        scopeOptions.find(opt => opt.id === id)?.label
      ).filter(Boolean).join(", ");

      const projectTypeLabel = projectTypes.find(t => t.value === formData.projectType)?.label || formData.projectType;
      const vesselTypeLabel = vesselTypes.find(t => t.value === formData.vesselType)?.label || formData.vesselType;

      const subject = encodeURIComponent(`Quote Request: ${projectTypeLabel} - ${formData.company}`);
      const body = encodeURIComponent(
        `QUOTE REQUEST — Maritime Automation\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `CONTACT\n` +
        `Name: ${formData.fullName}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone || "N/A"}\n` +
        `Company: ${formData.company}\n` +
        `Position: ${formData.position || "N/A"}\n\n` +
        `PROJECT\n` +
        `Type: ${projectTypeLabel}\n` +
        `Vessel: ${vesselTypeLabel || "N/A"}\n` +
        `Scope: ${scopeText || "N/A"}\n` +
        `Timeline: ${formData.timeline || "N/A"}\n` +
        `Budget: ${formData.budget || "N/A"}\n` +
        `Urgency: ${formData.urgency || "N/A"}\n\n` +
        `TECHNICAL\n` +
        `Systems: ${formData.systemType || "N/A"}\n` +
        `Certifications: ${formData.certificationRequirements || "N/A"}\n\n` +
        `DESCRIPTION\n` +
        `${formData.projectDescription || "N/A"}\n\n` +
        `Preferred contact: ${formData.preferredContact || "N/A"}\n`
      );

      window.location.href = `mailto:Lars@Maritime-Automation.no?subject=${subject}&body=${body}`;

      toast({
        title: "Quote Request Submitted",
        description: "Thank you for your request. We'll contact you within 24 hours to discuss your project in detail.",
      });

      // Reset form and close modal
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        projectType: "",
        vesselType: "",
        projectScope: [],
        timeline: "",
        budget: "",
        systemType: "",
        certificationRequirements: "",
        projectDescription: "",
        urgency: "",
        preferredContact: "",
      });
      onOpenChange(false);

    } catch (error) {
      console.error("Error submitting quote request:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Ship className="h-6 w-6 text-primary" />
            Request Professional Quote
          </DialogTitle>
          <DialogDescription>
            Provide details about your maritime automation project to receive a comprehensive quote within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position/Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Chief Engineer"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+47 XXX XX XXX"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="company">Company/Organization *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Maritime Solutions AS"
                  required
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectType">Project Type *</Label>
                <Select value={formData.projectType} onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vesselType">Vessel/Platform Type</Label>
                <Select value={formData.vesselType} onValueChange={(value) => setFormData(prev => ({ ...prev, vesselType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vesselTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeline">Project Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (&lt; 1 month)</SelectItem>
                    <SelectItem value="short">Short-term (1-3 months)</SelectItem>
                    <SelectItem value="medium">Medium-term (3-6 months)</SelectItem>
                    <SelectItem value="long">Long-term (6+ months)</SelectItem>
                    <SelectItem value="planning">Planning phase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">Estimated Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50k">Under €50,000</SelectItem>
                    <SelectItem value="50k-100k">€50,000 - €100,000</SelectItem>
                    <SelectItem value="100k-250k">€100,000 - €250,000</SelectItem>
                    <SelectItem value="250k-500k">€250,000 - €500,000</SelectItem>
                    <SelectItem value="500k-1m">€500,000 - €1,000,000</SelectItem>
                    <SelectItem value="over-1m">Over €1,000,000</SelectItem>
                    <SelectItem value="discuss">Prefer to discuss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Scope */}
            <div>
              <Label>Project Scope (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {scopeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={formData.projectScope.includes(option.id)}
                      onCheckedChange={(checked) => handleScopeChange(option.id, checked as boolean)}
                    />
                    <Label htmlFor={option.id} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Technical Requirements
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="systemType">Existing Systems/Integration Requirements</Label>
                <Textarea
                  id="systemType"
                  value={formData.systemType}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemType: e.target.value }))}
                  placeholder="Describe existing systems, PLCs, networks, or specific integration requirements..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="certificationRequirements">Certification Requirements</Label>
                <Input
                  id="certificationRequirements"
                  value={formData.certificationRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificationRequirements: e.target.value }))}
                  placeholder="DNV GL, ABS, Lloyd's Register, MED, etc."
                />
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Description</h3>
            <div>
              <Label htmlFor="projectDescription">Detailed Project Description</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Please provide a detailed description of your project requirements, challenges, and specific objectives..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgency">Project Urgency</Label>
                <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Planning stage</SelectItem>
                    <SelectItem value="medium">Medium - Active planning</SelectItem>
                    <SelectItem value="high">High - Ready to proceed</SelectItem>
                    <SelectItem value="urgent">Urgent - Immediate need</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select value={formData.preferredContact} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContact: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                    <SelectItem value="video">Video conference</SelectItem>
                    <SelectItem value="meeting">In-person meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>


          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isLoading ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};