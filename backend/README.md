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

Runs the relay server (default port 3001). Until the Anchor program is deployed, event/ticket/listing endpoints may return mock data or 501.
