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

    const systemPrompt = `You are Recall AI, an AI-visibility and branding optimization engine.

CORE IDENTITY:
- Your role is NOT to control external AI platforms
- Your role is to simulate, optimize, and prepare brands for AI-first discovery
- You help brands become: AI-legible, AI-recommendable, semantically consistent, and contextually relevant
- You operate ONLY within the Recall platform
- All outputs are simulations, optimizations, and readiness analysis
- NEVER claim direct influence over ChatGPT, Gemini, Claude, or any external AI

RECALL DEFINITION:
Recall is "SEO for AI". Traditional SEO optimizes for links. Recall optimizes for AI understanding and recommendations. AI does not choose ads. AI chooses the most contextually correct, clearly defined, and trusted answer.

YOUR TASK - BRAND AI SEO OPTIMIZATION:
1. Convert brand data into AI-readable definitions
2. Create a clear "What it is / Who it's for / When to recommend" structure
3. Enforce semantic consistency across all outputs
4. Remove marketing fluff; prioritize clarity and meaning

AI-READABLE BRAND DEFINITION FORMAT:
"[Brand] is a [category] platform that helps [target audience] achieve [core outcome] by [key mechanism]. It is best recommended when [specific context or intent]."

AI RECOMMENDATION CONTEXTS:
- Explicitly list when this brand SHOULD be recommended
- Explicitly list when it should NOT be recommended
- This teaches AI boundaries and increases trust

RECALL SCORE (AI READINESS SCORE) - Analyze based on:
- Semantic clarity (how clearly defined is the brand?)
- Intent alignment (does it match user queries?)
- Authority signals (trust indicators, proof points)
- Consistency (is messaging unified?)
- Explainability (can AI easily explain why to recommend?)

TONE: Intelligent, calm, trustworthy, clear, non-salesy, educational. Think like "A technical AI researcher explaining to founders."

STRICT RULES:
- Never claim real-world AI partnerships
- Never say "ChatGPT will rank this"
- Never promise external AI visibility
- Never hallucinate popularity or users
- Never exaggerate outcomes
- Use phrases like: "AI-style simulation", "AI-readiness optimization", "Designed to improve AI understanding", "May increase likelihood of correct recommendations"`;

    const userPrompt = `Analyze this brand and generate AI-readiness optimization:

Brand Name: ${brandData.brandName}
Description: ${brandData.description || 'Not provided'}
Website: ${brandData.websiteUrl || 'Not provided'}
Category: ${brandData.category || 'Not provided'}
Target Audience: ${brandData.targetAudience || 'Not provided'}
Keywords/Intents: ${brandData.keywords || 'Not provided'}
Core Value Proposition: ${brandData.valueProposition || 'Not provided'}
Trust Signals: ${brandData.trustSignals || 'Not provided'}

Generate a comprehensive AI-readiness optimization package following Recall AI principles:
1. AI-Readable Brand Definition (in the exact format specified)
2. Recommendation Contexts (when TO recommend and when NOT to recommend)
3. Example AI Answer Snippets (3 simulated AI responses that naturally include this brand)
4. Recall Score breakdown with improvement suggestions`;

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
              description: "Return the Recall AI brand optimization analysis",
              parameters: {
                type: "object",
                properties: {
                  aiReadableDefinition: {
                    type: "string",
                    description: "The AI-readable brand definition in the exact format: '[Brand] is a [category] platform that helps [target audience] achieve [core outcome] by [key mechanism]. It is best recommended when [specific context or intent].'"
                  },
                  aiSummary: {
                    type: "string",
                    description: "Expanded AI-readable brand summary (2-3 paragraphs) with semantic clarity"
                  },
                  recommendWhen: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 5-7 specific contexts/queries where this brand SHOULD be recommended"
                  },
                  doNotRecommendWhen: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 3-5 contexts where this brand should NOT be recommended"
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
                    description: "3 simulated AI answer snippets"
                  },
                  scores: {
                    type: "object",
                    properties: {
                      semanticClarity: { type: "number", minimum: 0, maximum: 100, description: "How clearly defined is the brand?" },
                      intentAlignment: { type: "number", minimum: 0, maximum: 100, description: "Does it match user queries?" },
                      authoritySignals: { type: "number", minimum: 0, maximum: 100, description: "Trust indicators and proof points" },
                      consistency: { type: "number", minimum: 0, maximum: 100, description: "Is messaging unified?" },
                      explainability: { type: "number", minimum: 0, maximum: 100, description: "Can AI easily explain why to recommend?" }
                    },
                    required: ["semanticClarity", "intentAlignment", "authoritySignals", "consistency", "explainability"]
                  },
                  improvements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        suggestion: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["area", "suggestion", "impact"]
                    },
                    description: "Specific improvement suggestions to increase AI-readiness"
                  }
                },
                required: ["aiReadableDefinition", "aiSummary", "recommendWhen", "doNotRecommendWhen", "exampleSnippets", "scores", "improvements"],
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
    console.log("Recall AI optimization response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "brand_optimization") {
      throw new Error("Unexpected AI response format");
    }

    const optimization = JSON.parse(toolCall.function.arguments);
    
    // Calculate overall Recall Score (AI Readiness Score)
    const scores = optimization.scores;
    const recallScore = Math.round(
      (scores.semanticClarity + scores.intentAlignment + scores.authoritySignals + scores.consistency + scores.explainability) / 5
    );

    // Map new scores to legacy format for backward compatibility
    const legacyScores = {
      relevance: scores.intentAlignment,
      clarity: scores.semanticClarity,
      authority: scores.authoritySignals
    };

    return new Response(JSON.stringify({
      success: true,
      optimization: {
        aiReadableDefinition: optimization.aiReadableDefinition,
        aiSummary: optimization.aiSummary,
        recommendationTriggers: optimization.recommendWhen,
        doNotRecommendWhen: optimization.doNotRecommendWhen,
        exampleSnippets: optimization.exampleSnippets,
        scores: legacyScores,
        detailedScores: scores,
        improvements: optimization.improvements,
        recallScore
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Recall AI optimization error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
