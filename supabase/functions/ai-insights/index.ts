import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analyticsData, brandData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Recall AI generating insights for analytics data");

    const systemPrompt = `You are Recall AI's Analytics Intelligence Engine.

CORE IDENTITY:
- You analyze brand AI-readiness data and provide actionable insights
- Your mission is to help brands become more understandable to AI systems
- You focus on semantic clarity, intent alignment, authority signals, and consistency
- All insights are designed to improve AI-readiness, not guarantee external AI visibility

RECALL PHILOSOPHY:
- Recall is "SEO for AI"
- Traditional SEO optimizes for links; Recall optimizes for AI understanding
- AI chooses the most contextually correct, clearly defined, and trusted answer
- We build understanding, not promotion

YOUR TASK:
Analyze the provided analytics and brand data to:
1. Identify patterns in AI-readiness performance
2. Highlight strengths and areas for improvement
3. Provide specific, actionable recommendations
4. Calculate an overall AI Visibility Health Score

TONE: 
- Intelligent, calm, trustworthy
- Clear and educational
- Non-salesy, focused on genuine improvements
- Think like "A technical AI researcher explaining to founders"

STRICT RULES:
- Never promise external AI visibility
- Never claim to control AI platform behavior
- Focus on optimization and readiness
- Use phrases like "may increase likelihood", "designed to improve", "AI-readiness optimization"`;

    const analyticsContext = `
Analytics Overview:
- Total Optimizations Performed: ${analyticsData.optimizations}
- Simulations Executed: ${analyticsData.simulations}
- Contextual Match Rate: ${analyticsData.successRate}%
- Average Confidence Score: ${analyticsData.avgConfidence}%

Score Distribution:
${analyticsData.scoreDistribution?.map((s: any) => `- ${s.name}: ${s.value}%`).join('\n') || 'No score data available'}
`;

    const brandContext = brandData ? `
Current Brand Profile:
- Name: ${brandData.brandName}
- Category: ${brandData.category || 'Not specified'}
- Is Optimized: ${brandData.isOptimized ? 'Yes' : 'No'}
- Recall Score (AI Readiness): ${brandData.recallScore || 'Not calculated'}
- Relevance Score: ${brandData.relevance_score || 'N/A'}
- Clarity Score: ${brandData.clarity_score || 'N/A'}
- Authority Score: ${brandData.authority_score || 'N/A'}
` : 'No brand profile selected.';

    const userPrompt = `ANALYSIS REQUEST:

${analyticsContext}

${brandContext}

Based on this data, provide Recall AI insights and recommendations to improve:
1. Semantic clarity - How clearly defined is the brand?
2. Intent alignment - Does it match user queries?
3. Authority signals - Are trust indicators present?
4. Consistency - Is messaging unified?
5. Explainability - Can AI easily explain why to recommend?

Focus on actionable improvements that will increase AI-readiness.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_recall_insights",
              description: "Generate structured Recall AI visibility insights",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A brief 1-2 sentence summary of the overall AI-readiness performance"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-3 current strengths in AI-readiness based on the data"
                  },
                  improvements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string", description: "One of: Semantic Clarity, Intent Alignment, Authority Signals, Consistency, Explainability" },
                        suggestion: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        impact: { type: "string", description: "Expected impact on AI-readiness" }
                      },
                      required: ["area", "suggestion", "priority", "impact"]
                    },
                    description: "List of 3-5 specific improvement suggestions to increase AI-readiness"
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 3 immediate action items to improve AI visibility"
                  },
                  healthScore: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Overall AI Visibility Health Score based on the analytics"
                  },
                  scoreBreakdown: {
                    type: "object",
                    properties: {
                      semanticClarity: { type: "number", minimum: 0, maximum: 100 },
                      intentAlignment: { type: "number", minimum: 0, maximum: 100 },
                      authoritySignals: { type: "number", minimum: 0, maximum: 100 },
                      consistency: { type: "number", minimum: 0, maximum: 100 },
                      explainability: { type: "number", minimum: 0, maximum: 100 }
                    },
                    required: ["semanticClarity", "intentAlignment", "authoritySignals", "consistency", "explainability"],
                    description: "Breakdown of Recall Score components"
                  }
                },
                required: ["summary", "strengths", "improvements", "nextSteps", "healthScore", "scoreBreakdown"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_recall_insights" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Recall AI Insights response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_recall_insights") {
      throw new Error("Unexpected AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      success: true,
      insights: result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Recall AI Insights error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
