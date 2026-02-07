/**
 * CREATE EVENT PAGE - ARTIST/ORGANIZER FLOW
 * 
 * Purpose:
 * - Allow artists and event organizers to create new events on-chain
 * - Set ticket tier, pricing, and supply
 * - Build + sign + submit create_event transaction via Anchor
 */

import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Calendar, MapPin, DollarSign, Shield, Check, Wallet, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWallet, shortenAddress } from '../contexts/WalletContext';
import { createEvent } from '../lib/api';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { wallet } = useSolanaWallet();
  const { connected, publicKey, balance, connect } = useWallet();

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [tierName, setTierName] = useState('General Admission');
  const [price, setPrice] = useState('');
  const [supply, setSupply] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!connected || !publicKey) {
      setError('Connect your wallet first.');
      connect();
      return;
    }
    if (!title || !venue || !date || !price || !supply) {
      setError('Please fill in all required fields.');
      return;
    }

    const priceSol = parseFloat(price);
    const supplyNum = parseInt(supply, 10);
    if (isNaN(priceSol) || priceSol <= 0) { setError('Price must be > 0'); return; }
    if (isNaN(supplyNum) || supplyNum <= 0) { setError('Supply must be > 0'); return; }

    setIsSubmitting(true);
    try {
      const dateTs = Math.floor(new Date(date).getTime() / 1000);
      const priceLamports = Math.round(priceSol * 1e9);

      const result = await createEvent({
        organizerPubkey: publicKey,
        eventAccountPubkey: '', // generated server-side
        title,
        venue,
        dateTs,
        tierName,
        priceLamports,
        supply: supplyNum,
      });

      if (result.transaction) {
        if (!wallet?.adapter) throw new Error('Wallet not ready to sign');
        const txBytes = Uint8Array.from(atob(result.transaction), (c) => c.charCodeAt(0));
        const tx = Transaction.from(txBytes);

        // Event account is a PDA — only the organizer wallet needs to sign
        const signed = await wallet.adapter.signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
        await connection.confirmTransaction(sig, 'confirmed');

        setSuccess(`Event created on-chain! ID: ${result.eventId ?? '?'}, Signature: ${sig}`);
      } else {
        setSuccess(result.message ?? 'Event created (mock).');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              to="/events"
              className="inline-flex items-center gap-2 text-[#87928e] hover:text-[#32b377] transition-colors mb-6 font-['Inter:Medium',sans-serif]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-6xl mb-4">
              Create Your <span className="text-[#32b377]">Event</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif]">
              Set up your event, configure ticket pricing, and mint NFT tickets for your fans.
              All sales and resales automatically follow your rules on-chain.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Form Section */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Event Details */}
                  <div>
                    <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[rgba(50,179,119,0.1)] rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#32b377]" />
                      </div>
                      Event Details
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2 font-['Inter:Medium',sans-serif]">Event Name *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Summer Music Festival 2026"
                          className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-xl px-4 py-3.5 text-[#fafaf9] placeholder-[#87928e] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2 font-['Inter:Medium',sans-serif]">Date *</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-xl px-4 py-3.5 text-[#fafaf9] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2 font-['Inter:Medium',sans-serif]">
                          <MapPin className="w-4 h-4 inline mr-1 text-[#32b377]" />
                          Venue / Location *
                        </label>
                        <input
                          type="text"
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          placeholder="e.g., Madison Square Garden, New York, NY"
                          className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-xl px-4 py-3.5 text-[#fafaf9] placeholder-[#87928e] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Ticket Tier */}
                  <div className="border-t border-[#262b2a] pt-8">
                    <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[rgba(50,179,119,0.1)] rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#32b377]" />
                      </div>
                      Ticket Pricing
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs mb-2 text-[#87928e] font-['Inter:Regular',sans-serif]">Tier Name</label>
                        <input
                          type="text"
                          value={tierName}
                          onChange={(e) => setTierName(e.target.value)}
                          placeholder="General Admission"
                          className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-lg px-3 py-2.5 text-sm text-[#fafaf9] placeholder-[#87928e] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-2 text-[#87928e] font-['Inter:Regular',sans-serif]">Price (SOL) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.5"
                          className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-lg px-3 py-2.5 text-sm text-[#fafaf9] placeholder-[#87928e] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-2 text-[#87928e] font-['Inter:Regular',sans-serif]">Supply *</label>
                        <input
                          type="number"
                          min="1"
                          value={supply}
                          onChange={(e) => setSupply(e.target.value)}
                          placeholder="100"
                          className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-lg px-3 py-2.5 text-sm text-[#fafaf9] placeholder-[#87928e] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wallet */}
                  <div className="border-t border-[#262b2a] pt-8">
                    <div className="flex items-center gap-4 p-4 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl">
                      <div className="w-12 h-12 bg-[#32b377] rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-[#090b0b]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-['Inter:Medium',sans-serif] mb-1">
                          {connected && publicKey ? 'Connected' : 'Wallet'}
                        </div>
                        <div className="text-sm text-[#87928e] font-mono">
                          {connected && publicKey ? shortenAddress(publicKey) : 'Not connected'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#87928e] mb-1">Balance</div>
                        <div className="font-['Inter:Medium',sans-serif]">◎ {balance}</div>
                      </div>
                    </div>
                    {!connected && (
                      <button
                        type="button"
                        onClick={connect}
                        className="mt-3 text-sm text-[#32b377] hover:underline font-['Inter:Medium',sans-serif]"
                      >
                        Connect wallet to continue
                      </button>
                    )}
                  </div>
                  
                  {/* Submit */}
                  <div className="border-t border-[#262b2a] pt-8">
                    {error && (
                      <div className="mb-4 rounded-lg border border-[rgba(255,100,100,0.3)] bg-[rgba(255,100,100,0.1)] px-4 py-3 text-sm text-[#ff6464] font-['Inter:Medium',sans-serif]">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 rounded-lg border border-[rgba(50,179,119,0.3)] bg-[rgba(50,179,119,0.1)] px-4 py-3 text-sm text-[#32b377] font-['Inter:Medium',sans-serif]">
                        {success}
                        <button
                          type="button"
                          onClick={() => navigate('/events')}
                          className="ml-3 underline hover:no-underline"
                        >
                          View Events
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#32b377] hover:bg-[#2a9865] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating Event…' : 'Create Event & Mint Tickets'}
                    </button>
                    
                    <div className="mt-4 p-4 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl">
                      <p className="text-sm text-[#87928e] font-['Inter:Regular',sans-serif]">
                        <Shield className="w-4 h-4 inline mr-1 text-[#32b377]" />
                        Your event will be created on Solana devnet. Estimated gas: ~0.005 SOL.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right - Preview */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8 sticky top-24"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-6">Live Preview</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-[#87928e] mb-1">Event</div>
                    <div className="font-['Space_Grotesk:Bold',sans-serif] text-lg">
                      {title || 'Your Event Name'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#87928e] mb-1">Venue</div>
                    <div className="font-['Inter:Medium',sans-serif] text-sm">
                      {venue || 'Venue / Location'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#87928e] mb-1">Date</div>
                    <div className="font-['Inter:Medium',sans-serif] text-sm">
                      {date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                    </div>
                  </div>
                  <div className="border-t border-[#262b2a] pt-4">
                    <div className="text-xs text-[#87928e] mb-1">Tier</div>
                    <div className="font-['Inter:Medium',sans-serif] text-sm">{tierName || 'General Admission'}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs text-[#87928e] mb-1">Price</div>
                      <div className="font-['Space_Grotesk:Bold',sans-serif] text-2xl text-[#32b377]">
                        {price ? `${price} SOL` : '— SOL'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#87928e] mb-1">Supply</div>
                      <div className="font-['Space_Grotesk:Bold',sans-serif] text-2xl">
                        {supply || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#262b2a] space-y-3">
                  <div className="text-sm font-['Inter:Medium',sans-serif] mb-3">On-chain features:</div>
                  {[
                    "NFT tickets minted to buyers",
                    "SOL goes directly to your wallet",
                    "Verifiable proof of attendance",
                    "Anti-scalping protection"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#87928e]">
                      <Check className="w-4 h-4 text-[#32b377] shrink-0" />
                      <span className="font-['Inter:Regular',sans-serif]">{item}</span>
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
