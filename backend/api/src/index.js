/**
 * TicketChain relay API
 * Proxies frontend requests to the Solana/Anchor program.
 * Returns serialized transactions for frontend to sign and submit.
 */

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  buildBuyTicketTransaction,
  buildCreateEventTransaction,
  buildListForResaleTransaction,
  buildBuyResaleTransaction,
  buildCancelListingTransaction,
  fetchAllListings,
} from './solana.js';

const app = express();
const PORT = process.env.PORT ?? 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = process.env.DATA_PATH ?? join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// eventId (from our API) -> on-chain Event account pubkey (set when event is created via create_event)
const eventIdToPubkey = new Map();

// On-chain events created through the API (appended by POST /api/events after signing)
const onChainEvents = [];
let nextOnChainId = 100; // start IDs at 100 to avoid collision with mocks
const purchases = [];
let nextTicketId = 1;
const userListings = [];
let nextListingId = 1000;

function loadData() {
  if (!existsSync(DATA_PATH)) return;
  try {
    const raw = readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const events = Array.isArray(parsed.onChainEvents) ? parsed.onChainEvents : [];
    const savedPurchases = Array.isArray(parsed.purchases) ? parsed.purchases : [];
    const savedListings = Array.isArray(parsed.userListings) ? parsed.userListings : [];
    const savedNextOnChainId = Number(parsed.nextOnChainId);
    const savedNextTicketId = Number(parsed.nextTicketId);
    const savedNextListingId = Number(parsed.nextListingId);
    const mapEntries = parsed.eventIdToPubkeyEntries ?? [];

    onChainEvents.length = 0;
    onChainEvents.push(...events);

    purchases.length = 0;
    purchases.push(...savedPurchases);

    userListings.length = 0;
    userListings.push(...savedListings);

    if (!Number.isNaN(savedNextOnChainId)) nextOnChainId = savedNextOnChainId;
    if (!Number.isNaN(savedNextTicketId)) nextTicketId = savedNextTicketId;
    if (!Number.isNaN(savedNextListingId)) nextListingId = savedNextListingId;

    eventIdToPubkey.clear();
    if (Array.isArray(mapEntries)) {
      mapEntries.forEach(([key, value]) => {
        if (key && value) eventIdToPubkey.set(String(key), String(value));
      });
    }
  } catch (err) {
    console.error('Failed to load persisted data', err);
  }
}

function saveData() {
  try {
    const payload = {
      onChainEvents,
      purchases,
      userListings,
      nextOnChainId,
      nextTicketId,
      nextListingId,
      eventIdToPubkeyEntries: Array.from(eventIdToPubkey.entries()),
    };
    writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist data', err);
  }
}

loadData();

// Mock events (match Frontend shape)
const MOCK_EVENTS = [
  { id: 1, title: 'Synthwave Sunset Festival', artist: 'Neon Dreams', date: 'March 15, 2026', location: 'Los Angeles, CA', price: 0.5, available: 234, total: 500, status: 'On Sale', loyaltyRequired: null, type: 'Concert' },
  { id: 2, title: 'Lakers vs Warriors', artist: 'NBA', date: 'March 22, 2026', location: 'Los Angeles, CA', price: 0.8, available: 89, total: 300, status: 'Almost Sold Out', loyaltyRequired: null, type: 'Sports' },
];

function getAllEvents() {
  return [...MOCK_EVENTS, ...onChainEvents];
}

function findEventById(id) {
  const all = getAllEvents();
  return all.find((e) => String(e.id) === String(id));
}

app.get('/api/events', (_req, res) => {
  res.json(getAllEvents());
});

app.get('/api/events/:id', (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json({ ...event, tier: event.tier ?? 'General Admission' });
});

app.get('/api/events/:id/attendees', (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const attendees = purchases
    .filter((p) => String(p.eventId) === String(req.params.id))
    .reduce((acc, purchase) => {
      const existing = acc.get(purchase.wallet);
      acc.set(purchase.wallet, {
        wallet: purchase.wallet,
        tickets: (existing?.tickets ?? 0) + 1,
      });
      return acc;
    }, new Map());
  res.json({
    eventId: event.id,
    eventTitle: event.title,
    attendees: Array.from(attendees.values()),
  });
});

// Create event: build create_event tx. Body: { organizerPubkey, title, venue, dateTs, tierName, priceLamports, supply }
// Event keypair is generated server-side and pre-signed; frontend only signs for organizer wallet.
app.post('/api/events', async (req, res) => {
  const { organizerPubkey, title, venue, dateTs, tierName, priceLamports, supply } = req.body ?? {};
  if (!organizerPubkey || !title || !venue || priceLamports == null || !supply) {
    return res.status(400).json({ error: 'Missing required fields: organizerPubkey, title, venue, dateTs, tierName, priceLamports, supply' });
  }
  try {
    const supplyNum = Number(supply);
    const priceLamportsNum = Number(priceLamports);
    const dateTsNum = dateTs ?? Math.floor(Date.now() / 1000);
    const tier = tierName ?? 'General Admission';

    const { transaction, eventPubkey } = await buildCreateEventTransaction(organizerPubkey, {
      title,
      venue,
      dateTs: dateTsNum,
      tierName: tier,
      priceLamports: priceLamportsNum,
      supply: supplyNum,
    });

    const eventId = nextOnChainId++;
    eventIdToPubkey.set(String(eventId), eventPubkey);

    // Add to in-memory events list so it appears in GET /api/events
    const dateStr = new Date(dateTsNum * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    onChainEvents.push({
      id: eventId,
      title,
      artist: 'On-chain Event',
      date: dateStr,
      location: venue,
      price: priceLamportsNum / 1e9,
      available: supplyNum,
      total: supplyNum,
      status: 'On Sale',
      loyaltyRequired: null,
      type: 'Concert',
      tier,
      eventPubkey,
      organizerPubkey,
    });

    saveData();
    res.json({ transaction, eventPubkey, eventId });
  } catch (e) {
    console.error('create_event build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build create_event transaction' });
  }
});

// Buy ticket: build buy_ticket tx if we have an on-chain event; else return mock.
app.post('/api/tickets/buy', async (req, res) => {
  const { eventId, eventPubkey, wallet, tier } = req.body ?? {};
  if (!wallet) return res.status(400).json({ error: 'Missing wallet' });
  // Look up on-chain pubkey: from body, from id->pubkey map, or from the event object itself
  let eventPk = eventPubkey ?? (eventId != null ? eventIdToPubkey.get(String(eventId)) : null);
  if (!eventPk && eventId != null) {
    const ev = onChainEvents.find((e) => String(e.id) === String(eventId));
    if (ev?.eventPubkey) eventPk = ev.eventPubkey;
  }
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

// Confirm purchase after wallet signs and submits the tx.
app.post('/api/tickets/confirm', async (req, res) => {
  const { eventId, wallet, signature } = req.body ?? {};
  if (!eventId || !wallet || !signature) {
    return res.status(400).json({ error: 'Missing eventId, wallet, or signature' });
  }

  const event = findEventById(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Determine which ticket mint this purchase corresponds to.
  // The mint PDA is: seeds = [b"ticket_mint", event_pubkey, sold_le_bytes]
  // 'sold' is the ticket index at time of purchase (before incrementing).
  const eventPk = event.eventPubkey ?? eventIdToPubkey.get(String(eventId));
  let ticketMint = null;
  if (eventPk) {
    // Try to derive the ticket mint from the pre-purchase sold count
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const eventPkObj = new PublicKey(eventPk);
      // sold index = total - available (approximation; the on-chain sold was used at buy time)
      // We use the current purchase count for this event as the index
      const purchaseIndex = purchases.filter(p => String(p.eventId) === String(eventId)).length;
      const soldBuf = Buffer.alloc(4);
      soldBuf.writeUInt32LE(purchaseIndex, 0);
      const [mintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('ticket_mint'), eventPkObj.toBuffer(), soldBuf],
        new PublicKey('BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts')
      );
      ticketMint = mintPda.toBase58();
    } catch (e) {
      console.error('Failed to derive ticket mint PDA', e);
    }
  }

  const ticket = {
    id: nextTicketId++,
    eventId: event.id,
    event: event.title,
    artist: event.artist ?? 'Unknown',
    date: event.date,
    tier: event.tier ?? 'General Admission',
    purchasePrice: event.price,
    suggestedPrice: event.price ? Number((event.price * 1.1).toFixed(2)) : 0,
    eventPubkey: eventPk ?? null,
    ticketMint,
    wallet,
    signature,
    purchasedAt: new Date().toISOString(),
  };
  purchases.push(ticket);

  const onChainEvent = onChainEvents.find((e) => String(e.id) === String(eventId));
  if (onChainEvent && typeof onChainEvent.available === 'number') {
    onChainEvent.available = Math.max(onChainEvent.available - 1, 0);
  }

  saveData();
  res.json({ ticket });
});

app.get('/api/tickets', (req, res) => {
  const wallet = req.query.wallet;
  if (!wallet) return res.status(400).json({ error: 'Missing wallet' });
  const owned = purchases.filter((p) => p.wallet === wallet);
  res.json(owned);
});

// ── Resale Listings (on-chain) ────────────────────────────────────────

/**
 * GET /api/listings — fetch all on-chain Listing accounts and enrich with event metadata.
 */
app.get('/api/listings', async (_req, res) => {
  try {
    const onChainListings = await fetchAllListings();

    // Enrich each listing with event metadata from our in-memory event store
    const enriched = onChainListings.map((l) => {
      // Find matching event in our records
      const ev = getAllEvents().find(
        (e) => e.eventPubkey === l.event
      );
      const sellerShort = l.seller.slice(0, 6) + '...' + l.seller.slice(-4);
      return {
        id: l.pubkey,
        ticketMint: l.ticketMint,
        event: ev?.title ?? 'On-chain Event',
        artist: ev?.artist ?? 'Unknown',
        originalPrice: ev?.price ?? 0,
        currentPrice: l.priceSol,
        seller: sellerShort,
        sellerWallet: l.seller,
        sellerRep: 'Bronze',
        date: ev?.date ?? 'TBD',
        verified: true,
        priceChange: ev?.price ? Math.round(((l.priceSol - ev.price) / ev.price) * 100) : 0,
        listingAge: 'On-chain',
        eventPubkey: l.event,
      };
    });

    // Also include local user listings (from before on-chain was wired)
    const combined = [...enriched, ...userListings];
    res.json(combined);
  } catch (e) {
    console.error('Failed to fetch on-chain listings', e);
    // Fallback to local listings if chain read fails
    res.json(userListings);
  }
});

/**
 * POST /api/listings — build list_for_resale transaction.
 * Body: { sellerWallet, eventPubkey, ticketMint, priceSol }
 */
app.post('/api/listings', async (req, res) => {
  const { sellerWallet, eventPubkey, ticketMint, priceSol } = req.body ?? {};
  if (!sellerWallet || !eventPubkey || !ticketMint || priceSol == null) {
    return res.status(400).json({
      error: 'Missing required fields: sellerWallet, eventPubkey, ticketMint, priceSol',
    });
  }
  try {
    const priceLamports = Math.round(Number(priceSol) * 1e9);
    const { transaction, listingPubkey } = await buildListForResaleTransaction(
      sellerWallet,
      eventPubkey,
      ticketMint,
      priceLamports
    );
    res.json({ transaction, listingPubkey });
  } catch (e) {
    console.error('list_for_resale build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build list_for_resale transaction' });
  }
});

/**
 * POST /api/listings/buy — build buy_resale transaction.
 * Body: { buyerWallet, ticketMint }
 */
app.post('/api/listings/buy', async (req, res) => {
  const { buyerWallet, ticketMint } = req.body ?? {};
  if (!buyerWallet || !ticketMint) {
    return res.status(400).json({ error: 'Missing required fields: buyerWallet, ticketMint' });
  }
  try {
    const transaction = await buildBuyResaleTransaction(buyerWallet, ticketMint);
    res.json({ transaction, message: 'Sign and submit to buy the resale ticket' });
  } catch (e) {
    console.error('buy_resale build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build buy_resale transaction' });
  }
});

/**
 * DELETE /api/listings — build cancel_listing transaction.
 * Body: { sellerWallet, ticketMint }
 */
app.delete('/api/listings', async (req, res) => {
  const { sellerWallet, ticketMint } = req.body ?? {};
  if (!sellerWallet || !ticketMint) {
    return res.status(400).json({ error: 'Missing required fields: sellerWallet, ticketMint' });
  }
  try {
    const transaction = await buildCancelListingTransaction(sellerWallet, ticketMint);
    res.json({ transaction, message: 'Sign and submit to cancel the listing' });
  } catch (e) {
    console.error('cancel_listing build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build cancel_listing transaction' });
  }
});

app.listen(PORT, () => {
  console.log(`TicketChain API listening on http://localhost:${PORT}`);
});
