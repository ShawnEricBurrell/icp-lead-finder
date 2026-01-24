import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Phone, Linkedin, Globe, MapPin, Building2,
  Clock, CheckCircle2, AlertCircle, TrendingUp, Users,
  ExternalLink, Copy, Check, MessageSquare, Send, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreBadge from './ScoreBadge';
import EmailDrafter from './EmailDrafter';
import FollowUpSequence from './FollowUpSequence';
import ScoreHistory from './ScoreHistory';

export default function LeadDetailsModal({ lead, isOpen, onClose, onSave }) {
  const [notes, setNotes] = useState(lead?.notes || '');
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !lead) return null;

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveNotes = () => {
    onSave({ ...lead, notes });
  };

  const scoreBreakdown = lead.score_breakdown || {
    growth: 0,
    techStack: 0,
    digitalPresence: 0
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {lead.company_name?.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{lead.company_name}</h2>
                <div className="flex items-center gap-3 text-blue-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {lead.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {lead.industry}
                  </span>
                </div>
              </div>
              <ScoreBadge score={lead.lead_score} size="large" />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-0 h-auto p-0 gap-4">
                <TabsTrigger 
                  value="details"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3"
                >
                  Lead Details
                </TabsTrigger>
                <TabsTrigger 
                  value="email"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Email Outreach
                  {lead.email_status !== 'not_sent' && (
                    <Badge className="bg-green-100 text-green-700 ml-1">
                      {lead.email_status === 'sent' && 'Sent'}
                      {lead.email_status === 'opened' && 'Opened'}
                      {lead.email_status === 'replied' && 'Replied'}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="followups"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Follow-Ups
                  {lead.follow_up_sequence?.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 ml-1">
                      {lead.follow_up_sequence.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="scoring"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Score History
                  {lead.score_history?.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 ml-1">
                      {lead.score_history.length}
                    </Badge>
                  )}
                </TabsTrigger>
                </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <Tabs value={activeTab}>
              <TabsContent value="details" className="space-y-6 m-0">
            {/* Pain Point */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Timer Pain Point</h3>
                  <p className="text-amber-900 leading-relaxed">{lead.timer_pain_point}</p>
                </div>
              </div>
              
              {lead.pain_points && lead.pain_points.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200/50">
                  <p className="text-sm font-medium text-amber-700 mb-2">All Pain Points:</p>
                  <ul className="space-y-2">
                    {lead.pain_points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Score Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{scoreBreakdown.growth || 0}</div>
                  <p className="text-sm text-gray-500 mt-1">Growth Signals</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{scoreBreakdown.techStack || 0}</div>
                  <p className="text-sm text-gray-500 mt-1">Tech Stack</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">{scoreBreakdown.digitalPresence || 0}</div>
                  <p className="text-sm text-gray-500 mt-1">Digital Presence</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Contact Name</p>
                  <p className="font-semibold text-gray-900">{lead.contact_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{lead.contact_title || 'Not specified'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Company Size</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{lead.company_size || 'Unknown'}</span>
                  </div>
                </div>

                {lead.verified_email && (
                  <div className="p-4 bg-gray-50 rounded-xl group">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">Email</p>
                    <div className="flex items-center justify-between">
                      <a href={`mailto:${lead.verified_email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">{lead.verified_email}</span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(lead.verified_email, 'email')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {copied === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                )}

                {lead.direct_phone && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">Phone</p>
                    <div className="flex items-center justify-between">
                      <a href={`tel:${lead.direct_phone}`} className="flex items-center gap-2 text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{lead.direct_phone}</span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(lead.direct_phone, 'phone')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {copied === 'phone' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {lead.linkedin_url && (
                  <a
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {lead.website && (
                  <a
                    href={`https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {lead.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            {lead.tech_stack && lead.tech_stack.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.tech_stack.map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  Notes
                </h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="min-h-[100px] resize-none"
                />
              </div>
              </TabsContent>

              <TabsContent value="email" className="m-0">
                <EmailDrafter 
                  lead={lead} 
                  onSave={onSave}
                  onEmailSent={(updatedLead) => {
                    onSave(updatedLead);
                    setActiveTab('details');
                  }}
                />
              </TabsContent>

              <TabsContent value="followups" className="m-0">
                <FollowUpSequence 
                  lead={lead}
                  initialEmail={{ subject: lead.email_subject, body: lead.email_draft }}
                  onSave={onSave}
                />
              </TabsContent>

              <TabsContent value="scoring" className="m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">AI-Powered Lead Score Evolution</h3>
                    <p className="text-sm text-gray-500">
                      Track how this lead's score changes based on engagement and AI analysis
                    </p>
                  </div>

                  {lead.last_score_update && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Last Updated:</span>{' '}
                        {new Date(lead.last_score_update).toLocaleDateString()} at{' '}
                        {new Date(lead.last_score_update).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Scores are automatically updated daily based on engagement patterns
                      </p>
                    </div>
                  )}

                  <ScoreHistory 
                    scoreHistory={lead.score_history} 
                    currentScore={lead.lead_score}
                  />
                </div>
              </TabsContent>
              </Tabs>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <Badge 
              variant="secondary" 
              className={`${lead.contacted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {lead.contacted ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Contacted</>
              ) : (
                'Not Contacted'
              )}
            </Badge>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSaveNotes} className="bg-blue-600 hover:bg-blue-700">
                Save Notes
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}