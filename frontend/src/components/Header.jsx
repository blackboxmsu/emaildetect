import React from 'react';
import { Shield, Eye, EyeOff, Database, FolderArchive, PlusCircle, Activity } from 'lucide-react';

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
    <header className="panel p-3 px-5 mb-4 flex items-center justify-between flex-wrap gap-3.5 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
          <Shield className="text-cyan-400 w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 m-0 tracking-wide">
              AI Email Threat Forensics
            </h1>
            <span className="badge badge-info text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              P7 PLATFORM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Threat Detection • Protocol Verification (SPF/DKIM/DMARC) • Origin Geolocation • Attribution
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {currentCaseId && (
          <div className="badge font-mono badge-neutral text-xs py-1 px-2 flex items-center gap-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            {currentCaseId}
          </div>
        )}

        {/* Database Status indicator */}
        <div
          className={`badge text-xs py-1 px-2.5 flex items-center gap-1.5 rounded border ${
            dbStatus?.connected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
          title={dbStatus?.connected ? "MongoDB connected" : "Using in-memory store. Set MONGODB_URI in backend/.env to connect MongoDB"}
        >
          <Database className="w-3 h-3" />
          {dbStatus?.connected ? 'MongoDB Connected' : 'In-Memory DB'}
        </div>

        {/* Privacy / PII Masking Toggle */}
        <button
          onClick={onTogglePrivacy}
          className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          title="Toggle PII Masking for sensitive data"
        >
          {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
          {privacyMode ? 'PII Masked' : 'Mask PII'}
        </button>

        {/* Case History Button */}
        <button
          onClick={onOpenHistory}
          className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <FolderArchive className="w-3.5 h-3.5 text-slate-400" />
          Cases ({caseCount || 0})
        </button>

        {/* New Investigation Button */}
        <button
          onClick={onOpenNewModal}
          className="btn-primary py-1 px-3 text-xs inline-flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Investigate Email
        </button>
      </div>
    </header>
  );
};
