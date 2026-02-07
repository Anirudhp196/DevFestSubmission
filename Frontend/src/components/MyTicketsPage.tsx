/**
 * MY TICKETS PAGE - VIEW OWNED TICKETS
 *
 * Purpose:
 * - Show tickets purchased by connected wallet
 * - Link to attendee list for each event
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { Calendar, Ticket, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTickets } from '../lib/api';
import { useWallet, shortenAddress } from '../contexts/WalletContext';
import type { Ticket as TicketType } from '../types';

export function MyTicketsPage() {
  const { connected, publicKey, connect } = useWallet();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyTickets(publicKey)
      .then((data) => {
        if (!cancelled) setTickets(data);
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
              ) : tickets.length === 0 ? (
                <div className="p-6 bg-[#131615] border border-[#262b2a] rounded-2xl text-[#87928e] font-['Inter:Medium',sans-serif]">
                  No tickets yet. Buy one from the events page.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-[#131615] border border-[#262b2a] rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl">
                            {ticket.event}
                          </h3>
                          <p className="text-[#87928e] text-sm font-['Inter:Medium',sans-serif]">
                            {ticket.artist} • {ticket.tier}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[rgba(50,179,119,0.1)] flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-[#32b377]" />
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-[#87928e]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#32b377]" />
                          <span>{ticket.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Paid</span>
                          <span className="text-[#fafaf9]">{ticket.purchasePrice} SOL</span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        {ticket.eventId != null && (
                          <Link
                            to={`/events/${ticket.eventId}/attendees`}
                            className="inline-flex items-center gap-2 text-sm text-[#32b377] hover:text-[#2a9865]"
                          >
                            <Users className="w-4 h-4" />
                            View attendees
                          </Link>
                        )}
                        <Link
                          to="/list-ticket"
                          className="ml-auto text-sm text-[#87928e] hover:text-[#fafaf9]"
                        >
                          List for resale
                        </Link>
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
