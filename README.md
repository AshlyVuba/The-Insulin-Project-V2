# First Response Express 🚑

**Just-In-Time Predictive Logistics for Tshwane Public Clinics**

First Response Express is a secure, automated backend logistics engine designed to eliminate the 6-hour chronic medication waiting queue at high-volume public clinics (e.g., Soshanguve Block TT). By synchronizing internal clinic workflows via a zero-data conversational bot 72 hours before a patient arrives, we convert chaotic waiting rooms into streamlined collection points—without compromising strict cold-chain insulin requirements.

## 🚀 The Solution

Unlike external smart lockers (which risk cold-chain spoilage) or generic queuing apps (which ignore backend administrative chaos), First Response Express optimizes the **internal** workflow.

* **Patient Interface:** Zero-data Twilio integration (SMS/WhatsApp). No smartphone or app download required.
* **Administrative Prep:** Triggers patient file pulls and pharmacy dry-prep 3 days in advance.
* **Cold-Chain Compliant:** Physical insulin remains safely in the clinic fridge until the patient physically arrives at the counter.

---

## 🏗️ Technical Architecture

This MVP is built on a modern, decoupled full-stack architecture.

* **Backend:** Python, FastAPI, SQLAlchemy
* **Frontend:** React.js, Tailwind CSS
* **Database:** PostgreSQL (Production) / SQLite (Local testing fallback)
* **Integration:** Twilio API for conversational NLP webhooks

---

## 🔐 Enterprise-Grade Security & POPIA Compliance

Security is not an afterthought; it is enforced at the architectural level. This repository maps directly to the OWASP Top 10 framework to protect sensitive public health data.

1. **Cryptographic Medical Identity (Broken Access Control):** We bypass standard email/password logins. Clinicians must authenticate using legally verified **HPCSA** or **SANC** registration numbers to generate a session JWT.
2. **POPIA Data Vault (Cryptographic Failures):** All patient Personally Identifiable Information (PII) is encrypted at rest using military-grade **AES-128 Fernet Encryption**. If the database is breached, attackers retrieve only ciphertext.
3. **Strict Role-Based Access Control:** Frontend and backend routes are cryptographically isolated. A filing clerk's JWT physically cannot query pharmacy dispensing endpoints.
4. **Automated DevSecOps:** Integrated GitHub Actions automatically run Static Application Security Testing (`bandit`) and frontend vulnerability scans (`npm audit`) on every push.

---

## ♿ Accessibility (a11y)

Designed for exhausted administrative staff and elderly demographics:

* **WCAG AA Compliant:** Strict high-contrast color palette (Navy Blue, Sky Blue, White).
* **UI/UX:** REM-based massive touch targets designed for visibility from a distance in poorly lit filing rooms.

---

## 💻 Local Setup & Deployment

### 1. Clone & Environment Setup

```bash
git clone https://github.com/your-username/the-insulin-project-v2.git
cd project

```

### 2. Boot the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt

# Create your .env file with your database URL
echo "DATABASE_URL=sqlite:///./insulin_express_hackathon.db" > .env

# Build tables and seed mock data (Gogo Nkomo)
python create_tables.py
python seed_data.py

# Launch the server
uvicorn app.main:app --reload

```

*The API will be available at `http://localhost:8000/docs*`

### 3. Boot the Frontend (React)

Open a new terminal window:

```bash
cd project
npm install
npm start

```

*The dashboard will be available at `http://localhost:3000*`

### 4. Bot Webhook Testing

To test the Twilio bot locally, expose your port 8000 using Ngrok and point your Twilio Sandbox webhook to `https://<your-ngrok-url>/bot/incoming`.

---
