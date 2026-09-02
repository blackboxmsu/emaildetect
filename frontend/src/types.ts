export interface SampleScenario {
  id: string;
  title: string;
  category: string;
  expectedRisk: string;
  description: string;
}

export interface RelayHop {
  hopIndex: number;
  rawHeader: string;
  from?: string;
  by?: string;
  withProtocol?: string;
  ip?: string;
  timestamp?: string;
  parsedDate?: string;
  delaySeconds?: number;
  isPrivateIp: boolean;
  isEarliestReliable: boolean;
  notes?: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    isp?: string;
    asn?: string;
    organization?: string;
    infraType: string;
  };
}

export interface AnalysisReport {
  caseId: string;
  evidenceId: string;
  sha256: string;
  md5: string;
  fileName: string;
  analyzedAt: string;
  analyst: string;
  parsedEmail: {
    subject: string;
    sizeBytes: number;
    from: {
      text: string;
      address?: string;
      domain?: string;
    };
    to?: {
      text: string;
      address?: string;
    };
    replyTo?: {
      text: string;
      address?: string;
      domain?: string;
    };
    returnPath?: string;
    messageId?: string;
    date?: string;
    textBody: string;
    htmlBody: string;
    urls: string[];
    rawHeaders: Record<string, string | string[]>;
    attachments: Array<{
      filename: string;
      contentType: string;
      size: number;
      sha256: string;
      isSuspicious: boolean;
      flagReason?: string;
    }>;
  };
  headers: {
    relayPath: RelayHop[];
    earliestReliableIp: string | null;
    earliestReliableHopIndex: number | null;
    fromDomain: string;
    returnPathDomain: string;
    replyToDomain: string;
    returnPathMismatch: boolean;
    replyToMismatch: boolean;
    messageIdValid: boolean;
    messageIdDomainMismatch: boolean;
    routingAnomalies: string[];
  };
  authentication: {
    spf: {
      status: string;
      pass: boolean;
      details: string;
      record?: string;
      ipChecked?: string;
    };
    dkim: {
      status: string;
      pass: boolean;
      details: string;
      domain?: string;
      selector?: string;
      alignment: boolean;
    };
    dmarc: {
      status: string;
      pass: boolean;
      details: string;
      policy?: string;
      spfAligned: boolean;
      dkimAligned: boolean;
    };
    summary: string;
    riskWeight: number;
  };
  nlp: {
    urgencyScore: number;
    urgencyCues: string[];
    becIndicators: string[];
    threatsDetected: string[];
    lookalikeDomains: Array<{
      domain: string;
      target: string;
      similarity: number;
      spoofed: boolean;
      technique: string;
    }>;
    executiveImpersonation: {
      detected: boolean;
      cues: string[];
    };
    credentialHarvesting: {
      detected: boolean;
      cues: string[];
    };
    financialFraud: {
      detected: boolean;
      cues: string[];
    };
    sentimentAlerts: string[];
  };
  domainIntel: {
    domain: string;
    registrar?: string;
    createdDate?: string;
    ageDays?: number;
    isRecentlyRegistered: boolean;
    reputation: string;
  };
  earliestReliableGeo: {
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    asn?: string;
    isp?: string;
    organization?: string;
    infraType: string;
    threatFlags: string[];
    reverseDns?: string;
  } | null;
  risk: {
    fraudScore: number;
    fraudLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    attributionConfidence: number;
    breakdown: {
      authenticationWeight: number;
      nlpUrgencyAndBecWeight: number;
      domainReputationWeight: number;
      infrastructureAndIpWeight: number;
      attachmentAndUrlWeight: number;
    };
    classification: {
      category: string;
      primaryThreat: string;
      confidence: number;
      description: string;
    };
    attributionAssessment: {
      infrastructureType: string;
      originReliability: string;
      disclaimer: string;
      probableInfrastructureOrigin: string;
    };
  };
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      risk?: string;
      details?: any;
    }>;
    edges: Array<{
      from: string;
      to: string;
      label: string;
      risk?: string;
    }>;
    campaignCluster?: {
      id: string;
      name: string;
      confidence: number;
      sharedAttributes: string[];
    };
  };
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
