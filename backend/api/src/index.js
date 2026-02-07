/**
 * TicketChain relay API
 * Proxies frontend requests to the Solana/Anchor program.
 * Until the program is deployed, returns mock data for GETs and 501 for writes.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Mock events (match Frontend/src/lib/api.ts shape when no program)
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

app.post('/api/events', (_req, res) => {
  res.status(501).json({ error: 'Not implemented: wire to Anchor create_event' });
});

app.post('/api/tickets/buy', (req, res) => {
  const { eventId, wallet, tier } = req.body ?? {};
  if (!eventId || !wallet) {
    return res.status(400).json({ error: 'Missing eventId or wallet' });
  }

  // TODO: Replace with Anchor buy_ticket transaction once program is deployed.
  const signature = `mock-${eventId}-${Date.now()}`;
  res.json({
    signature,
    message: `Queued buy_ticket for ${wallet}${tier ? ` (${tier})` : ''}`,
  });
});

app.get('/api/listings', (_req, res) => {
  res.json([]);
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
