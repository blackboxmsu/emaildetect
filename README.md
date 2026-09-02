# AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform

Built in strict accordance with the Hackathon Problem Statement (**P7.pdf**).

**Technology Stack:**
- **Backend**: **JavaScript (Node.js Express ESM)** + **Python AI Threat Forensics Engine (`ai_engine.py`)**
- **Frontend**: **HTML5**, **CSS3**, **TailwindCSS**, and **JavaScript (`.jsx` / `.js`)**
- **Database**: **MongoDB** (with local in-memory fallback store)

---

## 🔑 Where to configure Keys & Database (.env)

All environment variables, database URLs, and API keys are stored in:
👉 `backend/.env`

```env
# Server Port
PORT=5000

# MongoDB Database Connection URL (Local or Atlas Cloud)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/email_threat_forensics?retryWrites=true&w=majority

# Optional Threat Intelligence API Keys (Platform works even without keys)
ABUSEIPDB_API_KEY=
VIRUSTOTAL_API_KEY=
IPINFO_TOKEN=
```

---

## 🚀 How to Run the Project

### Step 1: Run Backend (Node.js + Python AI Engine)
Open a terminal in the project root:
```powershell
cd backend
npm run dev
```
- The backend starts on `http://localhost:5000`.
- The Node.js JavaScript server connects seamlessly to `backend/ai_engine.py` (via bundled zero-install Python runtime or system Python) to execute deep NLP & Threat Forensics.

### Step 2: Run Frontend (HTML + CSS + TailwindCSS + JavaScript)
Open a second terminal in the project root:
```powershell
cd frontend
npm run dev
```
The frontend UI starts on `http://localhost:5173/`.

---

## 📋 Core Features (As per P7.pdf)
1. **Fraudulent Email Detection Engine (Python AI Engine)**:
   - NLP-based subject/body analysis, high-urgency imperative & fear tactic detection.
   - Business Email Compromise (BEC) detection (payment diversion, wire routing changes, overdue fake invoices, gift cards).
   - Executive impersonation heuristics (CEO/CFO display name spoofing against free webmails).
   - Lookalike / Typosquatting / Combosquatting / Homoglyph domain identification (Levenshtein distance & character substitution).
2. **Email Header & Protocol Analysis**:
   - Return-Path, Received hops parsing & chronology, Message-ID validity, Reply-To mismatch detection.
   - DKIM cryptographic signature verification, SPF alignment, DMARC status evaluation.
3. **Origin Traceability & Location Analysis**:
   - Earliest reliable sending node identification from bottom-up Received chain.
   - IP geolocation (country, city, coordinates, ISP, ASN, reverse DNS).
   - Infrastructure categorization (Residential, Corporate, Cloud VPS, VPN/Proxy, Tor Exit Relay).
   - WHOIS domain intelligence & age calculation.
4. **Identity Correlation & Attribution**:
   - Threat correlation graph linking sender domain, IP, hosting provider, URLs, attachments, and campaign clusters (e.g. *Shadow-Infiltrator*).
5. **Dashboard & Forensic Reporting**:
   - Executive meters: Fraud Risk Score (0-100) vs. Attribution Confidence (0-100).
   - Relay path visualizer with time delay & routing anomaly indicators.
   - Interactive Leaflet dark map displaying multi-hop geographic routing.
   - ISO/IEC 27037 compliant legal forensic report with cryptographic SHA-256 evidence integrity hashing and printable PDF format.
   - Full PII masking toggle for GDPR/privacy compliance.
