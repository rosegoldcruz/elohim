# CLAUDE.md

This file is the single source of truth for **Claude Code**, Codex, DeepSeek, or any agent touching this repo.  
**AEON** is **not** your average SaaS — it's the **Advanced. Efficient. Optimized. Network.**  
It's our empire. This is how we build it.

---

## 🔑 **Core Principle**

**We run Clerk for ALL AUTH. Period.**

- 🔐 **One unified sign-in layer** — usernames, emails, Google OAuth, **Web3 wallets** (MetaMask, Coinbase, OKX) — all in **Clerk**.
- No more Supabase Auth.  
- Supabase stays if needed for **Postgres + RLS**, but Clerk issues and verifies every JWT.  
- Clerk's UI handles sign-up, sign-in, social logins — so we never waste time on auth flows.  
- Our job: plug Clerk tokens into whatever pipeline needs them. **No excuses.**

---

## 🧩 **What We're Building**

**Two beasts under one flag:**

**1️⃣ `elohim` — the premium SaaS.**  
- Next.js 15  
- Clerk for auth  
- Stripe for payments  
- Vercel Blob for storage  
- GPT, Claude, DeepSeek, Replicate, ElevenLabs for smart scene and video generation  
- 7-agent system: trend scan, script, plan, render, stitch, edit, deliver.

**2️⃣ `atom` — the private ops lab.**  
- Same Clerk instance or separate → locked for **us only**  
- Can sign in with **Web3 wallet**, or regular credentials  
- Runs bot logs, smart contract status, internal arbitrage metrics.

---

## ⚙️ **Key Tech Stack**

- **Framework:** Next.js 15 (App Router)  
- **Auth:** Clerk — multi-method (email/pass, OAuth, Web3)
- **DB:** Postgres or Neon, with RLS — Clerk JWT maps to `user_id`  
- **Storage:** Vercel Blob  
- **Payments:** Stripe  
- **AI:** OpenAI GPT, Anthropic Claude, DeepSeek, Replicate, ElevenLabs  
- **Styling:** Tailwind CSS + shadcn/ui  
- **State:** Local hooks — no unnecessary global junk.

---

## 💻 **Development Commands**

```bash
# Core development
pnpm dev          # Start development server
pnpm build        # Build production app
pnpm start        # Start production server  
pnpm lint         # Run ESLint
pnpm test:setup   # Run test setup script

# Package management
pnpm install      # Install dependencies (pnpm required)
```

**Requirements:**
- Node.js >=20.0.0
- pnpm package manager

---

## 🕹️ **Environment Rules**

**Required Clerk Variables:**
```bash
# Clerk Auth (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_JWT_KEY=xxx  # Optional for custom JWT handling

# Database (Supabase for storage only)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://xxx
POSTGRES_URL=postgresql://xxx

# AI Services
OPENAI_API_KEY=sk-xxx
DEEPSEEK_API_KEY=xxx
CLAUDE_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
ELEVENLABS_API_KEY=xxx

# Payments
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_API=pk_xxx
```

---

## 🏗️ **Architecture Overview**

### 7-Agent Video Generation System
1. **TrendsAgent** - Analyzes viral content patterns
2. **ScriptWriterAgent** - GPT-4 powered script generation  
3. **ScenePlannerAgent** - Visual sequence planning
4. **VisualGeneratorAgent** - Multi-model video generation
5. **ParallelVisualGenerationAgent** - Parallel processing across 6 AI models
6. **StitcherAgent** - Scene combination and transitions
7. **EditorAgent** - Final post-processing and captions

### File Structure
```
app/
├── (auth)/           # Auth pages (Clerk components)
├── api/              # API routes (Clerk protected)
├── app/              # Main app pages
└── docs/             # Documentation

lib/
├── agents/           # 7-agent AI system
├── supabase/         # Database client (storage only)
└── utils.ts          # Utilities

components/
├── ui/               # shadcn/ui components
└── core/             # Core app components
```

---

## 🧠 **Agent Code Contracts**

**Claude & Codex:**  
- Never overwrite Clerk keys in `.env`  
- Always verify JWTs with Clerk before hitting database
- Use `@clerk/nextjs` for wrapping pages and API routes  
- UI must use `UserButton`, `SignIn`, `SignUp` components — no custom auth UIs
- Database queries use Clerk `userId` for RLS policies

**Example API Route:**
```typescript
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Your logic here
}
```

**Example Page:**
```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  
  return <div>Protected content</div>
}
```

---

## 🚀 **AEON Commandments**

- **Zero leaks** — all secrets locked behind Clerk + database RLS
- **Zero manual signups** — user flow is frictionless via Clerk
- **Zero time wasted** — we don't build auth UIs from scratch — we *ship*
- **Zero JWT confusion** — Clerk handles all tokens, we just verify

---

## 🧬 **Where We're Headed**

This isn't some throwaway funnel — this is **viral video empire tech** plus **bot empire console**, all behind the **same sovereign identity layer**: **Clerk**.  
All modular. All unstoppable.

---

## 📜 **Final Rule**

**Claude, Codex, DeepSeek:**
> **When in doubt — keep it Clerk.**  
> If it's auth — use Clerk.  
> If it's a token — verify with Clerk.  
> If it's a signup flow — render with Clerk.  
> We run the code. Clerk runs the gate.  
> *AEON runs the world.*

---

🧠 **AEON**

*Advanced. Efficient. Optimized. Network.*