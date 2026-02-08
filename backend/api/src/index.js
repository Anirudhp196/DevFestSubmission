/**
 * TicketChain relay API
 * Proxies frontend requests to the Solana/Anchor program.
 * Returns serialized transactions for frontend to sign and submit.
 *
 * Data flow:
 *   Chain (source of truth) -> Supabase (cache) -> API responses
 *   If Supabase is not configured, falls back to direct chain reads + in-memory.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  buildBuyTicketTransaction,
  buildCreateEventTransaction,
  buildCloseEventTransaction,
  buildListForResaleTransaction,
  buildBuyResaleTransaction,
  buildCancelListingTransaction,
  fetchAllEvents,
  fetchAllListings,
} from './solana.js';
import {
  isEnabled as dbEnabled,
  cacheEvents,
  getCachedEvents,
  getCachedEvent,
  removeCachedEvent,
  addPurchase,
  getPurchasesByWallet,
  getPurchasesByEvent,
  getCachedListings,
} from './db.js';
import { startSync, syncFromChain } from './sync.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// ── In-memory fallback (used when Supabase is not configured) ────────
const inMemoryPurchases = [];
let nextTicketId = 1;

// ── Helper: convert chain event to frontend shape ────────────────────
function chainEventToFrontend(ce) {
  return {
    id: `chain-${ce.eventPubkey.slice(0, 8)}`,
    title: ce.title,
    artist: 'On-chain Event',
    date: ce.date ?? ce.date_display,
    location: ce.venue ?? ce.location,
    price: ce.priceSol ?? (ce.price_sol != null ? Number(ce.price_sol) : 0),
    available: ce.available,
    total: ce.supply,
    status: ce.available === 0 ? 'Sold Out' : ce.available < 10 ? 'Almost Sold Out' : 'On Sale',
    loyaltyRequired: null,
    type: 'Concert',
    tier: ce.tierName ?? ce.tier_name ?? 'General Admission',
    eventPubkey: ce.eventPubkey ?? ce.event_pubkey,
    organizerPubkey: ce.organizerPubkey ?? ce.organizer_pubkey,
  };
}

// ── Events ───────────────────────────────────────────────────────────

app.get('/api/events', async (_req, res) => {
  try {
    // Try Supabase cache first
    const cached = await getCachedEvents();
    if (cached && cached.length > 0) {
      const events = cached.map((row) => chainEventToFrontend({
        eventPubkey: row.event_pubkey,
        organizerPubkey: row.organizer_pubkey,
        title: row.title,
        venue: row.venue,
        date: row.date_display,
        tierName: row.tier_name,
        priceSol: Number(row.price_sol),
        supply: row.supply,
        sold: row.sold,
        available: row.available,
      }));
      return res.json(events);
    }

    // Fallback: read directly from chain
    const chainEvents = await fetchAllEvents();
    const events = chainEvents.map(chainEventToFrontend);
    res.json(events);
  } catch (e) {
    console.error('GET /api/events failed:', e.message);
    res.json([]);
  }
});

app.get('/api/events/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // If it's a chain-derived ID, extract the pubkey prefix
    if (id.startsWith('chain-')) {
      const pubkeyPrefix = id.slice(6); // e.g. "chain-AbCd1234" -> "AbCd1234"

      // Try Supabase cache
      const cached = await getCachedEvents();
      if (cached) {
        const match = cached.find((r) => r.event_pubkey.startsWith(pubkeyPrefix));
        if (match) {
          const event = chainEventToFrontend({
            eventPubkey: match.event_pubkey,
            organizerPubkey: match.organizer_pubkey,
            title: match.title,
            venue: match.venue,
            date: match.date_display,
            tierName: match.tier_name,
            priceSol: Number(match.price_sol),
            supply: match.supply,
            sold: match.sold,
            available: match.available,
          });
          return res.json({ ...event, tier: event.tier ?? 'General Admission' });
        }
      }

      // Fallback: chain
      const chainEvents = await fetchAllEvents();
      const ce = chainEvents.find((e) => `chain-${e.eventPubkey.slice(0, 8)}` === id);
      if (ce) {
        const event = chainEventToFrontend(ce);
        return res.json({ ...event, tier: event.tier ?? 'General Admission' });
      }
    }

    // Not a chain ID — could be a numeric ID from a previous session
    // Try looking up by numeric ID in Supabase purchases or just check chain
    const chainEvents = await fetchAllEvents();
    const byPubkey = chainEvents.find((e) => e.eventPubkey === id);
    if (byPubkey) {
      const event = chainEventToFrontend(byPubkey);
      return res.json({ ...event, tier: event.tier ?? 'General Admission' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e) {
    console.error('GET /api/events/:id failed:', e.message);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
});

app.get('/api/events/:id/attendees', async (req, res) => {
  const eventId = req.params.id;

  try {
    // Try Supabase
    const dbPurchases = await getPurchasesByEvent(eventId);
    const purchaseList = dbPurchases ?? inMemoryPurchases.filter((p) => String(p.eventId) === String(eventId));

    const attendees = purchaseList.reduce((acc, purchase) => {
      const w = purchase.wallet;
      const existing = acc.get(w);
      acc.set(w, { wallet: w, tickets: (existing?.tickets ?? 0) + 1 });
      return acc;
    }, new Map());

    res.json({
      eventId,
      attendees: Array.from(attendees.values()),
    });
  } catch (e) {
    console.error('GET /api/events/:id/attendees failed:', e.message);
    res.json({ eventId, attendees: [] });
  }
});

// Create event: build create_event tx
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

    // Cache the new event in Supabase immediately
    const dateStr = new Date(dateTsNum * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    await cacheEvents([{
      eventPubkey,
      organizerPubkey,
      title,
      venue,
      dateTs: dateTsNum,
      tierName: tier,
      priceLamports: priceLamportsNum,
      priceSol: priceLamportsNum / 1e9,
      supply: supplyNum,
      sold: 0,
      available: supplyNum,
      date: dateStr,
      location: venue,
    }]);

    res.json({ transaction, eventPubkey, eventId: `chain-${eventPubkey.slice(0, 8)}` });
  } catch (e) {
    console.error('create_event build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build create_event transaction' });
  }
});

// Delete event: build close_event tx
app.delete('/api/events', async (req, res) => {
  const { organizerPubkey, eventPubkey } = req.body ?? {};
  if (!organizerPubkey || !eventPubkey) {
    return res.status(400).json({ error: 'Missing required fields: organizerPubkey, eventPubkey' });
  }
  try {
    const transaction = await buildCloseEventTransaction(organizerPubkey, eventPubkey);

    // Remove from Supabase cache
    await removeCachedEvent(eventPubkey);

    res.json({ transaction, message: 'Sign and submit to delete the event. Rent SOL will be returned.' });
  } catch (e) {
    console.error('close_event build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build close_event transaction' });
  }
});

// ── Tickets ──────────────────────────────────────────────────────────

app.post('/api/tickets/buy', async (req, res) => {
  const { eventId, eventPubkey, wallet, tier } = req.body ?? {};
  if (!wallet) return res.status(400).json({ error: 'Missing wallet' });

  // Resolve eventPubkey from various sources
  let eventPk = eventPubkey ?? null;

  if (!eventPk && eventId) {
    // Try to find in Supabase cache or chain
    const cached = await getCachedEvents();
    if (cached) {
      const match = cached.find((r) =>
        r.event_pubkey.startsWith(eventId.replace('chain-', '')) ||
        `chain-${r.event_pubkey.slice(0, 8)}` === eventId
      );
      if (match) eventPk = match.event_pubkey;
    }

    // Fallback: search chain
    if (!eventPk) {
      try {
        const chainEvents = await fetchAllEvents();
        const match = chainEvents.find((e) =>
          `chain-${e.eventPubkey.slice(0, 8)}` === eventId ||
          e.eventPubkey === eventId
        );
        if (match) eventPk = match.eventPubkey;
      } catch (_) {}
    }
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

  res.status(400).json({ error: 'Could not find event. Create an on-chain event first.' });
});

app.post('/api/tickets/confirm', async (req, res) => {
  const { eventId, wallet, signature } = req.body ?? {};
  if (!eventId || !wallet || !signature) {
    return res.status(400).json({ error: 'Missing eventId, wallet, or signature' });
  }

  try {
    // Find event metadata (from cache or chain)
    let eventTitle = 'On-chain Event';
    let eventArtist = 'On-chain Event';
    let eventDate = 'TBD';
    let eventTier = 'General Admission';
    let eventPrice = 0;
    let eventPk = null;

    // Try Supabase cache
    const cached = await getCachedEvents();
    if (cached) {
      const match = cached.find((r) =>
        `chain-${r.event_pubkey.slice(0, 8)}` === String(eventId) ||
        r.event_pubkey === String(eventId)
      );
      if (match) {
        eventTitle = match.title;
        eventDate = match.date_display;
        eventTier = match.tier_name ?? 'General Admission';
        eventPrice = Number(match.price_sol);
        eventPk = match.event_pubkey;
      }
    }

    // Fallback: chain
    if (!eventPk) {
      try {
        const chainEvents = await fetchAllEvents();
        const ce = chainEvents.find((e) =>
          `chain-${e.eventPubkey.slice(0, 8)}` === String(eventId) ||
          e.eventPubkey === String(eventId)
        );
        if (ce) {
          eventTitle = ce.title;
          eventDate = ce.date;
          eventTier = ce.tierName ?? 'General Admission';
          eventPrice = ce.priceSol;
          eventPk = ce.eventPubkey;
        }
      } catch (_) {}
    }

    // Derive ticket mint PDA
    let ticketMint = null;
    if (eventPk) {
      try {
        const { PublicKey } = await import('@solana/web3.js');
        const eventPkObj = new PublicKey(eventPk);

        // Get purchase count for this event to determine sold index
        const dbPurchases = await getPurchasesByEvent(eventId);
        const purchaseCount = dbPurchases
          ? dbPurchases.length
          : inMemoryPurchases.filter((p) => String(p.eventId) === String(eventId)).length;

        const soldBuf = Buffer.alloc(4);
        soldBuf.writeUInt32LE(purchaseCount, 0);
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
      eventId,
      event: eventTitle,
      artist: eventArtist,
      date: eventDate,
      tier: eventTier,
      purchasePrice: eventPrice,
      suggestedPrice: eventPrice ? Number((eventPrice * 1.1).toFixed(2)) : 0,
      eventPubkey: eventPk,
      ticketMint,
      wallet,
      signature,
      purchasedAt: new Date().toISOString(),
    };

    // Write to Supabase + in-memory fallback
    await addPurchase(ticket);
    inMemoryPurchases.push(ticket);

    res.json({ ticket });
  } catch (e) {
    console.error('POST /api/tickets/confirm failed:', e.message);
    res.status(500).json({ error: 'Failed to confirm purchase' });
  }
});

app.get('/api/tickets', async (req, res) => {
  const wallet = req.query.wallet;
  if (!wallet) return res.status(400).json({ error: 'Missing wallet' });

  try {
    // Try Supabase
    const dbTickets = await getPurchasesByWallet(wallet);
    if (dbTickets) return res.json(dbTickets);

    // Fallback: in-memory
    const owned = inMemoryPurchases.filter((p) => p.wallet === wallet);
    res.json(owned);
  } catch (e) {
    console.error('GET /api/tickets failed:', e.message);
    res.json([]);
  }
});

// ── Resale Listings ──────────────────────────────────────────────────

app.get('/api/listings', async (_req, res) => {
  try {
    // Try Supabase cache for listings
    const cachedListings = await getCachedListings();
    const cachedEvents = await getCachedEvents();

    // If we have cached data, use it
    if (cachedListings && cachedListings.length > 0) {
      const enriched = cachedListings.map((l) => {
        const ev = cachedEvents?.find((e) => e.event_pubkey === l.event_pubkey);
        const sellerShort = l.seller.slice(0, 6) + '...' + l.seller.slice(-4);
        const priceSol = Number(l.price_sol);
        const evPrice = ev ? Number(ev.price_sol) : 0;
        return {
          id: l.listing_pubkey,
          ticketMint: l.ticket_mint,
          event: ev?.title ?? 'On-chain Event',
          artist: 'On-chain Event',
          originalPrice: evPrice,
          currentPrice: priceSol,
          seller: sellerShort,
          sellerWallet: l.seller,
          sellerRep: 'Bronze',
          date: ev?.date_display ?? 'TBD',
          verified: true,
          priceChange: evPrice ? Math.round(((priceSol - evPrice) / evPrice) * 100) : 0,
          listingAge: 'On-chain',
          eventPubkey: l.event_pubkey,
        };
      });
      return res.json(enriched);
    }

    // Fallback: read directly from chain
    const onChainListings = await fetchAllListings();
    const chainEvents = await fetchAllEvents();

    const enriched = onChainListings.map((l) => {
      const ev = chainEvents.find((e) => e.eventPubkey === l.event);
      const sellerShort = l.seller.slice(0, 6) + '...' + l.seller.slice(-4);
      return {
        id: l.pubkey,
        ticketMint: l.ticketMint,
        event: ev?.title ?? 'On-chain Event',
        artist: 'On-chain Event',
        originalPrice: ev?.priceSol ?? 0,
        currentPrice: l.priceSol,
        seller: sellerShort,
        sellerWallet: l.seller,
        sellerRep: 'Bronze',
        date: ev?.date ?? 'TBD',
        verified: true,
        priceChange: ev?.priceSol ? Math.round(((l.priceSol - ev.priceSol) / ev.priceSol) * 100) : 0,
        listingAge: 'On-chain',
        eventPubkey: l.event,
      };
    });
    res.json(enriched);
  } catch (e) {
    console.error('GET /api/listings failed:', e.message);
    res.json([]);
  }
});

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
      sellerWallet, eventPubkey, ticketMint, priceLamports
    );
    res.json({ transaction, listingPubkey });
  } catch (e) {
    console.error('list_for_resale build failed', e);
    res.status(500).json({ error: e.message ?? 'Failed to build list_for_resale transaction' });
  }
});

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

// ── Start server + sync ──────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`TicketChain API listening on http://localhost:${PORT}`);
  // Start the periodic chain -> Supabase sync
  startSync();
});
