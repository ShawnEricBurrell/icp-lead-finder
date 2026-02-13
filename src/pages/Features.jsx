import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Database, Zap, Mail, BarChart3, Calendar, 
  Code, Settings, Sparkles, TrendingUp, Users, Globe,
  FileText, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Features() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const frontendFeatures = [
    {
      category: "Lead Generation & Discovery",
      icon: Search,
      color: "blue",
      features: [
        "AI-powered lead search by city and industry",
        "Intelligent lead scoring (0-100 scale)",
        "Pain point identification and analysis",
        "Real-time lead enrichment with contact data",
        "Company profile aggregation",
        "Tech stack detection",
        "Growth signal analysis"
      ]
    },
    {
      category: "Lead Management Dashboard",
      icon: Database,
      color: "purple",
      features: [
        "Comprehensive lead database view",
        "Advanced filtering by status, score, and attributes",
        "Multi-status pipeline (new, contacted, qualified, converted)",
        "Bulk operations support",
        "Lead detail modal with full context",
        "Notes and activity tracking",
        "Contact history timeline"
      ]
    },
    {
      category: "Email Outreach System",
      icon: Mail,
      color: "green",
      features: [
        "AI-generated personalized emails",
        "Email template library",
        "Email composer with preview",
        "Follow-up sequence builder",
        "Optimal send time suggestions",
        "Email status tracking (sent, opened, replied)",
        "Template performance analytics"
      ]
    },
    {
      category: "Analytics & Reporting",
      icon: BarChart3,
      color: "amber",
      features: [
        "Real-time metrics dashboard",
        "CRM sync analytics with charts",
        "Email performance tracking",
        "Lead conversion funnel visualization",
        "Template effectiveness comparison",
        "Date range filtering",
        "Exportable reports"
      ]
    },
    {
      category: "CRM Integration",
      icon: Settings,
      color: "indigo",
      features: [
        "HubSpot bidirectional sync",
        "Custom field mapping",
        "Sync history tracking",
        "Manual and automated sync",
        "Connection status monitoring",
        "Error tracking and resolution",
        "Multi-CRM support ready (Salesforce, Zoho)"
      ]
    }
  ];

  const backendCapabilities = [
    {
      name: "AI Lead Generation",
      function: "InvokeLLM Integration",
      description: "Generates enriched lead data using AI with web search context",
      features: [
        "Real-time web data scraping",
        "Company information extraction",
        "Pain point analysis",
        "Lead scoring algorithm",
        "Structured JSON output"
      ]
    },
    {
      name: "Email Content Generation",
      function: "generateEmailContent",
      description: "AI-powered email drafting with personalization",
      features: [
        "Context-aware messaging",
        "Pain point references",
        "Call-to-action optimization",
        "Subject line generation",
        "Template variable replacement"
      ]
    },
    {
      name: "CRM Synchronization",
      function: "syncToHubSpot / syncFromHubSpot",
      description: "Bidirectional data sync with CRM platforms",
      features: [
        "Field mapping engine",
        "Duplicate detection",
        "Incremental updates",
        "Error handling and logging",
        "Batch processing"
      ]
    },
    {
      name: "Email Automation",
      function: "processScheduledEmails",
      description: "Scheduled email sending automation",
      features: [
        "Queue management",
        "Send time optimization",
        "Tracking ID generation",
        "Failure retry logic",
        "Status updates"
      ]
    },
    {
      name: "Sales Cadence Automation",
      function: "processSalesCadence",
      description: "Automated follow-up sequence execution",
      features: [
        "Multi-step sequences",
        "Timing control",
        "Engagement tracking",
        "Auto-pause on reply",
        "Performance metrics"
      ]
    },
    {
      name: "Lead Scoring AI",
      function: "updateLeadScores",
      description: "AI-driven lead score updates based on engagement",
      features: [
        "Engagement analysis",
        "Score history tracking",
        "Reason documentation",
        "Automated daily updates",
        "Trend detection"
      ]
    },
    {
      name: "Lead Insights Generator",
      function: "generateLeadInsights",
      description: "AI-generated strategic insights and predictions",
      features: [
        "Conversion probability",
        "Industry trend analysis",
        "Strategy recommendations",
        "Timeline predictions",
        "Executive summaries"
      ]
    },
    {
      name: "Lead Qualification",
      function: "qualifyLeads",
      description: "Automated lead qualification using AI",
      features: [
        "Multi-criteria evaluation",
        "Qualification reasoning",
        "Batch processing",
        "Status automation",
        "Priority assignment"
      ]
    }
  ];

  const dataEntities = [
    {
      name: "Lead",
      description: "Core lead records with comprehensive business data",
      fields: [
        "company_name, industry, location",
        "lead_score, timer_pain_point, pain_points",
        "contact_name, contact_title, verified_email",
        "email_status, email_sent_date, follow_up_sequence",
        "cadence_active, engagement_score",
        "status, notes, tech_stack"
      ]
    },
    {
      name: "EmailTemplate",
      description: "Reusable email templates with performance tracking",
      fields: [
        "name, subject, body",
        "category (initial_outreach, follow_up, etc.)",
        "use_count, success_rate"
      ]
    },
    {
      name: "CRMConnection",
      description: "CRM integration configuration",
      fields: [
        "crm_type (hubspot, salesforce, zoho)",
        "is_active, sync_direction",
        "field_mappings, last_sync, sync_stats"
      ]
    },
    {
      name: "CRMSyncHistory",
      description: "Detailed sync operation logs",
      fields: [
        "connection_id, crm_type, sync_direction",
        "status, records_synced, records_created",
        "duration_ms, error_details"
      ]
    },
    {
      name: "ScheduledEmail",
      description: "Email queue and tracking",
      fields: [
        "lead_id, to_email, subject, body",
        "scheduled_for, status",
        "tracking_id, sent_at"
      ]
    },
    {
      name: "LeadInsight",
      description: "AI-generated strategic insights",
      fields: [
        "conversion_predictions, industry_trends",
        "optimal_strategies, ai_summary"
      ]
    },
    {
      name: "EmailReport",
      description: "Email performance analytics",
      fields: [
        "period, total_sent, total_opened",
        "open_rate, reply_rate, insights, ai_analysis"
      ]
    }
  ];

  const automations = [
    {
      name: "Daily CRM Sync",
      type: "Scheduled",
      schedule: "Every day at 2:00 AM",
      description: "Automatically syncs leads to HubSpot CRM"
    },
    {
      name: "Email Processing",
      type: "Scheduled",
      schedule: "Every 5 minutes",
      description: "Processes and sends scheduled emails"
    },
    {
      name: "Sales Cadence",
      type: "Scheduled",
      schedule: "Every hour",
      description: "Processes automated follow-up sequences"
    },
    {
      name: "Lead Score Updates",
      type: "Scheduled",
      schedule: "Daily at 3:00 AM",
      description: "AI updates lead scores based on engagement"
    },
    {
      name: "Weekly Insights",
      type: "Scheduled",
      schedule: "Every Sunday at 8:00 AM",
      description: "Generates AI insights and predictions"
    }
  ];

  const techStack = [
    { category: "Frontend", items: ["React 18", "Tailwind CSS", "Framer Motion", "Recharts", "Shadcn UI"] },
    { category: "Backend", items: ["Deno Runtime", "Base44 SDK", "OpenAI API", "HubSpot API"] },
    { category: "Database", items: ["Base44 Entities", "Real-time Subscriptions", "Query Optimization"] },
    { category: "Integrations", items: ["HubSpot CRM", "AI (InvokeLLM)", "Email Service", "File Upload"] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block p-3 bg-blue-100 rounded-2xl mb-4"
          >
            <FileText className="w-12 h-12 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Technical Features & Capabilities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive documentation of the ICP Lead Finder platform - 
            AI-powered lead generation and sales automation system
          </p>
        </div>

        <Tabs defaultValue="frontend" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="data">Data Model</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="tech">Tech Stack</TabsTrigger>
          </TabsList>

          {/* Frontend Features */}
          <TabsContent value="frontend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-blue-600" />
                  Frontend Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Modern React-based user interface with real-time updates, 
                  responsive design, and comprehensive lead management tools.
                </p>
                <div className="space-y-4">
                  {frontendFeatures.map((module, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card>
                        <CardHeader 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleSection(`frontend-${idx}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-${module.color}-100 rounded-xl`}>
                                <module.icon className={`w-5 h-5 text-${module.color}-600`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{module.category}</CardTitle>
                                <p className="text-sm text-gray-500">{module.features.length} features</p>
                              </div>
                            </div>
                            {expandedSection === `frontend-${idx}` ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                        {expandedSection === `frontend-${idx}` && (
                          <CardContent>
                            <ul className="space-y-2">
                              {module.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                  <span className="text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backend Capabilities */}
          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  Backend Functions & APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Serverless backend functions powered by Deno runtime with 
                  AI integrations, CRM sync, and automated workflows.
                </p>
                <div className="space-y-4">
                  {backendCapabilities.map((func, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card>
                        <CardHeader 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleSection(`backend-${idx}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{func.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {func.function}
                                </Badge>
                                <p className="text-sm text-gray-500">{func.description}</p>
                              </div>
                            </div>
                            {expandedSection === `backend-${idx}` ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                        {expandedSection === `backend-${idx}` && (
                          <CardContent>
                            <ul className="space-y-2">
                              {func.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                                  <span className="text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Model */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-green-600" />
                  Data Entities & Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Comprehensive data model with {dataEntities.length} entities 
                  supporting the entire lead-to-conversion workflow.
                </p>
                <div className="space-y-4">
                  {dataEntities.map((entity, idx) => (
                    <Card key={idx}>
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection(`entity-${idx}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{entity.name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                          </div>
                          {expandedSection === `entity-${idx}` ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedSection === `entity-${idx}` && (
                        <CardContent>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Key Fields:</h4>
                            <ul className="space-y-1">
                              {entity.fields.map((field, fIdx) => (
                                <li key={fIdx} className="text-sm text-gray-600 font-mono">
                                  {field}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automations */}
          <TabsContent value="automations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  Scheduled Automations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  {automations.length} automated workflows running on schedules 
                  to keep data synchronized and processes flowing.
                </p>
                <div className="grid gap-4">
                  {automations.map((automation, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Zap className="w-5 h-5 text-amber-600" />
                              <h4 className="font-semibold text-gray-900">{automation.name}</h4>
                              <Badge variant="outline">{automation.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">{automation.schedule}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tech Stack */}
          <TabsContent value="tech" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-indigo-600" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {techStack.map((stack, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{stack.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {stack.items.map((item, iIdx) => (
                            <Badge key={iIdx} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">System Architecture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Platform</h4>
                        <p className="text-gray-600">
                          Built on Base44 platform with backend-as-a-service infrastructure, 
                          providing authentication, database management, and serverless functions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">AI Integration</h4>
                        <p className="text-gray-600">
                          Leverages advanced AI models for lead generation, email drafting, 
                          scoring, and insights with real-time web search capabilities.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Real-time Updates</h4>
                        <p className="text-gray-600">
                          Uses React Query for data fetching and Base44 real-time subscriptions 
                          for live updates across the application.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Security</h4>
                        <p className="text-gray-600">
                          Role-based access control, secure API key management, 
                          OAuth integrations, and encrypted data storage.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mt-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{frontendFeatures.reduce((sum, f) => sum + f.features.length, 0)}</div>
              <div className="text-sm text-gray-600">Frontend Features</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{backendCapabilities.length}</div>
              <div className="text-sm text-gray-600">Backend Functions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{dataEntities.length}</div>
              <div className="text-sm text-gray-600">Data Entities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">{automations.length}</div>
              <div className="text-sm text-gray-600">Automations</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}