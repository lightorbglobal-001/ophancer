import React from 'react';
import { Send, ArrowUp } from 'lucide-react';
import Logo from './Logo';

export default function Footer({ setActivePage, settings }) {
  const handleNav = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0E121B] text-white border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <button 
              onClick={() => handleNav('home')}
              className="text-left focus:outline-none transition-transform active:scale-95"
              aria-label="Ophancer Home"
            >
              <Logo isLight={true} size="md" showTag={true} />
            </button>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Opportunity Enhancer. A technology platform indexing formal job openings, freelance contracts, and public client requests across Nigeria, Africa, and global remote channels.
            </p>
          </div>

          {/* About us Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              About us
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors whitespace-nowrap">
                  Ophancer Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('cv-services')} className="hover:text-white transition-colors whitespace-nowrap">
                  Professional CV Services
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('ats-checker')} className="hover:text-white transition-colors whitespace-nowrap">
                  Free In-Browser ATS Scanner
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('admin')} className="text-slate-500 hover:text-white transition-colors whitespace-nowrap">
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Resource Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Resource
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('opportunities')} className="hover:text-white transition-colors whitespace-nowrap">
                  Directory Listings
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('submit')} className="hover:text-white transition-colors whitespace-nowrap">
                  Submit an Opportunity
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors whitespace-nowrap">
                  Privacy Policy (Zero Storage)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors whitespace-nowrap">
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Address & Channels Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Channels &amp; Community
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nigeria &bull; Pan-African Hubs &bull; Global Remote
            </p>
            <div className="pt-2">
              <a
                href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 whitespace-nowrap flex-shrink-0 active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 flex-shrink-0 text-[#857FF7]" />
                <span className="whitespace-nowrap">Join Official Telegram</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Centered Copyright Bottom Bar */}
      <div className="border-t border-white/10 py-5 px-4 sm:px-8 relative flex items-center justify-center">
        <p className="text-xs text-slate-400 font-medium text-center">
          &copy; {new Date().getFullYear()} Copyright Ophancer. All rights reserved.
        </p>

        {/* Scroll to Top Arrow */}
        <button
          onClick={scrollToTop}
          className="absolute right-4 sm:right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
