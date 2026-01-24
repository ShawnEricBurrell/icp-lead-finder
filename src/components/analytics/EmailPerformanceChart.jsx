import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailPerformanceChart({ leads }) {
  const emailStats = {
    not_sent: leads.filter(l => l.email_status === 'not_sent').length,
    sent: leads.filter(l => l.email_status === 'sent').length,
    opened: leads.filter(l => l.email_status === 'opened').length,
    replied: leads.filter(l => l.email_status === 'replied').length
  };

  const pieData = [
    { name: 'Not Sent', value: emailStats.not_sent, color: '#94a3b8' },
    { name: 'Sent', value: emailStats.sent, color: '#3b82f6' },
    { name: 'Opened', value: emailStats.opened, color: '#10b981' },
    { name: 'Replied', value: emailStats.replied, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  // Group by week
  const weeklyData = leads.reduce((acc, lead) => {
    if (lead.email_sent_date) {
      const week = new Date(lead.email_sent_date).toLocaleDateString();
      if (!acc[week]) {
        acc[week] = { week, sent: 0, opened: 0, replied: 0 };
      }
      acc[week].sent++;
      if (lead.email_status === 'opened' || lead.email_status === 'replied') {
        acc[week].opened++;
      }
      if (lead.email_status === 'replied') {
        acc[week].replied++;
      }
    }
    return acc;
  }, {});

  const timelineData = Object.values(weeklyData).sort((a, b) => 
    new Date(a.week) - new Date(b.week)
  ).slice(-10);

  const totalSent = emailStats.sent + emailStats.opened + emailStats.replied;
  const openRate = totalSent > 0 ? ((emailStats.opened + emailStats.replied) / totalSent * 100).toFixed(1) : 0;
  const replyRate = totalSent > 0 ? (emailStats.replied / totalSent * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{openRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reply Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{replyRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No email data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                  <Bar dataKey="opened" fill="#10b981" name="Opened" />
                  <Bar dataKey="replied" fill="#8b5cf6" name="Replied" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No timeline data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}