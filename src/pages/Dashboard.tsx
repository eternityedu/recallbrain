import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, Plus, Sparkles, TrendingUp, MessageSquare, Settings, Trash2, Eye, Zap, BarChart3, GitCompare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useBrandProfiles, BrandProfile } from "@/hooks/useBrandProfiles";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { brands, loading: brandsLoading, selectedBrand, setSelectedBrand, deleteBrand, optimizeBrand } = useBrandProfiles();
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleOptimize = async (brand: BrandProfile) => {
    setOptimizing(true);
    try {
      await optimizeBrand(brand);
      toast.success("Brand optimized successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to optimize brand");
    } finally {
      setOptimizing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand profile?")) return;
    try {
      await deleteBrand(id);
      toast.success("Brand profile deleted");
    } catch (error) {
      toast.error("Failed to delete brand profile");
    }
  };

  if (authLoading || brandsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold glow-text">Recall</span>
            {isAdmin && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/analytics")}>
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/brand-comparison")}>
              <GitCompare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/chat")}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Welcome to Recall</h1>
              <p className="text-muted-foreground">Build AI memory for your brand</p>
            </div>
            <Button variant="glow" onClick={() => navigate("/brand-setup")}>
              <Plus className="h-4 w-4" />
              Add Brand Profile
            </Button>
          </div>

          {/* Brand Selector (if multiple brands) */}
          {brands.length > 1 && (
            <div className="flex gap-2 flex-wrap">
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
          )}

          {/* Stats Grid */}
          {selectedBrand ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recall Score */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 glow-border">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(263, 70%, 58%)" />
                            <stop offset="100%" stopColor="hsl(280, 80%, 55%)" />
                          </linearGradient>
                        </defs>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(260, 15%, 18%)" strokeWidth="6" />
                        <circle cx="40" cy="40" r="32" fill="none" stroke="url(#scoreGradient)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${selectedBrand.recall_score * 2.01} 201`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold">{selectedBrand.recall_score}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">Recall Score</h3>
                      <p className="text-sm text-muted-foreground">AI visibility rating</p>
                    </div>
                  </div>
                </motion.div>

                {/* Score Breakdown */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold">Score Breakdown</h3>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/recall-score")} className="text-xs text-primary">
                      View Details
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Intent Alignment</span>
                        <span>{selectedBrand.relevance_score}%</span>
                      </div>
                      <Progress value={selectedBrand.relevance_score} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Semantic Clarity</span>
                        <span>{selectedBrand.clarity_score}%</span>
                      </div>
                      <Progress value={selectedBrand.clarity_score} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Authority Signals</span>
                        <span>{selectedBrand.authority_score}%</span>
                      </div>
                      <Progress value={selectedBrand.authority_score} className="h-2" />
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                  <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="glow" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleOptimize(selectedBrand)}
                      disabled={optimizing}
                    >
                      {optimizing ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {selectedBrand.is_optimized ? 'Re-Optimize' : 'Optimize Brand'}
                    </Button>
                    <Button variant="glowOutline" size="sm" className="w-full" onClick={() => navigate("/simulator")}>
                      <Eye className="h-4 w-4" />
                      Test in Simulator
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => handleDelete(selectedBrand.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete Brand
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* AI Optimization Results */}
              {selectedBrand.is_optimized && selectedBrand.ai_summary && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-lg">AI-Optimized Brand Summary</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedBrand.ai_summary}</p>
                  
                  {selectedBrand.ai_recommendation_triggers && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Recommendation Triggers</h4>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(selectedBrand.ai_recommendation_triggers).map((trigger: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/30">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBrand.ai_example_snippets && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Example AI Answer Snippets</h4>
                      <div className="space-y-3">
                        {JSON.parse(selectedBrand.ai_example_snippets).map((snippet: { query: string; answer: string }, i: number) => (
                          <div key={i} className="p-4 rounded-lg bg-muted/30 border border-glass-border">
                            <p className="text-sm text-muted-foreground mb-2">Q: {snippet.query}</p>
                            <p className="text-sm">{snippet.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            /* Empty State */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-3">Set Up Your First Brand</h2>
                <p className="text-muted-foreground mb-6">
                  Create your brand profile to start building AI memory and earning recommendations.
                </p>
                <Button variant="glow" onClick={() => navigate("/brand-setup")}>
                  <Plus className="h-4 w-4" />
                  Create Brand Profile
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
