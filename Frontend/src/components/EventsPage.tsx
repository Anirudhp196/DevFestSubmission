/**
 * EVENTS PAGE - BROWSE AND DISCOVER
 * 
 * Design Features:
 * - Card-based layout with hover animations
 * - Filter/search functionality (visual only)
 * - Event cards with gradient overlays
 * - Live status indicators
 * - Data from API client (mock until backend)
 * 
 * Engagement Strategy:
 * - High-quality event imagery
 * - Clear CTAs on each card
 * - Price and availability prominently displayed
 * - Loyalty badge indicators for early access
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Calendar, MapPin, Users, Star, TrendingUp, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEvents } from '../lib/api';
import { useWallet } from '../contexts/WalletContext';
import type { Event } from '../types';

export function EventsPage() {
  const { publicKey } = useWallet();
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ location: '', minAvailable: '', maxPrice: '' });
  const [tempFilters, setTempFilters] = useState({ location: '', minAvailable: '', maxPrice: '' });

  const parseEventDate = (dateString: string) => {
    const parsed = new Date(dateString);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvents()
      .then((data) => { if (!cancelled) { setEvents(data); setAllEvents(data); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load events'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // update filtered events when query/filters change
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const loc = filters.location.trim().toLowerCase();
    const minAvail = filters.minAvailable ? Number(filters.minAvailable) : null;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = allEvents.filter((e) => {
      const eventDate = parseEventDate(e.date);
      if (eventDate && eventDate < today) return false;
      const inQuery = !q || [e.title, e.organizer, e.location].some((s) => String(s).toLowerCase().includes(q));
      if (!inQuery) return false;
      if (loc && !String(e.location).toLowerCase().includes(loc)) return false;
      if (minAvail != null && !Number.isNaN(minAvail)) {
        const available = e.available ?? e.total ?? null;
        if (available == null) return false;
        if (Number(available) < minAvail) return false;
      }
      if (maxPrice != null && !Number.isNaN(maxPrice) && (Number(e.price ?? 0) > maxPrice)) return false;
      return true;
    });

    const sorted = filtered.sort((a, b) => {
      const dateA = parseEventDate(a.date);
      const dateB = parseEventDate(b.date);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });

    setEvents(sorted);
  }, [query, filters, allEvents]);

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
              Discover <span className="text-[#32b377]">Live Events</span>
            </h1>
            <p className="text-[#87928e] text-xl font-['Inter:Regular',sans-serif] max-w-2xl">
              Browse upcoming events, sports, festivals, and more. All tickets are NFTs on Solana - fraud-proof, transferable, and fair.
            </p>
          </motion.div>
          
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#87928e]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, organizers, venues..."
                className="w-full bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-xl pl-12 pr-4 py-3.5 text-[#fafaf9] placeholder-[#87928e] focus:border-[#32b377] focus:outline-none transition-colors font-['Inter:Regular',sans-serif]"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setTempFilters(filters);
                  setShowFilters((prev) => !prev);
                }}
                className="flex items-center gap-2 bg-[rgba(38,43,42,0.5)] border border-[#262b2a] rounded-xl px-6 py-3.5 hover:border-[#32b377] transition-colors font-['Inter:Medium',sans-serif]"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              {showFilters && (
                <div className="absolute right-0 mt-3 w-80 bg-[#090b0b] border border-[#16201f] rounded-xl p-4 z-50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-['Space_Grotesk:Bold',sans-serif]">Filters</h3>
                    <button onClick={() => { setShowFilters(false); }} className="text-sm text-[#87928e]">Close</button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-[#87928e] block mb-1">Location</label>
                      <input
                        value={tempFilters.location}
                        onChange={(e) => setTempFilters({ ...tempFilters, location: e.target.value })}
                        placeholder="City, venue, etc."
                        className="w-full bg-[#07100f] border border-[#16201f] rounded-lg px-3 py-2 text-[#fafaf9]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#87928e] block mb-1">Minimum tickets available</label>
                      <input
                        value={tempFilters.minAvailable}
                        onChange={(e) => setTempFilters({ ...tempFilters, minAvailable: e.target.value })}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 10"
                        className="w-full bg-[#07100f] border border-[#16201f] rounded-lg px-3 py-2 text-[#fafaf9]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#87928e] block mb-1">Max price (SOL)</label>
                      <input
                        value={tempFilters.maxPrice}
                        onChange={(e) => setTempFilters({ ...tempFilters, maxPrice: e.target.value })}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g. 1.5"
                        className="w-full bg-[#07100f] border border-[#16201f] rounded-lg px-3 py-2 text-[#fafaf9]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setTempFilters({ location: '', minAvailable: '', maxPrice: '' });
                        setFilters({ location: '', minAvailable: '', maxPrice: '' });
                      }}
                      className="px-3 py-2 rounded-lg border border-[#16201f] text-[#87928e]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        setFilters(tempFilters);
                        setShowFilters(false);
                      }}
                      className="px-3 py-2 rounded-lg bg-[#32b377] text-[#090b0b]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Events Grid */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.3)] rounded-xl text-[#ff6464] font-['Inter:Medium',sans-serif]">
              {error}
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-[#131615] border border-[#262b2a] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl overflow-hidden hover:border-[#32b377] transition-all group"
              >
                <div className="block">
                {/* Event Image - Using unsplash for real event photos */}
                <div className="relative h-48 bg-linear-to-br from-[#32b377] to-[#1a6a4a] overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[rgba(50,179,119,0.2)] backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-[rgba(50,179,119,0.4)]">
                        <Calendar className="w-8 h-8 text-[#32b377]" />
                      </div>
                      <div className="text-[#fafaf9] font-['Space_Grotesk:Bold',sans-serif] text-sm">
                        {event.date}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-['Inter:Medium',sans-serif] ${
                      event.status === 'Almost Sold Out' 
                        ? 'bg-[rgba(255,100,100,0.2)] text-[#ff6464] border border-[rgba(255,100,100,0.3)]'
                        : event.status === 'Early Access'
                        ? 'bg-[rgba(255,200,100,0.2)] text-[#ffc864] border border-[rgba(255,200,100,0.3)]'
                        : 'bg-[rgba(50,179,119,0.2)] text-[#32b377] border border-[rgba(50,179,119,0.3)]'
                    }`}>
                      {event.status}
                    </div>
                  </div>
                  
                  {/* Your Event Badge */}
                  {publicKey && event.organizerPubkey === publicKey && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="px-3 py-1.5 rounded-full bg-[rgba(99,102,241,0.25)] border border-[rgba(99,102,241,0.4)] backdrop-blur-sm flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-[#818cf8] fill-[#818cf8]" />
                        <span className="text-[#a5b4fc] text-xs font-['Inter:Medium',sans-serif]">
                          Your Event
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Loyalty Badge Requirement */}
                  {event.loyaltyRequired && (
                    <div className={`absolute ${publicKey && event.organizerPubkey === publicKey ? 'top-12 left-4' : 'top-4 left-4'}`}>
                      <div className="px-3 py-1.5 rounded-full bg-[rgba(255,200,100,0.2)] border border-[rgba(255,200,100,0.3)] flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-[#ffc864] fill-[#ffc864]" />
                        <span className="text-[#ffc864] text-xs font-['Inter:Medium',sans-serif]">
                          {event.loyaltyRequired}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Event Details */}
                <div className="p-6">
                  <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-2 group-hover:text-[#32b377] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-[#87928e] text-sm mb-4 font-['Inter:Medium',sans-serif]">
                    {event.organizer}
                  </p>
                  
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-[#87928e] text-sm">
                      <MapPin className="w-4 h-4 text-[#32b377]" />
                      <span className="font-['Inter:Regular',sans-serif]">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#87928e] text-sm">
                      <Users className="w-4 h-4 text-[#32b377]" />
                      <span className="font-['Inter:Regular',sans-serif]">
                        {event.available ?? 0} / {event.total ?? 0} available
                      </span>
                    </div>
                  </div>
                  
                  {/* Availability Bar */}
                  <div className="mb-5">
                    <div className="h-1.5 bg-[rgba(38,43,42,0.5)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-[#32b377] to-[#2a9865] rounded-full transition-all"
                        style={{ width: `${((event.available ?? 0) / (event.total ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[#87928e] text-xs mb-1 font-['Inter:Regular',sans-serif]">Starting at</div>
                      <div className="font-['Space_Grotesk:Bold',sans-serif] text-2xl text-[#32b377]">
                        {event.price} SOL
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        to={`/purchase/${event.id}`}
                        className="inline-block bg-[#32b377] hover:bg-[#2a9865] transition-all px-6 py-3 rounded-xl font-['Inter:Medium',sans-serif] text-sm text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)]"
                      >
                        Get Tickets
                      </Link>
                      <Link
                        to={`/events/${event.id}/attendees`}
                        className="block w-full text-right text-xs text-[#87928e] hover:text-[#32b377] transition-colors font-['Inter:Regular',sans-serif]"
                      >
                        View attendees
                      </Link>
                    </div>
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="border-t border-[#262b2a] py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-4xl mb-4">
              Can't find your event?
            </h2>
            <p className="text-[#87928e] text-lg mb-8 font-['Inter:Regular',sans-serif]">
              Organizers can create events and mint tickets in minutes. No middlemen, no delays.
            </p>
            <Link 
              to="/create-event"
              className="bg-[#32b377] hover:bg-[#2a9865] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)]"
            >
              Create Event as Organizer
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}