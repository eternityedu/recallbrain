import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  Target,
  TrendingUp,
  Settings as SettingsIcon,
  Save,
  Loader2,
  History,
  Users,
  ChevronRight,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading: prefsLoading, saving, updatePreferences } = useNotificationPreferences();

  // Local state for form
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifyThreshold, setNotifyThreshold] = useState(true);
  const [notifyImprovement, setNotifyImprovement] = useState(true);
  const [thresholdValue, setThresholdValue] = useState(70);
  const [improvementThreshold, setImprovementThreshold] = useState(10);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with loaded preferences
  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.email_notifications_enabled);
      setNotifyThreshold(preferences.notify_on_threshold);
      setNotifyImprovement(preferences.notify_on_improvement);
      setThresholdValue(preferences.threshold_value);
      setImprovementThreshold(preferences.improvement_threshold);
      setNotificationEmail(preferences.notification_email || user?.email || "");
    }
  }, [preferences, user?.email]);

  // Track changes
  useEffect(() => {
    if (!preferences) return;
    const changed =
      emailEnabled !== preferences.email_notifications_enabled ||
      notifyThreshold !== preferences.notify_on_threshold ||
      notifyImprovement !== preferences.notify_on_improvement ||
      thresholdValue !== preferences.threshold_value ||
      improvementThreshold !== preferences.improvement_threshold ||
      notificationEmail !== (preferences.notification_email || "");
    setHasChanges(changed);
  }, [preferences, emailEnabled, notifyThreshold, notifyImprovement, thresholdValue, improvementThreshold, notificationEmail]);

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSave = async () => {
    await updatePreferences({
      email_notifications_enabled: emailEnabled,
      notify_on_threshold: notifyThreshold,
      notify_on_improvement: notifyImprovement,
      threshold_value: thresholdValue,
      improvement_threshold: improvementThreshold,
      notification_email: notificationEmail || null,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <SettingsIcon className="h-7 w-7 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your notification preferences
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>

          {/* Email Notifications Card */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure when and how you receive email notifications about your brand scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your brand performance
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              {/* Notification Email */}
              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="your@email.com"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  disabled={!emailEnabled}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Email address where notifications will be sent
                </p>
              </div>

              <Separator />

              {/* Notification Types */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Notification Types
                </h3>

                {/* Threshold Notifications */}
                <div className={`p-4 rounded-lg border transition-opacity ${
                  emailEnabled ? "bg-muted/30 border-border/50" : "opacity-50"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Target className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Score Threshold Reached</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when a brand crosses your target score
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifyThreshold}
                      onCheckedChange={setNotifyThreshold}
                      disabled={!emailEnabled}
                    />
                  </div>
                  {notifyThreshold && emailEnabled && (
                    <div className="pl-11 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Threshold Value</Label>
                        <Badge variant="secondary" className="font-mono">
                          {thresholdValue}
                        </Badge>
                      </div>
                      <Slider
                        value={[thresholdValue]}
                        onValueChange={(v) => setThresholdValue(v[0])}
                        min={50}
                        max={95}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Receive notification when Recall Score reaches {thresholdValue} or higher
                      </p>
                    </div>
                  )}
                </div>

                {/* Improvement Notifications */}
                <div className={`p-4 rounded-lg border transition-opacity ${
                  emailEnabled ? "bg-muted/30 border-border/50" : "opacity-50"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Significant Improvement</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when a brand makes a big score jump
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifyImprovement}
                      onCheckedChange={setNotifyImprovement}
                      disabled={!emailEnabled}
                    />
                  </div>
                  {notifyImprovement && emailEnabled && (
                    <div className="pl-11 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Improvement Threshold</Label>
                        <Badge variant="secondary" className="font-mono">
                          +{improvementThreshold} points
                        </Badge>
                      </div>
                      <Slider
                        value={[improvementThreshold]}
                        onValueChange={(v) => setImprovementThreshold(v[0])}
                        min={5}
                        max={30}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Receive notification when score improves by {improvementThreshold}+ points
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
              <CardDescription>Access related features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navigate("/notification-history")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <History className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Notification History</p>
                    <p className="text-sm text-muted-foreground">View past email notifications</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navigate("/competitor-analysis")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Competitor Analysis</p>
                    <p className="text-sm text-muted-foreground">Compare against competitors</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Pro tip:</span>{" "}
                Email notifications are sent automatically when you optimize a brand. 
                Make sure your email domain is verified with your email provider to ensure delivery.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
