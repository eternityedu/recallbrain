import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface NotificationHistoryItem {
  id: string;
  user_id: string;
  brand_id: string | null;
  notification_type: string;
  email_sent_to: string;
  subject: string;
  status: string;
  error_message: string | null;
  score_data: {
    currentScore?: number;
    previousScore?: number;
    threshold?: number;
    improvement?: number;
  } | null;
  created_at: string;
  brand_profiles?: {
    brand_name: string;
  } | null;
}

export function useNotificationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notification_history")
        .select(`
          *,
          brand_profiles (brand_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notification history:", error);
      } else {
        setHistory(data as NotificationHistoryItem[] || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  return { history, loading };
}
