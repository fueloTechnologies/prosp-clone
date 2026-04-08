# Prosp Clone — AI LinkedIn Outreach Platform

A full-stack clone of Prosp.ai built with Next.js 14, TypeScript, PostgreSQL, Prisma, and OpenAI.

## Features

- **Sequences** — Visual campaign builder with drag-drop steps, AI personalization, daily limits
- **Find Leads** — Contact management, CSV import, 4-source enrichment (Prospeo, Dropcontact, Findymail, Datagma)
- **Unified Inbox** — Multi-account conversation management with AI reply generation

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (via Supabase or any PG) |
| ORM | Prisma |
| Auth | NextAuth.js (credentials) |
| AI | OpenAI GPT-4o |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/prosp_clone"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."         # optional, demo fallback built-in
```

### 3. Set up the database
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run locally
```bash
npm run dev
```

Open http://localhost:3000

**Demo login:** `demo@prosp.ai` / any password

---

## Project Structure

```
src/
├── app/
│   ├── login/             # Login page
│   ├── sequences/         # Campaign builder
│   ├── leads/             # Contact management
│   ├── inbox/             # Unified inbox
│   └── api/
│       ├── campaigns/     # Campaign CRUD + steps
│       ├── contacts/      # Contact CRUD + enrichment
│       ├── conversations/ # Conversation + messages
│       ├── ai/            # AI personalize + sequence gen
│       └── auth/          # NextAuth
├── components/
│   ├── layout/AppShell    # Top nav + sidebar
│   ├── sequences/         # CampaignList, SequenceBuilder
│   ├── leads/             # ContactsTable, EnrichmentPanel, ImportModal
│   └── inbox/             # AccountSidebar, ConversationList, MessageThread
└── lib/
    ├── prisma.ts          # DB client
    ├── auth.ts            # NextAuth config
    ├── openai.ts          # AI helpers
    ├── enrichment.ts      # 4-source enrichment
    └── utils.ts           # Helpers
```

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add these env vars in Vercel dashboard:
- `DATABASE_URL` — use Supabase connection pooling URL
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` — your production URL (e.g. https://yourapp.vercel.app)
- `OPENAI_API_KEY` — optional

> **Supabase tip:** Use the "Transaction" pooler URL (port 6543) for Vercel serverless functions.

---

## Adding Real Enrichment APIs

In `.env`, add your keys:
```env
PROSPEO_API_KEY=""
DROPCONTACT_API_KEY=""
FINDYMAIL_API_KEY=""
DATAGMA_API_KEY=""
```

Without these keys, the enrichment UI still renders with simulated states.

---

## CSV Import Format

Supported column names (case-insensitive):
```
first_name, last_name, email, phone, company, position, linkedin_url
```

Or combined: `name` (splits into first/last), `email_address`, `job_title`, etc.

---

## License
MIT
