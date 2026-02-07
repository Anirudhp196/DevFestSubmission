# TicketChain — Decentralized Event Ticketing on Solana

A Web3 event ticketing platform where tickets are NFTs on Solana. Create events, buy tickets, and resell — all on-chain with anti-scalping protection.

**Live program on Solana Devnet:** `BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts`

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 8+ | `npm install -g pnpm` |
| Phantom wallet | latest | https://phantom.app (browser extension) |

> **You do NOT need Rust, Solana CLI, or Anchor installed.** The Solana program is already deployed to devnet. You only need Node.js to run the app.

---

## Quick Start (3 commands)

```bash
# 1. Install dependencies
cd backend/api && npm install && cd ../..
cd Frontend && pnpm install && cd ..

# 2. Start the API server (Terminal 1)
cd backend/api
SOLANA_RPC_URL=https://api.devnet.solana.com node src/index.js

# 3. Start the frontend (Terminal 2)
cd Frontend
VITE_API_URL=http://localhost:3001 pnpm dev
```

Open **http://localhost:3000** in your browser.

---

## Setup — Step by Step

### 1. Clone the repo

```bash
git clone <repo-url>
cd mosh-decentralized-ticketing
```

### 2. Install API dependencies

```bash
cd backend/api
npm install
```

### 3. Install Frontend dependencies

```bash
cd Frontend
pnpm install
```

### 4. Configure Phantom Wallet

1. Install the [Phantom](https://phantom.app) browser extension
2. Create or import a wallet
3. **Switch to Devnet:** Settings > Developer Settings > Testnet Mode ON > select **Solana Devnet**
4. Get free devnet SOL: go to https://faucet.solana.com, select Devnet, paste your wallet address, request 2 SOL

### 5. Start the API (Terminal 1)

```bash
cd backend/api
SOLANA_RPC_URL=https://api.devnet.solana.com node src/index.js
```

You should see: `TicketChain API listening on http://localhost:3001`

### 6. Start the Frontend (Terminal 2)

```bash
cd Frontend
VITE_API_URL=http://localhost:3001 pnpm dev
```

You should see: `Local: http://localhost:3000/`

### 7. Open the app

Go to **http://localhost:3000** in your browser. Connect your Phantom wallet using the button in the nav bar.

---

## How to Test

### Create an Event
1. Go to http://localhost:3000/create-event
2. Fill in event name, date, venue, price (in SOL), and supply
3. Click **"Create Event & Mint Tickets"**
4. Approve the transaction in Phantom
5. Your event appears on the Events page

### Buy a Ticket
1. Go to http://localhost:3000/events
2. Click any event card (including ones you just created)
3. Click **"Confirm Purchase"**
4. Approve the transaction in Phantom
5. An NFT ticket is minted to your wallet

### Browse the Marketplace
1. Go to http://localhost:3000/marketplace
2. View resale listings (mock data for now)

---

## Project Structure

```
mosh-decentralized-ticketing/
├── Frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Pages: Landing, Events, Purchase, Create, Marketplace
│   │   ├── contexts/           # WalletContext (Solana wallet adapter)
│   │   ├── lib/api.ts          # API client (talks to backend)
│   │   └── types/index.ts      # Shared TypeScript types
│   └── package.json
│
├── backend/
│   ├── api/                    # Express API server (Node.js)
│   │   ├── src/index.js        # Routes: GET/POST events, POST tickets/buy, GET listings
│   │   ├── src/solana.js       # Builds Anchor transactions for the Solana program
│   │   └── src/idl/            # Program IDL (interface definition)
│   │
│   └── program/                # Solana/Anchor smart contract (Rust)
│       ├── programs/ticketchain/src/lib.rs   # On-chain program
│       └── Anchor.toml
│
└── README.md                   # You are here
```

---

## Architecture

```
Browser (React + Phantom Wallet)
    │
    ├──► Frontend (localhost:3000)
    │       Renders UI, connects wallet, signs transactions
    │
    ├──► API Server (localhost:3001)
    │       Builds unsigned Solana transactions
    │       Returns them to the frontend for wallet signing
    │
    └──► Solana Devnet
            TicketChain program (BxjzLBTG...)
            Stores events, mints NFT tickets, handles payments
```

**Flow:**
1. User fills out a form (e.g., create event)
2. Frontend sends request to API
3. API builds an unsigned Solana transaction and returns it
4. Frontend asks Phantom to sign the transaction
5. Signed transaction is submitted to Solana devnet
6. Program executes on-chain (creates event / mints ticket NFT)

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Wallet:** Solana Wallet Adapter (Phantom, Solflare)
- **API:** Express.js, @coral-xyz/anchor, @solana/web3.js
- **Smart Contract:** Rust, Anchor Framework 0.30.1
- **Blockchain:** Solana (Devnet)

---

## Environment Variables

| Variable | Where | Default | Description |
|----------|-------|---------|-------------|
| `VITE_API_URL` | Frontend | — | API server URL (e.g., `http://localhost:3001`) |
| `SOLANA_RPC_URL` | API | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `PORT` | API | `3001` | API server port |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Failed to fetch` in browser | Make sure the API is running on port 3001 |
| `API returned HTML` | You're pointing `VITE_API_URL` at the frontend port (3000) instead of the API port (3001) |
| Phantom shows "Not enough SOL" | Get free devnet SOL from https://faucet.solana.com |
| Phantom not connecting | Make sure Phantom is set to **Devnet**, not Mainnet |
| `EADDRINUSE 3001` | Another process is using port 3001. Kill it: `lsof -ti:3001 \| xargs kill -9` |

---

## Rebuilding the Solana Program (optional)

Only needed if you change the Rust code in `backend/program/`. Requires Rust, Solana CLI, and Anchor.

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Build
cd backend/program
cargo build-sbf -- -p ticketchain

# Deploy (needs ~2 SOL on devnet)
solana airdrop 2 --url devnet
solana program deploy target/deploy/ticketchain.so --url devnet
```
