/**
 * PURCHASE TICKET PAGE - CHECKOUT FLOW
 * 
 * Purpose:
 * - Complete purchase of event tickets
 * - Wallet connection and transaction confirmation
 * - Display ticket details and final pricing
 * - Show fair split breakdown
 * 
 * Design Approach:
 * - Clear step-by-step checkout process
 * - Transaction transparency
 * - Real-time wallet balance check
 * - Success state with NFT preview
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Calendar, MapPin, Shield, Check, Wallet, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { buyTicket, getEvent } from '../lib/api';
import { useWallet, shortenAddress } from '../contexts/WalletContext';
import type { Event } from '../types';

export function PurchaseTicketPage() {
  const { eventId } = useParams();
  const { connection } = useConnection();
  const { publicKey: walletPublicKey } = useSolanaWallet();
  const { connected, publicKey, balance, connect } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError('Missing event');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvent(eventId)
      .then((data) => { if (!cancelled) setEvent(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load event'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId]);

  const handleConfirmPurchase = async () => {
    if (!eventId || !event) return;
    if (!connected || !publicKey) {
      setPurchaseError('Connect your wallet to continue.');
      connect();
      return;
    }
    const adapter = walletPublicKey ? (useSolanaWallet as () => { wallet: { adapter: { signTransaction: (tx: Transaction) => Promise<Transaction> } } })() : null;
    setIsSubmitting(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    try {
      const result = await buyTicket(String(eventId), publicKey, event.tier);
      if (result.transaction) {
        const wallet = (useSolanaWallet as () => { wallet: { adapter: { signTransaction: (tx: Transaction) => Promise<Transaction> } } })();
        if (!wallet?.wallet?.adapter) throw new Error('Wallet not ready to sign');
        const tx = Transaction.from(Buffer.from(result.transaction, 'base64'));
        const signed = await wallet.wallet.adapter.signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
        await connection.confirmTransaction(sig, 'confirmed');
        setPurchaseSuccess(`Purchase submitted. Signature: ${sig}`);
      } else {
        setPurchaseSuccess(result.signature ?? result.message ?? 'Purchase confirmed.');
      }
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Purchase failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
        <Navigation />
        <div className="pt-32 pb-16 px-8 flex items-center justify-center min-h-[40vh]">
          <div className="text-[#87928e] font-['Inter:Medium',sans-serif]">Loading event…</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
        <Navigation />
        <div className="pt-32 pb-16 px-8 max-w-4xl mx-auto">
          <Link to="/events" className="inline-flex items-center gap-2 text-[#87928e] hover:text-[#32b377] transition-colors mb-6 font-['Inter:Medium',sans-serif]">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          <div className="p-6 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] font-['Inter:Medium',sans-serif]">
            {error ?? 'Event not found'}
          </div>
        </div>
      </div>
    );
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
              to="/events"
              className="inline-flex items-center gap-2 text-[#87928e] hover:text-[#32b377] transition-colors mb-6 font-['Inter:Medium',sans-serif]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-6xl mb-4">
              Complete Your <span className="text-[#32b377]">Purchase</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif]">
              You're moments away from your NFT ticket. Review details and confirm your purchase.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Checkout Section */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Event Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-3xl mb-2">
                      {event.title}
                    </h3>
                    <p className="text-[#87928e] text-lg font-['Inter:Medium',sans-serif]">
                      {event.artist}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[rgba(50,179,119,0.1)] rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#32b377]" />
                      </div>
                      <div>
                        <div className="text-xs text-[#87928e] mb-1 font-['Inter:Regular',sans-serif]">Date</div>
                        <div className="font-['Inter:Medium',sans-serif]">{event.date}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[rgba(50,179,119,0.1)] rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#32b377]" />
                      </div>
                      <div>
                        <div className="text-xs text-[#87928e] mb-1 font-['Inter:Regular',sans-serif]">Venue</div>
                        <div className="font-['Inter:Medium',sans-serif]">{event.location}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#262b2a]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">Ticket Tier</span>
                      <span className="font-['Inter:Medium',sans-serif]">{event.tier ?? 'General Admission'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">Quantity</span>
                      <span className="font-['Inter:Medium',sans-serif]">1 ticket</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Wallet Connection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Wallet Connection
                </h2>
                
                <div className="flex items-center gap-4 p-4 bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl">
                  <div className="w-12 h-12 bg-[#32b377] rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-[#090b0b]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-['Inter:Medium',sans-serif] mb-1">
                      {connected && publicKey ? 'Connected' : 'Wallet'}
                    </div>
                    <div className="text-sm text-[#87928e] font-mono font-['Inter:Regular',sans-serif]">
                      {connected && publicKey ? shortenAddress(publicKey) : 'Not connected'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#87928e] mb-1 font-['Inter:Regular',sans-serif]">Balance</div>
                    <div className="font-['Inter:Medium',sans-serif]">◎ {balance}</div>
                  </div>
                </div>
                
                {!connected && (
                  <p className="mt-4 text-sm text-[#ffc864] font-['Inter:Medium',sans-serif]">
                    Connect your wallet to complete the purchase.
                  </p>
                )}
              </motion.div>
              
              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-xl p-6"
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#32b377] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Inter:Medium',sans-serif] mb-2">Secure Transaction</div>
                    <p className="text-sm text-[#87928e] leading-relaxed font-['Inter:Regular',sans-serif]">
                      Your NFT ticket will be minted directly to your wallet. All transaction details are 
                      verified on-chain. You retain full custody of your assets.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column - Price Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8 sticky top-24"
              >
                <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-[#262b2a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">Ticket Price</span>
                    <span className="font-['Inter:Medium',sans-serif]">{event.price} SOL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">Platform Fee</span>
                    <span className="font-['Inter:Medium',sans-serif]">0.01 SOL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">Gas Fee (est.)</span>
                    <span className="font-['Inter:Medium',sans-serif]">~0.0001 SOL</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <span className="font-['Space_Grotesk:Bold',sans-serif] text-xl">Total</span>
                  <span className="font-['Space_Grotesk:Bold',sans-serif] text-3xl text-[#32b377]">
                    {(event.price + 0.01).toFixed(2)} SOL
                  </span>
                </div>
                
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting}
                  className="w-full bg-[#32b377] hover:bg-[#2a9865] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)] mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing…' : 'Confirm Purchase'}
                </button>

                {purchaseError && (
                  <div className="mb-4 rounded-lg border border-[rgba(255,100,100,0.3)] bg-[rgba(255,100,100,0.1)] px-4 py-3 text-sm text-[#ff6464] font-['Inter:Medium',sans-serif]">
                    {purchaseError}
                  </div>
                )}

                {purchaseSuccess && (
                  <div className="mb-4 rounded-lg border border-[rgba(50,179,119,0.3)] bg-[rgba(50,179,119,0.1)] px-4 py-3 text-sm text-[#32b377] font-['Inter:Medium',sans-serif]">
                    Purchase submitted. Signature: {purchaseSuccess}
                  </div>
                )}
                
                <p className="text-xs text-center text-[#87928e] font-['Inter:Regular',sans-serif]">
                  By purchasing, you agree to our Terms of Service
                </p>
                
                {/* Benefits List */}
                <div className="mt-6 pt-6 border-t border-[#262b2a] space-y-3">
                  <div className="text-sm font-['Inter:Medium',sans-serif] mb-3">What you get:</div>
                  {[
                    "NFT ticket minted to your wallet",
                    "Verifiable proof of ownership",
                    "Loyalty points for future events",
                    "Fair resale rights (40% back)"
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
