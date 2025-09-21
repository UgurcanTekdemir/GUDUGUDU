import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, Filter, Loader2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AuditLog {
  id: string;
  event_id: string;
  correlation_id?: string;
  actor_id?: string;
  actor_type: string;
  actor_ip?: string;
  actor_user_agent?: string;
  event_category: string;
  event_type: string;
  event_name?: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending' | 'info' | 'warning';
  is_sensitive: boolean;
  occurred_at: string;
  expires_at?: string;
}

const ITEMS_PER_PAGE = 10;

const AuditTrailViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    actor_type: '',
    event_category: '',
    event_type: '',
    severity: '',
    search: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    
    // For now, use existing tables to simulate audit trail
    // In production, you would use the actual audit_trail table
    let query = supabase
      .from('audit_trail')
      .select('*', { count: 'exact' });

    // Apply filters - using audit_trail fields
    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('event_category', filters.category);
    }
    if (filters.severity && filters.severity !== 'all') {
      query = query.eq('severity', filters.severity);
    }
    if (filters.actorType && filters.actorType !== 'all') {
      query = query.eq('actor_type', filters.actorType);
    }

    query = query
      .order('occurred_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
    } else {
      // Transform wallet_transactions to audit log format
      // Use data directly from audit_trail table
      const auditLogs: AuditLog[] = data || [];
      
      setLogs(auditLogs);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page on filter change
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'failure': return 'destructive';
      case 'pending': return 'secondary';
      case 'info': return 'outline';
      case 'warning': return 'secondary';
      default: return 'secondary';
    }
  };

  const openLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeLogDetails = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Input
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="col-span-full lg:col-span-1"
            />
            <Select value={filters.actor_type} onValueChange={(val) => handleFilterChange('actor_type', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Actor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actor Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="anonymous">Anonymous</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.event_category} onValueChange={(val) => handleFilterChange('event_category', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="authorization">Authorization</SelectItem>
                <SelectItem value="user_management">User Management</SelectItem>
                <SelectItem value="admin_management">Admin Management</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="system_config">System Config</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.event_type} onValueChange={(val) => handleFilterChange('event_type', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                <SelectItem value="login_success">Login Success</SelectItem>
                <SelectItem value="login_failure">Login Failure</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="user_updated">User Updated</SelectItem>
                <SelectItem value="deposit_initiated">Deposit Initiated</SelectItem>
                <SelectItem value="withdrawal_initiated">Withdrawal Initiated</SelectItem>
                <SelectItem value="security_alert">Security Alert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(val) => handleFilterChange('severity', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="mt-2 text-muted-foreground">Loading audit logs...</p>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No audit logs found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-accent/50 cursor-pointer" onClick={() => openLogDetails(log)}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.occurred_at), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{log.actor_type}</div>
                        <div className="text-sm text-muted-foreground">{log.actor_id?.substring(0, 8)}...</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event_category?.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.event_name || log.event_type?.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {log.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(log.severity!)}>{log.severity?.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status!)}>{log.status?.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openLogDetails(log); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {logs.length} of {totalCount} entries.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages - 1 || loading}
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected audit event.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20">
            {selectedLog && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Event ID</Label>
                  <p className="font-mono text-xs bg-secondary p-2 rounded">{selectedLog.event_id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Correlation ID</Label>
                  <p className="font-mono text-xs bg-secondary p-2 rounded">{selectedLog.correlation_id || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Occurred At</Label>
                  <p>{format(new Date(selectedLog.occurred_at), 'yyyy-MM-dd HH:mm:ss.SSS')}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Expires At</Label>
                  <p>{selectedLog.expires_at ? format(new Date(selectedLog.expires_at), 'yyyy-MM-dd HH:mm:ss') : 'Never'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Actor Type</Label>
                  <p>{selectedLog.actor_type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Actor ID</Label>
                  <p className="font-mono text-xs bg-secondary p-2 rounded">{selectedLog.actor_id || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Actor IP</Label>
                  <p>{selectedLog.actor_ip || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Actor User Agent</Label>
                  <p className="break-all">{selectedLog.actor_user_agent || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Event Category</Label>
                  <p>{selectedLog.event_category?.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Event Type</Label>
                  <p>{selectedLog.event_type?.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Event Name</Label>
                  <p>{selectedLog.event_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Severity</Label>
                  <Badge variant={getSeverityBadgeVariant(selectedLog.severity!)}>{selectedLog.severity?.toUpperCase()}</Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedLog.status!)}>{selectedLog.status?.toUpperCase()}</Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Entity Type</Label>
                  <p>{selectedLog.entity_type || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Entity ID</Label>
                  <p className="font-mono text-xs bg-secondary p-2 rounded">{selectedLog.entity_id || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-full">
                  <Label className="text-muted-foreground">Description</Label>
                  <Textarea readOnly value={selectedLog.description || 'N/A'} className="min-h-[80px]" />
                </div>
                {selectedLog.old_value && (
                  <div className="space-y-1 col-span-full">
                    <Label className="text-muted-foreground">Old Value</Label>
                    <Textarea readOnly value={JSON.stringify(selectedLog.old_value, null, 2)} className="font-mono text-xs min-h-[120px]" />
                  </div>
                )}
                {selectedLog.new_value && (
                  <div className="space-y-1 col-span-full">
                    <Label className="text-muted-foreground">New Value</Label>
                    <Textarea readOnly value={JSON.stringify(selectedLog.new_value, null, 2)} className="font-mono text-xs min-h-[120px]" />
                  </div>
                )}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-1 col-span-full">
                    <Label className="text-muted-foreground">Metadata</Label>
                    <Textarea readOnly value={JSON.stringify(selectedLog.metadata, null, 2)} className="font-mono text-xs min-h-[120px]" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Is Sensitive</Label>
                  <p>{selectedLog.is_sensitive ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end">
            <Button onClick={closeLogDetails}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTrailViewer;