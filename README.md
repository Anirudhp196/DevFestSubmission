# TicketChain — Decentralized Event Ticketing on Solana

TicketChain is a Web3 event ticketing platform where every ticket is an NFT on Solana. Organizers create events, set prices, and choose how resale revenue is split — all enforced by an on-chain smart contract. Fans buy, hold, and resell tickets through a consumer-grade UI without needing to understand crypto.

**Live on Solana Devnet:** [`BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts`](https://explorer.solana.com/address/BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts?cluster=devnet)

---

## What It Does

| Role | Actions |
|------|---------|
| **Organizer** | Create events, set ticket price & supply, choose a custom resale split (0–80% to organizer), view attendees, delete events |
| **Fan** | Browse events, buy NFT tickets (SOL goes straight to organizer), list tickets for resale, buy resale tickets, cancel listings |

### Key Features

- **NFT Tickets** — Every ticket is a unique SPL token (decimals=0) minted on Solana, stored in the buyer's wallet. Impossible to duplicate or counterfeit.
- **Organizer-Set Resale Split** — When creating an event, the organizer picks their cut of every resale (0–80%). The platform always takes 20%; the seller gets the rest. This is enforced on-chain — no one can bypass it.
- **Escrow-Based Marketplace** — Listing a ticket transfers the NFT into a program-owned escrow account. Buying a resale ticket atomically splits SOL three ways (organizer / seller / platform) and transfers the NFT to the buyer — all in one transaction.
- **Anti-Scalping by Design** — The on-chain split removes the profit incentive for scalpers because organizers always earn a percentage of every resale.
- **No Custodial Risk** — The API never holds private keys. It builds unsigned transactions that are returned to the frontend; the user signs with their own wallet (Phantom, Solflare, etc.).

---

## Architecture

```
┌───────────────────────────────────────────┐
│  Browser (React + Phantom Wallet)         │
│  localhost:3000                            │
└────────────┬──────────────────────────────┘
             │  HTTP (JSON)
             ▼
┌───────────────────────────────────────────┐
│  API Server (Express.js)                  │
│  localhost:3001                            │
│  Builds unsigned Anchor transactions      │
│  Optional: Supabase cache for event data  │
└────────────┬──────────────────────────────┘
             │  RPC (JSON-RPC)
             ▼
┌───────────────────────────────────────────┐
│  Solana Devnet                            │
│  Program: BxjzLBTG...                     │
│  On-chain: Events, Ticket Mints,          │
│            Listings, Escrow Accounts       │
└───────────────────────────────────────────┘
```

**Typical flow (e.g. buying a ticket):**
1. User clicks "Buy" in the frontend
2. Frontend `POST`s to the API with the user's wallet pubkey
3. API uses Anchor to build an unsigned `buy_ticket` transaction and returns it as base64
4. Frontend deserializes the transaction and asks Phantom to sign it
5. Signed transaction is submitted to Solana Devnet
6. Program executes: SOL transfers to the organizer, a new NFT mint is created, and one token is minted to the buyer's wallet

---

## On-Chain Program (Anchor/Rust)

The Solana program at `backend/program/programs/ticketchain/src/lib.rs` exposes six instructions:

| Instruction | What It Does |
|---|---|
| `create_event` | Creates an Event PDA (title, venue, date, price, supply, organizer's resale split). Organizer pays rent. |
| `buy_ticket` | Transfers `price_lamports` SOL from buyer to organizer. Mints a new ticket NFT (SPL token, decimals=0) to the buyer. |
| `list_for_resale` | Transfers the ticket NFT from the seller into a program-owned escrow token account. Creates a Listing PDA with the asking price. |
| `buy_resale` | Splits the resale price as SOL: `artist_pct`% → organizer, `(80 − artist_pct)`% → seller, 20% → platform. Transfers the NFT from escrow to buyer. Closes the Listing PDA. |
| `cancel_listing` | Returns the escrowed NFT to the seller. Closes the Listing and escrow accounts. |
| `close_event` | Closes the Event account and returns rent SOL to the organizer. |

All accounts use PDA seeds so the program can sign on their behalf without private keys.

---

## Project Structure

```
TicketChain/
├── Frontend/                          React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx        Hero, features, stats
│   │   │   ├── EventsPage.tsx         Browse all events
│   │   │   ├── PurchaseTicketPage.tsx  Buy a ticket for an event
│   │   │   ├── CreateEventPage.tsx     Organizer: create event + set resale split
│   │   │   ├── ManageEventsPage.tsx    Organizer: view/delete own events
│   │   │   ├── EventAttendeesPage.tsx  Organizer: view ticket holders
│   │   │   ├── MyTicketsPage.tsx       Fan: view owned tickets, list for resale
│   │   │   ├── MarketplacePage.tsx     Browse & buy resale listings
│   │   │   ├── ListTicketPage.tsx      List a ticket for resale
│   │   │   ├── AboutPage.tsx           Project info & tech deep-dive
│   │   │   ├── Navigation.tsx          Navbar with wallet connect/disconnect
│   │   │   └── SolanaProviders.tsx     Wallet adapter + connection provider
│   │   ├── contexts/WalletContext.tsx   Wallet state (connect, pubkey, balance)
│   │   ├── lib/api.ts                  API client (all fetch calls to backend)
│   │   └── types/index.ts             Shared TypeScript interfaces
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── api/                           Express API server
│   │   ├── src/
│   │   │   ├── index.js               Routes + controller logic
│   │   │   ├── solana.js              Anchor transaction builders
│   │   │   ├── db.js                  Supabase cache (optional, falls back to in-memory)
│   │   │   ├── sync.js               Periodic chain→cache sync
│   │   │   └── idl/ticketchain.json   Program IDL (interface definition)
│   │   └── package.json
│   │
│   └── program/                       Anchor/Rust smart contract
│       ├── programs/ticketchain/
│       │   └── src/lib.rs             All on-chain instructions & accounts
│       ├── Anchor.toml                Program ID, cluster config
│       └── Cargo.toml
│
├── render.yaml                        Render.com deploy blueprint for the API
└── README.md                          ← you are here
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion |
| Wallet | Solana Wallet Adapter (Phantom, Solflare, and any SPL-compatible wallet) |
| API | Express.js, @coral-xyz/anchor 0.30.1, @solana/web3.js, @solana/spl-token |
| Cache (optional) | Supabase (Postgres) — falls back to in-memory if not configured |
| Smart Contract | Rust, Anchor Framework 0.30.1 |
| Blockchain | Solana (Devnet) |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 8+ | `npm install -g pnpm` |
| Phantom wallet | latest | https://phantom.app (browser extension) |

> **You do NOT need Rust, Solana CLI, or Anchor installed.** The program is already deployed to Devnet. You only need Node.js to run the app.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Anirudhp196/TicketChain.git
cd TicketChain

# 2. Install dependencies
cd backend/api && npm install && cd ../..
cd Frontend && pnpm install && cd ..

# 3. Start the API (Terminal 1)
cd backend/api
SOLANA_RPC_URL=https://api.devnet.solana.com node src/index.js
# → TicketChain API listening on http://localhost:3001

# 4. Start the frontend (Terminal 2)
cd Frontend
VITE_API_URL=http://localhost:3001 pnpm dev
# → Local: http://localhost:3000/
```

Open **http://localhost:3000**, connect Phantom (set to **Devnet**), and you're in.

---

## Wallet Setup (Phantom)

1. Install the [Phantom](https://phantom.app) browser extension
2. Create or import a wallet
3. **Switch to Devnet:** Settings → Developer Settings → Testnet Mode ON → select **Solana Devnet**
4. Get free devnet SOL: go to https://faucet.solana.com, select Devnet, paste your wallet address, request 2 SOL

---

## How to Test

### As an Organizer
1. Connect Phantom at **http://localhost:3000**
2. Go to `/create-event` — fill in event details, set your resale split (0–80%), and click **Create Event & Mint Tickets**
3. Approve the transaction in Phantom — your event is now on-chain
4. Go to `/manage-events` to see your events, view attendees, or delete an event

### As a Fan
1. Go to `/events` and click an event card
2. Click **Confirm Purchase** and approve in Phantom — an NFT ticket is minted to your wallet
3. Go to `/my-tickets` to see your tickets
4. Click **List for Resale** on any ticket, set a price — the NFT moves to escrow on-chain
5. Go to `/marketplace` to see all resale listings and buy from other sellers

### Resale Split in Action
When a resale purchase happens, the program atomically splits the SOL:
- **Organizer** receives `artist_pct`% (set at event creation)
- **Seller** receives `(80 − artist_pct)`%
- **Platform** receives 20%

---

## Environment Variables

| Variable | Where | Default | Description |
|----------|-------|---------|-------------|
| `VITE_API_URL` | Frontend | *(none — required)* | API server URL, e.g. `http://localhost:3001` |
| `SOLANA_RPC_URL` | API | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `PORT` | API | `3001` | API server port |
| `SUPABASE_URL` | API | *(optional)* | Supabase project URL for caching event/ticket data |
| `SUPABASE_KEY` | API | *(optional)* | Supabase anon/service key |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Failed to fetch` in browser | Make sure the API is running on port 3001 and `VITE_API_URL=http://localhost:3001` |
| `API returned HTML` | You're pointing `VITE_API_URL` at the frontend (3000) instead of the API (3001) |
| Phantom says "Not enough SOL" | Get free devnet SOL from https://faucet.solana.com |
| Phantom won't connect | Confirm Phantom is set to **Devnet**, not Mainnet |
| `EADDRINUSE 3001` | Kill the existing process: `lsof -ti:3001 \| xargs kill -9` |
| Events page is empty | Ensure the API is running and `VITE_API_URL` is set correctly |

---

## Deployment

The repo includes a [render.yaml](render.yaml) blueprint for one-click API deployment on Render.

| Part | Platform | Notes |
|------|----------|-------|
| Frontend | **Vercel** | Static build. Set `VITE_API_URL` to deployed API URL. Root dir: `Frontend`. |
| API | **Render** or **Railway** | Node server. Set `SOLANA_RPC_URL`. Root dir: `backend/api`. |
| Solana program | Already on Devnet | No redeploy unless you change the Rust code. |

### Deploy the API (Render — recommended)

1. Push to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint** → connect this repo
3. Render reads `render.yaml` and deploys automatically
4. Optionally set `SUPABASE_URL` and `SUPABASE_KEY` in the dashboard for persistent caching
5. Copy the service URL (e.g. `https://ticketchain-api.onrender.com`)

### Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → import the repo
2. Set **Root Directory** to `Frontend`
3. Add env var: `VITE_API_URL` = your Render API URL (no trailing slash)
4. Deploy — Vercel runs `pnpm build` and serves the static app

---

## Rebuilding the Solana Program (optional)

Only needed if you change the Rust code in `backend/program/`. Requires Rust, Solana CLI 1.18+, and Anchor 0.30.1.

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Build
cd backend/program
anchor build

# Deploy (needs ~2 SOL on devnet)
solana airdrop 2 --url devnet
anchor deploy --provider.cluster devnet
```

---

## License

This project was built for a hackathon. See repo for license details.