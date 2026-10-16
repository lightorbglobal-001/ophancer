import React from 'react';
import { 
  Send, 
  ArrowUp, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase, 
  Target, 
  Mail,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
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
    <footer className="bg-[#0E121B] text-white border-t border-white/10 mt-20 relative overflow-hidden">
      {/* Subtle Ambient Radial Glow in background (keeps exact same dark color, subtle atmospheric depth) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(105, 98, 241, 0.35) 0%, transparent 70%)'
        }}
      />

      {/* Top Quick Bar: Live Radar Pulse & Community Dispatch */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">
              Real-Time Opportunity Radar Active
            </span>
            <span className="text-slate-400 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Syncing every 5 minutes across Abuja, Lagos &amp; Remote channels
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <a
              href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all border border-white/10 active:scale-95 cursor-pointer shadow-xs"
            >
              <Send className="w-3 h-3 text-[#857FF7]" />
              <span>@OphancerAlerts Channel</span>
            </a>
            <a
              href="https://t.me/OphancerAlertsBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6962F1] hover:bg-[#5b54e0] text-white text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>VIP Alerts Bot</span>
              <ExternalLink className="w-3 h-3 text-white/80" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand & Mission Column (Span 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <button 
              onClick={() => handleNav('home')}
              className="text-left focus:outline-none transition-transform active:scale-95 cursor-pointer"
              aria-label="Ophancer Home"
            >
              <Logo isLight={true} size="md" showTag={true} />
            </button>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Opportunity Enhancer. Nigeria's premier automated lead discovery pipeline, indexing verified corporate vacancies, freelance contracts, and direct client buyer inquiries.
            </p>

            {/* Platform Feature Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Leads Only</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                <ShieldCheck className="w-3 h-3 text-[#857FF7]" />
                <span>Zero Data Storage</span>
              </span>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <a href="mailto:support@ophancer.com" className="hover:text-white transition-colors">
                support@ophancer.com
              </a>
            </div>
          </div>

          {/* Column 2: Opportunities & Radar (Span 3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#6962F1]" />
              <span>Opportunities</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => handleNav('opportunities')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Verified Corporate Vacancies</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('opportunities')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Direct Client Radar</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    LIVE
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('submit')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Submit an Opening</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('opportunities')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Abuja &amp; Lagos Roles</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('opportunities')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Global Remote Gigs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Career Services (Span 3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#6962F1]" />
              <span>Career Services</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => handleNav('cv-services')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Executive CV Writing</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('ats-checker')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>In-Browser ATS Scanner</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    FREE
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('quote-maker')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Instant Freelance Quote Maker</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    PRO
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('about')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>About Ophancer System</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Community (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6962F1]" />
              <span>Trust &amp; Legal</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => handleNav('privacy')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('terms')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('contact')} 
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Contact Support</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('admin')} 
                  className="text-slate-600 hover:text-slate-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Clean Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-8 relative bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Ophancer. All rights reserved.</span>
            <span className="hidden md:inline text-slate-600 ml-2">&bull; Empowering Nigerian &amp; African Talent</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              WAT Timezone &bull; 24/7 Radar
            </span>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-[11px] font-semibold active:scale-95 cursor-pointer shadow-xs border border-white/10"
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3 text-slate-300" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
