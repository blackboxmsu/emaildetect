import React from 'react';
import { ShieldCheck, Eye, EyeOff, FolderArchive, PlusCircle, Database } from 'lucide-react';

export const Header = ({
  privacyMode,
  onTogglePrivacy,
  onOpenNewModal,
  onOpenHistory,
  caseCount,
  dbStatus,
  currentCaseId
}) => {
  return (
    <header className="panel p-4 px-6 mb-5 flex items-center justify-between flex-wrap gap-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 m-0 tracking-tight">
              AI Email Threat Forensics & Intelligence
            </h1>
            <span className="badge badge-info text-[11px] font-semibold">
              PS-7 PLATFORM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phishing Detection • Email Header Analysis • Origin Geolocation • Identity Attribution
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {currentCaseId && (
          <div className="badge badge-neutral font-mono text-xs py-1.5 px-3">
            Case: <strong>{currentCaseId}</strong>
          </div>
        )}

        {/* Database Status */}
        <div
          className={`badge text-xs py-1.5 px-3 ${
            dbStatus?.connected ? 'badge-safe' : 'badge-warning'
          }`}
          title={dbStatus?.connected ? "MongoDB connected" : "Local Storage Mode"}
        >
          <Database className="w-3 h-3" />
          {dbStatus?.connected ? 'Database Connected' : 'Local Mode'}
        </div>

        {/* PII Masking Toggle */}
        <button
          onClick={onTogglePrivacy}
          className={`btn-secondary py-1.5 px-3 text-xs ${privacyMode ? 'bg-amber-50 border-amber-300 text-amber-800' : ''}`}
          title="Toggle PII Masking for privacy compliance"
        >
          {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
          {privacyMode ? 'PII Masked (Active)' : 'Mask Sensitive PII'}
        </button>

        {/* Case History */}
        <button
          onClick={onOpenHistory}
          className="btn-secondary py-1.5 px-3 text-xs"
        >
          <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
          Saved Cases ({caseCount || 0})
        </button>

        {/* Investigate / Select Email */}
        <button
          onClick={onOpenNewModal}
          className="btn-primary py-1.5 px-3.5 text-xs shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Investigate / Load Email
        </button>
      </div>
    </header>
  );
};
