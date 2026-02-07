# TicketChain Backend

This folder holds the backend for TicketChain: the Solana/Anchor program and (optionally) a relay API the frontend can call.

## Structure

| Path | Purpose |
|------|---------|
| **`program/`** | Solana Anchor program (Rust): Event PDAs, buy_ticket, create_event, list, buy_listing, etc. |
| **`api/`** | Optional relay API (Node): `GET/POST /api/events`, `POST /api/tickets/buy`, `GET/POST /api/listings`, etc. Builds and submits transactions to the program; frontend sets `VITE_API_URL` to this server. |

## Frontend integration

- Point the frontend at this API by setting **`VITE_API_URL`** (e.g. `http://localhost:3001`) when running the API.
- See **`docs/FRONTEND_ARCHITECTURE_REVIEW.md`** for the full UI → API → Solana instruction mapping.

## Quick start (API only)

```bash
cd api
pnpm install
pnpm dev
```

Runs the relay server (default port 3001).

## Anchor wiring

The API builds **unsigned** transactions for the TicketChain program and returns them as base64. The frontend signs and submits.

- **POST /api/tickets/buy** – If the request includes an on-chain event (via `eventPubkey` or an `eventId` that was registered when creating an event), the API returns `{ transaction: "<base64>" }`. The frontend signs with the wallet and submits. Otherwise returns a mock success.
- **POST /api/events** – Body: `organizerPubkey`, `eventAccountPubkey` (new keypair pubkey), `title`, `venue`, `dateTs`, `tierName`, `priceLamports`, `supply`. Returns `{ transaction, eventPubkey, eventId }` for the organizer to sign and submit.

Set **SOLANA_RPC_URL** (default: devnet) if needed. After running `anchor build` in `program/`, copy `program/target/idl/ticketchain.json` to `api/src/idl/ticketchain.json` so the API uses the correct IDL and program id.
