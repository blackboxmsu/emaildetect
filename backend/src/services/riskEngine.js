export function calculateRiskAndConfidence(
  auth,
  headers,
  nlp,
  domainIntel,
  originGeo,
  suspiciousUrlCount = 0,
  suspiciousAttachmentCount = 0
) {
  let authWeight = 0;
  let nlpWeight = 0;
  let domainWeight = 0;
  let infraWeight = 0;
  let payloadWeight = 0;

  // 1. Authentication Weight (up to 30)
  if (auth?.dmarc?.status === 'FAIL') authWeight += 15;
  if (auth?.spf?.status === 'FAIL') authWeight += 10;
  else if (auth?.spf?.status === 'SOFTFAIL') authWeight += 5;
  if (auth?.dkim?.status === 'FAIL') authWeight += 10;
  else if (!auth?.dkim?.alignment && auth?.dkim?.domain) authWeight += 8;
  if (headers?.returnPathMismatch) authWeight += 10;
  if (headers?.replyToMismatch) authWeight += 15;
  authWeight = Math.min(30, authWeight);

  // 2. NLP & BEC Weight (up to 35)
  if (nlp?.financialFraud?.detected) nlpWeight += 18;
  if (nlp?.executiveImpersonation?.detected) nlpWeight += 15;
  if (nlp?.credentialHarvesting?.detected) nlpWeight += 14;
  nlpWeight += Math.min(10, (nlp?.urgencyCues?.length || 0) * 4);
  nlpWeight = Math.min(35, nlpWeight);

  // 3. Domain Reputation Weight (up to 20)
  if ((nlp?.lookalikeDomains?.length || 0) > 0) domainWeight += 16;
  if (domainIntel?.isRecentlyRegistered) domainWeight += 10;
  if (domainIntel?.reputation === 'MALICIOUS') domainWeight += 14;
  else if (domainIntel?.reputation === 'SUSPICIOUS') domainWeight += 7;
  domainWeight = Math.min(20, domainWeight);

  // 4. Infrastructure & IP Reputation Weight (up to 15)
  if (originGeo) {
    if (originGeo.infraType === 'TOR_EXIT') infraWeight += 15;
    else if (originGeo.infraType === 'VPN_PROXY') infraWeight += 12;
    else if (originGeo.infraType === 'CLOUD_HOSTING' && nlpWeight > 10) infraWeight += 8;
    infraWeight += Math.min(10, (originGeo.threatFlags || []).length * 4);
  }
  if ((headers?.routingAnomalies?.length || 0) > 0) infraWeight += 6;
  infraWeight = Math.min(15, infraWeight);

  // 5. Payload Weight (Attachments & URLs) (up to 15)
  if (suspiciousAttachmentCount > 0) payloadWeight += 15;
  if (suspiciousUrlCount > 0) payloadWeight += 10;
  payloadWeight = Math.min(15, payloadWeight);

  // Total Fraud Score (0 - 100)
  const totalFraud = Math.min(100, Math.round(authWeight + nlpWeight + domainWeight + infraWeight + payloadWeight));

  let fraudLevel = 'LOW';
  if (totalFraud >= 80) fraudLevel = 'CRITICAL';
  else if (totalFraud >= 60) fraudLevel = 'HIGH';
  else if (totalFraud >= 30) fraudLevel = 'MEDIUM';

  // Attribution Confidence (0 - 100)
  let attrScore = 50; // baseline

  // Positive technical evidence increases attribution confidence:
  if (headers?.earliestReliableIp) attrScore += 15;
  if ((headers?.relayPath?.length || 0) >= 2) attrScore += 10;
  if (originGeo && originGeo.asn) attrScore += 10;
  if (auth?.dkim?.pass) attrScore += 10; // Cryptographically signed provenance
  if (domainIntel?.createdDate) attrScore += 5;

  // Header tampering or anonymization reduces confidence in physical attacker attribution:
  if (originGeo?.infraType === 'TOR_EXIT') attrScore -= 30; // Tor obscures source
  else if (originGeo?.infraType === 'VPN_PROXY') attrScore -= 20; // VPN proxy masks origin
  if ((headers?.routingAnomalies?.length || 0) > 1) attrScore -= 15; // Corrupted / forged hops

  const attributionConfidence = Math.max(15, Math.min(95, Math.round(attrScore)));

  // Threat Classification
  let category = 'BENIGN';
  let primaryThreat = 'Clean Mail Traffic';
  let desc = 'Headers, authentication, and content match legitimate communication standards.';

  if (suspiciousAttachmentCount > 0) {
    category = 'MALWARE_DROPPER';
    primaryThreat = 'Malicious Attachment Dropper';
    desc = 'The email contains high-risk executable or macro-enabled attachments intended to deliver malware.';
  } else if (nlp?.financialFraud?.detected && (nlp?.executiveImpersonation?.detected || authWeight > 10)) {
    category = 'BEC_FRAUD';
    primaryThreat = 'Business Email Compromise (Payment Diversion)';
    desc = 'Urgent request attempting to divert financial funds or modify banking details under executive pretense.';
  } else if (nlp?.credentialHarvesting?.detected || ((nlp?.lookalikeDomains?.length || 0) > 0 && suspiciousUrlCount > 0)) {
    category = 'PHISHING';
    primaryThreat = 'Credential Harvesting Phishing';
    desc = 'Email utilizes deceptive domain branding and call-to-action links to harvest user credentials.';
  } else if (nlp?.executiveImpersonation?.detected) {
    category = 'EXECUTIVE_IMPERSONATION';
    primaryThreat = 'Executive Impersonation';
    desc = 'Sender mimics executive leadership to deceive the recipient into unauthorized actions.';
  } else if (totalFraud >= 30) {
    category = 'SUSPICIOUS';
    primaryThreat = 'Suspicious Relay / Anomalous Header Pattern';
    desc = 'Email exhibits abnormal routing headers and partial protocol authentication failures.';
  }

  const probableOrigin = originGeo 
    ? `${originGeo.city ? originGeo.city + ', ' : ''}${originGeo.country} (${originGeo.isp || originGeo.asn || 'Autonomous System'})`
    : 'Unknown Network Node';

  return {
    fraudScore: totalFraud,
    fraudLevel,
    attributionConfidence,
    breakdown: {
      authenticationWeight: authWeight,
      nlpUrgencyAndBecWeight: nlpWeight,
      domainReputationWeight: domainWeight,
      infrastructureAndIpWeight: infraWeight,
      attachmentAndUrlWeight: payloadWeight
    },
    classification: {
      category,
      primaryThreat,
      confidence: Math.max(65, totalFraud),
      description: desc
    },
    attributionAssessment: {
      infrastructureType: originGeo?.infraType || 'UNKNOWN',
      originReliability: attributionConfidence > 75 ? 'High Technical Evidence' : 'Probable Transit Infrastructure',
      disclaimer: 'LEGAL & FORENSIC NOTICE: Origin location represents technical network routing infrastructure (MTA/Proxy/Hosting Provider), NOT the verified physical location of the human operator.',
      probableInfrastructureOrigin: probableOrigin
    }
  };
}
