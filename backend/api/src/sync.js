/**
 * Chain-to-Supabase sync job.
 * Periodically fetches all Events and Listings from Solana and upserts them
 * into the Supabase cache. This keeps reads fast without hitting the RPC
 * on every API request.
 */

import { fetchAllEvents, fetchAllListings } from './solana.js';
import {
  isEnabled,
  cacheEvents,
  replaceCachedListings,
  pruneStaleEvents,
} from './db.js';

const SYNC_INTERVAL_MS = 3_000; // 3 seconds

let syncing = false;

/**
 * Run a single sync cycle: fetch chain data and upsert into Supabase.
 */
export async function syncFromChain() {
  if (!isEnabled()) return;
  if (syncing) return; // prevent overlapping syncs
  syncing = true;

  try {
    console.log('[sync] Fetching events from chain...');
    const events = await fetchAllEvents();
    await cacheEvents(events);
    // Prune events that no longer exist on-chain (deleted)
    await pruneStaleEvents(events.map((e) => e.eventPubkey));
    console.log(`[sync] Cached ${events.length} events`);

    console.log('[sync] Fetching listings from chain...');
    const listings = await fetchAllListings();
    await replaceCachedListings(listings);
    console.log(`[sync] Cached ${listings.length} listings`);
  } catch (e) {
    console.error('[sync] Chain sync failed:', e.message);
  } finally {
    syncing = false;
  }
}

/**
 * Start the periodic sync. Runs immediately on first call, then every SYNC_INTERVAL_MS.
 */
export function startSync() {
  if (!isEnabled()) {
    console.log('[sync] Supabase not configured — sync disabled');
    return;
  }

  // Initial sync
  syncFromChain();

  // Periodic sync
  setInterval(() => {
    syncFromChain();
  }, SYNC_INTERVAL_MS);

  console.log(`[sync] Chain sync started (every ${SYNC_INTERVAL_MS / 1000}s)`);
}

/**
 * Trigger an immediate sync (e.g. after a write operation).
 * Non-blocking — fires and forgets so the API response isn't delayed.
 */
export function triggerSync() {
  setTimeout(() => syncFromChain(), 500); // short delay to let the tx confirm on-chain
}
