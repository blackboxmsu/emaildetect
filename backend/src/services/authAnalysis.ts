export interface AuthStatus {
  pass: boolean;
  status: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE' | 'TEMPERROR' | 'PERMERROR';
  details: string;
}

export interface AuthenticationAnalysisResult {
  spf: AuthStatus & { record?: string; ipChecked?: string; clientDomain?: string };
  dkim: AuthStatus & { domain?: string; selector?: string; algorithm?: string; signatureValid?: boolean; alignment: boolean };
  dmarc: AuthStatus & { policy?: string; spfAligned: boolean; dkimAligned: boolean };
  summary: string;
  riskWeight: number; // 0 to 40 contribution to fraud risk
}

export function analyzeAuthentication(
  rawHeaders: Record<string, string | string[]>,
  fromDomain: string,
  originIp?: string | null
): AuthenticationAnalysisResult {
  const authResults = String(rawHeaders['authentication-results'] || '');
  const recSpf = String(rawHeaders['received-spf'] || '');
  const dkimSig = String(rawHeaders['dkim-signature'] || '');

  // 1. SPF Analysis
  let spfStatus: AuthStatus['status'] = 'NONE';
  let spfPass = false;
  let spfDetails = 'No SPF record or header evaluated';
  let ipChecked = originIp || undefined;

  if (recSpf) {
    const lowerSpf = recSpf.toLowerCase();
    if (lowerSpf.includes('pass')) {
      spfStatus = 'PASS';
      spfPass = true;
      spfDetails = 'Sender IP is explicitly authorized in domain SPF record';
    } else if (lowerSpf.includes('fail') && !lowerSpf.includes('softfail')) {
      spfStatus = 'FAIL';
      spfPass = false;
      spfDetails = 'Hard SPF Fail: Sender IP is unauthorized by domain policy (-all)';
    } else if (lowerSpf.includes('softfail')) {
      spfStatus = 'SOFTFAIL';
      spfPass = false;
      spfDetails = 'Soft SPF Fail: Sender IP is not authorized (~all)';
    } else if (lowerSpf.includes('neutral')) {
      spfStatus = 'NEUTRAL';
      spfPass = false;
      spfDetails = 'SPF Neutral: Domain does not assert authorization (?all)';
    } else if (lowerSpf.includes('permerror')) {
      spfStatus = 'PERMERROR';
      spfPass = false;
      spfDetails = 'SPF Permanent Error in DNS record syntax';
    }
  } else if (authResults) {
    const match = authResults.match(/spf=([a-z]+)/i);
    if (match) {
      const val = match[1].toLowerCase();
      if (val === 'pass') {
        spfStatus = 'PASS';
        spfPass = true;
        spfDetails = 'SPF verified as PASS via Authentication-Results';
      } else if (val === 'fail') {
        spfStatus = 'FAIL';
        spfDetails = 'SPF hard failure in Authentication-Results';
      } else if (val === 'softfail') {
        spfStatus = 'SOFTFAIL';
        spfDetails = 'SPF softfail in Authentication-Results';
      } else if (val === 'none') {
        spfStatus = 'NONE';
        spfDetails = 'No SPF record published';
      }
    }
  }

  // 2. DKIM Analysis
  let dkimStatus: AuthStatus['status'] = 'NONE';
  let dkimPass = false;
  let dkimDomain: string | undefined = undefined;
  let dkimSelector: string | undefined = undefined;
  let dkimAlgo: string | undefined = undefined;
  let dkimAlignment = false;
  let dkimDetails = 'No cryptographic DKIM signature found';

  if (dkimSig) {
    // Parse tags: d=, s=, a=
    const dMatch = dkimSig.match(/\bd=([^;\s]+)/i);
    const sMatch = dkimSig.match(/\bs=([^;\s]+)/i);
    const aMatch = dkimSig.match(/\ba=([^;\s]+)/i);

    if (dMatch) dkimDomain = dMatch[1].toLowerCase();
    if (sMatch) dkimSelector = sMatch[1];
    if (aMatch) dkimAlgo = aMatch[1];

    if (authResults) {
      const match = authResults.match(/dkim=([a-z]+)/i);
      if (match) {
        const val = match[1].toLowerCase();
        if (val === 'pass') {
          dkimStatus = 'PASS';
          dkimPass = true;
          dkimDetails = `DKIM signature verified (domain: ${dkimDomain || 'unknown'})`;
        } else if (val === 'fail') {
          dkimStatus = 'FAIL';
          dkimDetails = 'DKIM signature cryptographic verification failed (tampered message or bad key)';
        }
      } else {
        dkimStatus = 'NEUTRAL';
        dkimDetails = `DKIM signature present (d=${dkimDomain}), awaiting resolver verification`;
      }
    } else {
      dkimStatus = 'NEUTRAL';
      dkimDetails = `DKIM signature found for domain ${dkimDomain}`;
    }

    if (dkimDomain && fromDomain) {
      dkimAlignment = dkimDomain === fromDomain || fromDomain.endsWith(`.${dkimDomain}`);
    }
  }

  // 3. DMARC Analysis
  let dmarcStatus: AuthStatus['status'] = 'NONE';
  let dmarcPass = false;
  let dmarcPolicy: string | undefined = undefined;
  let spfAligned = spfPass && Boolean(fromDomain);
  let dkimAligned = dkimPass && dkimAlignment;
  let dmarcDetails = 'No DMARC evaluation found in headers';

  if (authResults) {
    const match = authResults.match(/dmarc=([a-z]+)/i);
    if (match) {
      const val = match[1].toLowerCase();
      if (val === 'pass') {
        dmarcStatus = 'PASS';
        dmarcPass = true;
        dmarcDetails = 'DMARC Passed: Authentication and domain alignment validated';
      } else if (val === 'fail') {
        dmarcStatus = 'FAIL';
        dmarcPass = false;
        dmarcDetails = 'DMARC Failed: Neither SPF nor DKIM passed and aligned with From domain';
      }
    }
  }

  if (dmarcStatus === 'NONE') {
    if (spfAligned || dkimAligned) {
      dmarcStatus = 'PASS';
      dmarcPass = true;
      dmarcDetails = 'Inferred DMARC Pass: Domain alignment satisfied via valid protocol';
    } else if (spfStatus === 'FAIL' || dkimStatus === 'FAIL') {
      dmarcStatus = 'FAIL';
      dmarcPass = false;
      dmarcDetails = 'DMARC Alignment Failure: Authentication unverified or mismatched';
    }
  }

  // Calculate risk weight
  let riskWeight = 0;
  if (dmarcStatus === 'FAIL') riskWeight += 25;
  if (spfStatus === 'FAIL') riskWeight += 15;
  else if (spfStatus === 'SOFTFAIL') riskWeight += 8;
  if (dkimSig && dkimStatus === 'FAIL') riskWeight += 15;
  if (dkimSig && !dkimAlignment) riskWeight += 10;

  let summary = 'Protocols verified successfully';
  if (dmarcStatus === 'FAIL' || spfStatus === 'FAIL') {
    summary = 'Email failed critical sender authentication checks (Spoofing indicator)';
  } else if (spfStatus === 'SOFTFAIL' || !dkimAligned) {
    summary = 'Partial authentication with domain alignment warnings';
  }

  return {
    spf: {
      status: spfStatus,
      pass: spfPass,
      details: spfDetails,
      record: recSpf || undefined,
      ipChecked
    },
    dkim: {
      status: dkimStatus,
      pass: dkimPass,
      details: dkimDetails,
      domain: dkimDomain,
      selector: dkimSelector,
      algorithm: dkimAlgo,
      alignment: dkimAlignment
    },
    dmarc: {
      status: dmarcStatus,
      pass: dmarcPass,
      details: dmarcDetails,
      policy: dmarcPolicy || 'quarantine',
      spfAligned,
      dkimAligned
    },
    summary,
    riskWeight: Math.min(40, riskWeight)
  };
}
