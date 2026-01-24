import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lead_id, template_id, email_type } = await req.json();

    // Get lead details
    const lead = await base44.asServiceRole.entities.Lead.get(lead_id);
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    let templateContent = null;
    if (template_id) {
      templateContent = await base44.entities.EmailTemplate.get(template_id);
    }

    // Generate AI-powered email content
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional, personalized cold email for a lead with the following details:
- Company: ${lead.company_name}
- Industry: ${lead.industry}
- Contact Name: ${lead.contact_name}
- Contact Title: ${lead.contact_title}
- Pain Point: ${lead.timer_pain_point}
- Additional Pain Points: ${lead.pain_points?.join(', ') || 'None'}

${templateContent ? `Use this template as inspiration but personalize it:
Subject: ${templateContent.subject}
Body: ${templateContent.body}` : ''}

Email Type: ${email_type || 'initial_outreach'}

The email should:
1. Be brief (150-200 words max)
2. Reference their specific pain point naturally
3. Offer clear value without being salesy
4. Include a soft call-to-action
5. Be conversational and human

Also provide:
- An optimal send time (day of week and hour in 24h format, with reason)
- 3 alternative subject lines to A/B test
- Key personalization variables used

Generate the email content.`,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
          alternative_subjects: {
            type: "array",
            items: { type: "string" }
          },
          optimal_send_time: {
            type: "object",
            properties: {
              day: { type: "string" },
              hour: { type: "number" },
              reason: { type: "string" }
            }
          },
          personalization_notes: { type: "string" }
        }
      }
    });

    const content = result.data || result;

    // Replace variables in content
    const replaceVars = (text) => {
      return text
        .replace(/\{\{company_name\}\}/g, lead.company_name)
        .replace(/\{\{contact_name\}\}/g, lead.contact_name)
        .replace(/\{\{contact_title\}\}/g, lead.contact_title)
        .replace(/\{\{industry\}\}/g, lead.industry);
    };

    return Response.json({
      success: true,
      subject: replaceVars(content.subject),
      body: replaceVars(content.body),
      alternative_subjects: content.alternative_subjects?.map(replaceVars) || [],
      optimal_send_time: content.optimal_send_time,
      personalization_notes: content.personalization_notes
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});