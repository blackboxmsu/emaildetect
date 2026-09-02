import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExecutiveThreatMeters } from './components/ExecutiveThreatMeters';
import { RelayRouteVisualizer } from './components/RelayRouteVisualizer';
import { GeoMap } from './components/GeoMap';
import { ThreatGraphView } from './components/ThreatGraphView';
import { ForensicsTabs } from './components/ForensicsTabs';
import { SamplePickerModal } from './components/SamplePickerModal';
import { ForensicReportModal } from './components/ForensicReportModal';
import { CaseHistoryModal } from './components/CaseHistoryModal';
import { AnalysisReport, SampleScenario } from './types';
import { AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export function App() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [samples, setSamples] = useState<SampleScenario[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);

  // Modals
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Backend & DB status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; engine: string }>({
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
    } catch (err: any) {
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
    } catch (err: any) {
      console.warn('Could not fetch cases:', err);
    }
  };

  const handleSelectSample = async (sampleId: string, analyst: string) => {
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

      const data: AnalysisReport = await res.json();
      setReport(data);
      setIsSampleModalOpen(false);
      fetchCases();
    } catch (err: any) {
      setError(err.message || 'Error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (file: File, analyst: string) => {
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

      const data: AnalysisReport = await res.json();
      setReport(data);
      setIsSampleModalOpen(false);
      fetchCases();
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRaw = async (rawContent: string, fileName: string, analyst: string) => {
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

      const data: AnalysisReport = await res.json();
      setReport(data);
      setIsSampleModalOpen(false);
      fetchCases();
    } catch (err: any) {
      setError(err.message || 'Error analyzing raw content');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoricalCase = (caseItem: any) => {
    setReport(caseItem);
    setIsHistoryModalOpen(false);
  };

  return (
    <div className="app-container">
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
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fca5a5',
          fontSize: '13px'
        }}>
          <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Banner */}
      {loading && (
        <div className="panel" style={{
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <RefreshCw style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
          <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>
            Analyzing email headers, tracing route hops, and validating authentication...
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <RelayRouteVisualizer
              hops={report.headers.relayPath}
              earliestReliableIp={report.headers.earliestReliableIp}
              anomalies={report.headers.routingAnomalies}
            />

            <GeoMap
              hops={report.headers.relayPath}
              earliestReliableGeo={report.earliestReliableGeo}
            />
          </div>

          {/* Threat Correlation & Campaign Graph (Section 10) */}
          <ThreatGraphView graph={report.graph} />

          {/* Deep Inspection Tabs (Auth, NLP, IOCs, Headers, Custody) */}
          <ForensicsTabs report={report} privacyMode={privacyMode} />
        </main>
      )}

      {/* Footer Legal & Forensic Attribution Notice */}
      <footer style={{
        marginTop: '30px',
        padding: '20px 0',
        borderTop: '1px solid rgba(56, 189, 248, 0.1)',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        <p>
          AEGIS-MAIL FORENSICS PLATFORM • Built in strict conformance with the Hackathon Specification Document
        </p>
        <p style={{ marginTop: '4px' }}>
          Origin geolocation indicates technical mail transfer agent/relay infrastructure, not verified human physical location (Section 9 & 12).
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
