import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ScoreHistoryEntry {
  id: string;
  brand_id: string;
  recall_score: number;
  semantic_clarity_score: number;
  intent_alignment_score: number;
  authority_score: number;
  consistency_score: number;
  explainability_score: number;
  created_at: string;
}

export function useScoreHistory(brandId?: string) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user || !brandId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brand_score_history')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching score history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, brandId]);

  const addHistoryEntry = async (entry: Omit<ScoreHistoryEntry, 'id' | 'created_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('brand_score_history')
      .insert({
        brand_id: entry.brand_id,
        user_id: user.id,
        recall_score: entry.recall_score,
        semantic_clarity_score: entry.semantic_clarity_score,
        intent_alignment_score: entry.intent_alignment_score,
        authority_score: entry.authority_score,
        consistency_score: entry.consistency_score,
        explainability_score: entry.explainability_score,
      })
      .select()
      .single();

    if (error) throw error;
    setHistory(prev => [...prev, data]);
    return data;
  };

  return {
    history,
    loading,
    addHistoryEntry,
    refetch: fetchHistory,
  };
}