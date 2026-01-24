import { supabase } from "@/integrations/supabase/client";
import { BrandProfile } from "@/hooks/useBrandProfiles";

const SCORE_THRESHOLD = 70;
const SIGNIFICANT_IMPROVEMENT_THRESHOLD = 10;

interface NotificationConfig {
  notifyOnThreshold: boolean;
  notifyOnImprovement: boolean;
  thresholdValue: number;
  improvementThreshold: number;
}

const defaultConfig: NotificationConfig = {
  notifyOnThreshold: true,
  notifyOnImprovement: true,
  thresholdValue: SCORE_THRESHOLD,
  improvementThreshold: SIGNIFICANT_IMPROVEMENT_THRESHOLD,
};

export async function sendThresholdNotification(
  brand: BrandProfile,
  email: string,
  threshold: number = SCORE_THRESHOLD
) {
  if (!brand.recall_score || brand.recall_score < threshold) return;

  try {
    const response = await supabase.functions.invoke("send-score-notification", {
      body: {
        email,
        brandName: brand.brand_name,
        notificationType: "threshold_reached",
        currentScore: brand.recall_score,
        threshold,
        scoreBreakdown: {
          semanticClarity: brand.semantic_clarity_score ?? 0,
          intentAlignment: brand.intent_alignment_score ?? 0,
          authority: brand.authority_score ?? 0,
          consistency: brand.consistency_score ?? 0,
          explainability: brand.explainability_score ?? 0,
        },
      },
    });

    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    console.error("Failed to send threshold notification:", error);
    throw error;
  }
}

export async function sendImprovementNotification(
  brand: BrandProfile,
  email: string,
  previousScore: number
) {
  if (!brand.recall_score) return;

  const improvement = brand.recall_score - previousScore;
  if (improvement < SIGNIFICANT_IMPROVEMENT_THRESHOLD) return;

  try {
    const response = await supabase.functions.invoke("send-score-notification", {
      body: {
        email,
        brandName: brand.brand_name,
        notificationType: "significant_improvement",
        currentScore: brand.recall_score,
        previousScore,
        scoreBreakdown: {
          semanticClarity: brand.semantic_clarity_score ?? 0,
          intentAlignment: brand.intent_alignment_score ?? 0,
          authority: brand.authority_score ?? 0,
          consistency: brand.consistency_score ?? 0,
          explainability: brand.explainability_score ?? 0,
        },
      },
    });

    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    console.error("Failed to send improvement notification:", error);
    throw error;
  }
}

export async function checkAndNotify(
  brand: BrandProfile,
  email: string,
  previousScore: number | null,
  config: Partial<NotificationConfig> = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };
  const notifications: Promise<any>[] = [];

  // Check if threshold was just crossed
  if (
    mergedConfig.notifyOnThreshold &&
    brand.recall_score &&
    brand.recall_score >= mergedConfig.thresholdValue &&
    (previousScore === null || previousScore < mergedConfig.thresholdValue)
  ) {
    notifications.push(
      sendThresholdNotification(brand, email, mergedConfig.thresholdValue)
    );
  }

  // Check for significant improvement
  if (
    mergedConfig.notifyOnImprovement &&
    previousScore !== null &&
    brand.recall_score &&
    brand.recall_score - previousScore >= mergedConfig.improvementThreshold
  ) {
    notifications.push(sendImprovementNotification(brand, email, previousScore));
  }

  if (notifications.length > 0) {
    await Promise.allSettled(notifications);
  }
}

export function useScoreNotifications() {
  return {
    sendThresholdNotification,
    sendImprovementNotification,
    checkAndNotify,
  };
}
