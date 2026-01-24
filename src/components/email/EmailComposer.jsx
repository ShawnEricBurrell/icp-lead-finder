import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Calendar, Sparkles, Clock, Loader2, Save, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export default function EmailComposer({ lead, onClose, onEmailSent }) {
  const [subject, setSubject] = useState(lead.email_subject || '');
  const [body, setBody] = useState(lead.email_draft || '');
  const [scheduleFor, setScheduleFor] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [optimalTime, setOptimalTime] = useState(null);
  const [alternativeSubjects, setAlternativeSubjects] = useState([]);

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list()
  });

  const generateContent = async (templateId = null) => {
    setGenerating(true);
    try {
      const result = await base44.functions.invoke('generateEmailContent', {
        lead_id: lead.id,
        template_id: templateId,
        email_type: 'initial_outreach'
      });

      setSubject(result.data.subject);
      setBody(result.data.body);
      setOptimalTime(result.data.optimal_send_time);
      setAlternativeSubjects(result.data.alternative_subjects || []);
      toast.success('AI-generated email content ready!');
    } catch (error) {
      toast.error('Failed to generate content: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('sendLeadEmail', {
        lead_id: lead.id,
        subject,
        body,
        schedule_for: scheduleFor || null
      });
    },
    onSuccess: (response) => {
      if (response.data.scheduled) {
        toast.success(`Email scheduled for ${new Date(scheduleFor).toLocaleString()}`);
      } else {
        toast.success('Email sent successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onEmailSent && onEmailSent({ ...lead, email_status: 'sent' });
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to send email: ' + error.message);
    }
  });

  const applyOptimalTime = () => {
    if (!optimalTime) return;
    
    const now = new Date();
    const daysMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };
    const targetDay = daysMap[optimalTime.day] || 2;
    const currentDay = now.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);
    scheduledDate.setHours(optimalTime.hour, 0, 0, 0);
    
    setScheduleFor(scheduledDate.toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-4">
      {/* AI Generate Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">AI-Powered Email</h4>
          </div>
          <Button
            onClick={() => generateContent(selectedTemplate)}
            disabled={generating}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
        
        {optimalTime && (
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm text-gray-900">Optimal Send Time</span>
                </div>
                <p className="text-sm text-gray-700">
                  {optimalTime.day} at {optimalTime.hour}:00
                </p>
                <p className="text-xs text-gray-500 mt-1">{optimalTime.reason}</p>
              </div>
              <Button
                onClick={applyOptimalTime}
                variant="outline"
                size="sm"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Template Selection */}
      {templates.length > 0 && (
        <div>
          <Label>Use Template (Optional)</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} 
                  {template.success_rate && (
                    <Badge className="ml-2 bg-green-100 text-green-700">
                      {template.success_rate.toFixed(0)}% success
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Subject Line */}
      <div>
        <Label>Subject Line</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject"
        />
        {alternativeSubjects.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">Try these alternatives:</p>
            {alternativeSubjects.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => setSubject(alt)}
                className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 rounded px-2 py-1 text-gray-700"
              >
                {alt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Email Body */}
      <div>
        <Label>Email Body</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email..."
          className="min-h-[250px] font-sans"
        />
        <p className="text-xs text-gray-500 mt-1">
          {body.split(' ').length} words
        </p>
      </div>

      {/* Schedule Section */}
      <div>
        <Label className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Send (Optional)
        </Label>
        <Input
          type="datetime-local"
          value={scheduleFor}
          onChange={(e) => setScheduleFor(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
        />
        {scheduleFor && (
          <p className="text-xs text-gray-500 mt-1">
            Will send on {new Date(scheduleFor).toLocaleString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={() => sendEmailMutation.mutate()}
          disabled={!subject || !body || sendEmailMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {sendEmailMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {scheduleFor ? 'Scheduling...' : 'Sending...'}
            </>
          ) : (
            <>
              {scheduleFor ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {scheduleFor ? 'Schedule Email' : 'Send Now'}
            </>
          )}
        </Button>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}