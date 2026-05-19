import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const startTime = Date.now();
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
    
    // Get leads to sync (new or updated since last sync)
    const leads = await base44.asServiceRole.entities.Lead.filter({
      status: { $nin: ['archived'] }
    });
    
    const results = {
      synced: [],
      errors: [],
      total: leads.length
    };
    
    for (const lead of leads) {
      try {
        // Map Base44 fields to HubSpot fields
        const companyProperties = {};
        const contactProperties = {};
        
        // Default mappings
        companyProperties.name = lead.company_name;
        companyProperties.industry = lead.industry;
        companyProperties.city = lead.location;
        companyProperties.website = lead.website;
        companyProperties.numberofemployees = lead.company_size;
        
        if (lead.contact_name) {
          const nameParts = lead.contact_name.split(' ');
          contactProperties.firstname = nameParts[0];
          contactProperties.lastname = nameParts.slice(1).join(' ') || nameParts[0];
        }
        contactProperties.email = lead.verified_email;
        contactProperties.phone = lead.direct_phone;
        contactProperties.jobtitle = lead.contact_title;
        
        // Apply custom field mappings
        fieldMappings.forEach(mapping => {
          const value = lead[mapping.base44_field];
          if (value !== undefined && value !== null) {
            if (mapping.crm_field.startsWith('contact_')) {
              contactProperties[mapping.crm_field.replace('contact_', '')] = value;
            } else {
              companyProperties[mapping.crm_field] = value;
            }
          }
        });
        
        // Create or update company in HubSpot
        let companyId;
        const searchResponse = await fetch(
          'https://api.hubapi.com/crm/v3/objects/companies/search',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              filterGroups: [{
                filters: [{
                  propertyName: 'name',
                  operator: 'EQ',
                  value: lead.company_name
                }]
              }]
            })
          }
        );
        
        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
          // Update existing company
          companyId = searchData.results[0].id;
          await fetch(
            `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ properties: companyProperties })
            }
          );
        } else {
          // Create new company
          const createResponse = await fetch(
            'https://api.hubapi.com/crm/v3/objects/companies',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ properties: companyProperties })
            }
          );
          const createData = await createResponse.json();
          companyId = createData.id;
        }
        
        // Create or update contact if email exists
        if (lead.verified_email) {
          const contactSearchResponse = await fetch(
            'https://api.hubapi.com/crm/v3/objects/contacts/search',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                filterGroups: [{
                  filters: [{
                    propertyName: 'email',
                    operator: 'EQ',
                    value: lead.verified_email
                  }]
                }]
              })
            }
          );
          
          const contactSearchData = await contactSearchResponse.json();
          
          if (contactSearchData.results && contactSearchData.results.length > 0) {
            // Update existing contact
            const contactId = contactSearchData.results[0].id;
            await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ properties: contactProperties })
              }
            );
            
            // Associate contact with company
            await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              }
            );
          } else {
            // Create new contact
            const createContactResponse = await fetch(
              'https://api.hubapi.com/crm/v3/objects/contacts',
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ properties: contactProperties })
              }
            );
            const contactData = await createContactResponse.json();
            
            // Associate contact with company
            await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactData.id}/associations/companies/${companyId}/contact_to_company`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              }
            );
          }
        }
        
        results.synced.push({
          company: lead.company_name,
          hubspot_company_id: companyId
        });
        
      } catch (error) {
        console.error(`Error syncing ${lead.company_name}:`, error);
        results.errors.push({
          company: lead.company_name,
          error: error.message
        });
      }
    }
    
    // Update connection stats
    await base44.asServiceRole.entities.CRMConnection.update(connection.id, {
      last_sync: new Date().toISOString(),
      sync_stats: {
        total_synced: (connection.sync_stats?.total_synced || 0) + results.synced.length,
        last_sync_count: results.synced.length,
        errors: (connection.sync_stats?.errors || 0) + results.errors.length
      }
    });
    
    // Create sync history record
    await base44.asServiceRole.entities.CRMSyncHistory.create({
      connection_id: connection.id,
      crm_type: 'hubspot',
      sync_direction: 'to_crm',
      status: results.errors.length === 0 ? 'success' : (results.synced.length > 0 ? 'partial' : 'failed'),
      records_synced: results.synced.length,
      records_created: 0,
      records_updated: results.synced.length,
      records_failed: results.errors.length,
      duration_ms: Date.now() - startTime,
      error_details: results.errors.map(e => ({ record: e.company, error: e.error }))
    });
    
    return Response.json({
      success: true,
      synced: results.synced.length,
      errors: results.errors.length,
      details: results
    });
    
  } catch (error) {
    console.error('Error in syncToHubSpot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});