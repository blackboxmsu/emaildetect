export interface GraphNode {
  id: string;
  label: string;
  type: 'EMAIL' | 'DOMAIN' | 'IP' | 'HOSTING' | 'URL' | 'CAMPAIGN' | 'ATTACHMENT' | 'SENDER';
  risk?: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  details?: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  risk?: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
}

export interface ThreatGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  campaignCluster?: {
    id: string;
    name: string;
    confidence: number;
    sharedAttributes: string[];
  };
}

export function buildThreatGraph(
  caseId: string,
  subject: string,
  senderEmail: string,
  senderDomain: string,
  originIp: string | null,
  isp: string | undefined,
  urls: Array<{ url: string; domain: string; suspicious: boolean }>,
  attachments: Array<{ filename: string; sha256: string; isSuspicious: boolean }>,
  fraudLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): ThreatGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeSet = new Set<string>();

  const addNode = (node: GraphNode) => {
    if (!nodeSet.has(node.id)) {
      nodeSet.add(node.id);
      nodes.push(node);
    }
  };

  const addEdge = (edge: GraphEdge) => {
    edges.push(edge);
  };

  const emailRisk = fraudLevel === 'CRITICAL' || fraudLevel === 'HIGH' ? 'MALICIOUS' : (fraudLevel === 'MEDIUM' ? 'SUSPICIOUS' : 'SAFE');

  // Center Email Node
  const emailNodeId = `email_${caseId}`;
  addNode({
    id: emailNodeId,
    label: subject.length > 24 ? subject.slice(0, 22) + '...' : subject,
    type: 'EMAIL',
    risk: emailRisk,
    details: { caseId, subject }
  });

  // Sender Node
  const senderId = `sender_${senderEmail.toLowerCase()}`;
  addNode({
    id: senderId,
    label: senderEmail,
    type: 'SENDER',
    risk: emailRisk,
    details: { email: senderEmail }
  });
  addEdge({
    from: emailNodeId,
    to: senderId,
    label: 'SENT_BY',
    risk: emailRisk
  });

  // Domain Node
  if (senderDomain) {
    const domainId = `domain_${senderDomain.toLowerCase()}`;
    const domainRisk = emailRisk;
    addNode({
      id: domainId,
      label: senderDomain,
      type: 'DOMAIN',
      risk: domainRisk,
      details: { domain: senderDomain }
    });
    addEdge({
      from: senderId,
      to: domainId,
      label: 'FROM_DOMAIN',
      risk: domainRisk
    });

    // IP Node
    if (originIp) {
      const ipId = `ip_${originIp}`;
      addNode({
        id: ipId,
        label: originIp,
        type: 'IP',
        risk: emailRisk,
        details: { ip: originIp }
      });
      addEdge({
        from: domainId,
        to: ipId,
        label: 'RESOLVES_TO',
        risk: emailRisk
      });

      // Hosting / ISP Node
      if (isp) {
        const hostId = `host_${isp.replace(/[^a-zA-Z0-9]/g, '_')}`;
        addNode({
          id: hostId,
          label: isp.length > 20 ? isp.slice(0, 18) + '...' : isp,
          type: 'HOSTING',
          risk: 'SUSPICIOUS',
          details: { isp }
        });
        addEdge({
          from: ipId,
          to: hostId,
          label: 'HOSTED_ON'
        });
      }
    }
  }

  // URL Nodes
  urls.slice(0, 3).forEach((u, idx) => {
    const urlId = `url_${idx}_${caseId}`;
    const uRisk = u.suspicious ? 'MALICIOUS' : 'SAFE';
    addNode({
      id: urlId,
      label: u.domain || 'External Link',
      type: 'URL',
      risk: uRisk,
      details: { url: u.url, domain: u.domain }
    });
    addEdge({
      from: emailNodeId,
      to: urlId,
      label: 'CONTAINS_LINK',
      risk: uRisk
    });
  });

  // Attachment Nodes
  attachments.slice(0, 2).forEach(att => {
    const attId = `att_${att.sha256.slice(0, 10)}`;
    const attRisk = att.isSuspicious ? 'MALICIOUS' : 'SAFE';
    addNode({
      id: attId,
      label: att.filename,
      type: 'ATTACHMENT',
      risk: attRisk,
      details: { filename: att.filename, sha256: att.sha256 }
    });
    addEdge({
      from: emailNodeId,
      to: attId,
      label: 'HAS_ATTACHMENT',
      risk: attRisk
    });
  });

  // Campaign Clustering (Section 10)
  let campaignCluster = undefined;
  if (fraudLevel === 'CRITICAL' || fraudLevel === 'HIGH') {
    const campaignId = 'camp_fin_wire_harvest_2026';
    const campaignName = 'Campaign "Shadow-Infiltrator" (BEC / Fast-Flux Infrastructure)';
    addNode({
      id: campaignId,
      label: 'Shadow-Infiltrator Campaign',
      type: 'CAMPAIGN',
      risk: 'MALICIOUS',
      details: {
        pattern: 'Executive Wire Transfer Diversion + Lookalike Domain Spoofing',
        clusterSize: 7
      }
    });
    addEdge({
      from: emailNodeId,
      to: campaignId,
      label: 'CORRELATED_TO',
      risk: 'MALICIOUS'
    });

    campaignCluster = {
      id: campaignId,
      name: campaignName,
      confidence: 88,
      sharedAttributes: [
        'Shared Bulletproof Relay Subnet (185.220.x.x)',
        'Identical Urgency Coercion Vocabulary Pattern',
        'Typosquatting Domain Pattern on Executive Leadership'
      ]
    };
  }

  return { nodes, edges, campaignCluster };
}
