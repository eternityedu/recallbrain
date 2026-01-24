import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications_enabled: boolean;
  notify_on_threshold: boolean;
  notify_on_improvement: boolean;
  threshold_value: number;
  improvement_threshold: number;
  notification_email: string | null;
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at"> = {
  email_notifications_enabled: true,
  notify_on_threshold: true,
  notify_on_improvement: true,
  threshold_value: 70,
  improvement_threshold: 10,
  notification_email: null,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data as NotificationPreferences);
      } else {
        // Create default preferences for new users
        const { data: newData, error: insertError } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            ...defaultPreferences,
            notification_email: user.email || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData as NotificationPreferences);
      }
    } catch (error: any) {
      console.error("Error fetching notification preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data as NotificationPreferences);
      toast.success("Preferences saved successfully");
      return data;
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to save preferences");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
