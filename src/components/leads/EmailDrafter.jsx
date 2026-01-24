import React, { useState } from 'react';
import EmailComposer from '../email/EmailComposer';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Send, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';

export default function EmailDrafter({ lead, onSave, onEmailSent }) {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(lead.email_subject || '');
  const [emailBody, setEmailBody] = useState(lead.email_draft || '');
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional sales outreach specialist. Write a personalized, compelling cold email for the following lead:

Company: ${lead.company_name}
Industry: ${lead.industry}
Location: ${lead.location}
Contact Name: ${lead.contact_name}
Contact Title: ${lead.contact_title}
Pain Points: ${lead.pain_points?.join(', ') || lead.timer_pain_point}
Primary Pain Point: ${lead.timer_pain_point}

The email should:
1. Be professional yet conversational
2. Reference their specific pain point naturally
3. Offer rapid website development services as a solution
4. Include a clear call-to-action
5. Be concise (3-4 short paragraphs max)
6. Not be overly salesy or pushy

Return ONLY the email subject and body, formatted as:
SUBJECT: [compelling subject line]
BODY: [email body]`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      setSubject(result.subject);
      setEmailBody(result.body);
    } catch (err) {
      console.error('Failed to generate email:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...lead,
      email_subject: subject,
      email_draft: emailBody
    });
  };

  const handleSendEmail = () => {
    const updatedLead = {
      ...lead,
      email_subject: subject,
      email_draft: emailBody,
      email_status: 'sent',
      email_sent_date: new Date().toISOString(),
      contacted: true,
      contact_date: new Date().toISOString()
    };
    onEmailSent(updatedLead);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    const configs = {
      not_sent: { class: 'bg-gray-100 text-gray-600', label: 'Not Sent' },
      sent: { class: 'bg-blue-100 text-blue-700', label: 'Sent' },
      opened: { class: 'bg-green-100 text-green-700', label: 'Opened' },
      replied: { class: 'bg-purple-100 text-purple-700', label: 'Replied' }
    };
    const config = configs[lead.email_status || 'not_sent'];
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Email Drafter</h3>
            <p className="text-sm text-gray-500">Generate personalized outreach emails</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Generate Button */}
      {!emailBody && !loading && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Generate AI Email</h4>
          <p className="text-sm text-gray-500 mb-4">
            Create a personalized email based on this lead's pain points
          </p>
          <Button onClick={generateEmail} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Email
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Crafting personalized email...</p>
        </div>
      )}

      {/* Email Editor */}
      {emailBody && !loading && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject Line</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Body</Label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="min-h-[300px] font-sans leading-relaxed"
              placeholder="Email body..."
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preview</div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">To: </span>
                <span className="text-sm text-gray-900">{lead.contact_name} ({lead.verified_email})</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Subject: </span>
                <span className="text-sm text-gray-900 font-medium">{subject}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {emailBody}
                </div>
              </div>
            </div>
          </div>

          {/* Email Status Timeline */}
          {lead.email_status !== 'not_sent' && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-sm font-semibold text-blue-800 mb-3">Email Timeline</div>
              <div className="space-y-2">
                {lead.email_sent_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-blue-700 font-medium">Sent:</span>
                    <span className="text-blue-600">{new Date(lead.email_sent_date).toLocaleString()}</span>
                  </div>
                )}
                {lead.email_opened_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span className="text-green-700 font-medium">Opened:</span>
                    <span className="text-green-600">{new Date(lead.email_opened_date).toLocaleString()}</span>
                  </div>
                )}
                {lead.email_replied_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span className="text-purple-700 font-medium">Replied:</span>
                    <span className="text-purple-600">{new Date(lead.email_replied_date).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={generateEmail}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              className="flex items-center gap-2"
            >
              Save Draft
            </Button>
            {lead.email_status === 'not_sent' && (
              <Button
                onClick={handleSendEmail}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2 ml-auto"
              >
                <Send className="w-4 h-4" />
                Mark as Sent
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}