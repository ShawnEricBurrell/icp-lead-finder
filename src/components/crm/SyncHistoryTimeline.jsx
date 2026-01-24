import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Clock, Upload, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function SyncHistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No sync history yet</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-amber-50 border-amber-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {history.slice(0, 10).map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`border-2 rounded-xl p-4 ${getStatusColor(entry.status)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              {getStatusIcon(entry.status)}
              <div>
                <div className="flex items-center gap-2">
                  {entry.sync_direction === 'to_crm' ? (
                    <Upload className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Download className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">
                    {entry.sync_direction === 'to_crm' ? 'Pushed to' : 'Pulled from'} {entry.crm_type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(entry.created_date).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge className={
              entry.status === 'success' ? 'bg-green-100 text-green-700' :
              entry.status === 'partial' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }>
              {entry.status}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-xs text-gray-500">Synced</div>
              <div className="font-semibold text-gray-900">{entry.records_synced}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-xs text-gray-500">Created</div>
              <div className="font-semibold text-green-700">{entry.records_created}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-xs text-gray-500">Updated</div>
              <div className="font-semibold text-blue-700">{entry.records_updated}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-xs text-gray-500">Failed</div>
              <div className="font-semibold text-red-700">{entry.records_failed}</div>
            </div>
          </div>

          {entry.duration_ms && (
            <div className="text-xs text-gray-500 mt-2">
              Duration: {(entry.duration_ms / 1000).toFixed(2)}s
            </div>
          )}

          {entry.error_details && entry.error_details.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs font-medium text-red-700 cursor-pointer">
                View {entry.error_details.length} error(s)
              </summary>
              <div className="mt-2 space-y-1">
                {entry.error_details.slice(0, 5).map((error, i) => (
                  <div key={i} className="text-xs bg-white rounded p-2 border border-red-200">
                    <strong>{error.record}:</strong> {error.error}
                  </div>
                ))}
              </div>
            </details>
          )}
        </motion.div>
      ))}
    </div>
  );
}