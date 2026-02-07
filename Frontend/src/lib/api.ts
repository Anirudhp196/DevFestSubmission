/**
 * API client for TicketChain.
 * Replace mock implementation with fetch(API_BASE + path) when backend is available.
 */

import type { Event } from '../types';

interface BuyTicketResponse {
  signature?: string;
  message?: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

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
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

async function getEventFromApi(id: string): Promise<Event | null> {
  if (!API_BASE) {
    const event = MOCK_EVENTS.find((e) => String(e.id) === id);
    if (!event) return null;
    return { ...event, tier: event.tier ?? 'General Admission' };
  }
  const res = await fetch(`${API_BASE}/api/events/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch event');
  const data = await res.json();
  return { ...data, tier: data.tier ?? 'General Admission' };
}

/** Fetch all events. Uses mock data when VITE_API_URL is not set. */
export async function getEvents(): Promise<Event[]> {
  return getEventsFromApi();
}

/** Fetch a single event by id. Uses mock data when VITE_API_URL is not set. */
export async function getEvent(id: string): Promise<Event | null> {
  return getEventFromApi(id);
}

export async function buyTicket(eventId: string, wallet: string, tier?: string): Promise<BuyTicketResponse> {
  if (!API_BASE) {
    return {
      signature: `mock-${eventId}-${Date.now()}`,
      message: 'Mock purchase complete',
    };
  }
  const res = await fetch(`${API_BASE}/api/tickets/buy`, {
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
