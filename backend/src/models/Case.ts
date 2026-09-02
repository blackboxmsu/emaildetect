import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseId: string;
  evidenceId: string;
  sha256: string;
  md5: string;
  fileName: string;
  analyzedAt: Date;
  analyst: string;
  subject: string;
  sender: {
    name?: string;
    email: string;
    domain: string;
  };
  recipient: {
    name?: string;
    email: string;
  };
  replyTo?: {
    email: string;
    mismatch: boolean;
  };
  returnPath?: {
    email: string;
    mismatch: boolean;
  };
  auth: {
    spf: { status: string; record?: string; details?: string; pass: boolean };
    dkim: { status: string; domain?: string; selector?: string; pass: boolean };
    dmarc: { status: string; policy?: string; aligned: boolean; pass: boolean };
  };
  relayPath: Array<{
    hopIndex: number;
    from?: string;
    by?: string;
    ip?: string;
    timestamp?: string;
    delaySeconds?: number;
    location?: any;
    isEarliestReliable: boolean;
  }>;
  earliestReliableNode?: {
    ip: string;
    reverseDns?: string;
    location: any;
    infraType: string;
    asn?: string;
    isp?: string;
  };
  risk: {
    fraudScore: number;
    fraudLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    attributionConfidence: number;
    breakdown: Record<string, number>;
  };
  classification: {
    category: string;
    primaryThreat: string;
    confidence: number;
    description: string;
  };
  nlp: {
    urgencyScore: number;
    becIndicators: string[];
    threatsDetected: string[];
    lookalikeDomains: Array<{ domain: string; target: string; similarity: number; spoofed: boolean }>;
    sentimentAlerts: string[];
  };
  urls: Array<{
    url: string;
    domain: string;
    suspicious: boolean;
    reason?: string;
  }>;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    sha256: string;
    isSuspicious: boolean;
    flagReason?: string;
  }>;
  iocs: {
    ips: string[];
    domains: string[];
    urls: string[];
    hashes: string[];
  };
  graph: {
    nodes: Array<{ id: string; label: string; type: string; details?: any }>;
    edges: Array<{ from: string; to: string; label: string; risk?: string }>;
  };
  campaignCluster?: {
    id: string;
    name: string;
    confidence: number;
    sharedAttributes: string[];
  };
  notes?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'ESCALATED' | 'CLOSED';
}

const CaseSchema = new Schema<ICase>({
  caseId: { type: String, required: true, unique: true, index: true },
  evidenceId: { type: String, required: true, index: true },
  sha256: { type: String, required: true, index: true },
  md5: { type: String, required: true },
  fileName: { type: String, default: 'uploaded_email.eml' },
  analyzedAt: { type: Date, default: Date.now },
  analyst: { type: String, default: 'SOC-Automated-Forensics' },
  subject: { type: String, default: 'No Subject' },
  sender: {
    name: String,
    email: { type: String, required: true },
    domain: { type: String, required: true }
  },
  recipient: {
    name: String,
    email: { type: String, default: '' }
  },
  replyTo: {
    email: String,
    mismatch: { type: Boolean, default: false }
  },
  returnPath: {
    email: String,
    mismatch: { type: Boolean, default: false }
  },
  auth: {
    spf: { type: Object, default: {} },
    dkim: { type: Object, default: {} },
    dmarc: { type: Object, default: {} }
  },
  relayPath: { type: [Object], default: [] },
  earliestReliableNode: { type: Object, default: null },
  risk: {
    fraudScore: { type: Number, required: true, min: 0, max: 100 },
    fraudLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    attributionConfidence: { type: Number, required: true, min: 0, max: 100 },
    breakdown: { type: Object, default: {} }
  },
  classification: {
    category: { type: String, default: 'SUSPICIOUS' },
    primaryThreat: { type: String, default: 'Unknown' },
    confidence: { type: Number, default: 50 },
    description: { type: String, default: '' }
  },
  nlp: {
    urgencyScore: { type: Number, default: 0 },
    becIndicators: { type: [String], default: [] },
    threatsDetected: { type: [String], default: [] },
    lookalikeDomains: { type: [Object], default: [] },
    sentimentAlerts: { type: [String], default: [] }
  },
  urls: { type: [Object], default: [] },
  attachments: { type: [Object], default: [] },
  iocs: {
    ips: { type: [String], default: [] },
    domains: { type: [String], default: [] },
    urls: { type: [String], default: [] },
    hashes: { type: [String], default: [] }
  },
  graph: {
    nodes: { type: [Object], default: [] },
    edges: { type: [Object], default: [] }
  },
  campaignCluster: { type: Object, default: null },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['NEW', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED'], default: 'NEW' }
}, {
  timestamps: true
});

export const Case = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
