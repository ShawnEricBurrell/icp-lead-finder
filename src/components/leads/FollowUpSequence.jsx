import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Calendar, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import CadenceControls from './CadenceControls';

export default function FollowUpSequence({ lead, initialEmail, onSave }) {
  const [loading, setLoading] = useState(false);
  const [sequence, setSequence] = useState(lead.follow_up_sequence || []);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const generateSequence = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional sales follow-up specialist. Generate a sequence of 3 follow-up emails for this lead:

Company: ${lead.company_name}
Industry: ${lead.industry}
Contact: ${lead.contact_name} (${lead.contact_title})
Pain Points: ${lead.timer_pain_point}
Status: ${lead.email_status === 'sent' ? 'Email sent, no response yet' : lead.email_status === 'opened' ? 'Email opened, but no reply' : 'Not yet contacted'}

Original Email Subject: ${initialEmail?.subject || lead.email_subject}
Original Email Body: ${initialEmail?.body || lead.email_draft}

Create 3 follow-up emails that:
1. First follow-up (3 days): Gentle reminder, add value with industry insight
2. Second follow-up (7 days): Different angle, offer specific help or resource
3. Third follow-up (14 days): Final outreach, create urgency or offer alternative

Each email should:
- Be brief and respectful of their time
- Reference the original email naturally
- Add new value or perspective
- Not be pushy or desperate
- Include a clear, low-friction call-to-action

Return ONLY a JSON array with 3 follow-up emails.`,
        response_json_schema: {
          type: "object",
          properties: {
            follow_ups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" },
                  delay_days: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSequence(result.follow_ups || []);
    } catch (err) {
      console.error('Failed to generate follow-up sequence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...lead,
      follow_up_sequence: sequence
    });
  };

  const updateEmail = (index, field, value) => {
    const updated = [...sequence];
    updated[index] = { ...updated[index], [field]: value };
    setSequence(updated);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Follow-Up Sequence</h3>
          <p className="text-sm text-gray-500">AI-generated follow-up emails to increase response rate</p>
        </div>
        {sequence.length > 0 && (
          <Badge className="bg-green-100 text-green-700">
            {sequence.length} Follow-Ups
          </Badge>
        )}
      </div>

      {/* Generate Button */}
      {sequence.length === 0 && !loading && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Generate Follow-Up Sequence</h4>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Create 3 intelligent follow-up emails that reference your original outreach and add value
          </p>
          <Button onClick={generateSequence} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Sequence
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Crafting intelligent follow-up sequence...</p>
        </div>
      )}

      {/* Follow-Up Cards */}
      {sequence.length > 0 && !loading && (
        <div className="space-y-4">
          {sequence.map((email, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
            >
              {/* Collapsed Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {email.delay_days} days after {index === 0 ? 'initial email' : `follow-up ${index}`}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{email.subject}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  {expandedIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              {/* Expanded Content */}
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 p-6 space-y-4 bg-gray-50/50"
                >
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={email.subject}
                      onChange={(e) => updateEmail(index, 'subject', e.target.value)}
                      className="font-medium bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Days After Previous Email</Label>
                    <Input
                      type="number"
                      min="1"
                      value={email.delay_days}
                      onChange={(e) => updateEmail(index, 'delay_days', parseInt(e.target.value))}
                      className="w-32 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={email.body}
                      onChange={(e) => updateEmail(index, 'body', e.target.value)}
                      className="min-h-[200px] font-sans leading-relaxed bg-white"
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preview</div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">To: </span>
                        <span className="text-sm text-gray-900">{lead.contact_name} ({lead.verified_email})</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Subject: </span>
                        <span className="text-sm text-gray-900 font-medium">{email.subject}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {email.body}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={generateSequence}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Sequence
            </Button>
            <Button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Save Follow-Up Sequence
            </Button>
          </div>

          {/* Cadence Controls */}
          <CadenceControls lead={lead} onUpdate={onSave} />

          {/* Timeline Visualization */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Email Timeline
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Day 0:</span>
                  <span className="text-gray-600 ml-2">Initial email sent</span>
                </div>
              </div>
              {sequence.map((email, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Day {email.delay_days}:</span>
                    <span className="text-gray-600 ml-2">Follow-up {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}