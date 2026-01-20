import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoreHistoryEntry } from "@/hooks/useScoreHistory";
import { format } from "date-fns";

interface ScoreHistoryChartProps {
  history: ScoreHistoryEntry[];
}

const scoreColors = {
  recall_score: "hsl(262, 83%, 58%)",
  semantic_clarity_score: "hsl(48, 96%, 53%)",
  intent_alignment_score: "hsl(199, 89%, 48%)",
  authority_score: "hsl(142, 71%, 45%)",
  consistency_score: "hsl(270, 67%, 58%)",
  explainability_score: "hsl(340, 82%, 52%)",
};

const scoreLabels = {
  recall_score: "Overall",
  semantic_clarity_score: "Semantic Clarity",
  intent_alignment_score: "Intent Alignment",
  authority_score: "Authority",
  consistency_score: "Consistency",
  explainability_score: "Explainability",
};

export function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  const chartData = useMemo(() => {
    return history.map((entry, index) => ({
      name: `Opt ${index + 1}`,
      date: format(new Date(entry.created_at), "MMM d"),
      recall_score: entry.recall_score,
      semantic_clarity_score: entry.semantic_clarity_score,
      intent_alignment_score: entry.intent_alignment_score,
      authority_score: entry.authority_score,
      consistency_score: entry.consistency_score,
      explainability_score: entry.explainability_score,
    }));
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">No optimization history yet. Run optimization to track progress.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          formatter={(value) => scoreLabels[value as keyof typeof scoreLabels]}
        />
        {Object.entries(scoreColors).map(([key, color]) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={key === "recall_score" ? 3 : 2}
            dot={{ fill: color, strokeWidth: 2, r: key === "recall_score" ? 5 : 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}