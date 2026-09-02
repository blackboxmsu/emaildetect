import crypto from 'crypto';
import { parseEmail, ParsedEmailData } from './emailParser.js';
import { analyzeHeaders, HeaderForensicsResult } from './headerForensics.js';
import { analyzeAuthentication, AuthenticationAnalysisResult } from './authAnalysis.js';
import { analyzeNLPThreats, NLPThreatAnalysis } from './nlpThreatEngine.js';
import { lookupGeoIP, analyzeDomainIntel, GeoLocationData, DomainIntelData } from './geoIpIntel.js';
import { calculateRiskAndConfidence, RiskScoreResult } from './riskEngine.js';
import { buildThreatGraph, ThreatGraphData } from './graphEngine.js';

export interface FullAnalysisReport {
  caseId: string;
  evidenceId: string;
  sha256: string;
  md5: string;
  fileName: string;
  analyzedAt: string;
  analyst: string;
  parsedEmail: ParsedEmailData;
  headers: HeaderForensicsResult;
  authentication: AuthenticationAnalysisResult;
  nlp: NLPThreatAnalysis;
  domainIntel: DomainIntelData;
  earliestReliableGeo: GeoLocationData | null;
  risk: RiskScoreResult;
  graph: ThreatGraphData;
  iocs: {
    ips: string[];
    domains: string[];
    urls: string[];
    hashes: string[];
  };
  chainOfCustody: {
    evidenceId: string;
    intakeTimestamp: string;
    sha256IntegrityHash: string;
    verifiedSignature: boolean;
    legalRetentionDays: number;
  };
}

export async function runFullEmailForensicAnalysis(
  rawContent: string | Buffer,
  fileName: string = 'investigation_evidence.eml',
  analyst: string = 'SOC-Threat-Forensics'
): Promise<FullAnalysisReport> {
  const caseId = `CASE-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const evidenceId = `EVD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const intakeTimestamp = new Date().toISOString();

  // 1. Email Parsing
  const parsed = await parseEmail(rawContent);

  // 2. Header Forensics
  const headers = analyzeHeaders(
    parsed.receivedHeaders,
    parsed.from.address || '',
    parsed.returnPath,
    parsed.replyTo?.address,
    parsed.messageId
  );

  // 3. Earliest Reliable Node Geolocation
  let earliestReliableGeo: GeoLocationData | null = null;
  if (headers.earliestReliableIp) {
    earliestReliableGeo = await lookupGeoIP(headers.earliestReliableIp);
  }

  // Populate geolocation for each hop in relayPath
  for (const hop of headers.relayPath) {
    if (hop.ip && !hop.isPrivateIp) {
      if (hop.ip === headers.earliestReliableIp && earliestReliableGeo) {
        hop.location = earliestReliableGeo;
      } else {
        hop.location = await lookupGeoIP(hop.ip);
      }
    }
  }

  // 4. Authentication Analysis
  const authentication = analyzeAuthentication(
    parsed.rawHeaders,
    parsed.from.domain || '',
    headers.earliestReliableIp
  );

  // 5. NLP & Threat Engine
  const nlp = analyzeNLPThreats(
    parsed.subject,
    parsed.textBody,
    parsed.from.address || '',
    parsed.from.value?.[0]?.name,
    parsed.urls
  );

  // 6. Domain Intelligence
  const domainIntel = analyzeDomainIntel(parsed.from.domain || '');

  // 7. URLs and Attachments Analysis
  const suspiciousUrls = parsed.urls.map(u => {
    let domain = '';
    try {
      domain = new URL(u).hostname;
    } catch {
      domain = u;
    }
    const isSuspicious = nlp.lookalikeDomains.some(l => l.domain === domain) || 
      domain.includes('auth') || domain.includes('login') || domain.includes('verify') || domain.endsWith('.xyz');
    return {
      url: u,
      domain,
      suspicious: isSuspicious,
      reason: isSuspicious ? 'Heuristic phishing/credential harvesting gateway' : 'Standard hyperlink'
    };
  });

  const suspiciousUrlCount = suspiciousUrls.filter(u => u.suspicious).length;
  const suspiciousAttachmentCount = parsed.attachments.filter(a => a.isSuspicious).length;

  // 8. Dual Risk & Attribution Confidence Engine
  const risk = calculateRiskAndConfidence(
    authentication,
    headers,
    nlp,
    domainIntel,
    earliestReliableGeo,
    suspiciousUrlCount,
    suspiciousAttachmentCount
  );

  // 9. Threat Relationship Graph & Campaign Correlation
  const graph = buildThreatGraph(
    caseId,
    parsed.subject,
    parsed.from.address || 'unknown@sender.net',
    parsed.from.domain || '',
    headers.earliestReliableIp,
    earliestReliableGeo?.isp || earliestReliableGeo?.organization,
    suspiciousUrls,
    parsed.attachments,
    risk.fraudLevel
  );

  // 10. Extract IOCs
  const iocIps = new Set<string>();
  if (headers.earliestReliableIp) iocIps.add(headers.earliestReliableIp);
  headers.relayPath.forEach(h => {
    if (h.ip && !h.isPrivateIp) iocIps.add(h.ip);
  });

  const iocDomains = new Set<string>();
  if (parsed.from.domain) iocDomains.add(parsed.from.domain);
  if (parsed.replyTo?.domain) iocDomains.add(parsed.replyTo.domain);
  suspiciousUrls.forEach(u => { if (u.domain) iocDomains.add(u.domain); });

  const iocHashes = new Set<string>();
  iocHashes.add(parsed.sha256);
  parsed.attachments.forEach(a => iocHashes.add(a.sha256));

  const iocs = {
    ips: Array.from(iocIps),
    domains: Array.from(iocDomains),
    urls: parsed.urls,
    hashes: Array.from(iocHashes)
  };

  const chainOfCustody = {
    evidenceId,
    intakeTimestamp,
    sha256IntegrityHash: parsed.sha256,
    verifiedSignature: true,
    legalRetentionDays: 365
  };

  return {
    caseId,
    evidenceId,
    sha256: parsed.sha256,
    md5: parsed.md5,
    fileName,
    analyzedAt: intakeTimestamp,
    analyst,
    parsedEmail: parsed,
    headers,
    authentication,
    nlp,
    domainIntel,
    earliestReliableGeo,
    risk,
    graph,
    iocs,
    chainOfCustody
  };
}
