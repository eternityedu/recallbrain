import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBrandProfiles } from "@/hooks/useBrandProfiles";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Zap, Calendar, Sparkles, ArrowRight, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";

interface AnalyticsData {
  optimizations: number;
  simulations: number;
  recommendations: number;
  avgConfidence: number;
  successRate: number;
  dailyTrends: { date: string; optimizations: number; simulations: number }[];
  scoreDistribution: { name: string; value: number }[];
}

interface AIInsights {
  summary: string;
  strengths: string[];
  improvements: { area: string; suggestion: string; priority: "high" | "medium" | "low" }[];
  nextSteps: string[];
  healthScore: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const Analytics = () => {
  const { user } = useAuth();
  const { selectedBrand } = useBrandProfiles();
  const [timeRange, setTimeRange] = useState("7");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(timeRange)));
      const endDate = endOfDay(new Date());

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const optimizations = events?.filter(e => e.event_type === 'optimization') || [];
      const simulations = events?.filter(e => e.event_type === 'simulation') || [];
      const recommendations = events?.filter(e => e.event_type === 'recommendation') || [];

      const confidenceScores = simulations
        .map(s => (s.event_data as any)?.confidenceScore)
        .filter(Boolean);
      const avgConfidence = confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

      const successfulSims = simulations.filter(s => (s.event_data as any)?.wasRecommended);
      const successRate = simulations.length > 0
        ? (successfulSims.length / simulations.length) * 100
        : 0;

      const dailyMap = new Map<string, { optimizations: number; simulations: number }>();
      for (let i = parseInt(timeRange); i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyMap.set(date, { optimizations: 0, simulations: 0 });
      }

      events?.forEach(event => {
        const date = format(new Date(event.created_at), 'MMM dd');
        const current = dailyMap.get(date) || { optimizations: 0, simulations: 0 };
        if (event.event_type === 'optimization') {
          current.optimizations++;
        } else if (event.event_type === 'simulation') {
          current.simulations++;
        }
        dailyMap.set(date, current);
      });

      const dailyTrends = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        ...data
      }));

      const scoreDistribution = [
        { name: 'Clarity', value: 0 },
        { name: 'Relevance', value: 0 },
        { name: 'Authority', value: 0 },
        { name: 'Overall', value: 0 }
      ];

      optimizations.forEach(opt => {
        const scores = (opt.event_data as any)?.scores;
        if (scores) {
          scoreDistribution[0].value += scores.clarity || 0;
          scoreDistribution[1].value += scores.relevance || 0;
          scoreDistribution[2].value += scores.authority || 0;
          scoreDistribution[3].value += scores.overall || 0;
        }
      });

      if (optimizations.length > 0) {
        scoreDistribution.forEach(s => {
          s.value = Math.round(s.value / optimizations.length);
        });
      }

      setAnalytics({
        optimizations: optimizations.length,
        simulations: simulations.length,
        recommendations: recommendations.length,
        avgConfidence: Math.round(avgConfidence),
        successRate: Math.round(successRate),
        dailyTrends,
        scoreDistribution
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!analytics) return;
    setLoadingInsights(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          analyticsData: analytics,
          brandData: selectedBrand ? {
            brandName: selectedBrand.brand_name,
            category: selectedBrand.category,
            isOptimized: selectedBrand.is_optimized,
            recallScore: selectedBrand.recall_score
          } : null
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setInsights(data.insights);
      toast.success("AI insights generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <h1 className="text-xl md:text-2xl font-bold text-center">Please sign in to view analytics</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 pt-20 md:pt-24 overflow-x-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track your brand optimization performance</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Calendar className="w-4 h-4 mr-2 shrink-0" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2 p-3 md:p-6">
                  <div className="h-3 md:h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="h-6 md:h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Optimizations</CardTitle>
                  <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="text-xl md:text-2xl font-bold">{analytics?.optimizations || 0}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Brand profiles optimized</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Simulations</CardTitle>
                  <Target className="h-3 w-3 md:h-4 md:w-4 text-cyan-500 shrink-0" />
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="text-xl md:text-2xl font-bold">{analytics?.simulations || 0}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">AI answer simulations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500 shrink-0" />
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="text-xl md:text-2xl font-bold">{analytics?.successRate || 0}%</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Brand recommended</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Avg Confidence</CardTitle>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-amber-500 shrink-0" />
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="text-xl md:text-2xl font-bold">{analytics?.avgConfidence || 0}%</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">AI confidence</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Section */}
            <Card className="mb-6 md:mb-8 glow-border">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0" />
                    <CardTitle className="text-lg md:text-xl">AI-Powered Insights</CardTitle>
                  </div>
                  <Button 
                    variant="glow" 
                    size="sm" 
                    onClick={generateInsights}
                    disabled={loadingInsights}
                    className="w-full sm:w-auto"
                  >
                    {loadingInsights ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4" />
                        Generate Insights
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription className="text-xs md:text-sm">Get AI-powered recommendations to improve your brand visibility</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {insights ? (
                  <div className="space-y-4 md:space-y-6">
                    {/* Health Score */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 md:p-4 rounded-lg bg-muted/30 border border-glass-border">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                          <circle 
                            cx="50%" cy="50%" r="40%" fill="none" 
                            stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${insights.healthScore * 2.51} 251`} 
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-display text-base md:text-lg font-bold">
                          {insights.healthScore}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 text-sm md:text-base">AI Visibility Health Score</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{insights.summary}</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        Current Strengths
                      </h4>
                      <div className="space-y-2">
                        {insights.strengths.map((strength, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 md:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <p className="text-xs md:text-sm">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        Suggested Improvements
                      </h4>
                      <div className="space-y-2">
                        {insights.improvements.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/30 border border-glass-border">
                            <span className={`px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full shrink-0 ${
                              item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.priority}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs md:text-sm">{item.area}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">{item.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                        Recommended Next Steps
                      </h4>
                      <div className="grid gap-2">
                        {insights.nextSteps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 md:p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs md:text-sm font-semibold shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-xs md:text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 text-muted-foreground">
                    <Sparkles className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
                    <p className="text-sm md:text-base">Click "Generate Insights" to get AI-powered recommendations</p>
                    <p className="text-xs md:text-sm mt-2">Our AI will analyze your analytics data and provide actionable suggestions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="trends" className="flex-1 md:flex-none text-xs md:text-sm">Activity Trends</TabsTrigger>
                <TabsTrigger value="scores" className="flex-1 md:flex-none text-xs md:text-sm">Score Distribution</TabsTrigger>
              </TabsList>

              <TabsContent value="trends">
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg">Daily Activity</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Optimizations and simulations over time</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 md:p-6 pt-0">
                    <div className="h-[250px] md:h-[400px] -mx-2 md:mx-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics?.dailyTrends || []} margin={{ left: -20, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="optimizations" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                            name="Optimizations"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="simulations" 
                            stroke="#06b6d4" 
                            strokeWidth={2}
                            dot={{ fill: '#06b6d4', r: 3 }}
                            name="Simulations"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scores">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-base md:text-lg">Average Scores</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Brand optimization score breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 md:p-6 pt-0">
                      <div className="h-[200px] md:h-[300px] -mx-2 md:mx-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics?.scoreDistribution || []} margin={{ left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-base md:text-lg">Score Distribution</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Visual breakdown of optimization areas</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 md:p-6 pt-0">
                      <div className="h-[200px] md:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics?.scoreDistribution || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius="70%"
                              fill="#8884d8"
                              dataKey="value"
                              fontSize={10}
                            >
                              {(analytics?.scoreDistribution || []).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;
