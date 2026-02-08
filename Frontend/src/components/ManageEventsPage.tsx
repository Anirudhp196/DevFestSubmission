/**
 * MANAGE EVENTS PAGE - ORGANIZER VIEW
 *
 * Purpose:
 * - Show events created by connected wallet
 * - Provide quick links to attendee lists
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Calendar, MapPin, Users, Plus, Trash2, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../lib/api';
import { useWallet } from '../contexts/WalletContext';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import type { Event } from '../types';

export function ManageEventsPage() {
  const { connected, publicKey, connect } = useWallet();
  const { connection } = useConnection();
  const wallet = useSolanaWallet();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null); // eventPubkey being deleted

  useEffect(() => {
    if (!connected || !publicKey) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvents()
      .then((data) => {
        if (cancelled) return;
        const mine = data.filter((event) => event.organizerPubkey === publicKey);
        setEvents(mine);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load events');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  async function handleDeleteEvent(event: Event) {
    if (!publicKey || !wallet.signTransaction || !event.eventPubkey) return;
    if (!confirm(`Delete "${event.title}"? This closes the on-chain account and returns rent SOL to you.`)) return;

    setDeleting(event.eventPubkey);
    setError(null);
    try {
      const { transaction: txBase64 } = await deleteEvent(publicKey, event.eventPubkey);
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      // Remove from local list
      setEvents((prev) => prev.filter((e) => e.eventPubkey !== event.eventPubkey));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  }

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
              Manage <span className="text-[#32b377]">Events</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif] mb-6">
              Organizer view of events created by this wallet.
            </p>
            <Link
              to="/create-event"
              className="inline-flex items-center gap-2 bg-[#32b377] hover:bg-[#2a9865] transition-all px-6 py-3 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Create Event as Organizer
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-5xl mx-auto">
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 bg-[rgba(50,179,119,0.1)] rounded-2xl flex items-center justify-center mb-8">
                <Calendar className="w-10 h-10 text-[#32b377]" />
              </div>
              <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-3xl mb-3">
                Manage your events on-chain
              </h2>
              <p className="text-[#87928e] text-lg font-['Inter:Regular',sans-serif] max-w-md mb-8 leading-relaxed">
                Connect your wallet to view events you've created, track ticket sales, and manage attendees.
              </p>
              <button
                onClick={connect}
                className="bg-[#32b377] hover:bg-[#2a9865] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-lg text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)] flex items-center gap-3"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
              <p className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif] mt-4">
                Works with Phantom, Solflare, and other Solana wallets
              </p>
            </motion.div>
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
              ) : events.length === 0 ? (
                <div className="p-6 bg-[#131615] border border-[#262b2a] rounded-2xl text-[#87928e] font-['Inter:Medium',sans-serif]">
                  No events found for this wallet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#131615] border border-[#262b2a] rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl">
                            {event.title}
                          </h3>
                          <p className="text-[#87928e] text-sm font-['Inter:Medium',sans-serif]">
                            {event.tier ?? 'General Admission'}
                          </p>
                        </div>
                        <div className="text-sm text-[#87928e]">
                          {event.available ?? 0}/{event.total ?? 0} left
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-[#87928e]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#32b377]" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#32b377]" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/events/${event.id}/attendees`}
                            className="inline-flex items-center gap-2 text-sm text-[#32b377] hover:text-[#2a9865]"
                          >
                            <Users className="w-4 h-4" />
                            View attendees
                          </Link>
                          <Link
                            to={`/purchase/${event.id}`}
                            className="text-sm text-[#87928e] hover:text-[#fafaf9]"
                          >
                            View as fan
                          </Link>
                        </div>
                        {event.eventPubkey && (
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            disabled={deleting === event.eventPubkey}
                            className="inline-flex items-center gap-1.5 text-sm text-[#87928e] hover:text-[#ff6464] transition-colors disabled:opacity-50"
                            title="Delete event from chain"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deleting === event.eventPubkey ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
