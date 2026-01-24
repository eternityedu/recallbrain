import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, Mail, CheckCircle, XCircle, Clock, TrendingUp, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationHistory, NotificationHistoryItem } from "@/hooks/useNotificationHistory";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function NotificationCard({ notification }: { notification: NotificationHistoryItem }) {
  const isSuccess = notification.status === "sent";
  const isThreshold = notification.notification_type === "threshold_reached";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-start gap-4"
    >
      <div
        className={`p-2 rounded-lg ${
          isSuccess ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
        }`}
      >
        {isThreshold ? <Target className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{notification.subject}</h3>
          <Badge variant={isSuccess ? "default" : "destructive"} className="shrink-0">
            {isSuccess ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Sent
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Failed
              </>
            )}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {notification.email_sent_to}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
          </span>
          {notification.brand_profiles?.brand_name && (
            <span className="text-primary">{notification.brand_profiles.brand_name}</span>
          )}
        </div>

        {notification.score_data && (
          <div className="mt-2 flex flex-wrap gap-2">
            {notification.score_data.currentScore !== undefined && (
              <Badge variant="outline">Score: {notification.score_data.currentScore}</Badge>
            )}
            {notification.score_data.previousScore !== undefined && (
              <Badge variant="outline">Previous: {notification.score_data.previousScore}</Badge>
            )}
            {notification.score_data.threshold !== undefined && (
              <Badge variant="outline">Threshold: {notification.score_data.threshold}</Badge>
            )}
            {notification.score_data.improvement !== undefined && (
              <Badge variant="secondary">+{notification.score_data.improvement} points</Badge>
            )}
          </div>
        )}

        {notification.error_message && (
          <p className="mt-2 text-sm text-destructive">{notification.error_message}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function NotificationHistory() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { history, loading } = useNotificationHistory();

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold glow-text">Notification History</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold mb-2">Email Notifications</h1>
            <p className="text-muted-foreground">View all past email notifications sent for your brand scores.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No Notifications Yet</h2>
              <p className="text-muted-foreground mb-4">
                Email notifications will appear here when your brand scores cross thresholds or improve
                significantly.
              </p>
              <Button variant="outline" onClick={() => navigate("/settings")}>
                Configure Notifications
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
