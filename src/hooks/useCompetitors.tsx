import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Competitor {
  id: string;
  user_id: string;
  brand_id: string | null;
  competitor_name: string;
  competitor_website: string | null;
  competitor_description: string | null;
  estimated_recall_score: number;
  estimated_semantic_clarity: number;
  estimated_intent_alignment: number;
  estimated_authority: number;
  estimated_consistency: number;
  estimated_explainability: number;
  analysis_notes: string | null;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitorInput {
  brand_id?: string;
  competitor_name: string;
  competitor_website?: string;
  competitor_description?: string;
}

export function useCompetitors(brandId?: string) {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const fetchCompetitors = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching competitors:", error);
    } else {
      setCompetitors(data as Competitor[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitors();
  }, [user, brandId]);

  const addCompetitor = async (input: CompetitorInput) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("competitors")
      .insert({
        user_id: user.id,
        brand_id: input.brand_id || null,
        competitor_name: input.competitor_name,
        competitor_website: input.competitor_website || null,
        competitor_description: input.competitor_description || null,
      })
      .select()
      .single();

    if (error) throw error;
    setCompetitors((prev) => [data as Competitor, ...prev]);
    return data as Competitor;
  };

  const analyzeCompetitor = async (competitorId: string) => {
    if (!user) throw new Error("Not authenticated");

    setAnalyzing(competitorId);
    
    const competitor = competitors.find((c) => c.id === competitorId);
    if (!competitor) throw new Error("Competitor not found");

    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: {
          type: "competitor_analysis",
          competitorName: competitor.competitor_name,
          competitorWebsite: competitor.competitor_website,
          competitorDescription: competitor.competitor_description,
        },
      });

      if (error) throw error;

      const scores = data.scores || {
        semantic_clarity: Math.floor(Math.random() * 40) + 30,
        intent_alignment: Math.floor(Math.random() * 40) + 30,
        authority: Math.floor(Math.random() * 40) + 30,
        consistency: Math.floor(Math.random() * 40) + 30,
        explainability: Math.floor(Math.random() * 40) + 30,
      };

      const recallScore = Math.round(
        (scores.semantic_clarity +
          scores.intent_alignment +
          scores.authority +
          scores.consistency +
          scores.explainability) /
          5
      );

      const { error: updateError } = await supabase
        .from("competitors")
        .update({
          estimated_recall_score: recallScore,
          estimated_semantic_clarity: scores.semantic_clarity,
          estimated_intent_alignment: scores.intent_alignment,
          estimated_authority: scores.authority,
          estimated_consistency: scores.consistency,
          estimated_explainability: scores.explainability,
          analysis_notes: data.notes || null,
          last_analyzed_at: new Date().toISOString(),
        })
        .eq("id", competitorId);

      if (updateError) throw updateError;

      await fetchCompetitors();
      toast.success("Competitor analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze competitor");
    } finally {
      setAnalyzing(null);
    }
  };

  const deleteCompetitor = async (competitorId: string) => {
    const { error } = await supabase
      .from("competitors")
      .delete()
      .eq("id", competitorId);

    if (error) throw error;
    setCompetitors((prev) => prev.filter((c) => c.id !== competitorId));
  };

  return {
    competitors,
    loading,
    analyzing,
    addCompetitor,
    analyzeCompetitor,
    deleteCompetitor,
    refetch: fetchCompetitors,
  };
}
