/**
 * Shared types for TicketChain frontend.
 * Align with API/backend when available.
 */

export interface Event {
  id: number | string;
  title: string;
  organizer: string;
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
  organizer: string;
  date: string;
  tier: string;
  purchasePrice: number;
  suggestedPrice: number;
  mintAddress?: string;
  ticketMint?: string;
  eventId?: string | number;
  eventPubkey?: string;
}

export interface Listing {
  id: number | string;
  event: string;
  organizer: string;
  originalPrice: number;
  currentPrice: number;
  seller: string;
  sellerWallet?: string;
  sellerRep: string;
  date: string;
  verified: boolean;
  priceChange: number;
  listingAge: string;
  ticketMint?: string;
  eventPubkey?: string;
}
