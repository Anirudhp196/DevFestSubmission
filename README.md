# TicketChain — Decentralized Event Ticketing on Solana

TicketChain is a Web3 event ticketing platform where every ticket is an NFT on Solana. Organizers create events, set prices, and choose how resale revenue is split — all enforced by an on-chain smart contract. Fans buy, hold, and resell tickets through a consumer-grade UI without needing to understand crypto.

**🌐 Live App:** [https://ticket-chain-two.vercel.app](https://ticket-chain-two.vercel.app/)

**On-Chain Program (Solana Devnet):** [`BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts`](https://explorer.solana.com/address/BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts?cluster=devnet)

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
│  ticket-chain-two.vercel.app              │
└────────────┬──────────────────────────────┘
             │  HTTP (JSON)
             ▼
┌───────────────────────────────────────────┐
│  API Server (Express.js)                  │
│  Hosted on Render                         │
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

### Why Smart Contracts? What They Actually Solve

Traditional ticketing is broken in three fundamental ways — and each is fixed by putting the logic on-chain:

**1. Counterfeiting → NFT Tickets**
Paper and QR-code tickets are trivially duplicated. With TicketChain, every ticket is a unique SPL token on Solana. Ownership is cryptographically verified by the blockchain — you either hold the token in your wallet or you don't. There is no PDF to screenshot, no barcode to photocopy. The venue can verify authenticity by checking the on-chain mint.

**2. Scalpers Keep All the Profit → Enforced Revenue Splits**
On traditional platforms, scalpers buy tickets at face value and resell at 5–10× markup. The organizer and original platform see zero revenue from that resale. In TicketChain, the `buy_resale` instruction enforces a three-way SOL split *atomically in the same transaction* — the organizer's cut, the seller's cut, and the platform fee all move at once. No one can bypass this because it's program logic, not a Terms of Service. Organizers choose their split (0–80%) when they create the event, and it cannot be changed after the fact.

**3. Centralized Control & Opaque Fees → Trustless, Transparent Rules**
With centralized ticketing, the platform can change fees, freeze accounts, or shut down at any time. TicketChain's rules live in an immutable Solana program. The escrow mechanism (listing locks the NFT in a program-owned account, buying atomically releases it) means neither the platform nor the API server can steal funds or tickets. The API only builds unsigned transactions — it never touches private keys. All fee logic is visible in the open-source Rust code and verifiable on the Solana explorer.

**Why Solana specifically?**
- **Sub-second finality (~400ms)** — ticket purchases confirm in real-time, no "pending" states
- **Negligible fees (~0.00001 SOL per tx)** — minting an NFT ticket costs a fraction of a cent, making it viable even for free or low-cost events
- **Native SPL token standard** — tickets are real tokens in the user's wallet, interoperable with any Solana wallet or marketplace
- **PDA-based escrow** — the program can custody NFTs and split SOL without any private key, eliminating custodial risk entirely

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

## Wallet Setup (Phantom)

1. Install the [Phantom](https://phantom.app) browser extension
2. Create or import a wallet
3. **Switch to Devnet:** Settings → Developer Settings → Testnet Mode ON → select **Solana Devnet**
4. Get free devnet SOL: go to https://faucet.solana.com, select Devnet, paste your wallet address, request 2 SOL

---

## How to Test

Visit **[https://ticket-chain-two.vercel.app](https://ticket-chain-two.vercel.app/)** and connect your Phantom wallet (set to **Devnet**).

### As an Organizer
1. Connect Phantom on the site
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

## Deployment

| Part | Platform | URL |
|------|----------|-----|
| Frontend | **Vercel** | [ticket-chain-two.vercel.app](https://ticket-chain-two.vercel.app/) |
| API | **Render** | Deployed via [render.yaml](render.yaml) blueprint |
| Solana program | **Devnet** | [`BxjzLBTG...`](https://explorer.solana.com/address/BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts?cluster=devnet) |

---

## License

This project was built for a hackathon. See repo for license details.