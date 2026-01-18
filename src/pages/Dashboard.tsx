import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, Plus, Sparkles, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const recallScore = 72;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold glow-text">Recall</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Welcome to Recall</h1>
              <p className="text-muted-foreground">Build AI memory for your brand</p>
            </div>
            <Button variant="glow" onClick={() => navigate("/brand-setup")}>
              <Plus className="h-4 w-4" />
              Add Brand Profile
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recall Score */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 glow-border">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(263, 70%, 58%)" />
                        <stop offset="100%" stopColor="hsl(280, 80%, 55%)" />
                      </linearGradient>
                    </defs>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(260, 15%, 18%)" strokeWidth="6" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="url(#scoreGradient)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${recallScore * 2.01} 201`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold">{recallScore}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Recall Score</h3>
                  <p className="text-sm text-muted-foreground">AI visibility rating</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">Optimize Brand</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Generate AI-readable summaries and triggers</p>
              <Button variant="glowOutline" size="sm" className="w-full" onClick={() => navigate("/brand-setup")}>
                Start Optimization
              </Button>
            </motion.div>

            {/* Simulator */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">AI Simulator</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Test how AI recommends your brand</p>
              <Button variant="glowOutline" size="sm" className="w-full" onClick={() => navigate("/simulator")}>
                Try Simulator
              </Button>
            </motion.div>
          </div>

          {/* Empty State */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Set Up Your First Brand</h2>
              <p className="text-muted-foreground mb-6">
                Create your brand profile to start building AI memory and earning recommendations.
              </p>
              <Button variant="glow" onClick={() => navigate("/brand-setup")}>
                <Plus className="h-4 w-4" />
                Create Brand Profile
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
