import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lead_id, subject, body, schedule_for } = await req.json();

    // Get lead details
    const lead = await base44.entities.Lead.get(lead_id);
    if (!lead || !lead.verified_email) {
      return Response.json({ error: 'Lead not found or no email address' }, { status: 400 });
    }

    const trackingId = crypto.randomUUID();
    const appUrl = Deno.env.get('APP_URL') || 'https://icpfinder.netlify.app';

    // Add tracking pixel and links
    const trackedBody = `${body}

<img src="${appUrl}/api/track/open/${trackingId}" width="1" height="1" alt="" />`;

    // If scheduling for later, create scheduled email
    if (schedule_for) {
      await base44.asServiceRole.entities.ScheduledEmail.create({
        lead_id,
        company_name: lead.company_name,
        to_email: lead.verified_email,
        subject,
        body: trackedBody,
        scheduled_for: schedule_for,
        tracking_id: trackingId,
        status: 'pending'
      });

      return Response.json({
        success: true,
        scheduled: true,
        scheduled_for: schedule_for,
        tracking_id: trackingId
      });
    }

    // Send immediately
    await base44.integrations.Core.SendEmail({
      from_name: user.full_name || 'ICP Lead Finder',
      to: lead.verified_email,
      subject,
      body: trackedBody
    });

    // Update lead
    await base44.asServiceRole.entities.Lead.update(lead_id, {
      email_subject: subject,
      email_draft: body,
      email_status: 'sent',
      email_sent_date: new Date().toISOString(),
      contacted: true,
      contact_date: new Date().toISOString()
    });

    // Track in engagement activities
    const activities = lead.engagement_activities || [];
    activities.push({
      type: 'email_sent',
      description: `Sent email: ${subject}`,
      timestamp: new Date().toISOString(),
      score_impact: 5
    });

    await base44.asServiceRole.entities.Lead.update(lead_id, {
      engagement_activities: activities,
      engagement_score: (lead.engagement_score || 0) + 5
    });

    return Response.json({
      success: true,
      sent: true,
      tracking_id: trackingId
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});