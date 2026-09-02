import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { connectDB, isConnected, fallbackStorage } from './db.js';
import { Case } from './models/Case.js';
import { runFullEmailForensicAnalysis } from './services/analyzer.js';
import { SAMPLE_EMAILS } from './data/sampleEmails.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Health check & DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AI-Powered Email Threat Forensics & Intelligence Platform',
    timestamp: new Date().toISOString(),
    engine: 'Node.js (JavaScript) + Python AI/NLP Forensics Engine',
    database: {
      engine: 'MongoDB',
      connected: isConnected(),
      mode: isConnected() ? 'MONGODB_CONNECTED' : 'LOCAL_IN_MEMORY_FALLBACK'
    }
  });
});

// List sample email scenarios
app.get('/api/samples', (req, res) => {
  const list = SAMPLE_EMAILS.map(s => ({
    id: s.id,
    title: s.title,
    category: s.category,
    expectedRisk: s.expectedRisk,
    description: s.description
  }));
  res.json({ samples: list });
});

// Analyze a pre-configured sample email
app.post('/api/analyze/sample/:id', async (req, res) => {
  try {
    const sample = SAMPLE_EMAILS.find(s => s.id === req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample scenario not found' });
    }

    const report = await runFullEmailForensicAnalysis(
      sample.rawEml,
      `${sample.id}.eml`,
      req.body.analyst || 'SOC-Analyst-01'
    );

    // Save to MongoDB if connected, else fallback
    await persistCase(report);

    res.json(report);
  } catch (err) {
    console.error('Error analyzing sample email:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Upload .eml file
app.post('/api/analyze/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No email file uploaded. Please upload a valid .eml file.' });
    }

    const report = await runFullEmailForensicAnalysis(
      req.file.buffer,
      req.file.originalname,
      req.body.analyst || 'SOC-Lead-Investigator'
    );

    await persistCase(report);
    res.json(report);
  } catch (err) {
    console.error('Error analyzing uploaded file:', err);
    res.status(500).json({ error: err.message || 'File analysis failed' });
  }
});

// Analyze raw text/headers
app.post('/api/analyze/raw', async (req, res) => {
  try {
    const { rawContent, fileName, analyst } = req.body;
    if (!rawContent || !rawContent.trim()) {
      return res.status(400).json({ error: 'Raw email content cannot be empty' });
    }

    const report = await runFullEmailForensicAnalysis(
      rawContent,
      fileName || 'pasted_email.eml',
      analyst || 'SOC-Forensic-Analyst'
    );

    await persistCase(report);
    res.json(report);
  } catch (err) {
    console.error('Error analyzing raw email:', err);
    res.status(500).json({ error: err.message || 'Raw analysis failed' });
  }
});

// List historical cases
app.get('/api/cases', async (req, res) => {
  try {
    if (isConnected()) {
      const cases = await Case.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ cases });
    } else {
      const cases = fallbackStorage.getAllCases();
      return res.json({ cases });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get case by ID
app.get('/api/cases/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isConnected()) {
      const c = await Case.findOne({ caseId: id });
      if (!c) return res.status(404).json({ error: 'Case not found' });
      return res.json(c);
    } else {
      const c = fallbackStorage.getCase(id);
      if (!c) return res.status(404).json({ error: 'Case not found' });
      return res.json(c);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function persistCase(report) {
  const caseDoc = {
    caseId: report.caseId,
    evidenceId: report.evidenceId,
    sha256: report.sha256,
    md5: report.md5,
    fileName: report.fileName,
    analyzedAt: new Date(report.analyzedAt),
    analyst: report.analyst,
    subject: report.parsedEmail.subject,
    sender: {
      name: report.parsedEmail.from.value?.[0]?.name,
      email: report.parsedEmail.from.address || 'unknown',
      domain: report.parsedEmail.from.domain || 'unknown'
    },
    recipient: {
      name: report.parsedEmail.to?.value?.[0]?.name,
      email: report.parsedEmail.to?.value?.[0]?.address || ''
    },
    replyTo: report.parsedEmail.replyTo ? {
      email: report.parsedEmail.replyTo.address || '',
      mismatch: report.headers.replyToMismatch
    } : undefined,
    returnPath: report.parsedEmail.returnPath ? {
      email: report.parsedEmail.returnPath,
      mismatch: report.headers.returnPathMismatch
    } : undefined,
    auth: {
      spf: report.authentication.spf,
      dkim: report.authentication.dkim,
      dmarc: report.authentication.dmarc
    },
    relayPath: report.headers.relayPath,
    earliestReliableNode: report.earliestReliableGeo ? {
      ip: report.earliestReliableGeo.ip,
      reverseDns: report.earliestReliableGeo.reverseDns,
      location: report.earliestReliableGeo,
      infraType: report.earliestReliableGeo.infraType,
      asn: report.earliestReliableGeo.asn,
      isp: report.earliestReliableGeo.isp
    } : null,
    risk: {
      fraudScore: report.risk.fraudScore,
      fraudLevel: report.risk.fraudLevel,
      attributionConfidence: report.risk.attributionConfidence,
      breakdown: report.risk.breakdown
    },
    classification: report.risk.classification,
    nlp: {
      urgencyScore: report.nlp.urgencyScore,
      becIndicators: report.nlp.becIndicators,
      threatsDetected: report.nlp.threatsDetected,
      lookalikeDomains: report.nlp.lookalikeDomains,
      sentimentAlerts: report.nlp.sentimentAlerts
    },
    urls: report.parsedEmail.urls.map(u => ({ url: u, domain: u, suspicious: false })),
    attachments: report.parsedEmail.attachments,
    iocs: report.iocs,
    graph: report.graph,
    campaignCluster: report.graph.campaignCluster,
    status: report.risk.fraudScore > 60 ? 'ESCALATED' : 'UNDER_REVIEW'
  };

  // Always save to fallback store for instant in-session access
  fallbackStorage.saveCase(report);

  // If MongoDB is connected, also save to MongoDB collection
  if (isConnected()) {
    try {
      await Case.findOneAndUpdate(
        { caseId: report.caseId },
        caseDoc,
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[MongoDB] Save warning:', e.message);
    }
  }
}

// Start Server
async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`✔ Backend server running on port: ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✖ Port ${PORT} is already in use.`);
    } else {
      console.error(`✖ Server error: ${err.message}`);
    }
  });
}

start();
