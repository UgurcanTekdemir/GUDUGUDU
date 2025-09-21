import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Archive, Settings, Trash2, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDataRetention, RetentionPolicy, RetentionStats } from '@/utils/dataRetention';

const AdminDataRetention: React.FC = () => {
  const { 
    policies, 
    stats, 
    loading, 
    error,
    loadPolicies,
    loadStats,
    updatePolicy,
    performCleanup,
    manualCleanup,
    getComplianceRequirements,
    validateCompliance
  } = useDataRetention();

  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    retention_days: 0,
    auto_delete: true,
    archive_before_delete: true
  });

  useEffect(() => {
    loadPolicies();
    loadStats();
  }, [loadPolicies, loadStats]);

  const handleEditPolicy = (policy: RetentionPolicy) => {
    setSelectedPolicy(policy);
    setEditForm({
      retention_days: policy.retention_days,
      auto_delete: policy.auto_delete,
      archive_before_delete: policy.archive_before_delete
    });
    setIsEditDialogOpen(true);
  };

  const handleSavePolicy = async () => {
    if (!selectedPolicy) return;

    const success = await updatePolicy(
      selectedPolicy.event_type,
      editForm.retention_days,
      editForm.auto_delete,
      editForm.archive_before_delete
    );

    if (success) {
      setIsEditDialogOpen(false);
      setSelectedPolicy(null);
    }
  };

  const handleManualCleanup = async (eventType: string) => {
    const result = await manualCleanup(eventType, 30, true);
    if (result) {
      console.log('Cleanup completed:', result);
    }
  };

  const formatDays = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return `${years} year${years > 1 ? 's' : ''}${remainingDays > 0 ? ` ${remainingDays} days` : ''}`;
    }
    return `${days} days`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  const complianceRequirements = getComplianceRequirements();

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Archive className="w-6 h-6" />
              Data Retention Management
            </h2>
            <p className="text-muted-foreground">Manage data retention policies and compliance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => performCleanup()} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Cleanup Now
            </Button>
            <Button onClick={() => loadStats()} disabled={loading}>
              <Clock className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
          </div>
        </div>

        {/* Retention Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{stats.total_records.toLocaleString()}</p>
                  </div>
                  <Archive className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expired Records</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.expired_records.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Archived Records</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.archived_records.toLocaleString()}</p>
                  </div>
                  <Archive className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Cleanup</p>
                    <p className="text-sm font-medium">{formatTimestamp(stats.next_cleanup_date)}</p>
                  </div>
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Compliance Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(complianceRequirements).map(([standard, requirement]) => (
                <div key={standard} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium">{standard}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{requirement.description}</p>
                  <p className="text-sm font-medium">
                    Retention: {formatDays(requirement.retention_period)}
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Requirements:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {requirement.requirements.slice(0, 2).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retention Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Retention Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Retention Period</TableHead>
                    <TableHead>Auto Delete</TableHead>
                    <TableHead>Archive Before Delete</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Badge variant="outline">{policy.event_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatDays(policy.retention_days)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.auto_delete ? 'default' : 'secondary'}>
                          {policy.auto_delete ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.archive_before_delete ? 'default' : 'secondary'}>
                          {policy.archive_before_delete ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.is_enabled ? 'default' : 'secondary'}>
                          {policy.is_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPolicy(policy)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManualCleanup(policy.event_type)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Policy Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Retention Policy</DialogTitle>
            </DialogHeader>
            {selectedPolicy && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <Input
                    id="event-type"
                    value={selectedPolicy.event_type}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="retention-days">Retention Period (Days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={editForm.retention_days}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      retention_days: parseInt(e.target.value) || 0
                    }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Current: {formatDays(editForm.retention_days)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-delete"
                    checked={editForm.auto_delete}
                    onCheckedChange={(checked) => setEditForm(prev => ({
                      ...prev,
                      auto_delete: checked
                    }))}
                  />
                  <Label htmlFor="auto-delete">Auto Delete Expired Records</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="archive-before-delete"
                    checked={editForm.archive_before_delete}
                    onCheckedChange={(checked) => setEditForm(prev => ({
                      ...prev,
                      archive_before_delete: checked
                    }))}
                  />
                  <Label htmlFor="archive-before-delete">Archive Before Delete</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePolicy} disabled={loading}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
  );
};

export default AdminDataRetention;
