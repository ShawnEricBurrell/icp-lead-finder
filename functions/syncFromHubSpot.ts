import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get HubSpot access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('hubspot');
    
    // Get CRM connection config
    const connections = await base44.asServiceRole.entities.CRMConnection.filter({
      crm_type: 'hubspot',
      is_active: true
    });
    
    if (connections.length === 0) {
      return Response.json({ error: 'No active HubSpot connection found' }, { status: 400 });
    }
    
    const connection = connections[0];
    const fieldMappings = connection.field_mappings || [];
    
    // Fetch companies from HubSpot
    const companiesResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/companies?limit=100&properties=name,industry,city,website,numberofemployees,phone',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const companiesData = await companiesResponse.json();
    
    const results = {
      created: [],
      updated: [],
      errors: [],
      total: companiesData.results?.length || 0
    };
    
    for (const company of companiesData.results || []) {
      try {
        const props = company.properties;
        
        // Check if lead already exists
        const existingLeads = await base44.asServiceRole.entities.Lead.filter({
          company_name: props.name
        });
        
        // Prepare lead data
        const leadData = {
          company_name: props.name || 'Unknown Company',
          industry: props.industry || 'Unknown',
          location: props.city || 'Unknown',
          website: props.website,
          company_size: props.numberofemployees,
          direct_phone: props.phone,
          lead_score: existingLeads.length > 0 ? existingLeads[0].lead_score : 50,
          timer_pain_point: existingLeads.length > 0 ? existingLeads[0].timer_pain_point : 'Imported from HubSpot'
        };
        
        // Apply custom field mappings (reverse direction)
        fieldMappings.forEach(mapping => {
          const crmValue = props[mapping.crm_field];
          if (crmValue !== undefined && crmValue !== null) {
            leadData[mapping.base44_field] = crmValue;
          }
        });
        
        // Fetch associated contacts for this company
        const contactsResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/companies/${company.id}/associations/contacts`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        const contactsData = await contactsResponse.json();
        
        if (contactsData.results && contactsData.results.length > 0) {
          // Get first contact details
          const contactId = contactsData.results[0].id;
          const contactResponse = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,phone,jobtitle`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          
          const contactData = await contactResponse.json();
          const contactProps = contactData.properties;
          
          leadData.contact_name = `${contactProps.firstname || ''} ${contactProps.lastname || ''}`.trim();
          leadData.verified_email = contactProps.email;
          leadData.contact_title = contactProps.jobtitle;
          if (contactProps.phone) {
            leadData.direct_phone = contactProps.phone;
          }
        }
        
        if (existingLeads.length > 0) {
          // Update existing lead
          await base44.asServiceRole.entities.Lead.update(existingLeads[0].id, leadData);
          results.updated.push({
            company: props.name,
            lead_id: existingLeads[0].id
          });
        } else {
          // Create new lead
          const newLead = await base44.asServiceRole.entities.Lead.create(leadData);
          results.created.push({
            company: props.name,
            lead_id: newLead.id
          });
        }
        
      } catch (error) {
        console.error(`Error processing company ${company.properties.name}:`, error);
        results.errors.push({
          company: company.properties.name,
          error: error.message
        });
      }
    }
    
    // Update connection stats
    await base44.asServiceRole.entities.CRMConnection.update(connection.id, {
      last_sync: new Date().toISOString(),
      sync_stats: {
        total_synced: (connection.sync_stats?.total_synced || 0) + results.created.length + results.updated.length,
        last_sync_count: results.created.length + results.updated.length,
        errors: (connection.sync_stats?.errors || 0) + results.errors.length
      }
    });
    
    return Response.json({
      success: true,
      created: results.created.length,
      updated: results.updated.length,
      errors: results.errors.length,
      details: results
    });
    
  } catch (error) {
    console.error('Error in syncFromHubSpot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});