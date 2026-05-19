import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all leads for analysis
    const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 500);

    if (leads.length === 0) {
      return Response.json({ 
        message: 'No leads to analyze',
        success: false
      });
    }

    // Prepare data for AI analysis
    const leadData = leads.map(l => ({
      id: l.id,
      company: l.company_name,
      industry: l.industry,
      location: l.location,
      score: l.lead_score,
      status: l.status,
      email_status: l.email_status,
      email_sent: l.email_status !== 'not_sent',
      email_opened: l.email_status === 'opened' || l.email_status === 'replied',
      email_replied: l.email_status === 'replied',
      cadence_active: l.cadence_active,
      contacted: l.contacted,
      days_in_pipeline: l.created_date ? Math.floor((Date.now() - new Date(l.created_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      pain_point: l.timer_pain_point,
      contact_title: l.contact_title
    }));

    // Count converted and qualified leads for success metrics
    const convertedLeads = leads.filter(l => l.status === 'converted');
    const qualifiedLeads = leads.filter(l => l.status === 'qualified');

    // Generate comprehensive AI insights
    const insights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert sales analytics AI. Analyze this B2B lead pipeline and provide actionable insights.

Total Leads: ${leads.length}
Qualified: ${qualifiedLeads.length}
Converted: ${convertedLeads.length}

Lead Data:
${JSON.stringify(leadData.slice(0, 100), null, 2)}

Provide comprehensive analysis with:

1. CONVERSION PREDICTIONS: Select the top 5 leads most likely to convert. For each provide:
   - conversion_probability (0-100)
   - predicted_timeline (e.g., "7-14 days", "2-4 weeks")
   - key_factors (array of 2-3 reasons why they'll convert)
   - recommended_actions (array of 2-3 specific next steps)

2. INDUSTRY TRENDS: Identify 3-4 patterns across industries:
   - Which industries are most engaged?
   - What pain points are trending?
   - What opportunities exist?

3. OPTIMAL STRATEGIES: Based on successful patterns, recommend 3-4 outreach strategies:
   - What's working best (subject lines, timing, approach)?
   - Calculate success_rate based on data
   - Specify best_for (what type of leads)
   - Provide implementation steps

4. AI SUMMARY: 2-3 paragraph executive summary with key takeaways and priorities.

Be specific, data-driven, and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          conversion_predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lead_id: { type: "string" },
                company_name: { type: "string" },
                conversion_probability: { type: "number" },
                predicted_timeline: { type: "string" },
                key_factors: { 
                  type: "array",
                  items: { "type": "string" }
                },
                recommended_actions: {
                  type: "array",
                  items: { "type": "string" }
                }
              }
            }
          },
          industry_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                industry: { type: "string" },
                trend: { type: "string" },
                impact: { type: "string" },
                opportunity: { type: "string" }
              }
            }
          },
          optimal_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy_name: { type: "string" },
                description: { type: "string" },
                success_rate: { type: "number" },
                best_for: { type: "string" },
                implementation: { type: "string" }
              }
            }
          },
          ai_summary: { type: "string" }
        }
      }
    });

    // Save insights to database
    await base44.asServiceRole.entities.LeadInsight.create({
      report_date: new Date().toISOString(),
      conversion_predictions: insights.conversion_predictions || [],
      industry_trends: insights.industry_trends || [],
      optimal_strategies: insights.optimal_strategies || [],
      ai_summary: insights.ai_summary || ''
    });

    // Send notification email
    const user = await base44.auth.me();
    if (user) {
      let emailBody = '🔮 AI Lead Insights Report\n\n';
      
      emailBody += '📊 EXECUTIVE SUMMARY:\n';
      emailBody += insights.ai_summary + '\n\n';
      
      if (insights.conversion_predictions?.length > 0) {
        emailBody += `🎯 TOP CONVERSION OPPORTUNITIES (${insights.conversion_predictions.length}):\n`;
        insights.conversion_predictions.slice(0, 3).forEach((pred, idx) => {
          emailBody += `\n${idx + 1}. ${pred.company_name} - ${pred.conversion_probability}% likely to convert\n`;
          emailBody += `   Timeline: ${pred.predicted_timeline}\n`;
          emailBody += `   Key Actions: ${pred.recommended_actions[0]}\n`;
        });
        emailBody += '\n';
      }
      
      if (insights.industry_trends?.length > 0) {
        emailBody += '📈 INDUSTRY TRENDS:\n';
        insights.industry_trends.forEach((trend, idx) => {
          emailBody += `   ${idx + 1}. ${trend.industry}: ${trend.trend}\n`;
        });
        emailBody += '\n';
      }
      
      if (insights.optimal_strategies?.length > 0) {
        emailBody += '💡 RECOMMENDED STRATEGIES:\n';
        insights.optimal_strategies.slice(0, 2).forEach((strategy, idx) => {
          emailBody += `   ${idx + 1}. ${strategy.strategy_name} (${strategy.success_rate}% success rate)\n`;
          emailBody += `      ${strategy.description}\n`;
        });
      }

      emailBody += '\n\nView full insights in your Dashboard → Analytics section.';

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: '🔮 AI Lead Insights: Conversion Predictions & Strategy Recommendations',
          body: emailBody
        });
      } catch (emailError) {
        console.error('Failed to send notification:', emailError);
      }
    }

    return Response.json({
      success: true,
      insights: {
        predictions_count: insights.conversion_predictions?.length || 0,
        trends_count: insights.industry_trends?.length || 0,
        strategies_count: insights.optimal_strategies?.length || 0
      }
    });

  } catch (error) {
    console.error('Error generating lead insights:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});