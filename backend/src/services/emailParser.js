import { simpleParser } from 'mailparser';
import crypto from 'crypto';

export async function parseEmail(rawContent) {
  const buffer = Buffer.isBuffer(rawContent) ? rawContent : Buffer.from(rawContent, 'utf-8');
  
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');

  let parsed;
  try {
    parsed = await simpleParser(buffer);
  } catch (err) {
    throw new Error(`Failed to parse RFC 5322 email: ${err.message}`);
  }

  // Extract raw headers
  const rawHeaders = {};
  const receivedHeaders = [];

  if (parsed.headerLines) {
    for (const line of parsed.headerLines) {
      const key = line.key.toLowerCase();
      if (key === 'received') {
        receivedHeaders.push(line.line);
      }
      if (!rawHeaders[key]) {
        rawHeaders[key] = line.line;
      } else if (Array.isArray(rawHeaders[key])) {
        rawHeaders[key].push(line.line);
      } else {
        rawHeaders[key] = [rawHeaders[key], line.line];
      }
    }
  }

  // If receivedHeaders empty, try headers.get('received')
  if (receivedHeaders.length === 0 && parsed.headers) {
    const rec = parsed.headers.get('received');
    if (rec) {
      if (Array.isArray(rec)) {
        rec.forEach(r => receivedHeaders.push(typeof r === 'string' ? r : JSON.stringify(r)));
      } else {
        receivedHeaders.push(typeof rec === 'string' ? rec : JSON.stringify(rec));
      }
    }
  }

  // Sender details
  const fromAddress = parsed.from?.value?.[0]?.address || '';
  const fromDomain = fromAddress.includes('@') ? fromAddress.split('@')[1].toLowerCase() : '';
  
  // Reply-To
  const replyToAddress = parsed.replyTo?.value?.[0]?.address || '';
  const replyToDomain = replyToAddress.includes('@') ? replyToAddress.split('@')[1].toLowerCase() : '';

  // Return-Path
  let returnPath = '';
  const retHeader = parsed.headers.get('return-path');
  if (retHeader) {
    if (typeof retHeader === 'string') {
      returnPath = retHeader;
    } else if (typeof retHeader.text === 'string') {
      returnPath = retHeader.text;
    } else if (Array.isArray(retHeader.value) && retHeader.value[0]?.address) {
      returnPath = retHeader.value[0].address;
    } else if (typeof retHeader.value === 'string') {
      returnPath = retHeader.value;
    }
    returnPath = (returnPath || '').replace(/[<>]/g, '').trim();
  }

  // Auth headers
  const authResults = parsed.headers.get('authentication-results')?.value || 
                       parsed.headers.get('authentication-results') || '';
  const recSpf = parsed.headers.get('received-spf')?.value || 
                 parsed.headers.get('received-spf') || '';
  const dkimSig = parsed.headers.get('dkim-signature')?.value || 
                  parsed.headers.get('dkim-signature') || '';

  const textBody = parsed.text || '';
  const htmlBody = parsed.html || '';

  // Extract URLs from text and HTML bodies
  const urlSet = new Set();
  const urlRegex = /https?:\/\/[^\s"'<>()[\]{}|\\^`]+/gi;
  
  let match;
  while ((match = urlRegex.exec(textBody)) !== null) {
    urlSet.add(match[0].replace(/[.,;:!]+$/, ''));
  }
  while ((match = urlRegex.exec(htmlBody)) !== null) {
    urlSet.add(match[0].replace(/[.,;:!]+$/, ''));
  }

  // Process attachments
  const dangerousExtensions = ['.exe', '.bat', '.scr', '.vbs', '.js', '.wsf', '.iso', '.cmd', '.ps1', '.hta', '.jar', '.xlsm', '.docm'];
  const attachments = (parsed.attachments || []).map(att => {
    const attHash = crypto.createHash('sha256').update(att.content).digest('hex');
    const ext = (att.filename || '').slice((att.filename || '').lastIndexOf('.')).toLowerCase();
    
    let isSuspicious = dangerousExtensions.includes(ext);
    let flagReason = isSuspicious ? `High-risk executable/macro extension detected (${ext})` : undefined;

    if (!isSuspicious && att.contentType?.toLowerCase().includes('application/x-msdownload')) {
      isSuspicious = true;
      flagReason = 'MIME type indicates binary executable';
    }

    return {
      filename: att.filename || 'unnamed_attachment',
      contentType: att.contentType,
      size: att.size,
      sha256: attHash,
      checksum: att.checksum || attHash.slice(0, 16),
      isSuspicious,
      flagReason
    };
  });

  return {
    sha256,
    md5,
    sizeBytes: buffer.length,
    subject: parsed.subject || '(No Subject)',
    from: {
      text: parsed.from?.text || fromAddress,
      value: parsed.from?.value || [],
      address: fromAddress,
      domain: fromDomain
    },
    to: {
      text: parsed.to ? (Array.isArray(parsed.to) ? parsed.to.map(t => t.text).join(', ') : parsed.to.text) : '',
      value: parsed.to ? (Array.isArray(parsed.to) ? parsed.to.flatMap(t => t.value) : parsed.to.value) : []
    },
    replyTo: replyToAddress ? {
      text: parsed.replyTo?.text || replyToAddress,
      address: replyToAddress,
      domain: replyToDomain
    } : undefined,
    returnPath: returnPath || undefined,
    messageId: parsed.messageId,
    date: parsed.date,
    rawHeaders,
    receivedHeaders,
    authenticationResults: typeof authResults === 'string' ? authResults : JSON.stringify(authResults),
    receivedSpf: typeof recSpf === 'string' ? recSpf : JSON.stringify(recSpf),
    dkimSignature: typeof dkimSig === 'string' ? dkimSig : JSON.stringify(dkimSig),
    textBody,
    htmlBody,
    urls: Array.from(urlSet),
    attachments
  };
}
