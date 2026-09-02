import mongoose from 'mongoose';

const { Schema } = mongoose;

const CaseSchema = new Schema({
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

export const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);
