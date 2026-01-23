import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandProfile } from "@/hooks/useBrandProfiles";
import {
  Brain,
  Target,
  Shield,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

interface ImprovementRecommendationsProps {
  brands: BrandProfile[];
}

const scoreComponents = [
  {
    key: "semantic_clarity_score" as const,
    label: "Semantic Clarity",
    icon: Brain,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "intent_alignment_score" as const,
    label: "Intent Alignment",
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    key: "authority_score" as const,
    label: "Authority Signals",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    key: "consistency_score" as const,
    label: "Consistency",
    icon: RefreshCw,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    key: "explainability_score" as const,
    label: "Explainability",
    icon: MessageSquare,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
];

type ScoreKey = (typeof scoreComponents)[number]["key"];

interface BrandWeakness {
  brand: BrandProfile;
  weakestArea: (typeof scoreComponents)[number];
  score: number;
  gap: number;
}

export function ImprovementRecommendations({ brands }: ImprovementRecommendationsProps) {
  if (brands.length < 2) return null;

  // Find each brand's weakest area and calculate improvement priority
  const brandWeaknesses: BrandWeakness[] = brands.map((brand) => {
    let lowestScore = 100;
    let weakestArea = scoreComponents[0];

    scoreComponents.forEach((component) => {
      const score = brand[component.key] ?? 0;
      if (score < lowestScore) {
        lowestScore = score;
        weakestArea = component;
      }
    });

    // Calculate gap to best performer in that area
    const bestInArea = Math.max(
      ...brands.map((b) => b[weakestArea.key] ?? 0)
    );

    return {
      brand,
      weakestArea,
      score: lowestScore,
      gap: bestInArea - lowestScore,
    };
  });

  // Sort by gap (largest gap = highest priority)
  const sortedByPriority = [...brandWeaknesses].sort((a, b) => b.gap - a.gap);
  const mostNeedsImprovement = sortedByPriority[0];

  // Find overall lowest scoring brand
  const lowestOverallBrand = brands.reduce((prev, curr) =>
    (curr.recall_score ?? 0) < (prev.recall_score ?? 0) ? curr : prev
  );

  // Find the component with lowest average across all brands
  const componentAverages = scoreComponents.map((component) => {
    const avg =
      brands.reduce((sum, b) => sum + (b[component.key] ?? 0), 0) /
      brands.length;
    return { component, avg };
  });
  const weakestOverallComponent = componentAverages.reduce((prev, curr) =>
    curr.avg < prev.avg ? curr : prev
  );

  const WeaknessIcon = mostNeedsImprovement.weakestArea.icon;
  const OverallWeakIcon = weakestOverallComponent.component.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Improvement Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Priority Improvement */}
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Priority Improvement Needed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">
                    {mostNeedsImprovement.brand.brand_name}
                  </span>{" "}
                  has the largest improvement opportunity in{" "}
                  <span
                    className={`font-medium ${mostNeedsImprovement.weakestArea.color}`}
                  >
                    {mostNeedsImprovement.weakestArea.label}
                  </span>{" "}
                  (score: {mostNeedsImprovement.score}, {mostNeedsImprovement.gap} points
                  behind leader).
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={`${mostNeedsImprovement.weakestArea.bgColor} ${mostNeedsImprovement.weakestArea.color} border-0`}
                  >
                    <WeaknessIcon className="h-3 w-3 mr-1" />
                    {mostNeedsImprovement.weakestArea.label}
                  </Badge>
                  <Badge variant="destructive">High Priority</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Lowest Overall Brand */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Lowest Overall AI-Readiness</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">
                    {lowestOverallBrand.brand_name}
                  </span>{" "}
                  has the lowest Recall Score ({lowestOverallBrand.recall_score}) and would
                  benefit most from comprehensive optimization.
                </p>
              </div>
            </div>
          </div>

          {/* Weakest Component Across All Brands */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${weakestOverallComponent.component.bgColor}`}
              >
                <OverallWeakIcon
                  className={`h-5 w-5 ${weakestOverallComponent.component.color}`}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Weakest Area Across All Brands</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span
                    className={`font-medium ${weakestOverallComponent.component.color}`}
                  >
                    {weakestOverallComponent.component.label}
                  </span>{" "}
                  has the lowest average score ({Math.round(weakestOverallComponent.avg)})
                  across your selected brands. Consider focusing team efforts here.
                </p>
              </div>
            </div>
          </div>

          {/* Individual Brand Weaknesses */}
          <div className="border-t border-border/50 pt-4">
            <p className="text-sm font-medium mb-3">Each Brand's Weakest Area:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {brandWeaknesses.map(({ brand, weakestArea, score }) => {
                const Icon = weakestArea.icon;
                return (
                  <div
                    key={brand.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <Icon className={`h-4 w-4 ${weakestArea.color}`} />
                    <span className="text-sm font-medium truncate">
                      {brand.brand_name}
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className={`text-xs ${weakestArea.color}`}>
                      {weakestArea.label} ({score})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
