import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeadConversionChart({ leads }) {
  // Status distribution
  const statusData = [
    { name: 'New', count: leads.filter(l => l.status === 'new').length, color: '#94a3b8' },
    { name: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: '#3b82f6' },
    { name: 'Qualified', count: leads.filter(l => l.status === 'qualified').length, color: '#10b981' },
    { name: 'Converted', count: leads.filter(l => l.status === 'converted').length, color: '#8b5cf6' },
    { name: 'Unqualified', count: leads.filter(l => l.status === 'unqualified').length, color: '#ef4444' }
  ];

  // Lead score distribution
  const scoreRanges = [
    { range: '0-20', count: leads.filter(l => l.lead_score < 20).length },
    { range: '20-40', count: leads.filter(l => l.lead_score >= 20 && l.lead_score < 40).length },
    { range: '40-60', count: leads.filter(l => l.lead_score >= 40 && l.lead_score < 60).length },
    { range: '60-80', count: leads.filter(l => l.lead_score >= 60 && l.lead_score < 80).length },
    { range: '80-100', count: leads.filter(l => l.lead_score >= 80).length }
  ];

  // Conversion funnel
  const funnelData = [
    { stage: 'Total Leads', count: leads.length, percentage: 100 },
    { stage: 'Contacted', count: leads.filter(l => l.contacted).length, percentage: leads.length > 0 ? (leads.filter(l => l.contacted).length / leads.length * 100).toFixed(1) : 0 },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified' || l.status === 'converted').length, percentage: leads.length > 0 ? (leads.filter(l => l.status === 'qualified' || l.status === 'converted').length / leads.length * 100).toFixed(1) : 0 },
    { stage: 'Converted', count: leads.filter(l => l.status === 'converted').length, percentage: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length * 100).toFixed(1) : 0 }
  ];

  const avgScore = leads.length > 0 
    ? (leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Lead Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{avgScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {leads.filter(l => l.status === 'converted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {leads.length > 0 
                ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            {funnelData.map((stage, idx) => (
              <div key={idx}>
                <div className="text-2xl font-bold text-gray-900">{stage.percentage}%</div>
                <div className="text-sm text-gray-500">{stage.stage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}