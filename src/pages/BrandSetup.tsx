import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function BrandSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brandName: "", description: "", websiteUrl: "", category: "", targetAudience: "", keywords: "", valueProposition: "", trustSignals: ""
  });

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    toast.success("Brand profile created! Generating AI optimization...");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold glow-text">Recall</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Brand Profile Setup</h1>
            <p className="text-muted-foreground">Step {step} of 2</p>
            <div className="flex gap-2 justify-center mt-4">
              {[1, 2].map((s) => (
                <div key={s} className={`h-2 w-16 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Brand Name *</Label>
                  <Input value={formData.brandName} onChange={(e) => updateField("brandName", e.target.value)} placeholder="Your brand name" className="input-glass" />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input value={formData.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} placeholder="https://yourbrand.com" className="input-glass" />
                </div>
                <div className="space-y-2">
                  <Label>Product Category *</Label>
                  <Input value={formData.category} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g., AI Tools, EdTech, SaaS" className="input-glass" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Description *</Label>
                  <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="What does your brand do?" className="input-glass min-h-[100px]" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Target Audience *</Label>
                  <Input value={formData.targetAudience} onChange={(e) => updateField("targetAudience", e.target.value)} placeholder="Who are your ideal users?" className="input-glass" />
                </div>
                <div className="space-y-2">
                  <Label>Keywords / Intents</Label>
                  <Input value={formData.keywords} onChange={(e) => updateField("keywords", e.target.value)} placeholder="Keywords users might search (comma-separated)" className="input-glass" />
                </div>
                <div className="space-y-2">
                  <Label>Core Value Proposition *</Label>
                  <Textarea value={formData.valueProposition} onChange={(e) => updateField("valueProposition", e.target.value)} placeholder="What makes your brand unique?" className="input-glass min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label>Trust Signals</Label>
                  <Textarea value={formData.trustSignals} onChange={(e) => updateField("trustSignals", e.target.value)} placeholder="Users, reviews, awards, notable clients..." className="input-glass min-h-[80px]" />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="glowOutline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : <div />}
              
              {step < 2 ? (
                <Button variant="glow" onClick={() => setStep(step + 1)} disabled={!formData.brandName || !formData.category || !formData.description}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="glow" onClick={handleSubmit} disabled={!formData.targetAudience || !formData.valueProposition}>
                  <Check className="h-4 w-4" /> Create Profile
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
