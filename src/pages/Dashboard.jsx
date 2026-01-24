import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Search, Target, TrendingUp, Users, Clock, Filter,
  CheckCircle2, Mail, Phone, MoreVertical, Trash2,
  MessageSquare, ExternalLink, Building2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import LeadDetailsModal from '@/components/leads/LeadDetailsModal';
import ScoreBadge from '@/components/leads/ScoreBadge';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100)
  });

  const { data: searches = [] } = useQuery({
    queryKey: ['searches'],
    queryFn: () => base44.entities.Search.list('-created_date', 10)
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated');
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
    }
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    contacted: leads.filter(l => l.contacted).length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    avgScore: leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length)
      : 0
  };

  const handleStatusChange = (lead, newStatus) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { 
        status: newStatus,
        contacted: newStatus !== 'new',
        contact_date: newStatus !== 'new' ? new Date().toISOString() : null
      }
    });
  };

  const handleSaveLead = (updatedLead) => {
    updateLeadMutation.mutate({
      id: updatedLead.id,
      data: updatedLead
    });
    setSelectedLead(updatedLead);
  };

  const getStatusBadge = (status) => {
    const configs = {
      new: { class: 'bg-blue-100 text-blue-700', label: 'New' },
      contacted: { class: 'bg-yellow-100 text-yellow-700', label: 'Contacted' },
      qualified: { class: 'bg-green-100 text-green-700', label: 'Qualified' },
      converted: { class: 'bg-purple-100 text-purple-700', label: 'Converted' },
      archived: { class: 'bg-gray-100 text-gray-600', label: 'Archived' }
    };
    const config = configs[status] || configs.new;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Dashboard</h1>
            <p className="text-gray-500">Manage and track your saved leads</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-500 font-medium">Total Leads</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-500 font-medium">Contacted</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.contacted}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-500 font-medium">Qualified</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.qualified}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-gray-500 font-medium">Avg Score</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
          </div>
        </motion.div>

        {/* Recent Searches */}
        {searches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {searches.slice(0, 8).map((search, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 py-2 px-4"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {search.city} • {search.industry}
                  <span className="ml-2 text-gray-400">({search.results_count} results)</span>
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search leads by company or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-12 rounded-xl">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-4">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No leads found</h3>
              <p className="text-gray-500">Search for leads on the home page to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pain Point</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {lead.company_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{lead.company_name}</p>
                            <p className="text-sm text-gray-500">{lead.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{lead.contact_name}</p>
                        <p className="text-sm text-gray-500">{lead.contact_title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ScoreBadge score={lead.lead_score} />
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">{lead.timer_pain_point}</p>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {lead.verified_email && (
                            <a
                              href={`mailto:${lead.verified_email}`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Mail className="w-4 h-4 text-gray-400" />
                            </a>
                          )}
                          {lead.direct_phone && (
                            <a
                              href={`tel:${lead.direct_phone}`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Phone className="w-4 h-4 text-gray-400" />
                            </a>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(lead, 'contacted')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead, 'qualified')}>
                                <Target className="w-4 h-4 mr-2" />
                                Mark Qualified
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead, 'converted')}>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Mark Converted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteLeadMutation.mutate(lead.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onSave={handleSaveLead}
      />
    </div>
  );
}