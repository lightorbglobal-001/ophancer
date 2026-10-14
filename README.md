# Ophancer — Opportunity Enhancer

> **Every Open Door. One Clean View.**  
> A high-performance opportunity discovery platform indexing job vacancies, freelance contracts, and public client requests across Nigeria, Africa, and global remote channels.

Inspired by the visual design and cyber-aurora aesthetic of modern technology platforms like [InterlinkLabs](https://interlinklabs.ai/), built with React, Vite, Tailwind CSS, Python, and Supabase on a strict **₦0 operating cost** free-tier stack.

---

## Architecture Overview

```
Ophancer Ecosystem
├── Web Application (React + Vite + Tailwind CSS)
│   ├── Home (Hero, Live Radar Marquee, 4-Stage Showcase)
│   ├── Find Opportunities (Search, Multi-Facet Filters, Grid/List Views)
│   ├── Opportunity Details (Scope, Verification, Broken Link Reporter)
│   ├── CV Services (Dual Path, ₦5,000 / ₦8,000 / $5 Pricing, WhatsApp Bridge)
│   ├── Free ATS CV Checker (In-Browser Memory Analysis, Circular Score HUD)
│   ├── Suggest Opportunity (Community Submission with Moderation Queue)
│   ├── Institutional Pages (About, Contact & FAQs, Privacy, Terms)
│   └── Admin Console (Moderation, Live Pricing & Bank Settings, System Logs)
│
├── Discovery Engine (Python 3.11)
│   ├── RSS & XML Collectors (WeWorkRemotely, Public Feeds)
│   ├── Greenhouse Public API Collector (Company Token JSON Endpoints)
│   ├── Canonical URL Normalizer & SHA-256 Deduplicator
│   ├── Budget (₦ & $) and Skill Extractors
│   └── Telegram Bot Alert Dispatcher (Rate-limited HTML Cards)
│
└── Automation & Cloud Infrastructure (₦0 Budget)
    ├── Frontend Hosting: Vercel / Cloudflare Pages (Free Tier)
    ├── Database: Supabase PostgreSQL with RLS (Free Tier)
    ├── Cron Scheduler: GitHub Actions (.github/workflows/discovery.yml)
    └── Notifications: Official Telegram Channel (@OphancerAlerts)
```

---

## Key Features & Policy Compliance

### 1. In-Browser ATS CV Checker (Zero-Storage Guarantee)
* **100% Client-Side Parsing:** User documents (`.pdf`, `.docx`, `.txt`) are parsed directly in the web browser's RAM memory using FileReader and deterministic regex heuristics.
* **No Server Storage:** Files are never uploaded to backend servers, cloud buckets, or databases, guaranteeing total candidate privacy and compliance with NDPR/GDPR.
* **Diagnostic Scoring:** Evaluates section hierarchy, active power verbs, quantifiable metrics (`%`, `₦`, `$`), and keyword density, generating a score out of 100 with actionable feedback.

### 2. Professional CV Services & WhatsApp Bridge
* **Configurable Pricing:**
  * **Nigerian Single CV:** ₦5,000 (1 CV)
  * **Nigerian Double Bundle:** ₦8,000 (2 CVs)
  * **International Single CV:** $5 (1 CV)
  * **International Double Bundle:** $8 (2 CVs)
* **Admin Dashboard Configurator:** Pricing, bank account details, and WhatsApp business numbers can be modified live from the `/admin` portal without code changes.
* **WhatsApp Deep Link:** Automatically encodes customer name, target role, and package details into an encrypted WhatsApp link where the user sends their existing file and bank transfer receipt directly to the consultant.

### 3. Data Integrity & Honest Telemetry
* **No Fabricated Marketing Numbers:** All opportunity counts and budgets represent genuine database items or clearly marked `[Sample Preview]` badges during staging.
* **Source Attribution:** Every listing preserves its original URL and source platform.

### 4. Free-Tier Reliability & Supabase Inactivity Protocol
* **Contingency Mode:** Should Supabase pause after 7 days of inactivity, the frontend gracefully falls back to local cached snapshots in `localStorage` and `engine/output/opportunities.json`.
* **Zero Data Loss:** Paused projects preserve all tables and records; a single click in the Supabase dashboard unpauses the service immediately.

---

## Quickstart Guide

### 1. Web Application Development
```bash
# Start Vite development server
npm run dev

# Compile production bundle
npm run build
```

### 2. Python Discovery Engine
```bash
# Run a live collection and deduplication cycle
python -m engine.main
```

### 3. Admin Portal Access
* Navigate to `/` and click the **Shield icon** in the top navigation bar, or select **Admin Dashboard** in the footer.
* Enter the development passkey: `ophancer2026`.
* Manage pending submissions, edit live CV pricing, review broken link reports, and inspect engine logs.

---

## Production Deployment Checklist

1. **Frontend:** Push to GitHub and link repository to **Vercel** or **Cloudflare Pages** (Build command: `npm run build`, Output directory: `dist`).
2. **GitHub Actions Secrets:** Add repository secrets:
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_KEY`
   * `TELEGRAM_BOT_TOKEN`
   * `TELEGRAM_CHANNEL_ID`
3. **Admin Settings:** Update your live Nigerian Bank Account details and WhatsApp Business line in `/admin` settings.
