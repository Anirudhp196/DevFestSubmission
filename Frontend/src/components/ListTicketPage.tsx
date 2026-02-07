/**
 * LIST TICKET PAGE - SELL/RESALE FLOW
 * 
 * Purpose:
 * - Allow fans to list their NFT tickets for resale
 * - Set listing price with fair split preview
 * - Show wallet tickets available to list
 * - Transparent breakdown of what seller receives
 * 
 * Design Approach:
 * - Show owned tickets from wallet
 * - Price suggestion based on market
 * - Clear 40/40/20 split visualization
 * - One-click listing with confirmation
 */

import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Wallet, TrendingUp, Shield, DollarSign, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyTickets, listForResale } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import type { Ticket } from '../types';

export function ListTicketPage() {
  const { connected, publicKey, connect } = useWallet();
  const { connection } = useConnection();
  const solanaWallet = useSolanaWallet();
  const [ownedTickets, setOwnedTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [listingPrice, setListingPrice] = useState('0.55');
  const [isListing, setIsListing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const ticket = ownedTickets[selectedTicket];
  const hasTicket = Boolean(ticket);
  const price = parseFloat(listingPrice) || 0;
  const organizerCut = price * 0.4;
  const sellerCut = price * 0.4;
  const platformCut = price * 0.2;

  useEffect(() => {
    if (!connected || !publicKey) return;
    let cancelled = false;
    getMyTickets(publicKey)
      .then((data) => {
        if (cancelled) return;
        setOwnedTickets(data);
        setSelectedTicket(0);
        if (data[0]?.suggestedPrice != null) {
          setListingPrice(String(data[0].suggestedPrice));
        }
      })
      .catch(() => {
        if (!cancelled) setOwnedTickets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  const navigate = useNavigate();

  async function handleListTicket() {
    if (!hasTicket || !publicKey || !solanaWallet.signTransaction) return;
    const priceSol = Number(listingPrice) || 0;
    if (priceSol <= 0) return;

    if (!ticket.eventPubkey || !ticket.ticketMint) {
      setListError('This ticket does not have on-chain data. Only on-chain tickets can be listed.');
      return;
    }

    setIsListing(true);
    setListError(null);
    try {
      const { transaction: txBase64 } = await listForResale(
        publicKey,
        ticket.eventPubkey,
        ticket.ticketMint,
        priceSol,
      );
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await solanaWallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      navigate('/marketplace#listings');
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to list ticket');
    } finally {
      setIsListing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
      <Navigation />
      
      {/* Header */}
      <section className="relative pt-32 pb-16 px-8 border-b border-[#262b2a]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/marketplace"
              className="inline-flex items-center gap-2 text-[#87928e] hover:text-[#32b377] transition-colors mb-6 font-['Inter:Medium',sans-serif]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-6xl mb-4">
              List Your <span className="text-[#32b377]">Tickets</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif]">
              Can't make it to the event? List your NFT tickets for resale with fair pricing that benefits everyone.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Listing Section */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Ticket Selection & Pricing */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Tickets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Your Tickets
                </h2>
                
                {!connected ? (
                  <div className="p-6 bg-[rgba(255,200,100,0.1)] border border-[rgba(255,200,100,0.3)] rounded-xl text-[#ffc864] font-['Inter:Medium',sans-serif]">
                    Connect your wallet to load tickets.
                    <button
                      onClick={connect}
                      className="ml-4 bg-[#32b377] hover:bg-[#2a9865] transition-all px-4 py-2 rounded-lg text-[#090b0b] text-sm"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : ownedTickets.length === 0 ? (
                  <div className="p-6 bg-[#131615] border border-[#262b2a] rounded-2xl text-[#87928e] font-['Inter:Medium',sans-serif]">
                    No tickets found for this wallet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownedTickets.map((t, index) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTicket(index);
                          if (t.suggestedPrice != null) setListingPrice(String(t.suggestedPrice));
                        }}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedTicket === index
                            ? 'border-[#32b377] bg-[rgba(50,179,119,0.05)]'
                            : 'border-[#262b2a] hover:border-[#32b377]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-lg mb-1">
                              {t.event}
                            </h3>
                            <p className="text-[#87928e] text-sm mb-3 font-['Inter:Medium',sans-serif]">
                              {t.organizer} • {t.date}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">
                                Tier: <span className="text-[#fafaf9]">{t.tier}</span>
                              </span>
                              <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">
                                Paid: <span className="text-[#fafaf9]">{t.purchasePrice} SOL</span>
                              </span>
                            </div>
                          </div>
                          
                          {selectedTicket === index && (
                            <div className="w-6 h-6 bg-[#32b377] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-[#090b0b]" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {connected && publicKey && (
                  <div className="mt-6 p-4 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-[#32b377] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#87928e] font-['Inter:Regular',sans-serif]">
                      Tickets loaded from your connected wallet: <span className="text-[#fafaf9] font-mono">{publicKey}</span>
                    </p>
                  </div>
                )}
              </motion.div>
              
              {/* Set Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Set Listing Price
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm mb-3 font-['Inter:Medium',sans-serif]">
                    List Price (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      disabled={!hasTicket}
                      className="w-full bg-[rgba(38,43,42,0.5)] border-2 border-[#32b377] rounded-xl px-6 py-4 text-3xl text-[#fafaf9] focus:border-[#32b377] focus:outline-none transition-colors font-['Space_Grotesk:Bold',sans-serif]"
                    />
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#87928e] text-lg font-['Space_Grotesk:Bold',sans-serif]">
                      SOL
                    </div>
                  </div>
                  
                  {hasTicket ? (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">
                        Original price: {ticket.purchasePrice} SOL
                      </span>
                      <button
                        onClick={() => setListingPrice(ticket.suggestedPrice.toString())}
                        className="text-[#32b377] hover:text-[#2a9865] transition-colors font-['Inter:Medium',sans-serif]"
                      >
                        Use suggested: {ticket.suggestedPrice} SOL
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-[#87928e]">
                      Select a ticket to set pricing.
                    </div>
                  )}
                </div>
                
                {/* Market Insight */}
                <div className="p-4 bg-[rgba(38,43,42,0.3)] border border-[#262b2a] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#32b377]" />
                    <span className="text-sm font-['Inter:Medium',sans-serif]">Market Insight</span>
                  </div>
                  <p className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">
                    {hasTicket
                      ? `Similar tickets for this event are selling at an average of ${ticket.suggestedPrice} SOL. Pricing competitively increases your chance of a quick sale.`
                      : 'Select a ticket to see market pricing.'}
                  </p>
                </div>
              </motion.div>
              
              {/* Fair Split Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Fair Split Breakdown
                </h2>
                
                <p className="text-sm text-[#87928e] mb-6 font-['Inter:Regular',sans-serif]">
                  When your ticket sells for <span className="text-[#32b377] font-['Inter:Medium',sans-serif]">{price.toFixed(2)} SOL</span>, 
                  here's how it's distributed:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#32b377] rounded" />
                      <div>
                        <div className="font-['Inter:Medium',sans-serif] mb-1">You Receive (40%)</div>
                        <div className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">Seller's fair share</div>
                      </div>
                    </div>
                    <div className="font-['Space_Grotesk:Bold',sans-serif] text-2xl text-[#32b377]">
                      {sellerCut.toFixed(3)} SOL
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[rgba(38,43,42,0.3)] border border-[#262b2a] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#32b377] rounded" />
                      <div>
                        <div className="font-['Inter:Medium',sans-serif] mb-1">Organizer Royalty (40%)</div>
                        <div className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">Supports the creator</div>
                      </div>
                    </div>
                    <div className="font-['Space_Grotesk:Bold',sans-serif] text-xl">
                      {organizerCut.toFixed(3)} SOL
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[rgba(38,43,42,0.3)] border border-[#262b2a] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#87928e] rounded" />
                      <div>
                        <div className="font-['Inter:Medium',sans-serif] mb-1">Platform Fee (20%)</div>
                        <div className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">Infrastructure & anti-scalping</div>
                      </div>
                    </div>
                    <div className="font-['Space_Grotesk:Bold',sans-serif] text-xl">
                      {platformCut.toFixed(3)} SOL
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#32b377] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#87928e] font-['Inter:Regular',sans-serif]">
                    This split is enforced by smart contract. Organizers continue earning from their work, 
                    and scalpers can't profit unfairly.
                    </p>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column - Summary & CTA */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8 sticky top-24"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Listing Summary
                </h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-[#262b2a]">
                  <div>
                    <div className="text-xs text-[#87928e] mb-2 font-['Inter:Regular',sans-serif]">Event</div>
                    <div className="font-['Inter:Medium',sans-serif]">{hasTicket ? ticket.event : '—'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-[#87928e] mb-2 font-['Inter:Regular',sans-serif]">Tier</div>
                    <div className="font-['Inter:Medium',sans-serif]">{hasTicket ? ticket.tier : '—'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-[#87928e] mb-2 font-['Inter:Regular',sans-serif]">List Price</div>
                    <div className="font-['Space_Grotesk:Bold',sans-serif] text-3xl text-[#32b377]">
                      {price.toFixed(2)} SOL
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-[#87928e] mb-2 font-['Inter:Regular',sans-serif]">You'll Receive</div>
                    <div className="font-['Space_Grotesk:Bold',sans-serif] text-2xl">
                      {sellerCut.toFixed(3)} SOL
                    </div>
                  </div>
                </div>
                
                {listError && (
                  <div className="mb-4 p-3 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] text-sm font-['Inter:Medium',sans-serif]">
                    {listError}
                  </div>
                )}

                <button
                  onClick={handleListTicket}
                  disabled={!hasTicket || isListing}
                  className="w-full bg-[#32b377] hover:bg-[#2a9865] disabled:opacity-60 disabled:cursor-not-allowed transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)] mb-4"
                >
                  {isListing ? 'Listing on-chain...' : hasTicket ? 'List Ticket' : 'Select a Ticket'}
                </button>
                
                <p className="text-xs text-center text-[#87928e] mb-6 font-['Inter:Regular',sans-serif]">
                  Gas fee: ~0.0001 SOL
                </p>
                
                {/* Listing Benefits */}
                <div className="pt-6 border-t border-[#262b2a] space-y-3">
                  <div className="text-sm font-['Inter:Medium',sans-serif] mb-3">Listing benefits:</div>
                  {[
                    "Instant marketplace visibility",
                    "Automatic fair split enforcement",
                    "Cancel anytime before sale",
                    "Keep your loyalty status"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-[#87928e]">
                      <Check className="w-4 h-4 text-[#32b377] shrink-0" />
                      <span className="font-['Inter:Regular',sans-serif]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
