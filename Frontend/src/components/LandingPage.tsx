/**
 * LANDING PAGE - MAIN ENTRY POINT
 * 
 * Design Strategy for Hackathon Impact:
 * 1. Immediate visual impact with animated hero section
 * 2. Clear value proposition above the fold
 * 3. Animated statistics for credibility
 * 4. Feature cards with hover effects for engagement
 * 5. Progressive disclosure - guide user through the story
 * 
 * Technical Choices:
 * - Motion animations for smooth, professional feel
 * - Gradient backgrounds for depth
 * - Micro-interactions on hover for delight
 * - Dark theme optimized for Web3 aesthetic
 */

import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import svgPaths from '../imports/svg-y53m400yen';
import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Shield, Users, Zap, Star, TrendingUp } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
      <Navigation />
      
      {/* HERO SECTION - The attention grabber */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            backgroundImage: "linear-gradient(rgba(50, 179, 119, 0.03) 1.5625%, rgba(50, 179, 119, 0) 1.5625%), linear-gradient(90deg, rgba(50, 179, 119, 0.03) 1.5625%, rgba(50, 179, 119, 0) 1.5625%)",
            backgroundSize: "64px 64px"
          }}
        />
        
        {/* Radial Gradient Glow Effect */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(50,179,119,0.15) 0%, rgba(50,179,119,0) 50%)" 
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge - "Built on Solana" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] mb-6"
          >
            <div className="w-2 h-2 bg-[#32b377] rounded-full animate-pulse" />
            <span className="text-[#32b377] text-sm font-['Inter:Medium',sans-serif] tracking-wide">
              BUILT ON SOLANA
            </span>
          </motion.div>
          
          {/* Main Headline - The hook */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-['Space_Grotesk:Bold',sans-serif] text-7xl mb-4 leading-tight"
          >
            Fair Tickets.
            <br />
            <span className="text-[#32b377]">Real Fans.</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#87928e] text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-['Inter:Regular',sans-serif]"
          >
            TicketChain is a decentralized event ticketing platform where every ticket
            is an NFT, loyalty is rewarded, and scalpers are left behind.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-4 justify-center mb-16"
          >
            <Link 
              to="/events"
              className="bg-[#32b377] hover:bg-[#2a9865] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#090b0b] flex items-center gap-2 shadow-lg hover:shadow-[0_0_30px_rgba(50,179,119,0.4)] transform hover:scale-105"
            >
              Browse Events
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/about"
              className="border border-[#262b2a] hover:border-[#32b377] transition-all px-8 py-4 rounded-xl font-['Inter:Medium',sans-serif] text-[#fafaf9] hover:bg-[rgba(50,179,119,0.05)]"
            >
              Learn More
            </Link>
          </motion.div>
          
          {/* Key Metrics - Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: "10K+", label: "Tickets Minted", icon: Ticket },
              { value: "40/40/20", label: "Fair Resale Split", icon: TrendingUp },
              { value: "< 0.001", label: "SOL per Transaction", icon: Zap }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-[rgba(38,43,42,0.3)] backdrop-blur-sm border border-[#262b2a] rounded-xl p-6 hover:border-[#32b377] transition-all"
              >
                <stat.icon className="w-6 h-6 text-[#32b377] mx-auto mb-3" />
                <div className="font-['Space_Grotesk:Bold',sans-serif] text-3xl mb-2">
                  {stat.value}
                </div>
                <div className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-[#32b377] rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-[#32b377] rounded-full" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* FEATURES SECTION - Reimagined design */}
      <section className="relative bg-[#131615] border-t border-[#262b2a] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-[#32b377] text-sm font-['Inter:Medium',sans-serif] tracking-widest uppercase mb-4">
              FEATURES
            </div>
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-4">
              Ticketing, reimagined
            </h2>
            <p className="text-[#87928e] text-lg max-w-2xl mx-auto font-['Inter:Regular',sans-serif]">
              Built from the ground up to solve the problems that plague traditional
              ticketing. Transparent, fair, and fan-first.
            </p>
          </motion.div>
          
          {/* Feature Grid - 3x2 layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Ticket className="w-6 h-6" />,
                title: "NFT Tickets",
                description: "Every ticket is minted as an NFT on Solana, verifiable on-chain and stored in your wallet. No fakes, no duplicates.",
                color: "#32b377"
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "Loyalty Badges",
                description: "Earn loyalty badges by attending events. Bronze, Silver, and Gold tiers unlock early access to future ticket drops.",
                color: "#32b377"
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Fair Marketplace",
                description: "Resale profits are split 40% artist, 40% seller, 20% platform. Scalping incentives are structurally eliminated.",
                color: "#32b377"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Anti-Scalping",
                description: "On-chain cooldowns, per-address caps, and loyalty gating ensure tickets reach real fans, not bots.",
                color: "#32b377"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Settlement",
                description: "Solana's sub-second finality means purchases, transfers, and resales settle immediately. No stuck transactions.",
                color: "#32b377"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Role-Based Access",
                description: "Artists manage events and track sales. Fans browse, buy, earn loyalty, and resell. Each role gets a tailored experience.",
                color: "#32b377"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="bg-[#090b0b] border border-[#262b2a] rounded-2xl p-8 hover:border-[#32b377] transition-all group"
              >
                <div className="w-12 h-12 bg-[rgba(50,179,119,0.1)] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[rgba(50,179,119,0.2)] transition-colors">
                  <div className="text-[#32b377]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#87928e] leading-relaxed font-['Inter:Regular',sans-serif]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* HOW IT WORKS SECTION */}
      <section className="relative py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-[#32b377] text-sm font-['Inter:Medium',sans-serif] tracking-widest uppercase mb-4">
              HOW IT WORKS
            </div>
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl">
              From wallet to front row
            </h2>
          </motion.div>
          
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Connect Your Wallet",
                description: "Link your Solana-based Phantom, Solflare, or any compatible wallet to get started."
              },
              {
                number: "02",
                title: "Choose Your Role",
                description: "Sign up as an artist to create events and sell tickets, or fan to browse and buy."
              },
              {
                number: "03",
                title: "Buy or Create Events",
                description: "Artists set up events with ticket tiers and pricing. Fans purchase NFT tickets instantly."
              },
              {
                number: "04",
                title: "Earn & Unlock",
                description: "Attend events to earn loyalty badges. Higher tiers unlock early access to future drops."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-[#32b377] text-7xl font-['Space_Grotesk:Bold',sans-serif] opacity-10 mb-4">
                  {step.number}
                </div>
                <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-[#87928e] leading-relaxed font-['Inter:Regular',sans-serif]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FOOTER CTA */}
      <section className="relative border-t border-[#262b2a] py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-6">
              Ready to experience <span className="text-[#32b377]">fair ticketing</span>?
            </h2>
            <p className="text-[#87928e] text-xl mb-10 font-['Inter:Regular',sans-serif]">
              Join the revolution. No more scalpers, no more fraud, just you and the music.
            </p>
            <Link 
              to="/events"
              className="inline-flex items-center gap-3 bg-[#32b377] hover:bg-[#2a9865] transition-all px-10 py-5 rounded-xl font-['Inter:Medium',sans-serif] text-lg text-[#090b0b] shadow-lg hover:shadow-[0_0_30px_rgba(50,179,119,0.4)] transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-[#262b2a] py-8 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#32b377] rounded-full flex items-center justify-center">
              <span className="text-[#090b0b] font-bold">T</span>
            </div>
            <span className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
              Fair event ticketing on Solana. Built by fans, for fans.
            </span>
          </div>
          <div className="flex gap-6 text-[#87928e] text-sm">
            <a href="#" className="hover:text-[#32b377] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#32b377] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[#32b377] transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}