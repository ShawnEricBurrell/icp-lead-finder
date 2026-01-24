import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Mail } from 'lucide-react';

export default function TemplatePerformanceChart({ templates, leads }) {
  // Calculate template performance based on email subjects matching
  const templateStats = templates.map(template => {
    const leadsUsingTemplate = leads.filter(l => 
      l.email_subject?.includes(template.subject.split('{{')[0].trim())
    );
    
    const sent = leadsUsingTemplate.filter(l => l.email_status !== 'not_sent').length;
    const opened = leadsUsingTemplate.filter(l => l.email_status === 'opened' || l.email_status === 'replied').length;
    const replied = leadsUsingTemplate.filter(l => l.email_status === 'replied').length;
    
    return {
      name: template.name,
      sent,
      opened,
      replied,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0,
      replyRate: sent > 0 ? ((replied / sent) * 100).toFixed(1) : 0,
      category: template.category
    };
  }).sort((a, b) => b.replyRate - a.replyRate);

  const topTemplates = templateStats.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {topTemplates.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTemplates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                <Bar dataKey="opened" fill="#10b981" name="Opened" />
                <Bar dataKey="replied" fill="#8b5cf6" name="Replied" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No template performance data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {templateStats.map((template, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div>
                      <div className="text-sm text-gray-500">Sent</div>
                      <div className="text-xl font-bold text-gray-900">{template.sent}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Opened</div>
                      <div className="text-xl font-bold text-green-600">{template.opened}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Replied</div>
                      <div className="text-xl font-bold text-purple-600">{template.replied}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Reply Rate</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-amber-600">{template.replyRate}%</div>
                        {template.replyRate > 20 && (
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}