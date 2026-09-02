// High-profile enterprise target domains for lookalike/typosquatting detection
const ENTERPRISE_TARGETS = [
  'microsoft.com',
  'office365.com',
  'google.com',
  'paypal.com',
  'apple.com',
  'amazon.com',
  'chase.com',
  'bankofamerica.com',
  'wellsfargo.com',
  'citigroup.com',
  'docusign.com',
  'adobe.com',
  'dropbox.com',
  'slack.com',
  'zoom.us',
  'salesforce.com',
  'github.com',
  'linkedin.com'
];

export interface LookalikeDomainResult {
  domain: string;
  target: string;
  similarity: number; // 0 to 1
  spoofed: boolean;
  technique: string;
}

export interface NLPThreatAnalysis {
  urgencyScore: number; // 0 to 100
  urgencyCues: string[];
  becIndicators: string[];
  threatsDetected: string[];
  lookalikeDomains: LookalikeDomainResult[];
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
  riskWeight: number; // 0 to 45
}

// Levenshtein distance helper
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[bn][an];
}

export function detectLookalikeDomain(domain: string): LookalikeDomainResult[] {
  if (!domain) return [];
  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const results: LookalikeDomainResult[] = [];

  for (const target of ENTERPRISE_TARGETS) {
    if (cleanDomain === target) continue;

    // Direct substring or brand embedding (e.g. microsoft-login.com or login-chase.com)
    const targetBrand = target.split('.')[0];
    if (cleanDomain.includes(targetBrand) && cleanDomain !== target) {
      results.push({
        domain: cleanDomain,
        target,
        similarity: 0.88,
        spoofed: true,
        technique: `Combosquatting / Brand hijacking containing '${targetBrand}'`
      });
      continue;
    }

    // Levenshtein distance check on domain SLD
    const cleanSLD = cleanDomain.split('.')[0];
    const targetSLD = target.split('.')[0];
    const dist = levenshtein(cleanSLD, targetSLD);

    if (dist > 0 && dist <= 2 && Math.abs(cleanSLD.length - targetSLD.length) <= 2) {
      const similarity = 1 - dist / Math.max(cleanSLD.length, targetSLD.length);
      results.push({
        domain: cleanDomain,
        target,
        similarity: Math.round(similarity * 100) / 100,
        spoofed: true,
        technique: `Typosquatting edit distance ${dist} from legitimate brand '${target}'`
      });
    }

    // Number substitution (e.g., micros0ft, paypa1)
    const homoglyph = cleanSLD.replace(/0/g, 'o').replace(/1/g, 'l').replace(/vv/g, 'w').replace(/5/g, 's');
    if (homoglyph === targetSLD && cleanSLD !== targetSLD) {
      results.push({
        domain: cleanDomain,
        target,
        similarity: 0.95,
        spoofed: true,
        technique: `Homoglyph character substitution (e.g., numeric substitution of vowels/letters)`
      });
    }
  }

  return results;
}

export function analyzeNLPThreats(
  subject: string,
  bodyText: string,
  fromEmail: string,
  fromName?: string,
  urls: string[] = []
): NLPThreatAnalysis {
  const combined = `${subject}\n${bodyText}`.toLowerCase();

  const urgencyCues: string[] = [];
  const becIndicators: string[] = [];
  const threatsDetected: string[] = [];
  const sentimentAlerts: string[] = [];

  // Urgency & Fear heuristics
  const urgencyPatterns = [
    { regex: /\b(immediate(?:ly)?|urgent(?:ly)?|right now|critical action|without delay)\b/i, cue: 'High-urgency imperative language' },
    { regex: /\b(within (?:24|12|48|2|1) hours?|deadline|expires? today|will be terminated|suspended within)\b/i, cue: 'Artificial time pressure / expiration deadline' },
    { regex: /\b(account (?:suspended|locked|restricted|disabled)|security breach|unauthorized access)\b/i, cue: 'Coercive account lock / penalty threat' },
    { regex: /\b(do not (?:call|contact|discuss)|keep this confidential|strictly confidential)\b/i, cue: 'Isolation tactic (requesting secrecy and no verification)' }
  ];

  for (const p of urgencyPatterns) {
    if (p.regex.test(combined)) {
      urgencyCues.push(p.cue);
    }
  }

  // Financial & BEC patterns
  const financialPatterns = [
    { regex: /\b(wire transfer|electronic transfer|ach payment|swift code|bank routing)\b/i, cue: 'Direct wire or ACH payment instruction' },
    { regex: /\b(update (?:our|the) bank(?:ing)? details|new account number|new routing details)\b/i, cue: 'Banking details diversion / payroll modification' },
    { regex: /\b(past due|outstanding invoice|remittance advice|overdue payment|invoice #[a-z0-9-]+)\b/i, cue: 'Fake invoice or overdue payment notice' },
    { regex: /\b(gift cards?|itunes card|steam card|apple gift card|vanilla visa)\b/i, cue: 'Executive gift card purchase scam' }
  ];

  for (const p of financialPatterns) {
    if (p.regex.test(combined)) {
      becIndicators.push(p.cue);
    }
  }

  // Executive Impersonation patterns
  const executiveCues: string[] = [];
  const execPatterns = [
    { regex: /\b(are you (?:at your desk|available)|in a meeting|busy right now|need you to handle this)\b/i, cue: 'Executive availability baiting' },
    { regex: /\b(sent from my (?:iphone|ipad|mobile device)|cant take calls|cant talk)\b/i, cue: 'Excuses for avoiding voice verification' }
  ];

  for (const p of execPatterns) {
    if (p.regex.test(combined)) {
      executiveCues.push(p.cue);
    }
  }

  // Check if sender name sounds like CEO/Executive but uses public domain
  const senderDomain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : '';
  const publicWebmails = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'mail.com', 'aol.com'];
  if (fromName && publicWebmails.includes(senderDomain)) {
    const execKeywords = ['ceo', 'cfo', 'director', 'president', 'executive', 'chief', 'founder', 'board'];
    if (execKeywords.some(k => (fromName || '').toLowerCase().includes(k))) {
      executiveCues.push(`Executive title in display name ('${fromName}') paired with free webmail (${senderDomain})`);
      becIndicators.push('Executive Display Name Spoofing over free webmail');
    }
  }

  // Credential Harvesting
  const credCues: string[] = [];
  const credPatterns = [
    { regex: /\b(verify your (?:account|password|identity)|password (?:expires?|expired)|login to verify)\b/i, cue: 'Credential verification prompt' },
    { regex: /\b(click here to login|sign in to keep your password|reactivate account)\b/i, cue: 'Call-to-action redirecting to auth portal' },
    { regex: /\b(office 365|microsoft 365|sharepoint notification|onedrive document shared)\b/i, cue: 'Cloud productivity lure (Office 365 / SharePoint)' }
  ];

  for (const p of credPatterns) {
    if (p.regex.test(combined)) {
      credCues.push(p.cue);
    }
  }

  // Lookalike Domain Check
  const lookalikeDomains: LookalikeDomainResult[] = [];
  if (senderDomain) {
    lookalikeDomains.push(...detectLookalikeDomain(senderDomain));
  }
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      lookalikeDomains.push(...detectLookalikeDomain(parsed.hostname));
    } catch {
      // ignore
    }
  }

  // Aggregate threats
  if (becIndicators.length > 0) threatsDetected.push('Business Email Compromise (BEC)');
  if (credCues.length > 0) threatsDetected.push('Credential Harvesting Phishing');
  if (executiveCues.length > 0) threatsDetected.push('Executive Impersonation Fraud');
  if (lookalikeDomains.length > 0) threatsDetected.push('Lookalike / Typosquatting Domain');
  if (urgencyCues.length >= 2) threatsDetected.push('Social Engineering & Coercive Pressure');

  // Compute urgency score (0 - 100)
  const urgencyScore = Math.min(100, (urgencyCues.length * 30) + (executiveCues.length * 20));

  // Compute risk weight (0 - 45)
  let riskWeight = 0;
  riskWeight += Math.min(15, urgencyCues.length * 5);
  riskWeight += Math.min(20, becIndicators.length * 10);
  riskWeight += Math.min(15, credCues.length * 8);
  if (lookalikeDomains.length > 0) riskWeight += 20;

  return {
    urgencyScore,
    urgencyCues,
    becIndicators,
    threatsDetected,
    lookalikeDomains,
    executiveImpersonation: {
      detected: executiveCues.length > 0,
      cues: executiveCues
    },
    credentialHarvesting: {
      detected: credCues.length > 0,
      cues: credCues
    },
    financialFraud: {
      detected: becIndicators.length > 0,
      cues: becIndicators
    },
    sentimentAlerts,
    riskWeight: Math.min(45, riskWeight)
  };
}
