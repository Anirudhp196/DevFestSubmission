/**
 * API client for TicketChain.
 * Replace mock implementation with fetch(API_BASE + path) when backend is available.
 */

import type { Event, Listing, Ticket } from '../types';

export interface BuyTicketResponse {
  signature?: string;
  message?: string;
  /** Base64 serialized unsigned transaction; frontend must sign and submit */
  transaction?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''); // no trailing slash

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  if (!API_BASE) throw new Error('VITE_API_URL is not set');
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed')) {
      throw new Error(
        `Could not reach API at ${API_BASE}. Start the API first: cd backend/api && pnpm dev (then use the same port in VITE_API_URL).`
      );
    }
    throw e;
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    throw new Error(
      'API returned HTML instead of JSON. Use the API server port in VITE_API_URL, not the app port. ' +
      'Run API on 3001, then: cd Frontend && VITE_API_URL=http://localhost:3001 pnpm dev — open http://localhost:3000'
    );
  }
  return res;
}

async function getEventsFromApi(): Promise<Event[]> {
  if (!API_BASE) return [];
  const res = await apiFetch('/api/events');
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

async function getEventFromApi(id: string): Promise<Event | null> {
  if (!API_BASE) return null;
  const res = await apiFetch(`/api/events/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch event');
  const data = await res.json();
  return { ...data, tier: data.tier ?? 'General Admission' };
}

/** Fetch marketplace listings from API (on-chain + local). */
export async function getListings(): Promise<Listing[]> {
  if (!API_BASE) return [];
  try {
    const res = await apiFetch('/api/listings');
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json();
  } catch {
    return [];
  }
}

/** Fetch all events. Uses mock data when VITE_API_URL is not set. */
export async function getEvents(): Promise<Event[]> {
  return getEventsFromApi();
}

/** Fetch a single event by id. Uses mock data when VITE_API_URL is not set. */
export async function getEvent(id: string): Promise<Event | null> {
  return getEventFromApi(id);
}

export interface CreateEventArgs {
  organizerPubkey: string;
  eventAccountPubkey: string;
  title: string;
  venue: string;
  dateTs: number;
  tierName: string;
  priceLamports: number;
  supply: number;
  artistPct?: number; // 0-80, default 40
}

export interface CreateEventResponse {
  transaction?: string;
  eventPubkey?: string;
  eventSecretKey?: number[];
  eventId?: number;
  message?: string;
}

export async function createEvent(args: CreateEventArgs): Promise<CreateEventResponse> {
  if (!API_BASE) {
    return { message: 'Mock: event created (no API)', eventId: 999 };
  }
  const res = await apiFetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to create event');
  }
  return res.json();
}

export async function buyTicket(eventId: string, wallet: string, tier?: string): Promise<BuyTicketResponse> {
  if (!API_BASE) {
    return {
      signature: `mock-${eventId}-${Date.now()}`,
      message: 'Mock purchase complete',
    };
  }
  const res = await apiFetch('/api/tickets/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, wallet, tier }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to buy ticket');
  }
  return res.json();
}

export async function confirmTicketPurchase(eventId: string, wallet: string, signature: string): Promise<{ ticket: Ticket }> {
  if (!API_BASE) {
    return {
      ticket: {
        id: `mock-${Date.now()}`,
        event: 'Mock Event',
        organizer: 'Mock Organizer',
        date: 'TBD',
        tier: 'General Admission',
        purchasePrice: 0,
        suggestedPrice: 0,
        eventId,
      },
    };
  }
  const res = await apiFetch('/api/tickets/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, wallet, signature }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to confirm ticket purchase');
  }
  return res.json();
}

export async function getMyTickets(wallet: string): Promise<Ticket[]> {
  if (!API_BASE) return [];
  const res = await apiFetch(`/api/tickets?wallet=${encodeURIComponent(wallet)}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function getEventAttendees(eventId: string): Promise<{ attendees: { wallet: string; tickets: number }[] }> {
  if (!API_BASE) return { attendees: [] };
  const res = await apiFetch(`/api/events/${eventId}/attendees`);
  if (!res.ok) throw new Error('Failed to fetch attendees');
  return res.json();
}

export interface DeleteEventResponse {
  transaction: string;
  message?: string;
}

/**
 * Build a close_event transaction (on-chain).
 * Returns a base64 transaction for the organizer to sign.
 */
export async function deleteEvent(organizerPubkey: string, eventPubkey: string): Promise<DeleteEventResponse> {
  const res = await apiFetch('/api/events', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizerPubkey, eventPubkey }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to build delete event transaction');
  }
  return res.json();
}

export interface ListForResaleResponse {
  transaction: string;
  listingPubkey: string;
}

/**
 * Build a list_for_resale transaction (on-chain).
 * Returns a base64 transaction for the seller to sign.
 */
export async function listForResale(
  sellerWallet: string,
  eventPubkey: string,
  ticketMint: string,
  priceSol: number,
): Promise<ListForResaleResponse> {
  const res = await apiFetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sellerWallet, eventPubkey, ticketMint, priceSol }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to build listing transaction');
  }
  return res.json();
}

export interface BuyResaleResponse {
  transaction: string;
  message?: string;
}

/**
 * Build a buy_resale transaction (on-chain).
 * Returns a base64 transaction for the buyer to sign.
 */
export interface CancelListingResponse {
  transaction: string;
  message?: string;
}

/**
 * Build a cancel_listing transaction (on-chain).
 * Returns a base64 transaction for the seller to sign.
 * The NFT is returned from escrow back to the seller's wallet.
 */
export async function cancelListing(sellerWallet: string, ticketMint: string): Promise<CancelListingResponse> {
  const res = await apiFetch('/api/listings', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sellerWallet, ticketMint }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to build cancel listing transaction');
  }
  return res.json();
}

export async function buyResale(buyerWallet: string, ticketMint: string): Promise<BuyResaleResponse> {
  const res = await apiFetch('/api/listings/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerWallet, ticketMint }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to build buy resale transaction');
  }
  return res.json();
}
