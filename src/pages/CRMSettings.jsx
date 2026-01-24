import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Settings, RefreshCw, Plus, Trash2, CheckCircle2,
  AlertCircle, ArrowRightLeft, Download, Upload, History, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import SyncHistoryTimeline from '@/components/crm/SyncHistoryTimeline';

export default function CRMSettings() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [newMapping, setNewMapping] = useState({
    base44_field: '',
    crm_field: '',
    field_type: 'string'
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['crm-connections'],
    queryFn: () => base44.entities.CRMConnection.list()
  });

  const { data: syncHistory = [] } = useQuery({
    queryKey: ['crm-sync-history'],
    queryFn: () => base44.entities.CRMSyncHistory.list('-created_date', 20)
  });

  const createConnectionMutation = useMutation({
    mutationFn: (data) => base44.entities.CRMConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-connections'] });
      toast.success('CRM connection created');
    }
  });

  const updateConnectionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMConnection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-connections'] });
      toast.success('Connection updated');
    }
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: (id) => base44.entities.CRMConnection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-connections'] });
      toast.success('Connection deleted');
    }
  });

  const syncToHubSpot = async () => {
    setSyncing(true);
    try {
      const result = await base44.functions.invoke('syncToHubSpot', {});
      toast.success(`Synced ${result.data.synced} leads to HubSpot`);
      queryClient.invalidateQueries({ queryKey: ['crm-connections'] });
      queryClient.invalidateQueries({ queryKey: ['crm-sync-history'] });
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const syncFromHubSpot = async () => {
    setSyncing(true);
    try {
      const result = await base44.functions.invoke('syncFromHubSpot', {});
      toast.success(`Imported ${result.data.created} new leads, updated ${result.data.updated}`);
      queryClient.invalidateQueries({ queryKey: ['crm-connections'] });
      queryClient.invalidateQueries({ queryKey: ['crm-sync-history'] });
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const addFieldMapping = (connectionId, currentMappings) => {
    if (!newMapping.base44_field || !newMapping.crm_field) {
      toast.error('Please fill in all mapping fields');
      return;
    }

    const updatedMappings = [...(currentMappings || []), newMapping];
    updateConnectionMutation.mutate({
      id: connectionId,
      data: { field_mappings: updatedMappings }
    });

    setNewMapping({ base44_field: '', crm_field: '', field_type: 'string' });
  };

  const removeFieldMapping = (connectionId, currentMappings, index) => {
    const updatedMappings = currentMappings.filter((_, i) => i !== index);
    updateConnectionMutation.mutate({
      id: connectionId,
      data: { field_mappings: updatedMappings }
    });
  };

  const hubspotConnection = connections.find(c => c.crm_type === 'hubspot');

  const createHubSpotConnection = () => {
    createConnectionMutation.mutate({
      crm_type: 'hubspot',
      is_active: true,
      sync_direction: 'bidirectional',
      field_mappings: [
        { base44_field: 'lead_score', crm_field: 'hs_lead_score', field_type: 'number' },
        { base44_field: 'notes', crm_field: 'notes_last_contacted', field_type: 'string' }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-8 h-8 text-blue-600" />
              CRM Integration Settings
            </h1>
            <p className="text-gray-500 mt-1">Sync leads with external CRM systems</p>
          </div>
        </div>

        {/* HubSpot Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                  H
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">HubSpot CRM</h3>
                  <p className="text-sm text-gray-600">Bi-directional lead sync</p>
                </div>
              </div>
              {hubspotConnection ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">
                  Not Connected
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!hubspotConnection ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Create a HubSpot connection to start syncing leads</p>
                <Button
                  onClick={createHubSpotConnection}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create HubSpot Connection
                </Button>
              </div>
            ) : (
              <>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Sync History
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                {/* Sync Stats */}
                {hubspotConnection.sync_stats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        {hubspotConnection.sync_stats.total_synced || 0}
                      </div>
                      <div className="text-sm text-blue-600">Total Synced</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {hubspotConnection.sync_stats.last_sync_count || 0}
                      </div>
                      <div className="text-sm text-green-600">Last Sync</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-2xl font-bold text-amber-700">
                        {hubspotConnection.sync_stats.errors || 0}
                      </div>
                      <div className="text-sm text-amber-600">Errors</div>
                    </div>
                  </div>
                )}

                {/* Last Sync */}
                {hubspotConnection.last_sync && (
                  <div className="text-sm text-gray-600">
                    <strong>Last sync:</strong>{' '}
                    {new Date(hubspotConnection.last_sync).toLocaleString()}
                  </div>
                )}

                {/* Sync Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={syncToHubSpot}
                    disabled={syncing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {syncing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Push to HubSpot
                  </Button>
                  <Button
                    onClick={syncFromHubSpot}
                    disabled={syncing}
                    variant="outline"
                    className="flex-1"
                  >
                    {syncing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Pull from HubSpot
                  </Button>
                </div>
                  </TabsContent>

                  <TabsContent value="mappings" className="space-y-6">
                {/* Field Mappings */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                    Field Mappings
                  </h4>

                  {/* Existing Mappings */}
                  <div className="space-y-2 mb-4">
                    {hubspotConnection.field_mappings?.map((mapping, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <Badge variant="outline" className="mr-2">Base44</Badge>
                          {mapping.base44_field}
                        </div>
                        <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <Badge variant="outline" className="mr-2">HubSpot</Badge>
                          {mapping.crm_field}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeFieldMapping(
                              hubspotConnection.id,
                              hubspotConnection.field_mappings,
                              idx
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Mapping */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Add Custom Field Mapping</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Base44 Field</Label>
                        <Input
                          placeholder="e.g., custom_field"
                          value={newMapping.base44_field}
                          onChange={(e) =>
                            setNewMapping({ ...newMapping, base44_field: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>HubSpot Field</Label>
                        <Input
                          placeholder="e.g., hs_custom_field"
                          value={newMapping.crm_field}
                          onChange={(e) =>
                            setNewMapping({ ...newMapping, crm_field: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newMapping.field_type}
                          onValueChange={(value) =>
                            setNewMapping({ ...newMapping, field_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        addFieldMapping(
                          hubspotConnection.id,
                          hubspotConnection.field_mappings
                        )
                      }
                      className="mt-3"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Mapping
                    </Button>
                  </div>
                </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">Sync History</h4>
                        <p className="text-sm text-gray-500">Recent synchronization activity</p>
                      </div>
                      <Badge variant="outline">
                        {syncHistory.filter(h => h.connection_id === hubspotConnection.id).length} records
                      </Badge>
                    </div>
                    <SyncHistoryTimeline 
                      history={syncHistory.filter(h => h.connection_id === hubspotConnection.id)}
                    />
                  </TabsContent>
                </Tabs>

                {/* Delete Connection */}
                <div className="border-t border-gray-200 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => deleteConnectionMutation.mutate(hubspotConnection.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Connection
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Other CRMs - Coming Soon */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <h4 className="font-semibold text-gray-900">Salesforce</h4>
            </div>
            <p className="text-sm text-gray-500">Coming soon - Authorization required</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                Z
              </div>
              <h4 className="font-semibold text-gray-900">Zoho CRM</h4>
            </div>
            <p className="text-sm text-gray-500">Coming soon - API credentials required</p>
          </div>
        </div>
      </div>
    </div>
  );
}