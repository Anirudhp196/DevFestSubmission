/**
 * NAVIGATION COMPONENT
 * 
 * Design Decisions:
 * - Glass-morphism effect for modern, premium look
 * - Sticky positioning for constant access
 * - Animated hover states for interactivity
 * - Brand green accent color (#32b377) for brand consistency
 * - Wallet connection CTA prominently displayed (Solana Wallet Adapter)
 */

import { Link, useLocation } from 'react-router-dom';
import svgPaths from '../imports/svg-y53m400yen';
import { useWallet, shortenAddress } from '../contexts/WalletContext';

export function Navigation() {
  const location = useLocation();
  const { connected, connecting, publicKey, balance, connect, disconnect } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(9,11,11,0.8)] backdrop-blur-xl border-b border-[#262b2a]">
      <div className="max-w-[1512px] mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[#32b377] rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-[#090b0b] font-bold">T</span>
          </div>
          <span className="text-[#fafaf9] font-['Space_Grotesk:Bold',sans-serif] text-xl">
            TicketChain
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/events"
            className={`font-['Inter:Medium',sans-serif] text-sm transition-colors ${
              isActive('/events') ? 'text-[#32b377]' : 'text-[#87928e] hover:text-[#fafaf9]'
            }`}
          >
            Events
          </Link>
          <Link
            to="/marketplace"
            className={`font-['Inter:Medium',sans-serif] text-sm transition-colors ${
              isActive('/marketplace') ? 'text-[#32b377]' : 'text-[#87928e] hover:text-[#fafaf9]'
            }`}
          >
            Marketplace
          </Link>
          <Link
            to="/my-tickets"
            className={`font-['Inter:Medium',sans-serif] text-sm transition-colors ${
              isActive('/my-tickets') ? 'text-[#32b377]' : 'text-[#87928e] hover:text-[#fafaf9]'
            }`}
          >
            My Tickets
          </Link>
          <Link
            to="/manage-events"
            className={`font-['Inter:Medium',sans-serif] text-sm transition-colors ${
              isActive('/manage-events') ? 'text-[#32b377]' : 'text-[#87928e] hover:text-[#fafaf9]'
            }`}
          >
            Manage Events
          </Link>
          <Link
            to="/about"
            className={`font-['Inter:Medium',sans-serif] text-sm transition-colors ${
              isActive('/about') ? 'text-[#32b377]' : 'text-[#87928e] hover:text-[#fafaf9]'
            }`}
          >
            About
          </Link>

          {connected && publicKey ? (
            <div className="flex items-center gap-3">
              <span className="font-['Inter:Medium',sans-serif] text-sm text-[#87928e]">
                {shortenAddress(publicKey)}
              </span>
              <span className="font-['Inter:Medium',sans-serif] text-sm text-[#32b377]">
                ◎ {balance}
              </span>
              <button
                onClick={disconnect}
                className="bg-[#262b2a] hover:bg-[#1a1e1d] transition-all px-4 py-2 rounded-lg font-['Inter:Medium',sans-serif] text-sm text-[#fafaf9] border border-[#262b2a]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="bg-[#32b377] hover:bg-[#2a9865] disabled:opacity-60 transition-all px-6 py-2.5 rounded-lg font-['Inter:Medium',sans-serif] text-sm text-[#090b0b] flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(50,179,119,0.3)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d={svgPaths.p323831} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d={svgPaths.pc65f180} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
              {connecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}