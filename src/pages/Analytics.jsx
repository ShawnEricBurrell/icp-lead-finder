import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Mail, Zap, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SyncAnalyticsChart from '@/components/analytics/SyncAnalyticsChart';
import EmailPerformanceChart from '@/components/analytics/EmailPerformanceChart';
import LeadConversionChart from '@/components/analytics/LeadConversionChart';
import TemplatePerformanceChart from '@/components/analytics/TemplatePerformanceChart';

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [crmFilter, setCrmFilter] = useState('all');

  const { data: syncHistory = [] } = useQuery({
    queryKey: ['crm-sync-history'],
    queryFn: () => base44.entities.CRMSyncHistory.list('-created_date', 100)
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list()
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list()
  });

  const { data: scheduledEmails = [] } = useQuery({
    queryKey: ['scheduled-emails'],
    queryFn: () => base44.entities.ScheduledEmail.list()
  });

  const hasAnyData = syncHistory.length > 0 || leads.length > 0 || templates.length > 0;

  // Filter data by date range
  const filteredSyncHistory = syncHistory.filter(sync => {
    const syncDate = new Date(sync.created_date);
    return syncDate >= new Date(dateRange.start) && syncDate <= new Date(dateRange.end);
  });

  const filteredLeads = leads.filter(lead => {
    const leadDate = new Date(lead.created_date);
    return leadDate >= new Date(dateRange.start) && leadDate <= new Date(dateRange.end);
  });

  // Calculate key metrics
  const totalSyncs = filteredSyncHistory.length;
  const successfulSyncs = filteredSyncHistory.filter(s => s.status === 'success').length;
  const totalLeads = filteredLeads.length;
  const convertedLeads = filteredLeads.filter(l => l.status === 'converted').length;
  const emailsSent = filteredLeads.filter(l => l.email_status !== 'not_sent').length;
  const emailsOpened = filteredLeads.filter(l => l.email_status === 'opened' || l.email_status === 'replied').length;
  const emailsReplied = filteredLeads.filter(l => l.email_status === 'replied').length;

  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
  const openRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : 0;
  const replyRate = emailsSent > 0 ? ((emailsReplied / emailsSent) * 100).toFixed(1) : 0;

  const statCards = [
    { icon: Zap, label: 'Total Syncs', value: totalSyncs, color: 'blue' },
    { icon: TrendingUp, label: 'Conversion Rate', value: `${conversionRate}%`, color: 'green' },
    { icon: Mail, label: 'Email Open Rate', value: `${openRate}%`, color: 'purple' },
    { icon: BarChart3, label: 'Email Reply Rate', value: `${replyRate}%`, color: 'amber' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track CRM sync performance and email outreach metrics</p>
        </div>

        {/* Empty State */}
        {!hasAnyData && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Analytics will appear here</h3>
            <p className="text-gray-500">
              Analytics data will show once you have leads and email activity
            </p>
          </div>
        )}

        {/* Filters */}
        {hasAnyData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                max={dateRange.end}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                min={dateRange.start}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>CRM Filter</Label>
              <Select value={crmFilter} onValueChange={setCrmFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CRMs</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="salesforce">Salesforce</SelectItem>
                  <SelectItem value="zoho">Zoho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 bg-${stat.color}-100 rounded-xl`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="sync" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sync">CRM Sync</TabsTrigger>
            <TabsTrigger value="email">Email Performance</TabsTrigger>
            <TabsTrigger value="conversion">Lead Conversion</TabsTrigger>
            <TabsTrigger value="templates">Top Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="sync">
            <SyncAnalyticsChart 
              syncHistory={filteredSyncHistory}
              crmFilter={crmFilter}
            />
          </TabsContent>

          <TabsContent value="email">
            <EmailPerformanceChart 
              leads={filteredLeads}
            />
          </TabsContent>

          <TabsContent value="conversion">
            <LeadConversionChart 
              leads={filteredLeads}
            />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatePerformanceChart 
              templates={templates}
              leads={filteredLeads}
            />
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}