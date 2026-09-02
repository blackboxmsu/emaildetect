#!/usr/bin/env python3
"""
AI-Powered Email Threat Forensics - Python NLP & Threat Intelligence Engine
Performs deep content heuristics, social engineering detection, BEC detection,
executive impersonation heuristics, homoglyph / typosquatting domain analysis,
and sentiment & risk weighting.
"""

import sys
import json
import re
from urllib.parse import urlparse

ENTERPRISE_TARGETS = [
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
]

PUBLIC_WEBMAILS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'protonmail.com', 'mail.com', 'aol.com', 'icloud.com'
]

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def detect_lookalike_domain(domain: str):
    if not domain:
        return []
    clean_domain = re.sub(r'^(https?:\/\/)?(www\.)?', '', domain.lower()).split('/')[0]
    results = []

    for target in ENTERPRISE_TARGETS:
        if clean_domain == target:
            continue

        target_brand = target.split('.')[0]
        # Combosquatting / brand hijacking
        if target_brand in clean_domain and clean_domain != target:
            results.append({
                'domain': clean_domain,
                'target': target,
                'similarity': 0.88,
                'spoofed': True,
                'technique': f"Combosquatting / Brand hijacking containing '{target_brand}'"
            })
            continue

        # Typosquatting Levenshtein distance on SLD
        clean_sld = clean_domain.split('.')[0]
        target_sld = target.split('.')[0]
        dist = levenshtein_distance(clean_sld, target_sld)

        if 0 < dist <= 2 and abs(len(clean_sld) - len(target_sld)) <= 2:
            max_len = max(len(clean_sld), len(target_sld))
            sim = round(1.0 - (dist / max_len), 2)
            results.append({
                'domain': clean_domain,
                'target': target,
                'similarity': sim,
                'spoofed': True,
                'technique': f"Typosquatting edit distance {dist} from legitimate brand '{target}'"
            })
            continue

        # Homoglyphs / numeric substitution (e.g., micros0ft, paypa1, vv/w)
        homoglyph = (clean_sld.replace('0', 'o')
                              .replace('1', 'l')
                              .replace('vv', 'w')
                              .replace('5', 's'))
        if homoglyph == target_sld and clean_sld != target_sld:
            results.append({
                'domain': clean_domain,
                'target': target,
                'similarity': 0.95,
                'spoofed': True,
                'technique': "Homoglyph character substitution (e.g., numeric substitution of vowels/letters)"
            })
            continue

        # Substring or compound homoglyph (e.g. micros0ft-corp or login-micros0ft)
        if target_brand in homoglyph and clean_domain != target:
            results.append({
                'domain': clean_domain,
                'target': target,
                'similarity': 0.90,
                'spoofed': True,
                'technique': f"Homoglyph and brand hijacking targeting '{target}' ('{target_brand}')"
            })
            continue

    return results

def analyze_nlp_threats(subject: str, body_text: str, from_email: str, from_name: str = '', urls=None):
    if urls is None:
        urls = []

    combined = f"{subject or ''}\n{body_text or ''}".lower()
    urgency_cues = []
    bec_indicators = []
    threats_detected = []
    sentiment_alerts = []

    # 1. Urgency heuristics
    urgency_patterns = [
        (r'\b(immediate(?:ly)?|urgent(?:ly)?|right now|critical action|without delay)\b', 'High-urgency imperative language'),
        (r'\b(within (?:24|12|48|2|1) hours?|deadline|expires? today|will be terminated|suspended within)\b', 'Artificial time pressure / expiration deadline'),
        (r'\b(account (?:suspended|locked|restricted|disabled)|security breach|unauthorized access)\b', 'Coercive account lock / penalty threat'),
        (r'\b(do not (?:call|contact|discuss)|keep this confidential|strictly confidential)\b', 'Isolation tactic (requesting secrecy and no verification)')
    ]
    for pattern, cue in urgency_patterns:
        if re.search(pattern, combined, re.IGNORECASE):
            urgency_cues.append(cue)

    # 2. Financial & BEC patterns
    financial_patterns = [
        (r'\b(wire transfer|electronic transfer|ach payment|swift code|bank routing)\b', 'Direct wire or ACH payment instruction'),
        (r'\b(update (?:our|the) bank(?:ing)? details|new account number|new routing details)\b', 'Banking details diversion / payroll modification'),
        (r'\b(past due|outstanding invoice|remittance advice|overdue payment|invoice #[a-z0-9-]+)\b', 'Fake invoice or overdue payment notice'),
        (r'\b(gift cards?|itunes card|steam card|apple gift card|vanilla visa)\b', 'Executive gift card purchase scam')
    ]
    for pattern, cue in financial_patterns:
        if re.search(pattern, combined, re.IGNORECASE):
            bec_indicators.append(cue)

    # 3. Executive Impersonation patterns
    executive_cues = []
    exec_patterns = [
        (r'\b(are you (?:at your desk|available)|in a meeting|busy right now|need you to handle this)\b', 'Executive availability baiting'),
        (r'\b(sent from my (?:iphone|ipad|mobile device)|cant take calls|cant talk)\b', 'Excuses for avoiding voice verification')
    ]
    for pattern, cue in exec_patterns:
        if re.search(pattern, combined, re.IGNORECASE):
            executive_cues.append(cue)

    # Check sender domain for executive spoofing over free webmail
    sender_domain = from_email.split('@')[1].lower() if '@' in from_email else ''
    if from_name and sender_domain in PUBLIC_WEBMAILS:
        exec_titles = ['ceo', 'cfo', 'director', 'president', 'executive', 'chief', 'founder', 'board']
        lower_name = from_name.lower()
        if any(k in lower_name for k in exec_titles):
            executive_cues.append(f"Executive title in display name ('{from_name}') paired with free webmail ({sender_domain})")
            bec_indicators.append('Executive Display Name Spoofing over free webmail')

    # 4. Credential Harvesting
    cred_cues = []
    cred_patterns = [
        (r'\b(verify your (?:account|password|identity)|password (?:expires?|expired)|login to verify)\b', 'Credential verification prompt'),
        (r'\b(click here to login|sign in to keep your password|reactivate account)\b', 'Call-to-action redirecting to auth portal'),
        (r'\b(office 365|microsoft 365|sharepoint notification|onedrive document shared)\b', 'Cloud productivity lure (Office 365 / SharePoint)')
    ]
    for pattern, cue in cred_patterns:
        if re.search(pattern, combined, re.IGNORECASE):
            cred_cues.append(cue)

    # 5. Lookalike Domain Check
    lookalike_domains = []
    if sender_domain:
        lookalike_domains.extend(detect_lookalike_domain(sender_domain))

    for u in urls:
        try:
            parsed = urlparse(u)
            host = parsed.netloc or parsed.path
            lookalike_domains.extend(detect_lookalike_domain(host))
        except Exception:
            pass

    # 6. Threat aggregation
    if bec_indicators:
        threats_detected.append('Business Email Compromise (BEC)')
    if cred_cues:
        threats_detected.append('Credential Harvesting Phishing')
    if executive_cues:
        threats_detected.append('Executive Impersonation Fraud')
    if lookalike_domains:
        threats_detected.append('Lookalike / Typosquatting Domain')
    if len(urgency_cues) >= 2:
        threats_detected.append('Social Engineering & Coercive Pressure')

    # 7. Sentiment and Urgency Score
    urgency_score = min(100, (len(urgency_cues) * 30) + (len(executive_cues) * 20))

    # 8. Risk Weight (0 to 45)
    risk_weight = 0
    risk_weight += min(15, len(urgency_cues) * 5)
    risk_weight += min(20, len(bec_indicators) * 10)
    risk_weight += min(15, len(cred_cues) * 8)
    if lookalike_domains:
        risk_weight += 20
    risk_weight = min(45, risk_weight)

    return {
        'engine': 'Python AI/NLP Threat Forensics Engine v2.0',
        'urgencyScore': urgency_score,
        'urgencyCues': urgency_cues,
        'becIndicators': bec_indicators,
        'threatsDetected': threats_detected,
        'lookalikeDomains': lookalike_domains,
        'executiveImpersonation': {
            'detected': len(executive_cues) > 0,
            'cues': executive_cues
        },
        'credentialHarvesting': {
            'detected': len(cred_cues) > 0,
            'cues': cred_cues
        },
        'financialFraud': {
            'detected': len(bec_indicators) > 0,
            'cues': bec_indicators
        },
        'sentimentAlerts': sentiment_alerts,
        'riskWeight': risk_weight
    }

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        sample_input = {
            'subject': 'URGENT: Confidential Wire Transfer Request for Acquisition',
            'bodyText': 'Please execute wire transfer of $142,500 immediately. I am in a board meeting, do not call.',
            'fromEmail': 'ceo.office@micros0ft-corp.xyz',
            'fromName': 'Satya Nadella [CEO]',
            'urls': ['http://micros0ft-login.xyz/auth']
        }
        res = analyze_nlp_threats(
            sample_input['subject'],
            sample_input['bodyText'],
            sample_input['fromEmail'],
            sample_input['fromName'],
            sample_input['urls']
        )
        print(json.dumps(res, indent=2))
        return

    # Read from stdin
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            # If no stdin, check command line arguments
            if len(sys.argv) > 1:
                raw_input = sys.argv[1]
            else:
                raw_input = '{}'
        data = json.loads(raw_input)
        res = analyze_nlp_threats(
            data.get('subject', ''),
            data.get('bodyText', ''),
            data.get('fromEmail', ''),
            data.get('fromName', ''),
            data.get('urls', [])
        )
        print(json.dumps(res))
    except Exception as e:
        sys.stderr.write(f"Python NLP Error: {str(e)}\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
