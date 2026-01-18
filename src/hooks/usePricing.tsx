import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface PricingPlan {
  id: string;
  plan_name: string;
  price: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePricing() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const createPlan = async (plan: Omit<PricingPlan, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAdmin) throw new Error('Only admins can create plans');

    const { data, error } = await supabase
      .from('pricing')
      .insert(plan)
      .select()
      .single();

    if (error) {
      toast.error('Failed to create plan');
      throw error;
    }

    setPlans(prev => [...prev, data].sort((a, b) => a.price - b.price));
    toast.success('Plan created successfully');
    return data;
  };

  const updatePlan = async (id: string, updates: Partial<PricingPlan>) => {
    if (!isAdmin) throw new Error('Only admins can update plans');

    const { data, error } = await supabase
      .from('pricing')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update plan');
      throw error;
    }

    setPlans(prev => prev.map(p => p.id === id ? data : p).sort((a, b) => a.price - b.price));
    toast.success('Plan updated successfully');
    return data;
  };

  const deletePlan = async (id: string) => {
    if (!isAdmin) throw new Error('Only admins can delete plans');

    const { error } = await supabase
      .from('pricing')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete plan');
      throw error;
    }

    setPlans(prev => prev.filter(p => p.id !== id));
    toast.success('Plan deleted successfully');
  };

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans,
  };
}
