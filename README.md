# AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform

Built in strict accordance with the Hackathon Problem Statement (**P7.pdf**).

---

## 🔑 Where to configure Keys & Database (.env)

All environment variables, database URLs, and API keys are stored in:
👉 `backend/.env`

```env
# Server Port
PORT=5000

# MongoDB Database Connection URL
# If you have local MongoDB running:
MONGODB_URI=mongodb://127.0.0.1:27017/email_threat_forensics

# Or if you use MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/email_threat_forensics?retryWrites=true&w=majority

# Optional Threat Intelligence API Keys (Platform works even without keys)
ABUSEIPDB_API_KEY=
VIRUSTOTAL_API_KEY=
IPINFO_TOKEN=
```

---

## 🚀 How to Run the Project

### Step 1: Run Backend
Open a terminal in the project folder:
```powershell
cd backend
npm run dev
```
The backend API starts on `http://localhost:5000/api`.

### Step 2: Run Frontend
Open a second terminal:
```powershell
cd frontend
npm run dev
```
The frontend UI will start on `http://localhost:5173/`.

---

## 📋 Core Features (As per P7.pdf)
1. **Fraudulent Email Detection Engine**: NLP-based subject/body analysis, urgency & social engineering detection, BEC detection (payment diversion, fake invoices, credential harvesting), lookalike domain identification.
2. **Email Header & Protocol Analysis**: Return-Path, Received headers, Message-ID, Reply-To, DKIM signatures, SPF alignment, DMARC status.
3. **Origin Traceability & Location Analysis**: Earliest reliable sending node identification, IP geolocation (country, city, ISP, ASN, hosting/proxy/VPN indicators), WHOIS domain intelligence.
4. **Identity Correlation & Attribution**: Threat graph linking sender domain, IP, hosting, and campaign clusters.
5. **Dashboard & Forensic Reporting**: Real-time alerts, fraud score vs attribution confidence meters, relay path, interactive map, structured legal forensic report (ISO/IEC 27037 compliant, printable PDF), and PII masking.
