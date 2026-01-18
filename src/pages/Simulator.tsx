import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, ArrowLeft, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBrandProfiles } from "@/hooks/useBrandProfiles";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";

interface SimulatorResponse {
  answer: string;
  brandRecommended: boolean;
  relevanceExplanation: string;
  confidenceScore: number;
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
      
      // Track simulation analytics
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
      <header className="border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold glow-text">Recall</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">AI Recommendation Simulator</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              AI Recommendation <span className="glow-text">Simulator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ask a question like a user would ask an AI assistant. See how your brand gets recommended.
            </p>
          </div>

          {/* Brand Selector */}
          {brands.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-sm text-muted-foreground mb-3">Select a brand to test:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    !selectedBrand
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-glass-border bg-glass-bg/50 text-muted-foreground hover:text-foreground'
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
                        : 'border-glass-border bg-glass-bg/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {brand.brand_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query Input */}
          <div className="glass-card p-6">
            <div className="flex gap-3">
              <Input
                placeholder="e.g., What's the best tool for AI brand optimization?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
                className="input-glass flex-1"
              />
              <Button variant="glow" onClick={handleSimulate} disabled={isLoading || !query.trim()}>
                {isLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Best AI tools for students", "Recommend a SaaS marketing platform", "Top EdTech platforms for coding"].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-3 py-1.5 text-xs rounded-full border border-glass-border bg-glass-bg/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Response */}
          {response && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold">AI Response</h3>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-glass-border">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{response.answer}</p>
                </div>
              </div>

              <div className={`glass-card p-6 ${response.brandRecommended ? 'glow-border' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                  {response.brandRecommended ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <h3 className="font-display font-semibold">
                    {response.brandRecommended ? 'Brand Was Recommended!' : 'Brand Not Recommended'}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all" 
                          style={{ width: `${response.confidenceScore}%` }} 
                        />
                      </div>
                      <span className="text-sm font-semibold">{response.confidenceScore}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tested Brand</p>
                    <p className="font-semibold text-primary">{selectedBrand?.brand_name || 'None'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground">{response.relevanceExplanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
