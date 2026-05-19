import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch leads that need score updates (not archived or converted)
    const leads = await base44.asServiceRole.entities.Lead.filter({
      status: { $nin: ['archived', 'converted'] }
    });

    if (leads.length === 0) {
      return Response.json({ 
        message: 'No leads to update',
        updated: 0
      });
    }

    const updateResults = {
      increased: [],
      decreased: [],
      unchanged: [],
      errors: []
    };

    for (const lead of leads) {
      try {
        // Calculate engagement metrics
        const engagementData = {
          email_sent: lead.email_status !== 'not_sent',
          email_opened: lead.email_status === 'opened' || lead.email_status === 'replied',
          email_replied: lead.email_status === 'replied',
          days_since_initial_contact: lead.email_sent_date 
            ? Math.floor((Date.now() - new Date(lead.email_sent_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          days_since_last_interaction: lead.email_opened_date || lead.email_replied_date
            ? Math.floor((Date.now() - new Date(lead.email_replied_date || lead.email_opened_date).getTime()) / (1000 * 60 * 60 * 24))
            : 999,
          cadence_active: lead.cadence_active,
          cadence_progress: lead.cadence_current_step || 0,
          follow_up_count: lead.follow_up_sequence?.length || 0,
          current_status: lead.status,
          engagement_activities_count: lead.engagement_activities?.length || 0
        };

        // Use AI to analyze engagement and calculate new score
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyze this lead's engagement and determine their current score (0-100).

Lead: ${lead.company_name}
Industry: ${lead.industry}
Current Score: ${lead.lead_score}
Initial Score Breakdown: ${JSON.stringify(lead.score_breakdown || {})}

Engagement Data:
- Email Status: ${lead.email_status || 'not_sent'}
- Email Sent: ${engagementData.email_sent ? 'Yes' : 'No'}
- Email Opened: ${engagementData.email_opened ? 'Yes' : 'No'}
- Email Replied: ${engagementData.email_replied ? 'Yes' : 'No'}
- Days Since Initial Contact: ${engagementData.days_since_initial_contact}
- Days Since Last Interaction: ${engagementData.days_since_last_interaction}
- Cadence Active: ${engagementData.cadence_active ? 'Yes' : 'No'}
- Follow-ups Sent: ${engagementData.cadence_progress} of ${engagementData.follow_up_count}
- Status: ${engagementData.current_status}
- Recent Activities: ${engagementData.engagement_activities_count}

Scoring Rules:
1. Base Score: Use the original lead_score as starting point
2. Email Engagement: +10 for opened, +20 for replied
3. Response Time: -5 if no interaction in 14+ days, -10 if 30+ days
4. Cadence Engagement: +5 if cadence is active and progressing
5. Status Impact: +10 if qualified, -20 if unqualified
6. Recency: Prioritize recent engagement (last 7 days = best signal)

Calculate a new score (0-100) and provide:
1. new_score: The updated score
2. change: How much it changed from current score (can be negative)
3. reason: Clear 1-2 sentence explanation of WHY the score changed
4. engagement_level: "high", "medium", or "low"
5. buying_intent: "strong", "moderate", or "weak"`,
          response_json_schema: {
            type: "object",
            properties: {
              new_score: { type: "number" },
              change: { type: "number" },
              reason: { type: "string" },
              engagement_level: { 
                type: "string",
                enum: ["high", "medium", "low"]
              },
              buying_intent: {
                type: "string", 
                enum: ["strong", "moderate", "weak"]
              }
            }
          }
        });

        // Only update if score changed by more than 3 points
        const scoreChange = Math.round(analysis.change);
        
        if (Math.abs(scoreChange) >= 3) {
          const newScoreHistory = [...(lead.score_history || []), {
            previous_score: lead.lead_score,
            new_score: Math.round(analysis.new_score),
            change: scoreChange,
            reason: analysis.reason,
            timestamp: new Date().toISOString()
          }];

          // Keep only last 10 score changes
          if (newScoreHistory.length > 10) {
            newScoreHistory.shift();
          }

          await base44.asServiceRole.entities.Lead.update(lead.id, {
            lead_score: Math.round(analysis.new_score),
            engagement_score: Math.round(analysis.new_score),
            score_history: newScoreHistory,
            last_score_update: new Date().toISOString()
          });

          if (scoreChange > 0) {
            updateResults.increased.push({
              company: lead.company_name,
              change: scoreChange,
              new_score: Math.round(analysis.new_score),
              reason: analysis.reason,
              intent: analysis.buying_intent
            });
          } else {
            updateResults.decreased.push({
              company: lead.company_name,
              change: scoreChange,
              new_score: Math.round(analysis.new_score),
              reason: analysis.reason
            });
          }
        } else {
          updateResults.unchanged.push({
            company: lead.company_name,
            score: lead.lead_score
          });
        }

      } catch (error) {
        console.error(`Error updating score for ${lead.company_name}:`, error);
        updateResults.errors.push({
          company: lead.company_name,
          error: error.message
        });
      }
    }

    // Send notification for significant score changes
    const user = await base44.auth.me();
    const hasSignificantChanges = updateResults.increased.length > 0 || updateResults.decreased.length > 0;
    
    if (hasSignificantChanges && user) {
      let emailBody = '📊 Lead Score Update Report\n\n';
      
      if (updateResults.increased.length > 0) {
        emailBody += `📈 Scores Increased (${updateResults.increased.length}):\n`;
        updateResults.increased.forEach((r, idx) => {
          emailBody += `   ${idx + 1}. ${r.company}: ${r.change > 0 ? '+' : ''}${r.change} pts → ${r.new_score}/100\n`;
          emailBody += `      Reason: ${r.reason}\n`;
          if (r.intent === 'strong') {
            emailBody += `      🎯 HIGH BUYING INTENT - Consider immediate follow-up!\n`;
          }
        });
        emailBody += '\n';
      }
      
      if (updateResults.decreased.length > 0) {
        emailBody += `📉 Scores Decreased (${updateResults.decreased.length}):\n`;
        updateResults.decreased.forEach((r, idx) => {
          emailBody += `   ${idx + 1}. ${r.company}: ${r.change} pts → ${r.new_score}/100\n`;
          emailBody += `      Reason: ${r.reason}\n`;
        });
        emailBody += '\n';
      }

      emailBody += `✅ Unchanged: ${updateResults.unchanged.length}\n\n`;
      emailBody += 'Visit your dashboard to review updated lead priorities.';

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `📊 Lead Scores Updated: ${updateResults.increased.length} ↑ | ${updateResults.decreased.length} ↓`,
          body: emailBody
        });
      } catch (emailError) {
        console.error('Failed to send notification:', emailError);
      }
    }

    return Response.json({
      success: true,
      processed: leads.length,
      increased: updateResults.increased.length,
      decreased: updateResults.decreased.length,
      unchanged: updateResults.unchanged.length,
      errors: updateResults.errors.length,
      details: updateResults
    });

  } catch (error) {
    console.error('Error in updateLeadScores function:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});