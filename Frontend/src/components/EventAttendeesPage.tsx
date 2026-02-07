/**
 * EVENT ATTENDEES PAGE
 *
 * Purpose:
 * - Show wallets that purchased tickets for an event
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Users, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getEvent, getEventAttendees } from '../lib/api';
import type { Event } from '../types';

interface Attendee {
  wallet: string;
  tickets: number;
}

export function EventAttendeesPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getEvent(eventId), getEventAttendees(eventId)])
      .then(([eventData, attendeeData]) => {
        if (cancelled) return;
        setEvent(eventData);
        setAttendees(attendeeData.attendees ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load attendees');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
      <Navigation />

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
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-4">
              Attendees <span className="text-[#32b377]">List</span>
            </h1>
            <p className="text-[#87928e] text-lg font-['Inter:Regular',sans-serif]">
              {event ? event.title : 'Event'} — wallets that purchased tickets.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] font-['Inter:Medium',sans-serif]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="h-48 bg-[#131615] border border-[#262b2a] rounded-2xl animate-pulse" />
          ) : attendees.length === 0 ? (
            <div className="p-6 bg-[#131615] border border-[#262b2a] rounded-2xl text-[#87928e] font-['Inter:Medium',sans-serif]">
              No attendees yet.
            </div>
          ) : (
            <div className="space-y-4">
              {attendees.map((attendee) => (
                <div
                  key={attendee.wallet}
                  className="flex items-center justify-between bg-[#131615] border border-[#262b2a] rounded-xl p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(50,179,119,0.1)] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#32b377]" />
                    </div>
                    <div className="text-sm text-[#fafaf9] font-mono">
                      {attendee.wallet}
                    </div>
                  </div>
                  <div className="text-sm text-[#87928e]">
                    {attendee.tickets} ticket{attendee.tickets === 1 ? '' : 's'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
