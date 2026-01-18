import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AnalyticsEvent {
  event_type: 'optimization' | 'simulation' | 'recommendation';
  brand_id?: string;
  event_data?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (event: AnalyticsEvent) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          brand_id: event.brand_id || null,
          event_type: event.event_type,
          event_data: event.event_data || {}
        });

      if (error) {
        console.error('Failed to track analytics event:', error);
      }
    } catch (err) {
      console.error('Analytics tracking error:', err);
    }
  };

  const trackOptimization = (brandId: string, scores: Record<string, number>) => {
    return trackEvent({
      event_type: 'optimization',
      brand_id: brandId,
      event_data: { scores, timestamp: new Date().toISOString() }
    });
  };

  const trackSimulation = (brandId: string, query: string, wasRecommended: boolean, confidenceScore: number) => {
    return trackEvent({
      event_type: 'simulation',
      brand_id: brandId,
      event_data: { query, wasRecommended, confidenceScore, timestamp: new Date().toISOString() }
    });
  };

  const trackRecommendation = (brandId: string, context: string) => {
    return trackEvent({
      event_type: 'recommendation',
      brand_id: brandId,
      event_data: { context, timestamp: new Date().toISOString() }
    });
  };

  return {
    trackEvent,
    trackOptimization,
    trackSimulation,
    trackRecommendation
  };
};
