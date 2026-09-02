// Regex helpers for IPv4 and IPv6
const IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
const IPV6_REGEX = /(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:::|::[a-fA-F0-9]{1,4}:)(?:[a-fA-F0-9]{1,4}:)*/;

export function isPrivateOrReservedIP(ip) {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return true;
  }
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    // 172.16.0.0 - 172.31.255.255
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 169.254.0.0/16 Link-local
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 Carrier grade NAT
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  }
  return false;
}

export function analyzeHeaders(
  receivedHeaders = [],
  fromEmail = '',
  returnPath,
  replyTo,
  messageId
) {
  const routingAnomalies = [];

  // Received headers in an email are added top-to-bottom as the email travels.
  // The TOP header is the most recent (recipient's MX), and the BOTTOM header is the earliest (originating MTA/client).
  // We parse them in order from earliest (bottom) to newest (top).
  const rawHops = [...receivedHeaders].reverse();
  const hops = [];

  let prevDate = null;

  for (let i = 0; i < rawHops.length; i++) {
    const raw = rawHops[i].replace(/\r?\n\s+/g, ' ');
    
    // Parse "from <sender> by <receiver> [with <proto>] [id <id>] [for <rcpt>]; <date>"
    const fromMatch = raw.match(/from\s+([^\s;]+(?:\s*\([^\)]+\))?)/i);
    const byMatch = raw.match(/by\s+([^\s;]+)/i);
    const withMatch = raw.match(/with\s+([^\s;]+)/i);
    const dateMatch = raw.match(/;\s*([A-Za-z0-9,:\s+-]+(?:UTC|GMT|[+-]\d{4}|\([A-Z]+\))?)$/);

    // Extract IP from the "from" clause or the whole line
    let ip = undefined;
    const ipMatch = raw.match(IPV4_REGEX);
    if (ipMatch) {
      ip = ipMatch[0];
    } else {
      const ipv6Match = raw.match(IPV6_REGEX);
      if (ipv6Match && ipv6Match[0].length > 4) {
        ip = ipv6Match[0];
      }
    }

    let parsedDate = null;
    let delaySeconds = undefined;

    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!isNaN(d.getTime())) {
        parsedDate = d;
        if (prevDate) {
          delaySeconds = Math.max(0, Math.round((d.getTime() - prevDate.getTime()) / 1000));
          if (delaySeconds > 3600) {
            routingAnomalies.push(`Suspicious delay of ${Math.round(delaySeconds / 60)} minutes between relay hop ${i} and ${i + 1}`);
          }
        }
        prevDate = d;
      }
    }

    const isPriv = ip ? isPrivateOrReservedIP(ip) : false;

    hops.push({
      hopIndex: i + 1,
      rawHeader: raw,
      from: fromMatch ? fromMatch[1].trim() : undefined,
      by: byMatch ? byMatch[1].trim() : undefined,
      withProtocol: withMatch ? withMatch[1].trim() : undefined,
      ip,
      timestamp: dateMatch ? dateMatch[1].trim() : undefined,
      parsedDate: parsedDate ? parsedDate.toISOString() : undefined,
      delaySeconds,
      isPrivateIp: isPriv,
      isEarliestReliable: false
    });
  }

  // Identify earliest reliable sending node:
  // The first non-private, authenticated public IP in the chain starting from the bottom
  let earliestReliableIp = null;
  let earliestReliableHopIndex = null;

  for (let i = 0; i < hops.length; i++) {
    const hop = hops[i];
    if (hop.ip && !hop.isPrivateIp) {
      earliestReliableIp = hop.ip;
      earliestReliableHopIndex = hop.hopIndex;
      hop.isEarliestReliable = true;
      hop.notes = 'Identified as Earliest Reliable Originating Transmission Node';
      break;
    }
  }

  // Domain checks
  const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : '';
  const returnPathDomain = returnPath && returnPath.includes('@') ? returnPath.split('@')[1].toLowerCase() : '';
  const replyToDomain = replyTo && replyTo.includes('@') ? replyTo.split('@')[1].toLowerCase() : '';

  const returnPathMismatch = Boolean(returnPathDomain && fromDomain && returnPathDomain !== fromDomain);
  const replyToMismatch = Boolean(replyToDomain && fromDomain && replyToDomain !== fromDomain);

  if (returnPathMismatch) {
    routingAnomalies.push(`Return-Path domain (${returnPathDomain}) does not match From domain (${fromDomain})`);
  }
  if (replyToMismatch) {
    routingAnomalies.push(`Reply-To address points to foreign domain (${replyToDomain}) instead of sender (${fromDomain})`);
  }

  // Message-ID analysis
  let messageIdValid = true;
  let messageIdDomainMismatch = false;

  if (messageId) {
    const msgIdMatch = messageId.match(/<([^@]+)@([^>]+)>/);
    if (msgIdMatch) {
      const msgIdDomain = msgIdMatch[2].toLowerCase();
      if (fromDomain && !msgIdDomain.includes(fromDomain) && !fromDomain.includes(msgIdDomain)) {
        messageIdDomainMismatch = true;
        routingAnomalies.push(`Message-ID domain (@${msgIdDomain}) does not match sender domain (@${fromDomain})`);
      }
    } else {
      messageIdValid = false;
      routingAnomalies.push('Malformed Message-ID header syntax (violates RFC 5322)');
    }
  } else {
    routingAnomalies.push('Missing Message-ID header (uncommon for legitimate enterprise mail systems)');
  }

  return {
    relayPath: hops,
    earliestReliableIp,
    earliestReliableHopIndex,
    fromDomain,
    returnPathDomain,
    replyToDomain,
    returnPathMismatch,
    replyToMismatch,
    messageIdValid,
    messageIdDomainMismatch,
    routingAnomalies
  };
}
