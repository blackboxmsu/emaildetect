import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { ExecutiveThreatMeters } from './components/ExecutiveThreatMeters.jsx';
import { RelayRouteVisualizer } from './components/RelayRouteVisualizer.jsx';
import { GeoMap } from './components/GeoMap.jsx';
import { ThreatGraphView } from './components/ThreatGraphView.jsx';
import { ForensicsTabs } from './components/ForensicsTabs.jsx';
import { SamplePickerModal } from './components/SamplePickerModal.jsx';
import { ForensicReportModal } from './components/ForensicReportModal.jsx';
import { CaseHistoryModal } from './components/CaseHistoryModal.jsx';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export function App() {
  const [report, setReport] = useState(null);
  const [samples, setSamples] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Modals
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Backend & DB status
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    engine: 'MongoDB'
  });

  // Initial load: fetch status, samples, cases, and analyze the first sample scenario
  useEffect(() => {
    fetchHealth();
    fetchSamples();
    fetchCases();
    handleSelectSample('sample_bec_ceo_fraud', 'SOC-Lead-Analyst');
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          connected: data.database?.connected || false,
          engine: data.database?.engine || 'MongoDB'
        });
      }
    } catch {
      // Backend starting up
    }
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch(`${API_BASE}/samples`);
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples || []);
      }
    } catch (err) {
      console.warn('Could not fetch samples:', err);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API_BASE}/cases`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.warn('Could not fetch cases:', err);
    }
  };

  const handleSelectSample = async (sampleId, analyst) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analyze/sample/${sampleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyst })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze sample email');
      }

      const data = await res.json();
      setReport(data);
      setIsSampleModalOpen(false);
      fetchCases();
    } catch (err) {
      setError(err.message || 'Error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (file, analyst) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analyst', analyst);

      const res = await fetch(`${API_BASE}/analyze/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze uploaded file');
      }

      const data = await res.json();
      setReport(data);
      setIsSampleModalOpen(false);
      fetchCases();
    } catch (err) {
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRaw = async (rawContent, fileName, analyst) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analyze/raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent, fileName, analyst })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze raw content');
      }

      const data = await res.json();
      setReport(data);
      setIsSampleModalOpen(false);
      fetchCases();
    } catch (err) {
      setError(err.message || 'Error analyzing raw content');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoricalCase = (caseItem) => {
    setReport(caseItem);
    setIsHistoryModalOpen(false);
  };

  return (
    <div className="app-container max-w-7xl mx-auto px-4 py-4 md:py-6">
      {/* Top Header */}
      <Header
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(p => !p)}
        onOpenNewModal={() => setIsSampleModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        caseCount={cases.length}
        dbStatus={dbStatus}
        currentCaseId={report?.caseId}
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3.5 px-4 bg-rose-500/10 border border-rose-500/30 rounded-md flex items-center gap-2.5 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Banner */}
      {loading && (
        <div className="panel p-4 mb-4 flex items-center justify-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-xs text-cyan-400 font-medium">
            Analyzing email headers, tracing route hops, running Python AI engine, and validating authentication...
          </span>
        </div>
      )}

      {/* Active Forensic Analysis View */}
      {report && (
        <main>
          {/* Executive Overview: Dual Risk & Attribution Meters */}
          <ExecutiveThreatMeters
            report={report}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />

          {/* Grid Layout: Transmission Route & GeoLocation Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <RelayRouteVisualizer
              hops={report.headers?.relayPath}
              earliestReliableIp={report.headers?.earliestReliableIp}
              anomalies={report.headers?.routingAnomalies}
            />

            <GeoMap
              hops={report.headers?.relayPath}
              earliestReliableGeo={report.earliestReliableGeo}
            />
          </div>

          {/* Threat Correlation & Campaign Graph */}
          <ThreatGraphView graph={report.graph} />

          {/* Deep Inspection Tabs (Auth, NLP, IOCs, Headers, Custody) */}
          <ForensicsTabs report={report} privacyMode={privacyMode} />
        </main>
      )}

      {/* Footer Legal & Forensic Attribution Notice */}
      <footer className="mt-8 py-5 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>
          AEGIS-MAIL FORENSICS PLATFORM • Built with Node.js (JavaScript) + Python AI Engine & TailwindCSS
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Origin geolocation indicates technical mail transfer agent/relay infrastructure, not verified human physical location.
        </p>
      </footer>

      {/* Modals */}
      <SamplePickerModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        samples={samples}
        onSelectSample={handleSelectSample}
        onUploadFile={handleUploadFile}
        onAnalyzeRaw={handleAnalyzeRaw}
        isLoading={loading}
      />

      {report && (
        <ForensicReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          report={report}
        />
      )}

      <CaseHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        cases={cases}
        onSelectCase={handleSelectHistoricalCase}
      />
    </div>
  );
}

export default App;
