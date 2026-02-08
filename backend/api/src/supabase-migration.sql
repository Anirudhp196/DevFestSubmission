-- TicketChain Supabase migration
-- Run this in the Supabase SQL Editor to create the cache tables.

-- Events cache (mirrors on-chain Event accounts)
create table if not exists events (
  event_pubkey text primary key,
  organizer_pubkey text not null,
  title text not null,
  venue text,
  date_ts bigint,
  date_display text,
  tier_name text,
  price_lamports bigint,
  price_sol numeric,
  supply integer,
  sold integer default 0,
  available integer,
  artist_pct smallint default 40,
  synced_at timestamptz default now()
);

-- Add artist_pct column if table already exists (idempotent)
alter table events add column if not exists artist_pct smallint default 40;

-- Purchases (ticket purchase records — not on-chain, needed for "My Tickets")
create table if not exists purchases (
  id serial primary key,
  event_id text,
  event_pubkey text,
  event_title text,
  artist text,
  date text,
  tier text,
  purchase_price numeric,
  suggested_price numeric,
  ticket_mint text,
  wallet text not null,
  signature text,
  created_at timestamptz default now()
);

-- Index for fast wallet lookups on purchases
create index if not exists idx_purchases_wallet on purchases (wallet);

-- Listings cache (mirrors on-chain Listing accounts)
create table if not exists listings (
  listing_pubkey text primary key,
  seller text not null,
  event_pubkey text,
  ticket_mint text,
  price_lamports bigint,
  price_sol numeric,
  synced_at timestamptz default now()
);
