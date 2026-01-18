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
    const { brandData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Optimizing brand:", brandData.brandName);

    const systemPrompt = `You are an AI brand optimization expert for "Recall" - a platform that helps brands become recommended inside AI-generated answers. Your job is to analyze brand data and generate:

1. An AI-readable brand summary (2-3 paragraphs) that clearly explains what the brand does, its unique value, and why it should be recommended
2. Recommendation triggers - specific user queries/intents where this brand should be recommended
3. Example AI answer snippets that naturally include this brand as a recommendation

Be specific, clear, and focus on creating content that AI systems can easily understand and use for recommendations.`;

    const userPrompt = `Analyze this brand and generate optimization content:

Brand Name: ${brandData.brandName}
Description: ${brandData.description || 'Not provided'}
Website: ${brandData.websiteUrl || 'Not provided'}
Category: ${brandData.category || 'Not provided'}
Target Audience: ${brandData.targetAudience || 'Not provided'}
Keywords/Intents: ${brandData.keywords || 'Not provided'}
Core Value Proposition: ${brandData.valueProposition || 'Not provided'}
Trust Signals: ${brandData.trustSignals || 'Not provided'}

Generate a comprehensive optimization package with:
1. AI-Readable Summary
2. Recommendation Triggers (list 5-7 specific queries)
3. Example AI Answer Snippets (3 examples)
4. Score each category from 0-100: Relevance, Clarity, Authority`;

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
              name: "brand_optimization",
              description: "Return the brand optimization analysis",
              parameters: {
                type: "object",
                properties: {
                  aiSummary: {
                    type: "string",
                    description: "AI-readable brand summary (2-3 paragraphs)"
                  },
                  recommendationTriggers: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 5-7 specific user queries where this brand should be recommended"
                  },
                  exampleSnippets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        query: { type: "string" },
                        answer: { type: "string" }
                      },
                      required: ["query", "answer"]
                    },
                    description: "3 example AI answer snippets"
                  },
                  scores: {
                    type: "object",
                    properties: {
                      relevance: { type: "number", minimum: 0, maximum: 100 },
                      clarity: { type: "number", minimum: 0, maximum: 100 },
                      authority: { type: "number", minimum: 0, maximum: 100 }
                    },
                    required: ["relevance", "clarity", "authority"]
                  }
                },
                required: ["aiSummary", "recommendationTriggers", "exampleSnippets", "scores"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "brand_optimization" } }
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
    console.log("AI Response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "brand_optimization") {
      throw new Error("Unexpected AI response format");
    }

    const optimization = JSON.parse(toolCall.function.arguments);
    
    // Calculate overall Recall Score
    const recallScore = Math.round(
      (optimization.scores.relevance + optimization.scores.clarity + optimization.scores.authority) / 3
    );

    return new Response(JSON.stringify({
      success: true,
      optimization: {
        ...optimization,
        recallScore
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Brand optimization error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
