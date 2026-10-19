import React from 'react';
import { 
  Send, 
  ExternalLink 
} from 'lucide-react';
import Logo from './Logo';

export default function Footer({ setActivePage, settings }) {
  const handleNav = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0E121B] text-white border-t border-white/10 mt-20 relative overflow-hidden">
      {/* Subtle Ambient Radial Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-40 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(105, 98, 241, 0.35) 0%, transparent 70%)'
        }}
      />

      {/* Main Clean Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <button 
              onClick={() => handleNav('home')}
              className="text-left focus:outline-none transition-transform active:scale-95 cursor-pointer"
              aria-label="Ophancer Home"
            >
              <Logo isLight={true} size="md" showTag={true} />
            </button>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Automated opportunity discovery pipeline indexing corporate vacancies, freelance contracts, and verified direct client inquiries for Nigerian &amp; African talent.
            </p>

            {/* Telegram Community Pill */}
            <div className="pt-1">
              <a
                href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10 active:scale-95 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-[#857FF7]" />
                <span>Join Telegram Radar</span>
                <ExternalLink className="w-3 h-3 text-white/60" />
              </a>
            </div>
          </div>

          {/* Column 1: Opportunities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Opportunities
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => handleNav('opportunities')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  All Opportunities
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('opportunities')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Direct Client Gigs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('submit')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Submit an Opening
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Career Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => handleNav('cv-services')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Executive CV Writing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('ats-checker')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  ATS Resume Scanner
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('quote-maker')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Freelance Quote Maker
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => handleNav('about')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Ophancer
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('privacy')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('terms')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('admin')} 
                  className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer text-left"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Clean Bottom Bar */}
      <div className="border-t border-white/10 py-5 px-4 sm:px-8 relative bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>&copy; {new Date().getFullYear()} Ophancer. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-slate-500">
              Real-Time Radar Active
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
