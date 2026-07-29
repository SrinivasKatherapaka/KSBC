# 🏛️ Apex Digital Banking Enterprise Resource Planning (ERP) Platform

A production-ready, enterprise-grade Digital Banking ERP Platform uniting core banking verticals—Customer Operations, Compliance & KYC, AI Risk Modeling, Commercial Loan Lifecycles, Treasury Capital Management, Double-Entry General Ledger, Procurement, HR, and Executive CFO Analytics—into a unified real-time continuous ecosystem.

---

## 🌟 Core Features & End-to-End Workflow

1. **Customer Operations**: Onboards corporate clients, ingests financial statements and demographic records.
2. **Compliance & KYC Hub**: Automated Multi-Modal OCR parsing & screening against Sanctions and Politically Exposed Persons (PEP) lists via server-side `@google/genai`.
3. **AI Risk Engine**: Computes Debt-To-Income (DTI), Debt Service Coverage (DSCR), automated Credit Risk Score (0-100), and underwriting advisory output conforming to strict JSON schema.
4. **Loan Underwriting State Machine**: Role-gated lifecycle (Draft ➔ Compliance Review ➔ Underwriting ➔ Approved ➔ Disbursed).
5. **Treasury Operations**: Monitors Tier 1 Vault Cash Reserves (Account 1010) and authorizes capital allocation.
6. **Double-Entry General Ledger**: Automated triggers post balanced debits and credits upon disbursement (Debit 1200 Commercial Loans Portfolio, Credit 1010 Vault Cash).
7. **Executive CFO Dashboard**: Real-time portfolio yields, asset trajectories, and audit logs.

---

## 🛠️ Technology Architecture

* **Frontend**: React v18+, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6.
* **Backend**: Node.js + Express.js REST API with modular architecture.
* **AI Intelligence**: `@google/genai` Backend SDK using `gemini-2.5-flash` with structured JSON Schema enforcement.
* **Database & Auth**: Supabase PostgreSQL & Auth with fallback relational store, JWT security, and Role-Based Access Control (RBAC).
* **Validation & Security**: Zod v3+, Helmet, CORS, bcryptjs password hashing.

---

## 🚀 Quickstart & Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Application available on http://localhost:3000
```

---

## 🔐 Default Demo Accounts (Password: `password123`)

* **CFO Executive**: `cfo@banking.com`
* **Loan Officer**: `loan@banking.com`
* **Treasury Manager**: `treasury@banking.com`
* **Compliance Officer**: `compliance@banking.com`
* **Customer Ops**: `customerops@banking.com`
* **Finance Manager**: `finance@banking.com`
* **System Admin**: `admin@banking.com`
