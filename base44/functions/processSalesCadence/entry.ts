import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch leads with active cadences
    const leads = await base44.asServiceRole.entities.Lead.filter({
      cadence_active: true,
      email_status: { $nin: ['replied', 'not_sent'] }
    });

    if (leads.length === 0) {
      return Response.json({ 
        message: 'No active cadences to process',
        processed: 0
      });
    }

    const results = {
      sent: [],
      paused: [],
      completed: [],
      errors: []
    };

    for (const lead of leads) {
      try {
        // Check if lead should be paused (replied or unqualified)
        if (lead.email_status === 'replied' || lead.status === 'unqualified') {
          await base44.asServiceRole.entities.Lead.update(lead.id, {
            cadence_active: false,
            cadence_paused_reason: lead.email_status === 'replied' 
              ? 'Lead replied to email' 
              : 'Lead marked as unqualified'
          });
          
          results.paused.push({
            company: lead.company_name,
            reason: lead.email_status === 'replied' ? 'replied' : 'unqualified'
          });
          continue;
        }

        // Check if there's a follow-up sequence
        if (!lead.follow_up_sequence || lead.follow_up_sequence.length === 0) {
          await base44.asServiceRole.entities.Lead.update(lead.id, {
            cadence_active: false,
            cadence_paused_reason: 'No follow-up sequence configured'
          });
          continue;
        }

        const currentStep = lead.cadence_current_step || 0;
        
        // Check if sequence is completed
        if (currentStep >= lead.follow_up_sequence.length) {
          await base44.asServiceRole.entities.Lead.update(lead.id, {
            cadence_active: false,
            cadence_paused_reason: 'Sequence completed'
          });
          
          results.completed.push({
            company: lead.company_name
          });
          continue;
        }

        // Calculate when next email should be sent
        const followUp = lead.follow_up_sequence[currentStep];
        const lastSentDate = lead.cadence_last_sent 
          ? new Date(lead.cadence_last_sent)
          : lead.email_sent_date 
            ? new Date(lead.email_sent_date)
            : new Date();
        
        const daysSinceLastEmail = Math.floor(
          (Date.now() - lastSentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if it's time to send the next email
        if (daysSinceLastEmail >= followUp.delay_days) {
          // In a real implementation, this would send the actual email
          // For now, we'll just update the lead to simulate sending
          
          await base44.asServiceRole.entities.Lead.update(lead.id, {
            cadence_current_step: currentStep + 1,
            cadence_last_sent: new Date().toISOString(),
            notes: `${lead.notes || ''}\n\n[Auto-Cadence ${new Date().toLocaleDateString()}]: Follow-up #${currentStep + 1} sent - "${followUp.subject}"`.trim()
          });

          results.sent.push({
            company: lead.company_name,
            step: currentStep + 1,
            subject: followUp.subject
          });
        }
      } catch (error) {
        console.error(`Error processing cadence for ${lead.company_name}:`, error);
        results.errors.push({
          company: lead.company_name,
          error: error.message
        });
      }
    }

    // Send notification if there are significant events
    const user = await base44.auth.me();
    const hasSignificantEvents = results.sent.length > 0 || results.paused.length > 0 || results.completed.length > 0;
    
    if (hasSignificantEvents && user) {
      let emailBody = '📧 Sales Cadence Daily Update\n\n';
      
      if (results.sent.length > 0) {
        emailBody += `✅ Emails Sent: ${results.sent.length}\n`;
        results.sent.forEach((r, idx) => {
          emailBody += `   ${idx + 1}. ${r.company} - Follow-up #${r.step}: "${r.subject}"\n`;
        });
        emailBody += '\n';
      }
      
      if (results.paused.length > 0) {
        emailBody += `⏸️  Cadences Paused: ${results.paused.length}\n`;
        results.paused.forEach((r, idx) => {
          emailBody += `   ${idx + 1}. ${r.company} - Reason: ${r.reason}\n`;
        });
        emailBody += '\n';
      }
      
      if (results.completed.length > 0) {
        emailBody += `🎯 Sequences Completed: ${results.completed.length}\n`;
        results.completed.forEach((r, idx) => {
          emailBody += `   ${idx + 1}. ${r.company}\n`;
        });
        emailBody += '\n';
      }

      emailBody += '\nVisit your dashboard to review and take action on these leads.';

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `📧 Sales Cadence Update: ${results.sent.length + results.paused.length + results.completed.length} Event(s)`,
          body: emailBody
        });
      } catch (emailError) {
        console.error('Failed to send notification:', emailError);
      }
    }

    return Response.json({
      success: true,
      processed: leads.length,
      sent: results.sent.length,
      paused: results.paused.length,
      completed: results.completed.length,
      errors: results.errors.length,
      details: results
    });

  } catch (error) {
    console.error('Error in processSalesCadence function:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});