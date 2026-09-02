export const SAMPLE_EMAILS = [
  {
    id: 'sample_bec_ceo_fraud',
    title: '1. Executive BEC Payment Diversion (CEO Fraud)',
    category: 'Business Email Compromise',
    expectedRisk: 'CRITICAL (92%)',
    description: 'Urgent wire transfer request from spoofed CEO (Johnathan Vance) targeting accounts payable, with lookalike domain and offshore proxy relay.',
    rawEml: `Delivered-To: finance-team@apexenterprises.com
Received: by 2002:a05:6512:2146:0:0:0:0 with SMTP id v6csp123445;
        Wed, 2 Sep 2026 10:14:22 -0700 (PDT)
X-Received: by 2002:a2e:9244:: with SMTP id s4mr8829141lkg.4.1662138862100;
        Wed, 02 Sep 2026 10:14:22 -0700 (PDT)
Authentication-Results: mx.google.com;
       spf=softfail (google.com: domain of transitioning c-suite@apex-enterprlses.com does not designate 91.240.118.42 as permitted sender) smtp.mailfrom=c-suite@apex-enterprlses.com;
       dkim=fail header.i=@apex-enterprlses.com;
       dmarc=fail (p=QUARANTINE sp=QUARANTINE dis=QUARANTINE) header.from=apex-enterprlses.com
Received-SPF: softfail (google.com: domain of transitioning c-suite@apex-enterprlses.com does not designate 91.240.118.42 as permitted sender) client-ip=91.240.118.42;
Received: from mail-relay-gateway.vpn-transit.net (mail-relay-gateway.vpn-transit.net. [91.240.118.42])
        by mx.google.com with ESMTPS id o18si6424982lfh.48.2026.09.02.10.14.21
        for <finance-team@apexenterprises.com>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Wed, 02 Sep 2026 10:14:21 -0700 (PDT)
Received: from internal-client-node (unknown [192.168.1.104])
        by mail-relay-gateway.vpn-transit.net (Postfix) with ESMTP id 4SwR5G3Nq9z7Bkd;
        Wed, 02 Sep 2026 17:14:15 +0000 (UTC)
From: "Johnathan Vance (CEO)" <ceo@apex-enterprlses.com>
Reply-To: "Executive Office" <jvance.ceo.private@gmail.com>
Return-Path: <bounce-daemon@apex-enterprlses.com>
To: "Robert Chen (Controller)" <finance-team@apexenterprises.com>
Subject: URGENT: Confidential Wire Transfer - Acquisition Escrow Deposit (Due Today)
Date: Wed, 02 Sep 2026 17:14:10 +0000
Message-ID: <20260902171410.84920.qmail@apex-enterprlses.com>
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit

Robert,

Are you at your desk right now? I need you to handle an urgent matter without delay.

I am currently locked in an all-day confidential executive board session regarding the Project Titan acquisition. We must process an immediate earnest money wire transfer of $148,500 to the escrow agent before close of business today (within 2 hours), or the exclusivity window expires and we forfeit the contract.

Do NOT discuss this with anyone in the office yet or call my cell phone as I cannot take calls during this closed meeting. 

Please find the updated bank wire instructions below:
Beneficiary: Titan Capital Escrow LLC
Bank: Offshore Commercial Trust
Routing / SWIFT: OCTRUS33XXX
Account Number: 8492-9102-4410
Amount: $148,500.00 USD
Reference: Project Titan Escrow - Strict Non-Disclosure

Reply immediately to this email as soon as the wire confirmation receipt is generated.

Regards,

Johnathan Vance
Chief Executive Officer
Apex Enterprises Inc.
Sent from my iPad Pro
`
  },
  {
    id: 'sample_m365_phishing',
    title: '2. Microsoft 365 Credential Harvester',
    category: 'Credential Harvesting Phishing',
    expectedRisk: 'HIGH (88%)',
    description: 'Spoofed Microsoft 365 Security alert urging employee to verify credentials within 24 hours to prevent account suspension, redirecting to lookalike domain.',
    rawEml: `Delivered-To: sarah.jenkins@company.com
Received: by 2002:a17:902:d007:0:0:0:0 with SMTP id b7csp482910;
        Wed, 2 Sep 2026 08:30:12 -0700 (PDT)
Authentication-Results: mx.security.outlook.com;
       spf=fail (sender IP 185.220.101.5 is not allowed by domain of account-security@micros0ft-portal.xyz);
       dkim=fail (bad signature);
       dmarc=fail (p=REJECT)
Received-SPF: fail (domain of account-security@micros0ft-portal.xyz does not designate 185.220.101.5 as permitted sender) client-ip=185.220.101.5;
Received: from tor-exit-relay-04.zwiebelfreunde.de (tor-exit-relay-04.zwiebelfreunde.de [185.220.101.5])
        by mx.security.outlook.com with ESMTP id 8s64919fkj;
        Wed, 02 Sep 2026 08:30:10 -0700 (PDT)
From: "Microsoft 365 Security Team" <security-alerts@micros0ft-portal.xyz>
Return-Path: <noreply@micros0ft-portal.xyz>
To: sarah.jenkins@company.com
Subject: [CRITICAL ACTION REQUIRED] Microsoft 365 Password Expiration Notice - 24 Hours Remaining
Date: Wed, 02 Sep 2026 15:30:00 +0000
Message-ID: <928174.sec.notice@micros0ft-portal.xyz>
MIME-Version: 1.0
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #0078d4;">Microsoft 365 Identity Protection</h2>
    <p>Dear Valued User,</p>
    <p>Your enterprise Microsoft 365 single-sign-on password will expire within <strong>24 hours</strong>. Immediate action is required to prevent immediate account suspension and loss of active SharePoint / OneDrive files.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://login.micros0ft-portal.xyz/auth/verify?session=token_8921" style="background-color: #0078d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Keep My Current Password & Verify Identity</a>
    </p>
    <p style="color: #666; font-size: 12px;">This is a mandatory security notice from Microsoft Corporation Cloud Services.</p>
  </div>
</body>
</html>
`
  },
  {
    id: 'sample_fake_invoice_malware',
    title: '3. Fake Vendor Invoice & Malicious Attachment',
    category: 'Malware Dropper / Financial Scam',
    expectedRisk: 'CRITICAL (94%)',
    description: 'Overdue invoice threat claiming pending legal action, originating from commercial cloud VPS with macro-enabled dangerous attachment.',
    rawEml: `Delivered-To: billing@enterprise.org
Received: by 2002:a05:6402:22c1:0:0:0:0 with SMTP id n1csp34121;
        Wed, 2 Sep 2026 11:20:00 -0400 (EDT)
Authentication-Results: mx.enterprise.org;
       spf=softfail client-ip=159.89.172.44;
       dkim=none;
       dmarc=fail (p=NONE)
Received-SPF: softfail (mail.invoicing-cloud-services.net does not designate 159.89.172.44) client-ip=159.89.172.44;
Received: from vps-vender-proxy.net (vps-vender-proxy.net [159.89.172.44])
        by mx.enterprise.org with ESMTP id 9fj301kf9;
        Wed, 02 Sep 2026 15:19:55 +0000
From: "Global Supplies Accounts Receivable" <invoicing@invoicing-cloud-services.net>
Reply-To: "Legal Recovery Dept" <recovery-disputes@invoicing-cloud-services.net>
To: billing@enterprise.org
Subject: FINAL NOTICE: Past Due Invoice #INV-2026-9810 Remittance Advice Attached
Date: Wed, 02 Sep 2026 15:19:40 +0000
Message-ID: <inv.notice.9810@invoicing-cloud-services.net>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_NextPart_000_01D8A1"

------=_NextPart_000_01D8A1
Content-Type: text/plain; charset="utf-8"

ATTN: Accounts Payable / Finance Department,

Despite multiple previous notices, your account remains severely past due on Invoice #INV-2026-9810 in the amount of $24,800.00 USD.

If payment or confirmation is not received within 24 hours, this case will be immediately referred to third-party collections and commercial legal enforcement without further notice.

Review the attached remittance invoice document immediately for breakdown and payment clearing coordinates:
Attachment: Invoice_INV2026_9810_Overdue.xlsm

------=_NextPart_000_01D8A1
Content-Type: application/vnd.ms-excel.sheet.macroEnabled.12; name="Invoice_INV2026_9810_Overdue.xlsm"
Content-Disposition: attachment; filename="Invoice_INV2026_9810_Overdue.xlsm"
Content-Transfer-Encoding: base64

UEsDBBQAAAAIAKBmVlQAAAAAAAAAAAAAAAAWAAAAW0NvbnRlbnRfVHlwZXNdLnhtbHNyYXZp
cjE5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5
OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5
------=_NextPart_000_01D8A1--
`
  },
  {
    id: 'sample_clean_legitimate',
    title: '4. Clean Legitimate Corporate Email (Baseline)',
    category: 'Clean Corporate Communication',
    expectedRisk: 'LOW (4%)',
    description: 'Legitimate enterprise email from verified Microsoft 365 infrastructure with authentic SPF pass, valid DKIM signature, and strict DMARC alignment.',
    rawEml: `Delivered-To: team-lead@partnercorp.com
Received: by 2002:a05:6808:1406:0:0:0:0 with SMTP id u6csp89102;
        Wed, 2 Sep 2026 09:00:15 -0700 (PDT)
Authentication-Results: mx.google.com;
       dkim=pass header.i=@microsoft.com header.s=s1024 header.b=X9a1B7;
       spf=pass (google.com: domain of prvs=19283=sarah@microsoft.com designates 40.92.74.8 as permitted sender) smtp.mailfrom=prvs=19283=sarah@microsoft.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=microsoft.com
Received-SPF: pass (google.com: domain of prvs=19283=sarah@microsoft.com designates 40.92.74.8 as permitted sender) client-ip=40.92.74.8;
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=microsoft.com; s=s1024;
        t=1662134415; bh=7Y123kL+pQ=;
        h=From:To:Subject:Date:Message-ID:MIME-Version;
        b=X9a1B7kW1qL88Zp...==
Received: from mail-redmond-hub01.outbound.protection.outlook.com (mail-redmond-hub01.outbound.protection.outlook.com [40.92.74.8])
        by mx.google.com with ESMTPS id j10si8192004lfk.22.2026.09.02.09.00.14
        for <team-lead@partnercorp.com>;
        Wed, 02 Sep 2026 09:00:14 -0700 (PDT)
From: "Sarah Connor (Partner Engineering)" <sarah@microsoft.com>
Return-Path: <prvs=19283=sarah@microsoft.com>
To: "Engineering Leadership" <team-lead@partnercorp.com>
Subject: Quarterly Engineering Sync & API Integration Notes
Date: Wed, 02 Sep 2026 16:00:10 +0000
Message-ID: <MSFT-PROD-981240182@microsoft.com>
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Hi Team,

Thank you for participating in our quarterly platform review meeting yesterday.

As discussed, we have published the updated API documentation for the upcoming SDK release. Please review the updated integration guidelines at your convenience ahead of our sprint planning next Tuesday.

Let us know if you have any questions or require additional sandbox access credentials.

Best regards,

Sarah Connor
Partner Solutions Architect
Microsoft Enterprise Cloud
`
  }
];
