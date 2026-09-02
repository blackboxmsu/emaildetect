import React from 'react';
import { Shield, Eye, EyeOff, Database, FolderArchive, PlusCircle, Activity } from 'lucide-react';

interface HeaderProps {
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onOpenNewModal: () => void;
  onOpenHistory: () => void;
  caseCount: number;
  dbStatus: { connected: boolean; engine: string };
  currentCaseId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  privacyMode,
  onTogglePrivacy,
  onOpenNewModal,
  onOpenHistory,
  caseCount,
  dbStatus,
  currentCaseId
}) => {
  return (
    <header className="panel" style={{ padding: '12px 20px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          background: '#1e293b',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield style={{ color: '#38bdf8', width: '20px', height: '20px' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              AI Email Threat Forensics
            </h1>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              P7 PLATFORM
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>
            Threat Detection • Protocol Verification (SPF/DKIM/DMARC) • Origin Geolocation • Attribution
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {currentCaseId && (
          <div className="badge font-mono badge-neutral">
            <Activity style={{ width: '12px', height: '12px', color: '#38bdf8' }} />
            {currentCaseId}
          </div>
        )}

        {/* Database Status indicator */}
        <div
          className={`badge ${dbStatus.connected ? 'badge-safe' : 'badge-warning'}`}
          title={dbStatus.connected ? "MongoDB connected" : "Using in-memory store. Set MONGODB_URI in backend/.env to connect MongoDB"}
        >
          <Database style={{ width: '12px', height: '12px' }} />
          {dbStatus.connected ? 'MongoDB Connected' : 'In-Memory DB'}
        </div>

        {/* Privacy / PII Masking Toggle */}
        <button
          onClick={onTogglePrivacy}
          className="btn-secondary"
          style={{ padding: '6px 11px', fontSize: '12px' }}
          title="Toggle PII Masking for sensitive data"
        >
          {privacyMode ? <EyeOff style={{ width: '13px', height: '13px' }} /> : <Eye style={{ width: '13px', height: '13px' }} />}
          {privacyMode ? 'PII Masked' : 'Mask PII'}
        </button>

        {/* Case History Button */}
        <button
          onClick={onOpenHistory}
          className="btn-secondary"
          style={{ padding: '6px 11px', fontSize: '12px' }}
        >
          <FolderArchive style={{ width: '13px', height: '13px' }} />
          Cases ({caseCount})
        </button>

        {/* New Investigation Button */}
        <button
          onClick={onOpenNewModal}
          className="btn-primary"
          style={{ padding: '6px 13px', fontSize: '12px' }}
        >
          <PlusCircle style={{ width: '14px', height: '14px' }} />
          Investigate Email
        </button>
      </div>
    </header>
  );
};
