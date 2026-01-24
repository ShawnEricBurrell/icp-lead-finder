import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch leads that need qualification (status is 'new' or 'contacted')
    const leads = await base44.asServiceRole.entities.Lead.filter({
      status: { $in: ['new', 'contacted'] }
    });

    if (leads.length === 0) {
      return Response.json({ 
        message: 'No leads to qualify',
        qualified: 0,
        unqualified: 0
      });
    }

    const qualificationResults = [];

    // Process leads in batches
    for (const lead of leads) {
      try {
        // Prepare lead data for AI analysis
        const leadData = {
          company_name: lead.company_name,
          industry: lead.industry,
          location: lead.location,
          lead_score: lead.lead_score,
          timer_pain_point: lead.timer_pain_point,
          email_status: lead.email_status || 'not_sent',
          email_sent: lead.email_status !== 'not_sent',
          email_opened: lead.email_status === 'opened' || lead.email_status === 'replied',
          email_replied: lead.email_status === 'replied',
          contacted: lead.contacted,
          contact_name: lead.contact_name,
          contact_title: lead.contact_title,
          company_size: lead.company_size
        };

        // Use AI to qualify the lead
        const qualification = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a lead qualification specialist. Analyze this lead and determine if they should be qualified for further sales outreach.

Lead Data:
${JSON.stringify(leadData, null, 2)}

Qualification Criteria:
1. Lead Score: Higher scores (70+) indicate better fit
2. Engagement: Email opens and replies show interest
3. Industry: Some industries may be better targets
4. Pain Points: Clear, urgent pain points indicate readiness
5. Contact Quality: Decision-maker contact (titles like CEO, CTO, Director, etc.)

Determine if this lead should be:
- 'qualified': Strong potential, ready for sales engagement
- 'unqualified': Not a good fit or insufficient engagement

Provide a brief reason (1-2 sentences) for your decision.`,
          response_json_schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["qualified", "unqualified"]
              },
              reason: {
                type: "string"
              },
              confidence: {
                type: "number",
                description: "Confidence level 0-100"
              }
            }
          }
        });

        // Only update if confidence is reasonable
        if (qualification.confidence >= 60) {
          await base44.asServiceRole.entities.Lead.update(lead.id, {
            status: qualification.status,
            notes: `${lead.notes || ''}\n\n[AI Qualification ${new Date().toLocaleDateString()}]: ${qualification.reason}`.trim()
          });

          qualificationResults.push({
            company: lead.company_name,
            status: qualification.status,
            reason: qualification.reason,
            confidence: qualification.confidence
          });
        }
      } catch (error) {
        console.error(`Error qualifying lead ${lead.company_name}:`, error);
      }
    }

    // Count results
    const qualified = qualificationResults.filter(r => r.status === 'qualified').length;
    const unqualified = qualificationResults.filter(r => r.status === 'unqualified').length;

    // Send notification email if there are newly qualified leads
    if (qualified > 0) {
      const qualifiedLeads = qualificationResults.filter(r => r.status === 'qualified');
      const emailBody = `
🎯 New Qualified Leads Report

${qualified} lead(s) have been automatically qualified by AI:

${qualifiedLeads.map((r, idx) => `${idx + 1}. ${r.company}
   Confidence: ${r.confidence}%
   Reason: ${r.reason}
`).join('\n')}

Visit your dashboard to review and engage with these qualified leads.
      `;

      try {
        const user = await base44.auth.me();
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `🎯 ${qualified} New Qualified Lead${qualified > 1 ? 's' : ''}`,
          body: emailBody
        });
      } catch (emailError) {
        console.error('Failed to send notification:', emailError);
      }
    }

    return Response.json({
      success: true,
      processed: leads.length,
      qualified,
      unqualified,
      results: qualificationResults
    });

  } catch (error) {
    console.error('Error in qualifyLeads function:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});