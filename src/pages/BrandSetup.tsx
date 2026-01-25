import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBrandProfiles } from "@/hooks/useBrandProfiles";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

export default function BrandSetup() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createBrand } = useBrandProfiles();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "", description: "", websiteUrl: "", category: "", targetAudience: "", keywords: "", valueProposition: "", trustSignals: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createBrand({
        brand_name: formData.brandName,
        description: formData.description,
        website_url: formData.websiteUrl,
        category: formData.category,
        target_audience: formData.targetAudience,
        keywords: formData.keywords,
        value_proposition: formData.valueProposition,
        trust_signals: formData.trustSignals,
      });
      toast.success("Brand profile created! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create brand profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Recall" className="h-7 w-7" />
            <span className="text-xl font-semibold text-foreground">Recall</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Brand Profile Setup</h1>
            <p className="text-muted-foreground">Step {step} of 2</p>
            <div className="flex gap-2 justify-center mt-4">
              {[1, 2].map((s) => (
                <div key={s} className={`h-2 w-16 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Brand Name *</Label>
                  <Input value={formData.brandName} onChange={(e) => updateField("brandName", e.target.value)} placeholder="Your brand name" />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input value={formData.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} placeholder="https://yourbrand.com" />
                </div>
                <div className="space-y-2">
                  <Label>Product Category *</Label>
                  <Input value={formData.category} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g., AI Tools, EdTech, SaaS" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Description *</Label>
                  <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="What does your brand do?" className="min-h-[100px]" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Target Audience *</Label>
                  <Input value={formData.targetAudience} onChange={(e) => updateField("targetAudience", e.target.value)} placeholder="Who are your ideal users?" />
                </div>
                <div className="space-y-2">
                  <Label>Keywords / Intents</Label>
                  <Input value={formData.keywords} onChange={(e) => updateField("keywords", e.target.value)} placeholder="Keywords users might search (comma-separated)" />
                </div>
                <div className="space-y-2">
                  <Label>Core Value Proposition *</Label>
                  <Textarea value={formData.valueProposition} onChange={(e) => updateField("valueProposition", e.target.value)} placeholder="What makes your brand unique?" className="min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label>Trust Signals</Label>
                  <Textarea value={formData.trustSignals} onChange={(e) => updateField("trustSignals", e.target.value)} placeholder="Users, reviews, awards, notable clients..." className="min-h-[80px]" />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : <div />}
              
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!formData.brandName || !formData.category || !formData.description}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !formData.targetAudience || !formData.valueProposition}>
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Create Profile
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
