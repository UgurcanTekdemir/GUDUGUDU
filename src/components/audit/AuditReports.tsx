import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus, 
  Eye, 
  Trash2, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AuditReport {
  id: string;
  report_name: string;
  report_type: string;
  parameters: any;
  generated_by: string;
  file_url?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generated_at?: string;
  created_at: string;
  updated_at: string;
}

const AuditReports: React.FC = () => {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    report_name: '',
    report_type: '',
    parameters: {}
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const createReport = async () => {
    if (!newReport.report_name || !newReport.report_type) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('audit_reports')
        .insert({
          report_name: newReport.report_name,
          report_type: newReport.report_type,
          parameters: newReport.parameters,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      setIsCreateDialogOpen(false);
      setNewReport({ report_name: '', report_type: '', parameters: {} });
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    }
  };

  const downloadReport = async (report: AuditReport) => {
    if (!report.file_url) {
      setError('Report file not available');
      return;
    }

    try {
      // In a real application, you would download the file from the URL
      window.open(report.file_url, '_blank');
    } catch (err) {
      setError('Failed to download report');
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('audit_reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        throw error;
      }

      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'generating': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'generating': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Audit Reports
          </h2>
          <p className="text-muted-foreground">Generate and manage audit reports</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={newReport.report_name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, report_name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={newReport.report_type} onValueChange={(value) => setNewReport(prev => ({ ...prev, report_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_summary">Daily Summary</SelectItem>
                    <SelectItem value="user_activity">User Activity</SelectItem>
                    <SelectItem value="security_incidents">Security Incidents</SelectItem>
                    <SelectItem value="financial_transactions">Financial Transactions</SelectItem>
                    <SelectItem value="admin_actions">Admin Actions</SelectItem>
                    <SelectItem value="compliance_report">Compliance Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createReport}>
                  Create Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="mt-2 text-muted-foreground">Loading reports...</p>
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reports found. Create your first report to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.report_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.report_type.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <Badge variant={getStatusBadgeVariant(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(report.created_at), 'yyyy-MM-dd HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.generated_at ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {format(new Date(report.generated_at), 'yyyy-MM-dd HH:mm')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {report.status === 'completed' && report.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadReport(report)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReport(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AuditReports;