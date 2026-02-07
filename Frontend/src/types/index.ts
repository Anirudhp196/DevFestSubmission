/**
 * Shared types for TicketChain frontend.
 * Align with API/backend when available.
 */

export interface Event {
  id: number | string;
  title: string;
  artist: string;
  date: string;
  location: string;
  price: number; // SOL
  available?: number;
  total?: number;
  status?: string; // "On Sale" | "Almost Sold Out" | "Early Access"
  loyaltyRequired?: string | null;
  image?: string;
  type?: string;
  tier?: string; // e.g. "General Admission" for purchase flow
  organizerPubkey?: string;
  eventPubkey?: string;
}

export interface Ticket {
  id: number | string;
  event: string;
  artist: string;
  date: string;
  tier: string;
  purchasePrice: number;
  suggestedPrice: number;
  mintAddress?: string;
  eventId?: string | number;
}

export interface Listing {
  id: number | string;
  event: string;
  artist: string;
  originalPrice: number;
  currentPrice: number;
  seller: string;
  sellerRep: string;
  date: string;
  verified: boolean;
  priceChange: number;
  listingAge: string;
}
