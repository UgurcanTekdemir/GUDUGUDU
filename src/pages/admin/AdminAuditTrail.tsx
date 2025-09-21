import React from 'react';
import AuditTrailViewer from '@/components/audit/AuditTrailViewer';

const AdminAuditTrail: React.FC = () => {
  return (
    <div className="p-6">
      <AuditTrailViewer />
    </div>
  );
};

export default AdminAuditTrail;
