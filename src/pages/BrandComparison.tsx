import { useState } from "react";
import { motion } from "framer-motion";
import { useBrandProfiles, BrandProfile } from "@/hooks/useBrandProfiles";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { ImprovementRecommendations } from "@/components/comparison/ImprovementRecommendations";
import { toast } from "sonner";
import {
  Brain,
  Target,
  Shield,
  RefreshCw,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Download,
  FileText,
} from "lucide-react";

const scoreComponents = [
  {
    key: "semantic_clarity_score",
    label: "Semantic Clarity",
    description: "How clearly defined is the brand?",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
  },
  {
    key: "intent_alignment_score",
    label: "Intent Alignment",
    description: "Does it match user queries?",
    icon: Target,
    color: "from-purple-500 to-pink-500",
  },
  {
    key: "authority_score",
    label: "Authority Signals",
    description: "Trust indicators and proof points",
    icon: Shield,
    color: "from-amber-500 to-orange-500",
  },
  {
    key: "consistency_score",
    label: "Consistency",
    description: "Is messaging unified?",
    icon: RefreshCw,
    color: "from-green-500 to-emerald-500",
  },
  {
    key: "explainability_score",
    label: "Explainability",
    description: "Can AI easily explain why to recommend?",
    icon: MessageSquare,
    color: "from-rose-500 to-red-500",
  },
] as const;


function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function BrandSelector({
  brands,
  selectedIds,
  onToggle,
}: {
  brands: BrandProfile[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Select Brands to Compare
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brands.map((brand) => {
            const isSelected = selectedIds.includes(brand.id);
            const isOptimized = brand.is_optimized;
            return (
              <div
                key={brand.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-border"
                } ${!isOptimized ? "opacity-60" : ""}`}
                onClick={() => isOptimized && onToggle(brand.id)}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={!isOptimized}
                  onCheckedChange={() => isOptimized && onToggle(brand.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {brand.brand_name}
                  </p>
                  {isOptimized ? (
                    <p className="text-xs text-muted-foreground">
                      Score: {brand.recall_score}
                    </p>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Not optimized
                    </Badge>
                  )}
                </div>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        {brands.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No brands found. Create and optimize brands first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ComparisonTable({
  brands,
}: {
  brands: BrandProfile[];
}) {
  if (brands.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Select at least 2 brands to compare their AI-readiness scores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Score Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground w-48">
                  Score Component
                </th>
                {brands.map((brand) => (
                  <th
                    key={brand.id}
                    className="text-left p-4 text-sm font-medium min-w-[180px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">{brand.brand_name}</span>
                      <Badge variant="secondary" className="shrink-0">
                        {brand.recall_score}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scoreComponents.map((component, idx) => {
                const Icon = component.icon;
                return (
                  <motion.tr
                    key={component.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${component.color} text-white`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {component.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {component.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    {brands.map((brand) => {
                      const score = brand[component.key] ?? 0;
                      const maxScore = Math.max(
                        ...brands.map((b) => b[component.key] ?? 0)
                      );
                      const isHighest = score === maxScore && maxScore > 0;
                      return (
                        <td key={brand.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xl font-bold ${
                                  isHighest ? "text-primary" : ""
                                }`}
                              >
                                {score}
                              </span>
                              {isHighest && brands.length > 1 && (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-primary/20 text-primary"
                                >
                                  Best
                                </Badge>
                              )}
                            </div>
                            <ScoreBar score={score} color={component.color} />
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
              {/* Overall Recall Score Row */}
              <tr className="bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Overall Recall Score</p>
                      <p className="text-xs text-muted-foreground">
                        Average of all components
                      </p>
                    </div>
                  </div>
                </td>
                {brands.map((brand) => {
                  const maxScore = Math.max(...brands.map((b) => b.recall_score));
                  const isHighest = brand.recall_score === maxScore && maxScore > 0;
                  return (
                    <td key={brand.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-2xl font-bold ${
                            isHighest ? "text-primary" : ""
                          }`}
                        >
                          {brand.recall_score}
                        </span>
                        {isHighest && brands.length > 1 && (
                          <Badge variant="default" className="bg-primary">
                            Winner
                          </Badge>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandComparison() {
  const { user, loading: authLoading } = useAuth();
  const { brands, loading: brandsLoading } = useBrandProfiles();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (authLoading || brandsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedBrands = brands.filter((b) => selectedIds.includes(b.id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Brand Comparison
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare AI-readiness scores across your brands
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedBrands.length >= 2 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      exportToCSV(selectedBrands);
                      toast.success("CSV exported successfully");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      exportToPDF(selectedBrands);
                      toast.success("PDF report generated");
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Brand Selector */}
          <BrandSelector
            brands={brands}
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />

          {/* Comparison Table */}
          <ComparisonTable brands={selectedBrands} />

          {/* Improvement Recommendations */}
          <ImprovementRecommendations brands={selectedBrands} />

          {/* Simulation Note */}
          <p className="text-xs text-muted-foreground text-center">
            This comparison uses AI-readiness simulation scores generated by
            Recall AI. Scores indicate optimization level for AI discovery, not
            guaranteed external AI rankings.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
