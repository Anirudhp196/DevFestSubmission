/**
 * TicketChain relay API
 * Proxies frontend requests to the Solana/Anchor program.
 * Returns serialized transactions for frontend to sign and submit.
 */

import express from 'express';
import cors from 'cors';
import { buildBuyTicketTransaction, buildCreateEventTransaction } from './solana.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// eventId (from our API) -> on-chain Event account pubkey (set when event is created via create_event)
const eventIdToPubkey = new Map();

// Mock events (match Frontend shape; merge with any on-chain event ids we know)
const MOCK_EVENTS = [
  { id: 1, title: 'Synthwave Sunset Festival', artist: 'Neon Dreams', date: 'March 15, 2026', location: 'Los Angeles, CA', price: 0.5, available: 234, total: 500, status: 'On Sale', loyaltyRequired: null, type: 'Concert' },
  { id: 2, title: 'Lakers vs Warriors', artist: 'NBA', date: 'March 22, 2026', location: 'Los Angeles, CA', price: 0.8, available: 89, total: 300, status: 'Almost Sold Out', loyaltyRequired: null, type: 'Sports' },
];

app.get('/api/events', (_req, res) => {
  res.json(MOCK_EVENTS);
});

app.get('/api/events/:id', (req, res) => {
  const event = MOCK_EVENTS.find((e) => String(e.id) === req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json({ ...event, tier: event.tier ?? 'General Admission' });
});

// Create event: build create_event tx. Body: { organizerPubkey, eventAccountPubkey, title, venue, dateTs, tierName, priceLamports, supply }
app.post('/api/events', async (req, res) => {
  const { organizerPubkey, eventAccountPubkey, title, venue, dateTs, tierName, priceLamports, supply } = req.body ?? {};
  if (!organizerPubkey || !eventAccountPubkey || !title || !venue || priceLamports == null || !supply) {
    return res.status(400).json({ error: 'Missing required fields: organizerPubkey, eventAccountPubkey, title, venue, dateTs, tierName, priceLamports, supply' });
  }
  try {
    const transaction = await buildCreateEventTransaction(organizerPubkey, eventAccountPubkey, {
      title,
      venue,
      dateTs: dateTs ?? Math.floor(Date.now() / 1000),
      tierName: tierName ?? 'General Admission',
      priceLamports: Number(priceLamports),
      supply: Number(supply),
    });
    const nextId = MOCK_EVENTS.length + eventIdToPubkey.size + 1;
    eventIdToPubkey.set(String(nextId), eventAccountPubkey);
    res.json({ transaction, eventPubkey: eventAccountPubkey, eventId: nextId });
  } catch (e) {
    console.error('create_event build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build create_event transaction' });
  }
});

// Buy ticket: build buy_ticket tx if we have an on-chain event; else return mock.
app.post('/api/tickets/buy', async (req, res) => {
  const { eventId, eventPubkey, wallet, tier } = req.body ?? {};
  if (!wallet) return res.status(400).json({ error: 'Missing wallet' });
  const eventPk = eventPubkey ?? (eventId != null ? eventIdToPubkey.get(String(eventId)) : null);
  if (eventPk) {
    try {
      const transaction = await buildBuyTicketTransaction(eventPk, wallet);
      return res.json({ transaction, message: 'Sign and submit this transaction in your wallet' });
    } catch (e) {
      console.error('buy_ticket build failed', e);
      return res.status(400).json({ error: e.message ?? 'Failed to build buy_ticket transaction' });
    }
  }
  const signature = `mock-${eventId ?? '?'}-${Date.now()}`;
  res.json({ signature, message: `Mock purchase (no on-chain event for this id). Create an event first to get a real transaction.` });
});

// Mock listings (match Frontend Listing type; replace with Listing PDAs when program is wired)
const MOCK_LISTINGS = [
  { id: 1, event: 'Synthwave Sunset Festival', artist: 'Neon Dreams', originalPrice: 0.5, currentPrice: 0.55, seller: '7a2f...3b4c', sellerRep: 'Gold', date: 'March 15, 2026', verified: true, priceChange: 10, listingAge: '2 hours ago' },
  { id: 2, event: 'Jazz in the Park', artist: 'The Blue Notes Collective', originalPrice: 0.3, currentPrice: 0.28, seller: '9c4d...7e2a', sellerRep: 'Silver', date: 'March 22, 2026', verified: true, priceChange: -7, listingAge: '5 hours ago' },
  { id: 3, event: 'Ethereal Beats World Tour', artist: 'DJ Aurora', originalPrice: 0.8, currentPrice: 0.82, seller: '3f8e...1d6b', sellerRep: 'Gold', date: 'April 5, 2026', verified: true, priceChange: 2.5, listingAge: '1 day ago' },
  { id: 4, event: 'Indie Rock Underground', artist: 'The Echoes', originalPrice: 0.4, currentPrice: 0.41, seller: '6b2c...9f3e', sellerRep: 'Bronze', date: 'April 12, 2026', verified: true, priceChange: 2.5, listingAge: '3 hours ago' },
];

app.get('/api/listings', (_req, res) => {
  res.json(MOCK_LISTINGS);
});

app.post('/api/listings', (_req, res) => {
  res.status(501).json({ error: 'Not implemented: wire to Anchor list' });
});

app.post('/api/listings/buy', (_req, res) => {
  res.status(501).json({ error: 'Not implemented: wire to Anchor buy_listing' });
});

app.listen(PORT, () => {
  console.log(`TicketChain API listening on http://localhost:${PORT}`);
});
