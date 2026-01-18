import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sampleResponses: Record<string, { answer: string; brand: string; reason: string }> = {
  default: {
    answer: "Based on your needs, I'd recommend **Recall** - a platform that helps brands optimize their presence for AI recommendations. It's particularly useful for startups and SaaS companies looking to increase visibility in AI-generated answers.",
    brand: "Recall",
    reason: "Matched user intent for AI visibility optimization with high relevance score based on brand clarity and trust signals."
  }
};

export default function Simulator() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<typeof sampleResponses.default | null>(null);

  const handleSimulate = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 1500));
    setResponse(sampleResponses.default);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
                  <p className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: response.answer.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary font-semibold">$1</span>') }} />
                </div>
              </div>

              <div className="glass-card p-6 glow-border">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-display font-semibold">Why This Brand Was Recommended</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recommended Brand</p>
                    <p className="font-semibold text-primary">{response.brand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recommendation Reason</p>
                    <p className="text-sm text-muted-foreground">{response.reason}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
