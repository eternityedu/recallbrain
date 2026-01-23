import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScoreNotificationRequest {
  email: string;
  brandName: string;
  notificationType: "threshold_reached" | "significant_improvement";
  currentScore: number;
  previousScore?: number;
  threshold?: number;
  scoreBreakdown?: {
    semanticClarity: number;
    intentAlignment: number;
    authority: number;
    consistency: number;
    explainability: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const {
      email,
      brandName,
      notificationType,
      currentScore,
      previousScore,
      threshold,
      scoreBreakdown,
    }: ScoreNotificationRequest = await req.json();

    if (!email || !brandName || !notificationType || currentScore === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let subject: string;
    let htmlContent: string;

    if (notificationType === "threshold_reached") {
      subject = `🎉 ${brandName} has reached a Recall Score of ${currentScore}!`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Milestone Achieved!</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">
              Great news! <strong>${brandName}</strong> has reached a Recall Score of <strong style="color: #6366f1; font-size: 24px;">${currentScore}</strong>, crossing your threshold of ${threshold || 70}!
            </p>
            
            ${scoreBreakdown ? `
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">Score Breakdown</h3>
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Semantic Clarity</span>
                  <strong style="color: #3b82f6;">${scoreBreakdown.semanticClarity}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Intent Alignment</span>
                  <strong style="color: #8b5cf6;">${scoreBreakdown.intentAlignment}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Authority Signals</span>
                  <strong style="color: #f59e0b;">${scoreBreakdown.authority}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Consistency</span>
                  <strong style="color: #22c55e;">${scoreBreakdown.consistency}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #64748b;">Explainability</span>
                  <strong style="color: #ef4444;">${scoreBreakdown.explainability}</strong>
                </div>
              </div>
            </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #64748b;">
              Your brand is now better optimized for AI discovery and recommendations. Keep iterating to improve your AI-readiness even further!
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://recallbrain.lovable.app/recall-score" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Full Report
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
            Recall AI - AI Visibility Optimization Platform
          </p>
        </div>
      `;
    } else {
      const improvement = previousScore ? currentScore - previousScore : 0;
      subject = `📈 ${brandName} improved by ${improvement} points!`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📈 Significant Improvement!</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">
              <strong>${brandName}</strong> has improved significantly!
            </p>
            
            <div style="display: flex; justify-content: center; gap: 20px; margin: 30px 0; text-align: center;">
              <div style="background: white; padding: 20px 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Previous</div>
                <div style="font-size: 32px; font-weight: bold; color: #64748b;">${previousScore || 'N/A'}</div>
              </div>
              <div style="display: flex; align-items: center; color: #22c55e; font-size: 24px;">→</div>
              <div style="background: white; padding: 20px 30px; border-radius: 8px; border: 2px solid #22c55e;">
                <div style="color: #22c55e; font-size: 12px; text-transform: uppercase;">Current</div>
                <div style="font-size: 32px; font-weight: bold; color: #22c55e;">${currentScore}</div>
              </div>
            </div>
            
            <div style="background: #dcfce7; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="color: #16a34a; font-weight: 600; font-size: 18px;">+${improvement} points improvement</span>
            </div>
            
            ${scoreBreakdown ? `
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">Current Score Breakdown</h3>
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Semantic Clarity</span>
                  <strong style="color: #3b82f6;">${scoreBreakdown.semanticClarity}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Intent Alignment</span>
                  <strong style="color: #8b5cf6;">${scoreBreakdown.intentAlignment}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Authority Signals</span>
                  <strong style="color: #f59e0b;">${scoreBreakdown.authority}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: #64748b;">Consistency</span>
                  <strong style="color: #22c55e;">${scoreBreakdown.consistency}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #64748b;">Explainability</span>
                  <strong style="color: #ef4444;">${scoreBreakdown.explainability}</strong>
                </div>
              </div>
            </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #64748b;">
              Your optimization efforts are paying off. Keep refining your brand to maximize AI discoverability!
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://recallbrain.lovable.app/recall-score" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Full Report
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
            Recall AI - AI Visibility Optimization Platform
          </p>
        </div>
      `;
    }

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Recall AI <onboarding@resend.dev>",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
