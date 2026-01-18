import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Zap, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsData {
  optimizations: number;
  simulations: number;
  recommendations: number;
  avgConfidence: number;
  successRate: number;
  dailyTrends: { date: string; optimizations: number; simulations: number }[];
  scoreDistribution: { name: string; value: number }[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Process analytics data
      const optimizations = events?.filter(e => e.event_type === 'optimization') || [];
      const simulations = events?.filter(e => e.event_type === 'simulation') || [];
      const recommendations = events?.filter(e => e.event_type === 'recommendation') || [];

      // Calculate average confidence from simulations
      const confidenceScores = simulations
        .map(s => (s.event_data as any)?.confidenceScore)
        .filter(Boolean);
      const avgConfidence = confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

      // Calculate success rate (simulations where brand was recommended)
      const successfulSims = simulations.filter(s => (s.event_data as any)?.wasRecommended);
      const successRate = simulations.length > 0
        ? (successfulSims.length / simulations.length) * 100
        : 0;

      // Daily trends
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

      // Score distribution from optimizations
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Please sign in to view analytics</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your brand optimization performance</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Optimizations</CardTitle>
                  <Zap className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.optimizations || 0}</div>
                  <p className="text-xs text-muted-foreground">Brand profiles optimized</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Simulations Run</CardTitle>
                  <Target className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.simulations || 0}</div>
                  <p className="text-xs text-muted-foreground">AI answer simulations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.successRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Brand recommended rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.avgConfidence || 0}%</div>
                  <p className="text-xs text-muted-foreground">AI recommendation confidence</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList>
                <TabsTrigger value="trends">Activity Trends</TabsTrigger>
                <TabsTrigger value="scores">Score Distribution</TabsTrigger>
              </TabsList>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Optimizations and simulations over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics?.dailyTrends || []}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="optimizations" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                            name="Optimizations"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="simulations" 
                            stroke="#06b6d4" 
                            strokeWidth={2}
                            dot={{ fill: '#06b6d4' }}
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
                    <CardHeader>
                      <CardTitle>Average Scores</CardTitle>
                      <CardDescription>Brand optimization score breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics?.scoreDistribution || []}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis domain={[0, 100]} className="text-xs" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Score Distribution</CardTitle>
                      <CardDescription>Visual breakdown of optimization areas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics?.scoreDistribution || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
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
