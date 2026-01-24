import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, TrendingDown, Mail, Eye, MessageCircle, 
  Sparkles, RefreshCw, BarChart3, Lightbulb, Award
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmailPerformanceReport() {
  const [generating, setGenerating] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads-analytics'],
    queryFn: () => base44.entities.Lead.list('-created_date', 1000)
  });

  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ['email-reports'],
    queryFn: () => base44.entities.EmailReport.list('-report_date', 10)
  });

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Filter leads with email data
      const emailedLeads = leads.filter(l => l.email_status && l.email_status !== 'not_sent');
      
      if (emailedLeads.length === 0) {
        return;
      }

      const totalSent = emailedLeads.length;
      const totalOpened = emailedLeads.filter(l => l.email_status === 'opened' || l.email_status === 'replied').length;
      const totalReplied = emailedLeads.filter(l => l.email_status === 'replied').length;

      // Prepare data for AI analysis
      const performanceData = emailedLeads.map(l => ({
        subject: l.email_subject,
        status: l.email_status,
        pain_point: l.timer_pain_point,
        industry: l.industry,
        score: l.lead_score
      }));

      // Generate AI insights
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze email campaign performance data and identify winning patterns:

Total Emails Sent: ${totalSent}
Emails Opened: ${totalOpened} (${((totalOpened/totalSent)*100).toFixed(1)}%)
Emails Replied: ${totalReplied} (${((totalReplied/totalSent)*100).toFixed(1)}%)

Email Performance Data:
${JSON.stringify(performanceData, null, 2)}

Analyze and provide:
1. top_performing_subjects: 3-5 subject line patterns that led to opens/replies (look for common themes, not exact matches)
2. top_performing_patterns: 3-5 content/approach patterns that worked well
3. recommendations: 5 specific, actionable recommendations to improve open and reply rates
4. summary: A brief 2-3 paragraph analysis of what's working and what's not

Focus on patterns, not individual emails. Be specific and data-driven.`,
        response_json_schema: {
          type: "object",
          properties: {
            top_performing_subjects: {
              type: "array",
              items: { type: "string" }
            },
            top_performing_patterns: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });

      // Save report
      await base44.entities.EmailReport.create({
        report_date: new Date().toISOString(),
        period: 'Weekly',
        total_sent: totalSent,
        total_opened: totalOpened,
        total_replied: totalReplied,
        open_rate: (totalOpened / totalSent) * 100,
        reply_rate: (totalReplied / totalSent) * 100,
        insights: {
          top_performing_subjects: analysis.top_performing_subjects || [],
          top_performing_patterns: analysis.top_performing_patterns || [],
          recommendations: analysis.recommendations || []
        },
        ai_analysis: analysis.summary
      });

      refetchReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const latestReport = reports[0];
  const emailedLeads = leads.filter(l => l.email_status && l.email_status !== 'not_sent');

  const stats = {
    sent: emailedLeads.length,
    opened: emailedLeads.filter(l => l.email_status === 'opened' || l.email_status === 'replied').length,
    replied: emailedLeads.filter(l => l.email_status === 'replied').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Email Performance Analytics
          </h2>
          <p className="text-gray-500 mt-1">AI-powered insights into your outreach campaigns</p>
        </div>
        <Button
          onClick={generateReport}
          disabled={generating || stats.sent === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 font-medium">Emails Sent</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-xl">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 font-medium">Open Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">{stats.opened} opens</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-xl">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-500 font-medium">Reply Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">{stats.replied} replies</p>
        </motion.div>
      </div>

      {/* Latest Report */}
      {latestReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {latestReport.period} Performance Report
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generated on {new Date(latestReport.report_date).toLocaleDateString()}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                Latest Report
              </Badge>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-2">AI Performance Analysis</h4>
                  <p className="text-purple-800 leading-relaxed whitespace-pre-wrap">
                    {latestReport.ai_analysis}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Performing Patterns */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Performing Subject Lines
              </h4>
              <div className="space-y-2">
                {latestReport.insights?.top_performing_subjects?.map((subject, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-green-800">{subject}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Patterns */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Winning Content Patterns
              </h4>
              <div className="space-y-2">
                {latestReport.insights?.top_performing_patterns?.map((pattern, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-blue-800">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Actionable Recommendations
              </h4>
              <div className="space-y-2">
                {latestReport.insights?.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-amber-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Data State */}
      {!latestReport && !generating && stats.sent === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Email Data Yet</h3>
          <p className="text-gray-500">Send some emails to start generating performance reports</p>
        </div>
      )}

      {!latestReport && !generating && stats.sent > 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Generate Report</h3>
          <p className="text-gray-500 mb-4">
            You have {stats.sent} sent emails. Generate an AI-powered performance report.
          </p>
          <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      )}

      {/* Previous Reports */}
      {reports.length > 1 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Previous Reports</h3>
          <div className="space-y-2">
            {reports.slice(1).map((report, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{report.period} Report</p>
                  <p className="text-sm text-gray-500">
                    {new Date(report.report_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Open Rate:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {report.open_rate?.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reply Rate:</span>
                    <span className="ml-2 font-semibold text-purple-600">
                      {report.reply_rate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}