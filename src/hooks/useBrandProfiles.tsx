import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BrandProfile {
  id: string;
  user_id: string;
  brand_name: string;
  description: string | null;
  website_url: string | null;
  category: string | null;
  target_audience: string | null;
  keywords: string | null;
  value_proposition: string | null;
  trust_signals: string | null;
  ai_summary: string | null;
  ai_recommendation_triggers: string | null;
  ai_example_snippets: string | null;
  recall_score: number;
  relevance_score: number;
  clarity_score: number;
  authority_score: number;
  is_optimized: boolean;
  created_at: string;
  updated_at: string;
}

export function useBrandProfiles() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(null);

  const fetchBrands = async () => {
    if (!user) {
      setBrands([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
      
      // Select first brand if available and none selected
      if (data && data.length > 0 && !selectedBrand) {
        setSelectedBrand(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brand profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [user]);

  const createBrand = async (brandData: Partial<BrandProfile>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({
        user_id: user.id,
        brand_name: brandData.brand_name!,
        description: brandData.description,
        website_url: brandData.website_url,
        category: brandData.category,
        target_audience: brandData.target_audience,
        keywords: brandData.keywords,
        value_proposition: brandData.value_proposition,
        trust_signals: brandData.trust_signals,
      })
      .select()
      .single();

    if (error) throw error;
    
    setBrands(prev => [data, ...prev]);
    setSelectedBrand(data);
    return data;
  };

  const updateBrand = async (id: string, updates: Partial<BrandProfile>) => {
    const { data, error } = await supabase
      .from('brand_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    setBrands(prev => prev.map(b => b.id === id ? data : b));
    if (selectedBrand?.id === id) {
      setSelectedBrand(data);
    }
    return data;
  };

  const deleteBrand = async (id: string) => {
    const { error } = await supabase
      .from('brand_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setBrands(prev => prev.filter(b => b.id !== id));
    if (selectedBrand?.id === id) {
      setSelectedBrand(brands.find(b => b.id !== id) || null);
    }
  };

  const optimizeBrand = async (brand: BrandProfile) => {
    const response = await supabase.functions.invoke('optimize-brand', {
      body: {
        brandData: {
          brandName: brand.brand_name,
          description: brand.description,
          websiteUrl: brand.website_url,
          category: brand.category,
          targetAudience: brand.target_audience,
          keywords: brand.keywords,
          valueProposition: brand.value_proposition,
          trustSignals: brand.trust_signals,
        }
      }
    });

    if (response.error) throw response.error;
    
    const { optimization } = response.data;
    
    // Update brand with optimization results
    const updated = await updateBrand(brand.id, {
      ai_summary: optimization.aiSummary,
      ai_recommendation_triggers: JSON.stringify(optimization.recommendationTriggers),
      ai_example_snippets: JSON.stringify(optimization.exampleSnippets),
      recall_score: optimization.recallScore,
      relevance_score: optimization.scores.relevance,
      clarity_score: optimization.scores.clarity,
      authority_score: optimization.scores.authority,
      is_optimized: true,
    });

    return updated;
  };

  return {
    brands,
    loading,
    selectedBrand,
    setSelectedBrand,
    createBrand,
    updateBrand,
    deleteBrand,
    optimizeBrand,
    refetch: fetchBrands,
  };
}
