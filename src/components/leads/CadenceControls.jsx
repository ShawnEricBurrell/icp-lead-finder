import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CadenceControls({ lead, onUpdate }) {
  const handleStartCadence = () => {
    if (!lead.follow_up_sequence || lead.follow_up_sequence.length === 0) {
      alert('Please create a follow-up sequence first');
      return;
    }
    
    if (lead.email_status === 'not_sent') {
      alert('Please send the initial email first before starting the cadence');
      return;
    }

    onUpdate({
      ...lead,
      cadence_active: true,
      cadence_current_step: 0,
      cadence_last_sent: lead.email_sent_date || new Date().toISOString(),
      cadence_paused_reason: null
    });
  };

  const handlePauseCadence = () => {
    onUpdate({
      ...lead,
      cadence_active: false,
      cadence_paused_reason: 'Manually paused by user'
    });
  };

  const handleRestartCadence = () => {
    onUpdate({
      ...lead,
      cadence_active: true,
      cadence_current_step: 0,
      cadence_last_sent: new Date().toISOString(),
      cadence_paused_reason: null
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
          Automated Cadence
        </h4>
        {lead.cadence_active ? (
          <Badge className="bg-green-100 text-green-700">Active</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
        )}
      </div>

      {lead.cadence_active && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">Progress:</span> Follow-up {lead.cadence_current_step || 0} of {lead.follow_up_sequence?.length || 0}
          </p>
          {lead.cadence_last_sent && (
            <p className="text-xs text-indigo-600 mt-1">
              Last sent: {new Date(lead.cadence_last_sent).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {lead.cadence_paused_reason && !lead.cadence_active && (
        <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Paused:</span> {lead.cadence_paused_reason}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {!lead.cadence_active && (
          <>
            <Button
              onClick={handleStartCadence}
              className="bg-indigo-600 hover:bg-indigo-700 flex-1"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {lead.cadence_current_step > 0 ? 'Resume' : 'Start'} Cadence
            </Button>
            {lead.cadence_current_step > 0 && (
              <Button
                onClick={handleRestartCadence}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            )}
          </>
        )}
        {lead.cadence_active && (
          <Button
            onClick={handlePauseCadence}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause Cadence
          </Button>
        )}
      </div>

      <p className="text-xs text-indigo-600 mt-3">
        The system will automatically send follow-up emails based on your sequence timing and pause if the lead replies or becomes unqualified.
      </p>
    </motion.div>
  );
}