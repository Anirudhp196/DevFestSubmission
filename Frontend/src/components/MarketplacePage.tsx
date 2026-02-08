/**
 * MARKETPLACE PAGE - TICKET RESALE
 * 
 * Key Features:
 * - Secondary market for ticket resale
 * - Fair pricing display (40/40/20 split visualization)
 * - Data from API (mock until Listing PDAs are wired)
 * - Seller reputation badges
 * 
 * Design Goal:
 * - Show transparency in resale economics
 * - Build trust through clear fee breakdown
 * - Highlight fairness vs traditional ticketing
 */

import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { TrendingUp, TrendingDown, Clock, Shield, Star, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getListings, buyResale } from '../lib/api';
import { useWallet } from '../contexts/WalletContext';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import type { Listing } from '../types';

export function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null); // ticketMint being bought
  const listingsRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const { connected, publicKey, connect } = useWallet();
  const { connection } = useConnection();
  const wallet = useSolanaWallet();

  async function handleBuyResale(listing: Listing) {
    if (!connected || !publicKey) {
      connect();
      return;
    }
    if (!listing.ticketMint) {
      alert('This listing does not have on-chain data. Cannot purchase.');
      return;
    }
    if (!wallet.signTransaction) return;

    setBuying(listing.ticketMint);
    try {
      const { transaction: txBase64 } = await buyResale(publicKey, listing.ticketMint);
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      alert(`Purchase successful! Signature: ${sig.slice(0, 20)}...`);
      // Refresh listings
      const data = await getListings();
      setListings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to buy resale ticket');
    } finally {
      setBuying(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getListings()
      .then((data) => { if (!cancelled) setListings(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load listings'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Scroll to listings if URL contains hash '#listings'
  useEffect(() => {
    if (!location || !location.hash) return;
    if (location.hash === '#listings' && listingsRef.current) {
      // allow UI to render then scroll
      requestAnimationFrame(() => listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location, loading]);

  return (
    <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-8 border-b border-[#262b2a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-6xl mb-4">
              Fair <span className="text-[#32b377]">Marketplace</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif] max-w-2xl">
              Buy and sell tickets fairly. Artists set their resale split, platform takes 20%. 
              No more scalpers getting rich off your passion.
            </p>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8"
          >
            {[
              { label: "Active Listings", value: String(listings.length), icon: TrendingUp },
              { label: "Avg Resale Price", value: listings.length > 0 ? (listings.reduce((s, l) => s + l.currentPrice, 0) / listings.length).toFixed(2) + ' SOL' : '— SOL', icon: DollarSign },
              { label: "Unique Sellers", value: String(new Set(listings.map(l => l.seller)).size), icon: Users },
              { label: "Fair Splits Paid", value: String(listings.length), icon: Shield }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-[rgba(38,43,42,0.3)] border border-[#262b2a] rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-[rgba(50,179,119,0.1)] rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-[#32b377]" />
                </div>
                <div>
                  <div className="text-[#87928e] text-xs mb-1 font-['Inter:Regular',sans-serif]">
                    {stat.label}
                  </div>
                  <div className="font-['Space_Grotesk:Bold',sans-serif] text-xl">
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Fair Split Explainer */}
      <section className="py-16 px-8 bg-[#131615]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-4xl mb-4">
              How the <span className="text-[#32b377]">Custom Split</span> Works
            </h2>
            <p className="text-[#87928e] text-lg font-['Inter:Regular',sans-serif]">
              Every resale automatically splits profits on-chain. Artists set their cut, platform takes 20%, sellers get the rest.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                percent: "0-80%",
                recipient: "Artist",
                description: "Artists choose their resale share when creating the event",
                color: "#32b377"
              },
              {
                percent: "0-80%",
                recipient: "Seller",
                description: "Fair profit for sellers — gets whatever the artist doesn't take",
                color: "#32b377"
              },
              {
                percent: "20%",
                recipient: "Platform",
                description: "Platform fee covers infrastructure and anti-scalping systems",
                color: "#87928e"
              }
            ].map((split, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#090b0b] border border-[#262b2a] rounded-2xl p-8 text-center"
              >
                <div 
                  className="text-6xl font-['Space_Grotesk:Bold',sans-serif] mb-3"
                  style={{ color: split.color }}
                >
                  {split.percent}
                </div>
                <div className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-3">
                  {split.recipient}
                </div>
                <p className="text-[#87928e] text-sm leading-relaxed font-['Inter:Regular',sans-serif]">
                  {split.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Marketplace Listings */}
      <section id="listings" ref={(el) => (listingsRef.current = el)} className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-3xl mb-2">
              Available Tickets
            </h2>
            <p className="text-[#87928e] font-['Inter:Regular',sans-serif]">
              All tickets verified on-chain. No fakes, no fraud.
            </p>
          </motion.div>
          
          {error && (
            <div className="mb-6 p-4 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] font-['Inter:Medium',sans-serif]">
              {error}
            </div>
          )}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-[#131615] border border-[#262b2a] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="p-8 bg-[#131615] border border-[#262b2a] rounded-2xl text-center">
              <p className="text-[#87928e] font-['Inter:Medium',sans-serif] text-lg mb-2">No tickets listed for resale yet.</p>
              <p className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">When someone lists a ticket, it will appear here.</p>
            </div>
          ) : (
          <div className="space-y-4">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-6 hover:border-[#32b377] transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Event Icon/Visual */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[#32b377] to-[#1a6a4a] rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="w-8 h-8 text-[#fafaf9]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl group-hover:text-[#32b377] transition-colors">
                            {listing.event}
                          </h3>
                          {listing.verified && (
                            <div className="w-5 h-5 bg-[#32b377] rounded-full flex items-center justify-center" title="Verified NFT">
                              <Shield className="w-3 h-3 text-[#090b0b]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[#87928e] text-sm mb-3 font-['Inter:Medium',sans-serif]">
                          {listing.organizer}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#87928e]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#32b377]" />
                            <span className="font-['Inter:Regular',sans-serif]">{listing.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#32b377]" />
                            <span className="font-['Inter:Regular',sans-serif]">
                              Seller: {listing.seller}
                            </span>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-['Inter:Medium',sans-serif] ${
                              listing.sellerRep === 'Gold' 
                                ? 'bg-[rgba(255,200,100,0.2)] text-[#ffc864]'
                                : listing.sellerRep === 'Silver'
                                ? 'bg-[rgba(200,200,200,0.2)] text-[#c8c8c8]'
                                : 'bg-[rgba(205,127,50,0.2)] text-[#cd7f32]'
                            }`}>
                              <Star className="w-3 h-3 inline mr-1" />
                              {listing.sellerRep}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8">
                    {/* Original vs Current Price */}
                    <div>
                      <div className="text-[#87928e] text-xs mb-1 font-['Inter:Regular',sans-serif]">
                        Original: {listing.originalPrice} SOL
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-['Space_Grotesk:Bold',sans-serif] text-3xl text-[#32b377]">
                          {listing.currentPrice} SOL
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-['Inter:Medium',sans-serif] ${
                          listing.priceChange > 0
                            ? 'bg-[rgba(255,100,100,0.1)] text-[#ff6464]'
                            : 'bg-[rgba(100,255,150,0.1)] text-[#64ff96]'
                        }`}>
                          {listing.priceChange > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(listing.priceChange)}%
                        </div>
                      </div>
                      <div className="text-[#87928e] text-xs mt-1 font-['Inter:Regular',sans-serif]">
                        Listed {listing.listingAge}
                      </div>
                    </div>
                    
                    {/* CTA */}
                    <button
                      className="bg-[#32b377] hover:bg-[#2a9865] disabled:opacity-60 transition-all px-8 py-3.5 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)] whitespace-nowrap"
                      disabled={buying === listing.ticketMint}
                      onClick={() => handleBuyResale(listing)}
                    >
                      {buying === listing.ticketMint ? 'Buying...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
                
                {/* Fair Split Preview */}
                <div className="mt-6 pt-6 border-t border-[#262b2a]">
                  {(() => {
                    const aPct = listing.artistPct ?? 40;
                    const sPct = 80 - aPct;
                    const artistAmt = (listing.currentPrice * aPct / 100).toFixed(2);
                    const sellerAmt = (listing.currentPrice * sPct / 100).toFixed(2);
                    const platformAmt = (listing.currentPrice * 0.2).toFixed(2);
                    return (
                      <>
                        <div className="text-[#87928e] text-xs mb-3 font-['Inter:Medium',sans-serif]">
                          Fair Split Breakdown for {listing.currentPrice} SOL:
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#32b377] rounded" />
                            <span className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">
                              Artist: {artistAmt} SOL ({aPct}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#32b377] rounded" />
                            <span className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">
                              Seller: {sellerAmt} SOL ({sPct}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#87928e] rounded" />
                            <span className="text-xs text-[#87928e] font-['Inter:Regular',sans-serif]">
                              Platform: {platformAmt} SOL (20%)
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Scroll to listings when hash present */}
      <script>{/* placeholder to keep TSX valid; scroll handled in effect below */}</script>
      
      {/* Seller CTA */}
      <section className="border-t border-[#262b2a] py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[rgba(50,179,119,0.1)] to-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-2xl p-12 text-center"
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-4xl mb-4">
              Have tickets to sell?
            </h2>
            <p className="text-[#87928e] text-lg mb-8 font-['Inter:Regular',sans-serif]">
              List your NFT tickets on the marketplace. Fair pricing, instant settlement, zero fraud.
            </p>
            <Link 
              to="/list-ticket"
              className="inline-flex items-center gap-3 bg-[#32b377] hover:bg-[#2a9865] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)]"
            >
              List Your Tickets
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}