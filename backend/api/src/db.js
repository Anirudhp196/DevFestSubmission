/**
 * Supabase cache layer for TicketChain.
 * Mirrors on-chain data for fast reads. Chain remains source of truth.
 * If SUPABASE_URL / SUPABASE_KEY are not set, all functions gracefully return null
 * so the app falls back to direct chain reads.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase cache enabled');
} else {
  console.log('Supabase not configured — using chain reads only (set SUPABASE_URL and SUPABASE_KEY to enable cache)');
}

/** Check if Supabase is available */
export function isEnabled() {
  return supabase !== null;
}

// ── Events ────────────────────────────────────────────────────────────

/**
 * Upsert an array of events into the cache.
 * Called by the sync job after fetching from chain.
 */
export async function cacheEvents(events) {
  if (!supabase) return;
  const rows = events.map((e) => ({
    event_pubkey: e.eventPubkey,
    organizer_pubkey: e.organizerPubkey,
    title: e.title,
    venue: e.venue ?? e.location,
    date_ts: e.dateTs,
    date_display: e.date,
    tier_name: e.tierName,
    price_lamports: e.priceLamports,
    price_sol: e.priceSol,
    supply: e.supply,
    sold: e.sold,
    available: e.available,
    artist_pct: e.artistPct ?? 40,
    synced_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('events')
    .upsert(rows, { onConflict: 'event_pubkey' });
  if (error) console.error('cacheEvents error:', error.message);
}

/**
 * Read all cached events. Returns null if Supabase not available.
 */
export async function getCachedEvents() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('synced_at', { ascending: false });
  if (error) {
    console.error('getCachedEvents error:', error.message);
    return null;
  }
  return data;
}

/**
 * Get a single cached event by pubkey.
 */
export async function getCachedEvent(eventPubkey) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_pubkey', eventPubkey)
    .maybeSingle();
  if (error) {
    console.error('getCachedEvent error:', error.message);
    return null;
  }
  return data;
}

/**
 * Remove an event from the cache (when closed on-chain).
 */
export async function removeCachedEvent(eventPubkey) {
  if (!supabase) return;
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('event_pubkey', eventPubkey);
  if (error) console.error('removeCachedEvent error:', error.message);
}

/**
 * Remove events from cache that are no longer on-chain.
 */
export async function pruneStaleEvents(liveEventPubkeys) {
  if (!supabase || liveEventPubkeys.length === 0) return;
  const cached = await getCachedEvents();
  if (!cached) return;
  const liveSet = new Set(liveEventPubkeys);
  const stale = cached.filter((e) => !liveSet.has(e.event_pubkey));
  for (const s of stale) {
    await removeCachedEvent(s.event_pubkey);
  }
}

// ── Purchases ─────────────────────────────────────────────────────────

/**
 * Insert a purchase record into the cache.
 */
export async function addPurchase(purchase) {
  if (!supabase) return;
  const row = {
    event_id: purchase.eventId != null ? String(purchase.eventId) : null,
    event_pubkey: purchase.eventPubkey ?? null,
    event_title: purchase.event,
    artist: purchase.artist,
    date: purchase.date,
    tier: purchase.tier,
    purchase_price: purchase.purchasePrice,
    suggested_price: purchase.suggestedPrice,
    ticket_mint: purchase.ticketMint,
    wallet: purchase.wallet,
    signature: purchase.signature,
  };
  const { error } = await supabase.from('purchases').insert(row);
  if (error) console.error('addPurchase error:', error.message);
}

/**
 * Get all purchases for a wallet. Returns null if Supabase not available.
 */
export async function getPurchasesByWallet(wallet) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('wallet', wallet)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getPurchasesByWallet error:', error.message);
    return null;
  }
  // Map DB rows back to the ticket shape the frontend expects
  return data.map((row) => ({
    id: row.id,
    eventId: row.event_id,
    event: row.event_title,
    artist: row.artist,
    date: row.date,
    tier: row.tier,
    purchasePrice: Number(row.purchase_price),
    suggestedPrice: Number(row.suggested_price),
    eventPubkey: row.event_pubkey,
    ticketMint: row.ticket_mint,
    wallet: row.wallet,
    signature: row.signature,
    purchasedAt: row.created_at,
  }));
}

/**
 * Get all purchases for a specific event. Returns null if Supabase not available.
 */
export async function getPurchasesByEvent(eventId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('event_id', String(eventId));
  if (error) {
    console.error('getPurchasesByEvent error:', error.message);
    return null;
  }
  return data;
}

/**
 * Transfer a purchase record from seller to buyer (resale).
 * Updates the wallet, price, and signature on the existing record.
 */
export async function transferPurchase(ticketMint, buyerWallet, resalePrice, signature) {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('purchases')
    .update({
      wallet: buyerWallet,
      purchase_price: resalePrice,
      signature,
    })
    .eq('ticket_mint', ticketMint)
    .select('id');
  if (error) {
    console.error('transferPurchase error:', error.message);
    return false;
  }
  return Array.isArray(data) ? data.length > 0 : false;
}

// ── Listings ──────────────────────────────────────────────────────────

/**
 * Upsert an array of listings into the cache.
 */
export async function cacheListings(listings) {
  if (!supabase) return;
  const rows = listings.map((l) => ({
    listing_pubkey: l.pubkey,
    seller: l.seller,
    event_pubkey: l.event,
    ticket_mint: l.ticketMint,
    price_lamports: l.priceLamports,
    price_sol: l.priceSol,
    synced_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('listings')
    .upsert(rows, { onConflict: 'listing_pubkey' });
  if (error) console.error('cacheListings error:', error.message);
}

/**
 * Read all cached listings. Returns null if Supabase not available.
 */
export async function getCachedListings() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('synced_at', { ascending: false });
  if (error) {
    console.error('getCachedListings error:', error.message);
    return null;
  }
  return data;
}

/**
 * Replace all cached listings with the current on-chain set (removes stale ones).
 */
export async function replaceCachedListings(listings) {
  if (!supabase) return;
  // Delete all existing, then insert fresh
  await supabase.from('listings').delete().neq('listing_pubkey', '');
  if (listings.length > 0) {
    await cacheListings(listings);
  }
}
