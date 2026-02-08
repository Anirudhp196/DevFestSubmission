/**
 * MY TICKETS PAGE - VIEW OWNED TICKETS
 *
 * Purpose:
 * - Show tickets purchased by connected wallet
 * - Link to attendee list for each event
 * - List tickets for resale on the marketplace
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './Navigation';
import { Calendar, Ticket, Users, X, Shield, Tag, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyTickets, getListings, getEvent, listForResaleBatch, cancelListing, confirmCancelListing } from '../lib/api';
import { useWallet, shortenAddress } from '../contexts/WalletContext';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import type { Ticket as TicketType, Listing } from '../types';

export function MyTicketsPage() {
  const { connected, publicKey, connect } = useWallet();
  const { connection } = useConnection();
  const wallet = useSolanaWallet();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Listed tickets (in escrow on marketplace)
  const [listedTickets, setListedTickets] = useState<Listing[]>([]);
  const [cancellingMint, setCancellingMint] = useState<string | null>(null);

  // Resale modal state (group = event + tickets available to list)
  const [resaleGroup, setResaleGroup] = useState<{ eventName: string; eventId: string | number | null; eventPubkey: string; availableTickets: TicketType[]; purchasePrice: number; suggestedPrice: number } | null>(null);
  const [resaleQuantity, setResaleQuantity] = useState(1);
  const [resalePrice, setResalePrice] = useState('');
  const [listing, setListing] = useState(false);
  const [listSuccess, setListSuccess] = useState(false);
  const [listSuccessCount, setListSuccessCount] = useState(0);
  const [modalError, setModalError] = useState<string | null>(null);
  const [eventArtistPct, setEventArtistPct] = useState(40);

  useEffect(() => {
    if (!connected || !publicKey) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Fetch owned tickets and marketplace listings in parallel
    Promise.all([
      getMyTickets(publicKey),
      getListings(),
    ])
      .then(([ticketData, listingData]) => {
        if (cancelled) return;
        setTickets(ticketData);
        // Filter listings to only show ones from this wallet
        const myListings = listingData.filter(
          (l) => l.sellerWallet === publicKey
        );
        setListedTickets(myListings);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load tickets');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  async function openResaleModal(availableTickets: TicketType[], eventName: string, eventId: string | number | null, eventPubkey: string, purchasePrice: number, suggestedPrice: number) {
    if (availableTickets.length === 0) return;
    setResaleGroup({
      eventName,
      eventId,
      eventPubkey,
      availableTickets,
      purchasePrice,
      suggestedPrice,
    });
    setResaleQuantity(1);
    setResalePrice(suggestedPrice?.toString() ?? (purchasePrice * 1.1).toFixed(2));
    setListSuccess(false);
    setListSuccessCount(0);
    setModalError(null);
    setEventArtistPct(40);
    const lookupId = eventPubkey ?? (eventId ? String(eventId) : null);
    if (lookupId) {
      try {
        const ev = await getEvent(lookupId);
        if (ev?.artistPct != null) setEventArtistPct(ev.artistPct);
      } catch { /* use default */ }
    }
  }

  function closeResaleModal() {
    setResaleGroup(null);
    setResaleQuantity(1);
    setResalePrice('');
    setListing(false);
    setListSuccess(false);
    setListSuccessCount(0);
    setModalError(null);
  }

  async function handleCancelListing(listed: Listing) {
    if (!publicKey || !wallet.signTransaction || !listed.ticketMint) return;
    setCancellingMint(listed.ticketMint);
    setError(null);
    try {
      const { transaction: txBase64 } = await cancelListing(publicKey, listed.ticketMint);
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      try {
        await confirmCancelListing(listed.ticketMint);
      } catch (e) {
        console.error('Failed to confirm listing cancel cache:', e);
      }
      // Remove from local state
      setListedTickets((prev) => prev.filter((l) => l.ticketMint !== listed.ticketMint));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel listing');
    } finally {
      setCancellingMint(null);
    }
  }

  async function handleListForResale() {
    setModalError(null);
    if (!resaleGroup || resaleGroup.availableTickets.length === 0) {
      setModalError('No tickets selected.');
      return;
    }
    if (!publicKey) {
      setModalError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    if (!wallet.signTransaction) {
      setModalError('Wallet does not support signing. Please reconnect your Phantom wallet.');
      return;
    }
    const priceSol = Number(resalePrice) || 0;
    if (priceSol <= 0) {
      setModalError('Please enter a valid price greater than 0.');
      return;
    }
    const qty = Math.min(resaleQuantity, resaleGroup.availableTickets.length);
    const toList = resaleGroup.availableTickets.slice(0, qty).filter((t) => t.eventPubkey && t.ticketMint);
    if (toList.length === 0) {
      setModalError('Selected tickets lack on-chain data (eventPubkey/ticketMint).');
      return;
    }

    setListing(true);
    try {
      const listings = toList.map((t) => ({
        eventPubkey: t.eventPubkey!,
        ticketMint: t.ticketMint!,
        priceSol,
      }));
      const { transaction: txBase64 } = await listForResaleBatch(publicKey, listings);
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      setListSuccessCount(toList.length);
      setListSuccess(true);
      // Refetch so UI updates (listings sync from chain)
      const [ticketData, listingData] = await Promise.all([getMyTickets(publicKey), getListings()]);
      setTickets(ticketData);
      setListedTickets(listingData.filter((l) => l.sellerWallet === publicKey));
    } catch (e) {
      console.error('List for resale failed:', e);
      setModalError(e instanceof Error ? e.message : 'Failed to list tickets for resale');
    } finally {
      setListing(false);
    }
  }

  const price = Number(resalePrice) || 0;
  const artistCut = price * (eventArtistPct / 100);
  const platformCut = price * 0.2;
  const sellerCut = price - artistCut - platformCut;

  // Group tickets by event (eventPubkey or eventId)
  const groupKey = (t: TicketType) => t.eventPubkey ?? String(t.eventId ?? t.id);
  const groups = (() => {
    const map = new Map<string, { tickets: TicketType[]; listed: Listing[] }>();
    for (const t of tickets) {
      const key = groupKey(t);
      if (!map.has(key)) map.set(key, { tickets: [], listed: [] });
      map.get(key)!.tickets.push(t);
    }
    for (const l of listedTickets) {
      const t = tickets.find((tick) => tick.ticketMint && tick.ticketMint === l.ticketMint);
      if (t) {
        const key = groupKey(t);
        if (map.has(key)) map.get(key)!.listed.push(l);
      }
    }
    return Array.from(map.entries()).map(([key, { tickets: groupTickets, listed }]) => {
      const ownedNotListed = groupTickets.filter((t) => !listed.some((l) => l.ticketMint === t.ticketMint));
      const first = groupTickets[0];
      return {
        key,
        eventName: first?.event ?? 'Event',
        eventId: first?.eventId ?? null,
        eventPubkey: first?.eventPubkey ?? '',
        artist: first?.artist,
        date: first?.date,
        tier: first?.tier,
        purchasePrice: first?.purchasePrice ?? 0,
        suggestedPrice: first?.suggestedPrice ?? 0,
        totalCount: groupTickets.length,
        listedCount: listed.length,
        ownedNotListedCount: ownedNotListed.length,
        ownedNotListed,
        listed,
      };
    });
  })();

  // Orphan listings (no matching ticket in our list)
  const orphanListings = listedTickets.filter(
    (l) => !tickets.some((t) => t.ticketMint && t.ticketMint === l.ticketMint)
  );

  return (
    <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
      <Navigation />

      <section className="relative pt-32 pb-16 px-8 border-b border-[#262b2a]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-6xl mb-4">
              My <span className="text-[#32b377]">Tickets</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif]">
              Your purchased NFT tickets tied to {publicKey ? shortenAddress(publicKey) : 'your wallet'}.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-5xl mx-auto">
          {!connected && (
            <div className="p-6 bg-[rgba(255,200,100,0.1)] border border-[rgba(255,200,100,0.3)] rounded-xl text-[#ffc864] font-['Inter:Medium',sans-serif]">
              Connect your wallet to view tickets.
              <button
                onClick={connect}
                className="ml-4 bg-[#32b377] hover:bg-[#2a9865] transition-all px-4 py-2 rounded-lg text-[#090b0b] text-sm"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {connected && (
            <>
              {error && (
                <div className="mb-6 p-4 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] font-['Inter:Medium',sans-serif]">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-[#131615] border border-[#262b2a] rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : groups.length === 0 && orphanListings.length === 0 ? (
                <div className="p-6 bg-[#131615] border border-[#262b2a] rounded-2xl text-[#87928e] font-['Inter:Medium',sans-serif]">
                  No tickets yet. Buy one from the events page.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* One card per event group */}
                  {groups.map((group) => (
                    <div
                      key={group.key}
                      className={`relative bg-[#131615] rounded-2xl p-6 border ${group.listedCount > 0 ? 'border-[rgba(50,179,119,0.4)]' : 'border-[#262b2a]'}`}
                    >
                      {group.listedCount > 0 && (
                        <div className="mb-4 inline-flex items-center gap-2 bg-[rgba(50,179,119,0.15)] border border-[rgba(50,179,119,0.3)] text-[#32b377] text-sm font-['Inter:Medium',sans-serif] px-4 py-2 rounded-full">
                          <Tag className="w-4 h-4" />
                          {group.listedCount} LISTED FOR RESALE
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl">{group.eventName}</h3>
                          <p className="text-[#87928e] text-sm font-['Inter:Medium',sans-serif] mt-1">
                            {group.artist} • {group.tier}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[rgba(50,179,119,0.1)] flex items-center justify-center shrink-0 ml-4">
                          <Ticket className="w-5 h-5 text-[#32b377]" />
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-[#87928e]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#32b377]" />
                          <span>{group.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tickets</span>
                          <span className="text-[#fafaf9] font-['Space_Grotesk:Bold',sans-serif]">
                            {group.totalCount} {group.totalCount === 1 ? 'ticket' : 'tickets'}
                          </span>
                        </div>
                        {group.listedCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span>Owned</span>
                            <span className="text-[#fafaf9]">{group.ownedNotListedCount} · {group.listedCount} listed</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Paid</span>
                          <span className="text-[#fafaf9]">{group.purchasePrice} SOL each</span>
                        </div>
                      </div>

                      {/* Listed items: show each with cancel */}
                      {group.listed.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#262b2a] space-y-2">
                          <div className="text-xs text-[#87928e] font-['Inter:Medium',sans-serif]">Listed for resale</div>
                          {group.listed.map((listed) => (
                            <div key={listed.ticketMint} className="flex items-center justify-between py-1">
                              <span className="text-[#32b377] text-sm">{listed.currentPrice} SOL</span>
                              <button
                                onClick={() => handleCancelListing(listed)}
                                disabled={cancellingMint === listed.ticketMint}
                                className="text-sm text-[#ff6464] hover:text-[#ff4444] disabled:opacity-60 font-['Inter:Medium',sans-serif]"
                              >
                                {cancellingMint === listed.ticketMint ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-[#262b2a] flex items-center gap-3 flex-wrap">
                        {group.eventId != null && (
                          <Link
                            to={`/events/${group.eventId}/attendees`}
                            className="inline-flex items-center gap-2 text-sm text-[#32b377] hover:text-[#2a9865]"
                          >
                            <Users className="w-4 h-4" />
                            View attendees
                          </Link>
                        )}
                        {group.ownedNotListedCount > 0 && (
                          <button
                            onClick={() => openResaleModal(group.ownedNotListed, group.eventName, group.eventId, group.eventPubkey, group.purchasePrice, group.suggestedPrice)}
                            className="ml-auto text-sm text-[#87928e] hover:text-[#32b377] transition-colors font-['Inter:Medium',sans-serif]"
                          >
                            List for resale
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Orphan listings (no matching ticket in our list) */}
                  {orphanListings.map((listed) => (
                      <div
                        key={listed.ticketMint ?? listed.id}
                        className="relative bg-[#131615] border border-[rgba(50,179,119,0.4)] rounded-2xl p-6"
                      >
                        <div className="mb-4 inline-flex items-center gap-2 bg-[rgba(50,179,119,0.15)] border border-[rgba(50,179,119,0.3)] text-[#32b377] text-sm font-['Inter:Medium',sans-serif] px-4 py-2 rounded-full">
                          <Tag className="w-4 h-4" />
                          LISTED FOR RESALE
                        </div>

                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl">
                            {listed.event ?? 'Event'}
                          </h3>
                          <div className="w-10 h-10 rounded-full bg-[rgba(50,179,119,0.1)] flex items-center justify-center shrink-0 ml-4">
                            <Ticket className="w-5 h-5 text-[#32b377]" />
                          </div>
                        </div>

                        <div className="space-y-3 text-sm text-[#87928e]">
                          <div className="flex items-center justify-between">
                            <span>Listing Price</span>
                            <span className="text-[#32b377] font-['Space_Grotesk:Bold',sans-serif]">{listed.currentPrice} SOL</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#262b2a]">
                          <button
                            onClick={() => handleCancelListing(listed)}
                            disabled={cancellingMint === listed.ticketMint}
                            className="inline-flex items-center gap-1.5 text-sm text-[#ff6464] hover:text-[#ff4444] disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-['Inter:Medium',sans-serif]"
                          >
                            <XCircle className="w-4 h-4" />
                            {cancellingMint === listed.ticketMint ? 'Cancelling...' : 'Cancel Listing'}
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Resale Listing Modal */}
      <AnimatePresence>
        {resaleGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeResaleModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#131615] border border-[#262b2a] rounded-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-[#262b2a]">
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl">
                  List for <span className="text-[#32b377]">Resale</span>
                </h2>
                <button
                  onClick={closeResaleModal}
                  className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.2)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {listSuccess ? (
                /* Success state */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(50,179,119,0.1)] flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-[#32b377]" />
                  </div>
                  <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-2">
                    {listSuccessCount > 1 ? 'Tickets Listed!' : 'Ticket Listed!'}
                  </h3>
                  <p className="text-[#87928e] text-sm mb-6 font-['Inter:Regular',sans-serif]">
                    {listSuccessCount} ticket{listSuccessCount !== 1 ? 's' : ''} for <span className="text-[#fafaf9]">{resaleGroup.eventName}</span> {listSuccessCount !== 1 ? 'are' : 'is'} now live on the marketplace at <span className="text-[#32b377]">{price.toFixed(2)} SOL</span> each.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { closeResaleModal(); navigate('/marketplace#listings'); }}
                      className="bg-[#32b377] hover:bg-[#2a9865] transition-all px-6 py-3 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b]"
                    >
                      View on Marketplace
                    </button>
                    <button
                      onClick={closeResaleModal}
                      className="border border-[#262b2a] hover:border-[#32b377] transition-all px-6 py-3 rounded-xl font-['Inter:Medium',sans-serif] text-[#87928e] hover:text-[#fafaf9]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Listing form */
                <div className="p-6 space-y-6">
                  {/* Event info */}
                  <div className="p-4 bg-[rgba(38,43,42,0.5)] rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Ticket className="w-5 h-5 text-[#32b377]" />
                      <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-lg">{resaleGroup.eventName}</h3>
                    </div>
                    <p className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
                      {resaleGroup.availableTickets.length} ticket{resaleGroup.availableTickets.length !== 1 ? 's' : ''} available to list
                    </p>
                    <p className="text-[#87928e] text-xs mt-1 font-['Inter:Regular',sans-serif]">
                      Original price: <span className="text-[#fafaf9]">{resaleGroup.purchasePrice} SOL</span> each
                    </p>
                  </div>

                  {/* Quantity to list */}
                  <div>
                    <label className="block text-sm mb-2 font-['Inter:Medium',sans-serif]">How many to list?</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setResaleQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-lg bg-[#262b2a] hover:bg-[#32b377] text-[#fafaf9] font-['Inter:Medium',sans-serif] disabled:opacity-50"
                        disabled={resaleQuantity <= 1}
                      >
                        −
                      </button>
                      <span className="font-['Space_Grotesk:Bold',sans-serif] text-xl min-w-[2rem] text-center">{resaleQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setResaleQuantity((q) => Math.min(resaleGroup.availableTickets.length, q + 1))}
                        className="w-10 h-10 rounded-lg bg-[#262b2a] hover:bg-[#32b377] text-[#fafaf9] font-['Inter:Medium',sans-serif] disabled:opacity-50"
                        disabled={resaleQuantity >= resaleGroup.availableTickets.length}
                      >
                        +
                      </button>
                      <span className="text-[#87928e] text-sm">of {resaleGroup.availableTickets.length}</span>
                    </div>
                  </div>

                  {/* Price input */}
                  <div>
                    <label className="block text-sm mb-2 font-['Inter:Medium',sans-serif]">Resale price per ticket (SOL)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={resalePrice}
                        onChange={(e) => setResalePrice(e.target.value)}
                        className="flex-1 bg-[rgba(38,43,42,0.5)] border-2 border-[#262b2a] focus:border-[#32b377] rounded-xl px-5 py-3 text-2xl text-[#fafaf9] focus:outline-none transition-colors font-['Space_Grotesk:Bold',sans-serif]"
                      />
                      <span className="text-[#87928e] text-lg font-['Space_Grotesk:Bold',sans-serif] shrink-0">
                        SOL
                      </span>
                    </div>
                    {resaleGroup.suggestedPrice != null && resaleGroup.suggestedPrice > 0 && (
                      <button
                        onClick={() => setResalePrice(resaleGroup.suggestedPrice.toString())}
                        className="mt-2 text-xs text-[#32b377] hover:text-[#2a9865] transition-colors font-['Inter:Medium',sans-serif]"
                      >
                        Use suggested: {resaleGroup.suggestedPrice} SOL
                      </button>
                    )}
                  </div>

                  {/* Fair split preview */}
                  <div className="space-y-2">
                    <div className="text-xs text-[#87928e] font-['Inter:Medium',sans-serif] mb-1">
                      {eventArtistPct}/{80 - eventArtistPct}/20 Fair Split Preview
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 p-3 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl text-center">
                        <div className="text-xs text-[#87928e] mb-1 font-['Inter:Regular',sans-serif]">You get</div>
                        <div className="font-['Space_Grotesk:Bold',sans-serif] text-lg text-[#32b377]">{sellerCut.toFixed(3)}</div>
                        <div className="text-xs text-[#87928e]">{80 - eventArtistPct}%</div>
                      </div>
                      <div className="flex-1 p-3 bg-[rgba(38,43,42,0.3)] border border-[#262b2a] rounded-xl text-center">
                        <div className="text-xs text-[#87928e] mb-1 font-['Inter:Regular',sans-serif]">Organizer</div>
                        <div className="font-['Space_Grotesk:Bold',sans-serif] text-lg">{artistCut.toFixed(3)}</div>
                        <div className="text-xs text-[#87928e]">{eventArtistPct}%</div>
                      </div>
                      <div className="flex-1 p-3 bg-[rgba(38,43,42,0.3)] border border-[#262b2a] rounded-xl text-center">
                        <div className="text-xs text-[#87928e] mb-1 font-['Inter:Regular',sans-serif]">Platform</div>
                        <div className="font-['Space_Grotesk:Bold',sans-serif] text-lg">{platformCut.toFixed(3)}</div>
                        <div className="text-xs text-[#87928e]">20%</div>
                      </div>
                    </div>
                  </div>

                  {/* Error display inside modal */}
                  {modalError && (
                    <div className="p-3 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] text-sm font-['Inter:Medium',sans-serif]">
                      {modalError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleListForResale}
                      disabled={listing || price <= 0}
                      className="flex-1 bg-[#32b377] hover:bg-[#2a9865] disabled:opacity-60 disabled:cursor-not-allowed transition-all px-6 py-3.5 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)]"
                    >
                      {listing ? 'Listing...' : `List ${resaleQuantity} Ticket${resaleQuantity !== 1 ? 's' : ''}`}
                    </button>
                    <button
                      onClick={closeResaleModal}
                      className="border border-[#262b2a] hover:border-[#32b377] transition-all px-6 py-3.5 rounded-xl font-['Inter:Medium',sans-serif] text-[#87928e] hover:text-[#fafaf9]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
