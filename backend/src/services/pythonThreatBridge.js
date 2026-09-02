import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate Python runtime
function getPythonExecutable() {
  const candidates = [
    path.resolve(process.cwd(), 'backend', 'python_runtime', 'python.exe'),
    path.resolve(process.cwd(), 'python_runtime', 'python.exe'),
    path.resolve(__dirname, '..', '..', 'python_runtime', 'python.exe'),
    'python3',
    'python',
    'py'
  ];

  for (const c of candidates) {
    if (c.includes('\\') || c.includes('/')) {
      if (fs.existsSync(c)) return c;
    }
  }
  return 'python';
}

function getAiScriptPath() {
  const candidates = [
    path.resolve(process.cwd(), 'backend', 'ai_engine.py'),
    path.resolve(process.cwd(), 'ai_engine.py'),
    path.resolve(__dirname, '..', '..', 'ai_engine.py')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(__dirname, '..', '..', 'ai_engine.py');
}

/**
 * Execute Python AI & NLP Threat Engine with graceful fallback to JS
 */
export async function analyzeThreatsWithPython(subject, bodyText, fromEmail, fromName = '', urls = []) {
  const pythonExe = getPythonExecutable();
  const scriptPath = getAiScriptPath();

  const payload = JSON.stringify({
    subject: subject || '',
    bodyText: bodyText || '',
    fromEmail: fromEmail || '',
    fromName: fromName || '',
    urls: urls || []
  });

  return new Promise((resolve) => {
    try {
      const child = spawn(pythonExe, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      child.on('error', (err) => {
        console.warn(`[Python Bridge] Spawning Python failed: ${err.message}. Using high-fidelity JS fallback.`);
        resolve(fallbackJsNlpAnalysis(subject, bodyText, fromEmail, fromName, urls));
      });

      child.on('close', (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            return resolve(parsed);
          } catch (jsonErr) {
            console.warn(`[Python Bridge] JSON parse error from Python output:`, jsonErr.message);
          }
        } else {
          console.warn(`[Python Bridge] Python script exited with code ${code}: ${stderrData}`);
        }
        resolve(fallbackJsNlpAnalysis(subject, bodyText, fromEmail, fromName, urls));
      });

      // Write payload to Python stdin
      child.stdin.write(payload);
      child.stdin.end();

      // Timeout safety (5 seconds)
      setTimeout(() => {
        try {
          child.kill();
        } catch {}
      }, 5000);

    } catch (e) {
      console.warn(`[Python Bridge] Execution exception: ${e.message}`);
      resolve(fallbackJsNlpAnalysis(subject, bodyText, fromEmail, fromName, urls));
    }
  });
}

// Full JavaScript fallback in case Python process is interrupted
function fallbackJsNlpAnalysis(subject, bodyText, fromEmail, fromName, urls = []) {
  const combined = `${subject || ''}\n${bodyText || ''}`.toLowerCase();
  const urgencyCues = [];
  const becIndicators = [];
  const threatsDetected = [];

  const urgencyPatterns = [
    { regex: /\b(immediate(?:ly)?|urgent(?:ly)?|right now|critical action|without delay)\b/i, cue: 'High-urgency imperative language' },
    { regex: /\b(within (?:24|12|48|2|1) hours?|deadline|expires? today|will be terminated|suspended within)\b/i, cue: 'Artificial time pressure / expiration deadline' },
    { regex: /\b(account (?:suspended|locked|restricted|disabled)|security breach|unauthorized access)\b/i, cue: 'Coercive account lock / penalty threat' },
    { regex: /\b(do not (?:call|contact|discuss)|keep this confidential|strictly confidential)\b/i, cue: 'Isolation tactic (requesting secrecy and no verification)' }
  ];

  for (const p of urgencyPatterns) {
    if (p.regex.test(combined)) urgencyCues.push(p.cue);
  }

  const financialPatterns = [
    { regex: /\b(wire transfer|electronic transfer|ach payment|swift code|bank routing)\b/i, cue: 'Direct wire or ACH payment instruction' },
    { regex: /\b(update (?:our|the) bank(?:ing)? details|new account number|new routing details)\b/i, cue: 'Banking details diversion / payroll modification' },
    { regex: /\b(past due|outstanding invoice|remittance advice|overdue payment|invoice #[a-z0-9-]+)\b/i, cue: 'Fake invoice or overdue payment notice' },
    { regex: /\b(gift cards?|itunes card|steam card|apple gift card|vanilla visa)\b/i, cue: 'Executive gift card purchase scam' }
  ];

  for (const p of financialPatterns) {
    if (p.regex.test(combined)) becIndicators.push(p.cue);
  }

  const executiveCues = [];
  const execPatterns = [
    { regex: /\b(are you (?:at your desk|available)|in a meeting|busy right now|need you to handle this)\b/i, cue: 'Executive availability baiting' },
    { regex: /\b(sent from my (?:iphone|ipad|mobile device)|cant take calls|cant talk)\b/i, cue: 'Excuses for avoiding voice verification' }
  ];

  for (const p of execPatterns) {
    if (p.regex.test(combined)) executiveCues.push(p.cue);
  }

  const credCues = [];
  const credPatterns = [
    { regex: /\b(verify your (?:account|password|identity)|password (?:expires?|expired)|login to verify)\b/i, cue: 'Credential verification prompt' },
    { regex: /\b(click here to login|sign in to keep your password|reactivate account)\b/i, cue: 'Call-to-action redirecting to auth portal' },
    { regex: /\b(office 365|microsoft 365|sharepoint notification|onedrive document shared)\b/i, cue: 'Cloud productivity lure (Office 365 / SharePoint)' }
  ];

  for (const p of credPatterns) {
    if (p.regex.test(combined)) credCues.push(p.cue);
  }

  if (becIndicators.length > 0) threatsDetected.push('Business Email Compromise (BEC)');
  if (credCues.length > 0) threatsDetected.push('Credential Harvesting Phishing');
  if (executiveCues.length > 0) threatsDetected.push('Executive Impersonation Fraud');
  if (urgencyCues.length >= 2) threatsDetected.push('Social Engineering & Coercive Pressure');

  const urgencyScore = Math.min(100, (urgencyCues.length * 30) + (executiveCues.length * 20));

  let riskWeight = 0;
  riskWeight += Math.min(15, urgencyCues.length * 5);
  riskWeight += Math.min(20, becIndicators.length * 10);
  riskWeight += Math.min(15, credCues.length * 8);

  return {
    engine: 'JavaScript High-Fidelity Threat Engine Fallback',
    urgencyScore,
    urgencyCues,
    becIndicators,
    threatsDetected,
    lookalikeDomains: [],
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
    sentimentAlerts: [],
    riskWeight: Math.min(45, riskWeight)
  };
}
