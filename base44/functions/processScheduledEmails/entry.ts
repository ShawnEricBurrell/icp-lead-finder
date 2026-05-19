import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date().toISOString();
    
    // Get pending emails that are due
    const scheduledEmails = await base44.asServiceRole.entities.ScheduledEmail.filter({
      status: 'pending'
    });

    const dueEmails = scheduledEmails.filter(email => 
      email.scheduled_for <= now
    );

    const results = {
      sent: [],
      failed: []
    };

    for (const email of dueEmails) {
      try {
        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'ICP Lead Finder',
          to: email.to_email,
          subject: email.subject,
          body: email.body
        });

        // Update scheduled email status
        await base44.asServiceRole.entities.ScheduledEmail.update(email.id, {
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        // Update lead
        await base44.asServiceRole.entities.Lead.update(email.lead_id, {
          email_status: 'sent',
          email_sent_date: new Date().toISOString()
        });

        results.sent.push(email.company_name);
      } catch (error) {
        await base44.asServiceRole.entities.ScheduledEmail.update(email.id, {
          status: 'failed',
          error_message: error.message
        });

        results.failed.push({
          company: email.company_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed: dueEmails.length,
      sent: results.sent.length,
      failed: results.failed.length,
      details: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});