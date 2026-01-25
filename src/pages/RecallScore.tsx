import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Lightbulb, Shield, RefreshCw, MessageSquare, TrendingUp, Info, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandProfiles } from "@/hooks/useBrandProfiles";
import { useScoreHistory } from "@/hooks/useScoreHistory";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreHistoryChart } from "@/components/charts/ScoreHistoryChart";
import logo from "@/assets/logo.png";

interface ScoreComponent {
  name: string;
  key: string;
  icon: React.ElementType;
  color: string;
  description: string;
  tips: string[];
}

const scoreComponents: ScoreComponent[] = [
  {
    name: "Semantic Clarity",
    key: "semanticClarity",
    icon: Lightbulb,
    color: "bg-amber-500",
    description: "How clearly defined is your brand? AI systems need unambiguous, precise definitions to recommend accurately.",
    tips: [
      "Use specific, concrete language in descriptions",
      "Avoid jargon and marketing fluff",
      "Define exactly what your product does in one sentence"
    ]
  },
  {
    name: "Intent Alignment",
    key: "intentAlignment",
    icon: Target,
    color: "bg-blue-500",
    description: "Does your brand match user queries? Strong alignment means AI will recommend you for the right searches.",
    tips: [
      "Identify specific user problems you solve",
      "Use language your target audience uses",
      "Map your features to user intents"
    ]
  },
  {
    name: "Authority Signals",
    key: "authoritySignals",
    icon: Shield,
    color: "bg-emerald-500",
    description: "Are trust indicators present? Reviews, awards, user counts, and credentials help AI validate recommendations.",
    tips: [
      "Highlight customer testimonials and case studies",
      "Include awards, certifications, partnerships",
      "Mention user numbers or market position"
    ]
  },
  {
    name: "Consistency",
    key: "consistency",
    icon: RefreshCw,
    color: "bg-purple-500",
    description: "Is your messaging unified? Consistent brand information across all touchpoints improves AI understanding.",
    tips: [
      "Ensure website, social, and docs use same messaging",
      "Maintain consistent terminology",
      "Align value proposition across all content"
    ]
  },
  {
    name: "Explainability",
    key: "explainability",
    icon: MessageSquare,
    color: "bg-pink-500",
    description: "Can AI easily explain why to recommend you? Clear reasoning paths make recommendations more natural.",
    tips: [
      "Create clear 'because' statements for your value",
      "Define specific use cases and scenarios",
      "Explain benefits in terms of user outcomes"
    ]
  }
];

export default function RecallScore() {
  const navigate = useNavigate();
  const { brands, selectedBrand, setSelectedBrand, optimizeBrand, loading } = useBrandProfiles();
  const { history, loading: historyLoading } = useScoreHistory(selectedBrand?.id);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const getScores = () => {
    if (!selectedBrand) {
      return {
        semanticClarity: 0,
        intentAlignment: 0,
        authoritySignals: 0,
        consistency: 0,
        explainability: 0
      };
    }
    
    return {
      semanticClarity: selectedBrand.clarity_score || 0,
      intentAlignment: selectedBrand.relevance_score || 0,
      authoritySignals: selectedBrand.authority_score || 0,
      consistency: Math.round((selectedBrand.clarity_score || 0) * 0.9),
      explainability: Math.round((selectedBrand.relevance_score || 0) * 0.95)
    };
  };

  const scores = getScores();
  const overallScore = selectedBrand?.recall_score || 0;

  const handleOptimize = async () => {
    if (!selectedBrand) return;
    setIsOptimizing(true);
    try {
      await optimizeBrand(selectedBrand);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500" };
    if (score >= 60) return { label: "Good", color: "text-blue-500" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Needs Work", color: "text-red-500" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
          <span className="text-sm text-muted-foreground">Recall Score Breakdown</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-foreground">
              Recall <span className="text-primary">Score</span> Breakdown
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Your AI-readiness score measures how well AI systems can understand, match, and recommend your brand.
            </p>
          </div>

          {/* Brand Selector */}
          {brands.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">Select a brand to view scores:</p>
              <div className="flex gap-2 flex-wrap">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm ${
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

          {/* No Brand Selected */}
          {!selectedBrand && (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <img src={logo} alt="Recall" className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No Brand Selected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a brand above to view its Recall Score breakdown, or create a new brand profile.
              </p>
              <Button onClick={() => navigate("/brand-setup")}>
                Create Brand Profile
              </Button>
            </div>
          )}

          {/* Overall Score */}
          {selectedBrand && (
            <>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Score Circle */}
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/30">
                      <div className="text-center">
                        <span className="text-4xl md:text-5xl font-bold text-primary">{overallScore}</span>
                        <p className="text-xs text-muted-foreground">/ 100</p>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {getScoreLevel(overallScore).label}
                    </div>
                  </div>

                  {/* Score Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
                      {selectedBrand.brand_name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedBrand.is_optimized 
                        ? "This brand has been optimized for AI-readiness."
                        : "This brand hasn't been optimized yet. Run optimization to improve scores."}
                    </p>
                    <Button 
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className="w-full md:w-auto"
                    >
                      {isOptimizing ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {selectedBrand.is_optimized ? "Re-Optimize" : "Optimize Now"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Score Components Grid */}
              <div className="grid gap-4 md:gap-6">
                {scoreComponents.map((component, index) => {
                  const score = scores[component.key as keyof typeof scores];
                  const scoreLevel = getScoreLevel(score);
                  const Icon = component.icon;

                  return (
                    <motion.div
                      key={component.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card border border-border rounded-lg p-4 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Icon & Name */}
                        <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${component.color} flex items-center justify-center`}>
                            <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm md:text-base text-foreground">{component.name}</h3>
                            <span className={`text-xs ${scoreLevel.color}`}>{scoreLevel.label}</span>
                          </div>
                        </div>

                        {/* Score Bar & Details */}
                        <div className="flex-1 space-y-3">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Progress value={score} className="h-2" />
                            </div>
                            <span className="text-lg md:text-xl font-bold w-12 text-right text-foreground">{score}%</span>
                          </div>

                          {/* Description */}
                          <p className="text-xs md:text-sm text-muted-foreground">{component.description}</p>

                          {/* Tips */}
                          <TooltipProvider>
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                                    <Info className="h-3 w-3" />
                                    <span>Improvement Tips</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs p-3">
                                  <ul className="space-y-1 text-xs">
                                    {component.tips.map((tip, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Score History Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Optimization History</h3>
                    <p className="text-xs text-muted-foreground">Track how your scores improve over time</p>
                  </div>
                </div>
                {historyLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <ScoreHistoryChart history={history} />
                )}
                {history.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {history.length} optimization{history.length !== 1 ? 's' : ''} recorded
                  </p>
                )}
              </motion.div>
              
              {/* Tips Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4 text-foreground">How to Improve Your Recall Score</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <h4 className="font-semibold text-primary mb-2">Run Optimization</h4>
                    <p className="text-muted-foreground text-xs">
                      Use the AI optimization feature to generate AI-readable definitions and recommendation contexts.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <h4 className="font-semibold text-primary mb-2">Test with Simulator</h4>
                    <p className="text-muted-foreground text-xs">
                      Use the AI Recommendation Simulator to test how your brand performs in different query contexts.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <h4 className="font-semibold text-primary mb-2">Add Trust Signals</h4>
                    <p className="text-muted-foreground text-xs">
                      Include reviews, awards, user counts, and other authority indicators in your brand profile.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <h4 className="font-semibold text-primary mb-2">Refine Descriptions</h4>
                    <p className="text-muted-foreground text-xs">
                      Use clear, specific language and avoid jargon to improve semantic clarity.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
