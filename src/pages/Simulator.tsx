import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBrandProfiles } from "@/hooks/useBrandProfiles";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface SimulatorResponse {
  answer: string;
  brandRecommended: boolean;
  relevanceExplanation: string;
  confidenceScore: number;
  intentMatch?: string;
  improvementTips?: string[];
}

export default function Simulator() {
  const navigate = useNavigate();
  const { brands, selectedBrand, setSelectedBrand } = useBrandProfiles();
  const { trackSimulation } = useAnalytics();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<SimulatorResponse | null>(null);

  const handleSimulate = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-simulator', {
        body: {
          query,
          brandData: selectedBrand ? {
            brandName: selectedBrand.brand_name,
            description: selectedBrand.description,
            category: selectedBrand.category,
            valueProposition: selectedBrand.value_proposition,
            trustSignals: selectedBrand.trust_signals,
          } : null
        }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.result);
      
      if (selectedBrand) {
        trackSimulation(
          selectedBrand.id,
          query,
          data.result.brandRecommended,
          data.result.confidenceScore
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to simulate AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Recall" className="h-7 w-7" />
              <span className="text-xl font-semibold text-foreground">Recall</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">AI Recommendation Simulator</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              AI Recommendation <span className="text-primary">Simulator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Test how AI systems might recommend your brand. This is an AI-readiness simulation.
            </p>
          </div>

          {/* Brand Selector */}
          {brands.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">Select a brand to test:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    !selectedBrand
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  No Brand (Generic)
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedBrand?.id === brand.id
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {brand.brand_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query Input */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex gap-3">
              <Input
                placeholder="e.g., What's the best tool for AI brand optimization?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
                className="flex-1"
              />
              <Button onClick={handleSimulate} disabled={isLoading || !query.trim()}>
                {isLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Best AI tools for students", "Recommend a SaaS marketing platform", "Top EdTech platforms for coding"].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-3 py-1.5 text-xs rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Response */}
          {response && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Simulated AI Response */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Simulated AI Response</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    AI-Style Simulation
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-secondary border border-border">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{response.answer}</p>
                </div>
              </div>

              {/* Recommendation Status */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  {response.brandRecommended ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <h3 className="font-semibold text-foreground">
                    {response.brandRecommended ? 'Brand Was Contextually Matched!' : 'Brand Not Contextually Relevant'}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contextual Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${response.confidenceScore}%` }} 
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{response.confidenceScore}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tested Brand</p>
                    <p className="font-semibold text-primary">{selectedBrand?.brand_name || 'None'}</p>
                  </div>
                </div>
                
                {response.intentMatch && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Intent Analysis</p>
                    <p className="text-sm text-foreground">{response.intentMatch}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">Relevance Explanation</p>
                  <p className="text-sm text-muted-foreground">{response.relevanceExplanation}</p>
                </div>
              </div>

              {/* Improvement Tips */}
              {response.improvementTips && response.improvementTips.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4 text-foreground">AI-Readiness Improvement Tips</h3>
                  <ul className="space-y-2">
                    {response.improvementTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
