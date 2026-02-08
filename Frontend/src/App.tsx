/**
 * TICKETCHAIN - Web3 Event Ticketing Platform
 * 
 * Main App Component with Multi-Page Routing
 * Built for Hackathon Submission
 * 
 * ARCHITECTURE:
 * - React Router for multi-page navigation
 * - All pages accessible via single URL with routes
 * - Animated transitions for premium feel
 * - Responsive design for mobile and desktop
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SolanaProviders } from './components/SolanaProviders';
import { WalletProvider } from './contexts/WalletContext';
import { LandingPage } from './components/LandingPage';
import { EventsPage } from './components/EventsPage';
import { MarketplacePage } from './components/MarketplacePage';
import { AboutPage } from './components/AboutPage';
import { CreateEventPage } from './components/CreateEventPage';
import { PurchaseTicketPage } from './components/PurchaseTicketPage';
import { ListTicketPage } from './components/ListTicketPage';
import { MyTicketsPage } from './components/MyTicketsPage';
import { EventAttendeesPage } from './components/EventAttendeesPage';
import { ManageEventsPage } from './components/ManageEventsPage';

export default function App() {
  return (
    <SolanaProviders>
      <WalletProvider>
        <Router>
      <Routes>
        {/* Main landing page - the wow factor entry point */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Browse all events */}
        <Route path="/events" element={<EventsPage />} />
        
        {/* Ticket marketplace with resale */}
        <Route path="/marketplace" element={<MarketplacePage />} />
        
        {/* About TicketChain - deep dive into features */}
        <Route path="/about" element={<AboutPage />} />
        
        {/* Organizer flow - create new events */}
        <Route path="/create-event" element={<CreateEventPage />} />

        {/* Organizer flow - manage events */}
        <Route path="/manage-events" element={<ManageEventsPage />} />
        
        {/* Purchase ticket flow */}
        <Route path="/purchase/:eventId" element={<PurchaseTicketPage />} />

        {/* Attendees list for an event */}
        <Route path="/events/:eventId/attendees" element={<EventAttendeesPage />} />
        
        {/* List tickets for resale */}
        <Route path="/list-ticket" element={<ListTicketPage />} />

        {/* View owned tickets */}
        <Route path="/my-tickets" element={<MyTicketsPage />} />
      </Routes>
        </Router>
      </WalletProvider>
    </SolanaProviders>
  );
}