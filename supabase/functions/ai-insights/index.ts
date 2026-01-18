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

    console.log("Generating AI insights for analytics data");

    const systemPrompt = `You are an AI visibility optimization expert. Your task is to analyze brand optimization analytics data and provide actionable insights to improve brand visibility in AI-generated recommendations.

Focus on:
1. Identifying patterns in the data
2. Suggesting specific improvements based on scores
3. Providing actionable next steps
4. Highlighting wins and areas of concern`;

    const analyticsContext = `
Analytics Overview:
- Total Optimizations: ${analyticsData.optimizations}
- Simulations Run: ${analyticsData.simulations}
- Success Rate (Brand Recommended): ${analyticsData.successRate}%
- Average Confidence Score: ${analyticsData.avgConfidence}%

Score Distribution:
${analyticsData.scoreDistribution?.map((s: any) => `- ${s.name}: ${s.value}%`).join('\n') || 'No score data available'}
`;

    const brandContext = brandData ? `
Current Brand Profile:
- Name: ${brandData.brandName}
- Category: ${brandData.category || 'Not specified'}
- Is Optimized: ${brandData.isOptimized ? 'Yes' : 'No'}
- Recall Score: ${brandData.recallScore || 'Not calculated'}
` : 'No brand profile selected.';

    const userPrompt = `${analyticsContext}

${brandContext}

Based on this data, provide insights and recommendations to improve AI visibility and recommendation rates.`;

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
              name: "generate_insights",
              description: "Generate structured AI visibility insights",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A brief 1-2 sentence summary of the overall performance"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-3 current strengths based on the data"
                  },
                  improvements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        suggestion: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["area", "suggestion", "priority"]
                    },
                    description: "List of 3-4 specific improvement suggestions"
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-3 immediate action items"
                  },
                  healthScore: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Overall AI visibility health score based on the analytics"
                  }
                },
                required: ["summary", "strengths", "improvements", "nextSteps", "healthScore"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } }
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
    console.log("AI Insights response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_insights") {
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
    console.error("AI Insights error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
