/**
 * ABOUT PAGE - DEEP DIVE INTO MATCHA
 * 
 * Content Strategy:
 * - Tell the story of why Matcha exists
 * - Compare to traditional ticketing problems
 * - Technical details for hackathon judges
 * - Team/project vision
 * - Solana integration highlights
 * 
 * Design Approach:
 * - Long-form content with visual breaks
 * - Comparison tables
 * - Technical architecture visualization
 * - Bold typography for key statements
 */

import { motion } from 'motion/react';
import { Navigation } from './Navigation';
import { Check, X, Shield, Zap, Users, Lock, TrendingUp, Code } from 'lucide-react';
import { useWallet, shortenAddress } from '../contexts/WalletContext';
import svgPaths from '../imports/svg-y53m400yen';

export function AboutPage() {
  const { connected, connecting, publicKey, balance, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen bg-[#090b0b] text-[#fafaf9]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-['Space_Grotesk:Bold',sans-serif] text-7xl mb-6 leading-tight">
              Ticketing <span className="text-[#32b377]">Reimagined</span> for Web3
            </h1>
            <p className="text-[#87928e] text-2xl leading-relaxed font-['Inter:Regular',sans-serif]">
              Matcha is rewriting the rules of live event ticketing. Built on Solana, 
              powered by fans, designed for fairness.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* The Problem Section */}
      <section className="py-16 px-8 bg-[#131615] border-y border-[#262b2a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-6">
              The Traditional Ticketing <span className="text-[#ff6464]">Problem</span>
            </h2>
            <p className="text-[#87928e] text-xl max-w-3xl mx-auto font-['Inter:Regular',sans-serif]">
              Centralized platforms, scalper bots, hidden fees, and artists getting shortchanged. 
              The current system is broken. We're fixing it.
            </p>
          </motion.div>
          
          {/* Comparison Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traditional Ticketing */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[rgba(255,100,100,0.05)] border border-[rgba(255,100,100,0.2)] rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[rgba(255,100,100,0.2)] rounded-xl flex items-center justify-center">
                  <X className="w-6 h-6 text-[#ff6464]" />
                </div>
                <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl">
                  Traditional Platforms
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Centralized control & single point of failure",
                  "Hidden fees reaching 30%+ per ticket",
                  "Scalper bots buy up inventory instantly",
                  "Paper tickets easily counterfeited",
                  "Artists get nothing from resales",
                  "No loyalty rewards for fans",
                  "Opaque pricing & fee structures",
                  "Days to settle payments"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-[#ff6464] shrink-0 mt-0.5" />
                    <span className="text-[#87928e] font-['Inter:Regular',sans-serif]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* Matcha Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[rgba(50,179,119,0.05)] border border-[rgba(50,179,119,0.2)] rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[rgba(50,179,119,0.2)] rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-[#32b377]" />
                </div>
                <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-2xl">
                  Matcha Platform
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Decentralized on Solana blockchain",
                  "Transparent 20% platform fee only",
                  "Anti-scalping built into smart contracts",
                  "NFT tickets - impossible to counterfeit",
                  "Artists earn 40% of all resales",
                  "Loyalty badges unlock early access",
                  "All fees visible upfront on-chain",
                  "Instant settlement in seconds"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#32b377] shrink-0 mt-0.5" />
                    <span className="text-[#fafaf9] font-['Inter:Regular',sans-serif]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Technical Architecture */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-[#32b377] text-sm font-['Inter:Medium',sans-serif] tracking-widest uppercase mb-4">
              TECHNICAL DEEP DIVE
            </div>
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-6">
              Built on <span className="text-[#32b377]">Solana</span>
            </h2>
            <p className="text-[#87928e] text-xl max-w-3xl mx-auto font-['Inter:Regular',sans-serif]">
              We chose Solana for its speed, low costs, and proven NFT ecosystem. 
              Here's how the tech stack comes together.
            </p>
          </motion.div>
          
          {/* Tech Stack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <Code className="w-6 h-6" />,
                title: "Smart Contracts",
                description: "Rust-based Solana programs enforce fair split logic, anti-scalping rules, and loyalty tier verification on-chain."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "NFT Standard",
                description: "Metaplex NFT standard for tickets with metadata for event details, seat info, and transfer history."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Sub-Second Finality",
                description: "Solana's 400ms block time means tickets mint, transfer, and resell in real-time with negligible fees."
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Wallet Integration",
                description: "Phantom, Solflare, and all SPL-compatible wallets work seamlessly. No custodial risk."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "On-Chain Reputation",
                description: "Loyalty badges stored as NFTs. Bronze, Silver, Gold tiers unlock progressively earlier access."
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Fair Resale Logic",
                description: "40/40/20 split enforced by smart contract. Artists auto-receive royalties on every secondary sale."
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#131615] border border-[#262b2a] rounded-2xl p-8 hover:border-[#32b377] transition-all"
              >
                <div className="w-12 h-12 bg-[rgba(50,179,119,0.1)] rounded-xl flex items-center justify-center mb-6">
                  <div className="text-[#32b377]">
                    {tech.icon}
                  </div>
                </div>
                <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-xl mb-3">
                  {tech.title}
                </h3>
                <p className="text-[#87928e] leading-relaxed font-['Inter:Regular',sans-serif]">
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Architecture Diagram (Text-based) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#131615] border border-[#262b2a] rounded-2xl p-12"
          >
            <h3 className="font-['Space_Grotesk:Bold',sans-serif] text-3xl mb-8 text-center">
              System Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-[rgba(50,179,119,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#32b377]" />
                </div>
                <h4 className="font-['Space_Grotesk:Bold',sans-serif] text-lg mb-2">Frontend</h4>
                <p className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
                  React + Wallet Adapter
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-[rgba(50,179,119,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-[#32b377]" />
                </div>
                <h4 className="font-['Space_Grotesk:Bold',sans-serif] text-lg mb-2">Smart Contracts</h4>
                <p className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
                  Solana Programs (Rust)
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-[rgba(50,179,119,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#32b377]" />
                </div>
                <h4 className="font-['Space_Grotesk:Bold',sans-serif] text-lg mb-2">Blockchain</h4>
                <p className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
                  Solana Mainnet
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Mission Statement */}
      <section className="py-24 px-8 bg-[#131615] border-y border-[#262b2a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-8 leading-tight">
              "We believe fans should come first, <br />
              <span className="text-[#32b377]">not scalpers or middlemen.</span>"
            </h2>
            <p className="text-[#87928e] text-xl leading-relaxed font-['Inter:Regular',sans-serif]">
              TicketChain is a consumer-grade, Web3-native ticketing platform that lets artists mint 
              fraud-proof tickets, set fair resale rules on-chain, and sell directly to fans—without 
              forcing users to understand crypto. It replaces opaque, centralized ticketing with 
              verifiable rules, seamless onboarding, and a mainstream app experience.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Key Metrics */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-4">
              Impact by the Numbers
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "< 0.001", label: "SOL per transaction", sublabel: "vs $5-15 traditional fees" },
              { value: "400ms", label: "Average block time", sublabel: "Instant finality" },
              { value: "40%", label: "To artists on resale", sublabel: "vs 0% traditional" },
              { value: "0%", label: "Scalping incentive", sublabel: "Anti-bot by design" }
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-3 text-[#32b377]">
                  {metric.value}
                </div>
                <div className="font-['Space_Grotesk:Bold',sans-serif] mb-2">
                  {metric.label}
                </div>
                <div className="text-[#87928e] text-sm font-['Inter:Regular',sans-serif]">
                  {metric.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-24 px-8 border-t border-[#262b2a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Space_Grotesk:Bold',sans-serif] text-5xl mb-6">
              Built at a hackathon. <br />
              <span className="text-[#32b377]">Ready for the world.</span>
            </h2>
            <p className="text-[#87928e] text-xl mb-10 font-['Inter:Regular',sans-serif]">
              This is just the beginning. Join us in revolutionizing live events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {connected && publicKey ? (
                <div className="flex items-center gap-4 bg-[#131615] border border-[#262b2a] px-8 py-4 rounded-xl">
                  <span className="font-['Inter:Medium',sans-serif] text-lg text-[#87928e]">
                    {shortenAddress(publicKey)}
                  </span>
                  <span className="font-['Inter:Medium',sans-serif] text-lg text-[#32b377]">
                    ◎ {balance}
                  </span>
                  <button
                    onClick={disconnect}
                    className="bg-[#262b2a] hover:bg-[#1a1e1d] transition-all px-6 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-lg text-[#fafaf9] border border-[#262b2a]"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="bg-[#32b377] hover:bg-[#2a9865] disabled:opacity-60 transition-all px-10 py-5 rounded-xl font-['Inter:Medium',sans-serif] text-lg text-[#090b0b] flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_0_30px_rgba(50,179,119,0.4)]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p323831} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.pc65f180} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </svg>
                  {connecting ? 'Connecting…' : 'Connect Wallet'}
                </button>
              )}
              <a
                href="https://github.com/Anirudhp196/TicketChain"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#262b2a] hover:border-[#32b377] transition-all px-10 py-5 rounded-xl font-['Inter:Medium',sans-serif] text-lg text-[#fafaf9] hover:bg-[rgba(50,179,119,0.05)] text-center"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}