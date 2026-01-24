import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SyncAnalyticsChart({ syncHistory, crmFilter }) {
  const filteredHistory = crmFilter === 'all' 
    ? syncHistory 
    : syncHistory.filter(s => s.crm_type === crmFilter);

  // Group by date
  const dataByDate = filteredHistory.reduce((acc, sync) => {
    const date = new Date(sync.created_date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, success: 0, partial: 0, failed: 0, total: 0 };
    }
    acc[date][sync.status]++;
    acc[date].total++;
    return acc;
  }, {});

  const chartData = Object.values(dataByDate).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const totalRecords = filteredHistory.reduce((sum, sync) => sum + sync.records_synced, 0);
  const avgDuration = filteredHistory.length > 0
    ? (filteredHistory.reduce((sum, sync) => sum + (sync.duration_ms || 0), 0) / filteredHistory.length / 1000).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Records Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Sync Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{avgDuration}s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredHistory.length > 0 
                ? ((filteredHistory.filter(s => s.status === 'success').length / filteredHistory.length) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Status Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10b981" name="Success" />
                <Bar dataKey="partial" fill="#f59e0b" name="Partial" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No sync data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}