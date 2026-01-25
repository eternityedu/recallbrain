import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  Users,
  Globe,
  BarChart3,
  Target,
  Shield,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrandProfiles } from "@/hooks/useBrandProfiles";
import { useCompetitors, Competitor, CompetitorInput } from "@/hooks/useCompetitors";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";

const scoreComponents = [
  { key: "estimated_semantic_clarity", label: "Semantic Clarity", icon: Sparkles, color: "bg-purple-500" },
  { key: "estimated_intent_alignment", label: "Intent Alignment", icon: Target, color: "bg-blue-500" },
  { key: "estimated_authority", label: "Authority", icon: Shield, color: "bg-emerald-500" },
  { key: "estimated_consistency", label: "Consistency", icon: RefreshCw, color: "bg-orange-500" },
  { key: "estimated_explainability", label: "Explainability", icon: BarChart3, color: "bg-pink-500" },
] as const;

function CompetitorCard({
  competitor,
  onAnalyze,
  onDelete,
  analyzing,
  userBrand,
}: {
  competitor: Competitor;
  onAnalyze: () => void;
  onDelete: () => void;
  analyzing: boolean;
  userBrand?: { recall_score: number | null };
}) {
  const hasScores = competitor.last_analyzed_at !== null;
  const scoreDiff = userBrand?.recall_score
    ? (userBrand.recall_score || 0) - competitor.estimated_recall_score
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{competitor.competitor_name}</h3>
          {competitor.competitor_website && (
            <a
              href={competitor.competitor_website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              {competitor.competitor_website}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {hasScores ? "Re-analyze" : "Analyze"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {competitor.competitor_description && (
        <p className="text-sm text-muted-foreground mb-4">{competitor.competitor_description}</p>
      )}

      {hasScores ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${competitor.estimated_recall_score * 1.63} 163`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                  {competitor.estimated_recall_score}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">Estimated Recall Score</p>
                {scoreDiff !== null && (
                  <p
                    className={`text-sm ${
                      scoreDiff > 0 ? "text-green-500" : scoreDiff < 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {scoreDiff > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        You're ahead by {scoreDiff} pts
                      </>
                    ) : scoreDiff < 0 ? (
                      <>They're ahead by {Math.abs(scoreDiff)} pts</>
                    ) : (
                      "Same score as you"
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scoreComponents.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  <span className="font-medium text-foreground">{competitor[key]}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${competitor[key]}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {competitor.analysis_notes && (
            <div className="mt-4 p-3 rounded-lg bg-secondary border border-border">
              <p className="text-sm text-muted-foreground">{competitor.analysis_notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Click "Analyze" to get AI-estimated scores</p>
        </div>
      )}
    </motion.div>
  );
}

export default function CompetitorAnalysis() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { brands, selectedBrand } = useBrandProfiles();
  const { competitors, loading, analyzing, addCompetitor, analyzeCompetitor, deleteCompetitor } =
    useCompetitors(selectedBrand?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CompetitorInput>({
    competitor_name: "",
    competitor_website: "",
    competitor_description: "",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.competitor_name.trim()) {
      toast.error("Competitor name is required");
      return;
    }

    try {
      await addCompetitor({
        ...form,
        brand_id: selectedBrand?.id,
      });
      toast.success("Competitor added!");
      setForm({ competitor_name: "", competitor_website: "", competitor_description: "" });
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add competitor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this competitor?")) return;
    try {
      await deleteCompetitor(id);
      toast.success("Competitor removed");
    } catch (error) {
      toast.error("Failed to delete competitor");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Recall" className="h-7 w-7" />
              <span className="text-xl font-semibold text-foreground">Competitor Analysis</span>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Competitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Competitor Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Acme Corp"
                    value={form.competitor_name}
                    onChange={(e) => setForm((f) => ({ ...f, competitor_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={form.competitor_website}
                    onChange={(e) => setForm((f) => ({ ...f, competitor_website: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the competitor..."
                    value={form.competitor_description}
                    onChange={(e) => setForm((f) => ({ ...f, competitor_description: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Competitor
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {brands.length > 0 && (
            <div className="flex items-center gap-4">
              <Label className="shrink-0">Analyzing for:</Label>
              <Select value={selectedBrand?.id || ""} disabled>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.brand_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : competitors.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">No Competitors Added</h2>
              <p className="text-muted-foreground mb-6">
                Add competitors to analyze their AI-readiness and compare against your brand.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Your First Competitor
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competitors.map((competitor) => (
                <CompetitorCard
                  key={competitor.id}
                  competitor={competitor}
                  onAnalyze={() => analyzeCompetitor(competitor.id)}
                  onDelete={() => handleDelete(competitor.id)}
                  analyzing={analyzing === competitor.id}
                  userBrand={selectedBrand}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
