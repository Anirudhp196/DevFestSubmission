/**
 * API client for TicketChain.
 * Replace mock implementation with fetch(API_BASE + path) when backend is available.
 */

import type { Event, Listing } from '../types';

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

// Mock events used until backend is available (same as previous in-component mocks)
const MOCK_EVENTS: Event[] = [
  { id: 1, title: "Synthwave Sunset Festival", artist: "Neon Dreams", date: "March 15, 2026", location: "Los Angeles, CA", price: 0.5, available: 234, total: 500, status: "On Sale", loyaltyRequired: null, image: "concert electronic festival", type: "Concert" },
  { id: 2, title: "Lakers vs Warriors", artist: "NBA", date: "March 22, 2026", location: "Los Angeles, CA", price: 0.8, available: 89, total: 300, status: "Almost Sold Out", loyaltyRequired: null, image: "basketball game arena", type: "Sports" },
  { id: 3, title: "Ethereal Beats World Tour", artist: "DJ Aurora", date: "April 5, 2026", location: "Miami, FL", price: 0.8, available: 450, total: 1000, status: "Early Access", loyaltyRequired: "Gold", image: "electronic music concert lights", type: "Concert" },
  { id: 4, title: "Comedy Night Live", artist: "Stand-Up Stars", date: "April 12, 2026", location: "Austin, TX", price: 0.4, available: 156, total: 250, status: "On Sale", loyaltyRequired: null, image: "comedy show stage", type: "Comedy" },
  { id: 5, title: "World Cup Qualifier", artist: "FIFA", date: "April 20, 2026", location: "Boston, MA", price: 0.6, available: 320, total: 800, status: "On Sale", loyaltyRequired: null, image: "soccer stadium match", type: "Sports" },
  { id: 6, title: "Hip Hop Block Party", artist: "MC Thunder & Friends", date: "May 1, 2026", location: "Atlanta, GA", price: 0.35, available: 12, total: 400, status: "Almost Sold Out", loyaltyRequired: null, image: "hip hop concert crowd", type: "Concert" },
];

async function getEventsFromApi(): Promise<Event[]> {
  if (!API_BASE) return MOCK_EVENTS;
  const res = await apiFetch('/api/events');
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

async function getEventFromApi(id: string): Promise<Event | null> {
  if (!API_BASE) {
    const event = MOCK_EVENTS.find((e) => String(e.id) === id);
    if (!event) return null;
    return { ...event, tier: event.tier ?? 'General Admission' };
  }
  const res = await apiFetch(`/api/events/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch event');
  const data = await res.json();
  return { ...data, tier: data.tier ?? 'General Admission' };
}

const MOCK_LISTINGS: Listing[] = [
  { id: 1, event: 'Synthwave Sunset Festival', artist: 'Neon Dreams', originalPrice: 0.5, currentPrice: 0.55, seller: '7a2f...3b4c', sellerRep: 'Gold', date: 'March 15, 2026', verified: true, priceChange: 10, listingAge: '2 hours ago' },
  { id: 2, event: 'Jazz in the Park', artist: 'The Blue Notes Collective', originalPrice: 0.3, currentPrice: 0.28, seller: '9c4d...7e2a', sellerRep: 'Silver', date: 'March 22, 2026', verified: true, priceChange: -7, listingAge: '5 hours ago' },
  { id: 3, event: 'Ethereal Beats World Tour', artist: 'DJ Aurora', originalPrice: 0.8, currentPrice: 0.82, seller: '3f8e...1d6b', sellerRep: 'Gold', date: 'April 5, 2026', verified: true, priceChange: 2.5, listingAge: '1 day ago' },
  { id: 4, event: 'Indie Rock Underground', artist: 'The Echoes', originalPrice: 0.4, currentPrice: 0.41, seller: '6b2c...9f3e', sellerRep: 'Bronze', date: 'April 12, 2026', verified: true, priceChange: 2.5, listingAge: '3 hours ago' },
];

async function getListingsFromApi(): Promise<Listing[]> {
  if (!API_BASE) return MOCK_LISTINGS;
  const res = await apiFetch('/api/listings');
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

/** Fetch marketplace listings. Uses mock when VITE_API_URL is not set. */
export async function getListings(): Promise<Listing[]> {
  return getListingsFromApi();
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
