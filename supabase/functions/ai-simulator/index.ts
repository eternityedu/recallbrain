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
    const { query, brandData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Recall AI simulating answer for query:", query);

    const systemPrompt = `You are Recall AI's Recommendation Simulator.

CORE IDENTITY:
- You simulate how AI assistants (like ChatGPT, Claude, Gemini) might answer user questions
- This is a SIMULATION, not a real-world guarantee
- Your role is to demonstrate AI-readiness and help brands understand how they might appear in AI-generated answers

SIMULATION RULES:
1. Understand the user's intent from their query
2. Evaluate if the brand is contextually relevant
3. Generate a realistic AI-style response
4. Include the brand recommendation ONLY if genuinely relevant
5. Explain WHY the brand was or wasn't recommended

TONE: 
- AI-style, neutral, helpful
- Intelligent, calm, trustworthy
- Never force brand mentions if not relevant
- Never exaggerate or make false claims

STRICT RULES:
- This is an "AI-style simulation" - always frame it as such
- Never claim this represents actual AI platform behavior
- Never guarantee visibility or rankings
- Focus on contextual relevance and helpfulness

OUTPUT FORMAT:
Generate a response that shows:
1. How an AI might naturally answer the user's query
2. Whether the brand fits the context
3. Why the brand was or wasn't included
4. Confidence level in the recommendation`;

    const brandContext = brandData ? `
Brand Profile for Simulation:
- Name: ${brandData.brandName}
- Description: ${brandData.description || 'N/A'}
- Category: ${brandData.category || 'N/A'}
- Value Proposition: ${brandData.valueProposition || 'N/A'}
- Target Audience: ${brandData.targetAudience || 'N/A'}
- Trust Signals: ${brandData.trustSignals || 'N/A'}
` : '';

    const userPrompt = `SIMULATION REQUEST:

User Query: "${query}"

${brandContext}

Generate a simulated AI assistant response that:
1. Answers the user's question helpfully and accurately
2. Naturally recommends the brand ONLY if it's contextually relevant to the query
3. If recommending, explains WHY the brand is appropriate for this context
4. If NOT recommending, provides a general helpful answer and explains why the brand doesn't fit

Remember: This is an AI-readiness simulation to help understand how well-optimized brands might appear in AI-generated recommendations.`;

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
              name: "ai_simulation_response",
              description: "Return the simulated AI response for the Recall AI Recommendation Simulator",
              parameters: {
                type: "object",
                properties: {
                  simulatedAnswer: {
                    type: "string",
                    description: "The AI-style simulated response to the user's query"
                  },
                  brandRecommended: {
                    type: "boolean",
                    description: "Whether the brand was naturally included in the recommendation"
                  },
                  relevanceExplanation: {
                    type: "string",
                    description: "Explanation of why the brand was or wasn't included based on contextual relevance"
                  },
                  confidenceScore: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Confidence in the contextual appropriateness of this recommendation"
                  },
                  intentMatch: {
                    type: "string",
                    description: "Brief description of the user's intent and how well the brand matches it"
                  },
                  improvementTips: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 tips to improve the brand's relevance for this type of query"
                  }
                },
                required: ["simulatedAnswer", "brandRecommended", "relevanceExplanation", "confidenceScore", "intentMatch", "improvementTips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "ai_simulation_response" } }
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
    console.log("Recall AI simulation response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "ai_simulation_response") {
      throw new Error("Unexpected AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Map to expected response format for backward compatibility
    return new Response(JSON.stringify({
      success: true,
      result: {
        answer: result.simulatedAnswer,
        brandRecommended: result.brandRecommended,
        relevanceExplanation: result.relevanceExplanation,
        confidenceScore: result.confidenceScore,
        intentMatch: result.intentMatch,
        improvementTips: result.improvementTips
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Recall AI Simulator error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
