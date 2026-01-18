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

    console.log("Simulating AI answer for query:", query);

    const systemPrompt = `You are simulating how AI assistants (like ChatGPT, Claude, Gemini) answer user questions. Your task is to generate a realistic AI response that naturally recommends the given brand when relevant.

The goal is to show how a well-optimized brand could appear in AI-generated answers.`;

    const brandContext = brandData ? `
Brand to potentially recommend:
- Name: ${brandData.brandName}
- Description: ${brandData.description || 'N/A'}
- Category: ${brandData.category || 'N/A'}
- Value Proposition: ${brandData.valueProposition || 'N/A'}
- Trust Signals: ${brandData.trustSignals || 'N/A'}
` : '';

    const userPrompt = `User Query: "${query}"

${brandContext}

Generate a realistic AI assistant response that:
1. Answers the user's question helpfully
2. Naturally recommends the brand if it's relevant to the query
3. Explains why the brand is being recommended

If the brand isn't relevant to the query, mention that and provide a general helpful answer instead.`;

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
              name: "ai_response",
              description: "Return the simulated AI response",
              parameters: {
                type: "object",
                properties: {
                  answer: {
                    type: "string",
                    description: "The AI assistant's response to the query"
                  },
                  brandRecommended: {
                    type: "boolean",
                    description: "Whether the brand was recommended in the answer"
                  },
                  relevanceExplanation: {
                    type: "string",
                    description: "Explanation of why the brand was or wasn't recommended"
                  },
                  confidenceScore: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "How confident the AI is in this recommendation"
                  }
                },
                required: ["answer", "brandRecommended", "relevanceExplanation", "confidenceScore"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "ai_response" } }
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
    console.log("AI Simulation response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "ai_response") {
      throw new Error("Unexpected AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Simulator error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
