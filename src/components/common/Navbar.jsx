import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Send, 
  ChevronDown, 
  FileText, 
  ScanLine,
  Radio,
  Calculator,
  Briefcase,
  Target
} from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ activePage, setActivePage, settings, onOpenTelegramAlerts }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [oppsDropdownOpen, setOppsDropdownOpen] = useState(false);
  const [oppsMobileOpen, setOppsMobileOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [servicesMobileOpen, setServicesMobileOpen] = useState(false);
  
  const oppsDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close desktop dropdowns on outside click or escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (oppsDropdownRef.current && !oppsDropdownRef.current.contains(e.target)) {
        setOppsDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target)) {
        setServicesDropdownOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOppsDropdownOpen(false);
        setServicesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    setOppsDropdownOpen(false);
    setServicesDropdownOpen(false);
    setOppsMobileOpen(false);
    setServicesMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHeroOverlay = activePage === 'home' && !isScrolled;
  const isOppsActive = activePage === 'opportunities' || activePage === 'lead-inbox' || activePage === 'opportunity-detail';
  const isServicesActive = activePage === 'cv-services' || activePage === 'ats-checker' || activePage === 'quote-maker';

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 h-[74px] transition-all duration-300 ${
        isHeroOverlay 
          ? 'bg-black/25 backdrop-blur-[12px] border-b border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.15)]' 
          : 'bg-white/95 backdrop-blur-[16px] border-b border-slate-100 text-[#0E121B] shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-6">
        
        {/* Brand Logo on Left */}
        <button 
          onClick={() => handleNav('home')}
          className="flex-shrink-0 text-left focus:outline-none transition-transform active:scale-95 cursor-pointer"
          aria-label="Ophancer Home"
        >
          <Logo isLight={isHeroOverlay} size="md" />
        </button>

        {/* Center Desktop Navigation: Exactly 4 Clean Items */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-8 flex-shrink-0">
          
          {/* 1. Opportunities */}
          <button
            onClick={() => handleNav('opportunities')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 text-[14px] transition-all duration-200 cursor-pointer py-2 ${
              isHeroOverlay
                ? (isOppsActive 
                    ? 'text-white font-bold drop-shadow-sm' 
                    : 'text-white/85 hover:text-white font-medium hover:drop-shadow-sm')
                : (isOppsActive 
                    ? 'text-[#6962F1] font-semibold' 
                    : 'text-[#2D3139] hover:text-[#6962F1] font-medium')
            }`}
          >
            <span>Opportunities</span>
          </button>

          {/* 2. Career Services (CV Services + Free ATS Scanner + Quote Maker) */}
          <div 
            ref={servicesDropdownRef}
            className="relative"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <button
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              aria-expanded={servicesDropdownOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 text-[14px] transition-all duration-200 cursor-pointer py-2 ${
                isHeroOverlay
                  ? (isServicesActive 
                      ? 'text-white font-bold drop-shadow-sm' 
                      : 'text-white/85 hover:text-white font-medium hover:drop-shadow-sm')
                  : (isServicesActive 
                      ? 'text-[#6962F1] font-semibold' 
                      : 'text-[#2D3139] hover:text-[#6962F1] font-medium')
              }`}
            >
              <span>Career Services</span>
              <ChevronDown 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  servicesDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </button>

            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 z-50 min-w-[320px] animate-scale-in origin-top">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_16px_40px_rgba(14,18,27,0.12)] p-2 space-y-1">
                  
                  {/* Professional CV Writing */}
                  <button
                    onClick={() => handleNav('cv-services')}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      activePage === 'cv-services'
                        ? 'bg-[#EEF0FD] text-[#6962F1]'
                        : 'hover:bg-[#F8F9FE] text-[#0E121B]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#0E121B]">Professional CV Writing</div>
                      <p className="text-[11px] text-[#525866] leading-tight mt-0.5">
                        Human rewrite, ATS keywords &amp; WhatsApp consult
                      </p>
                    </div>
                  </button>

                  {/* Free ATS CV Scanner */}
                  <button
                    onClick={() => handleNav('ats-checker')}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      activePage === 'ats-checker'
                        ? 'bg-[#EEF0FD] text-[#6962F1]'
                        : 'hover:bg-[#F8F9FE] text-[#0E121B]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ScanLine className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>Free ATS CV Scanner</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">100% Free</span>
                      </div>
                      <p className="text-[11px] text-[#525866] leading-tight mt-0.5">
                        Instant in-browser resume score &amp; formatting audit
                      </p>
                    </div>
                  </button>

                  {/* Freelance Quote Maker */}
                  <button
                    onClick={() => handleNav('quote-maker')}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      activePage === 'quote-maker'
                        ? 'bg-[#EEF0FD] text-[#6962F1]'
                        : 'hover:bg-[#F8F9FE] text-[#0E121B]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#0E121B]">Freelance Quote Maker</div>
                      <p className="text-[11px] text-[#525866] leading-tight mt-0.5">
                        Generate polished client estimates &amp; PDF quotes
                      </p>
                    </div>
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* 3. Submit Job */}
          <button
            onClick={() => handleNav('submit')}
            className={`whitespace-nowrap flex-shrink-0 text-[14px] transition-all duration-200 cursor-pointer ${
              isHeroOverlay
                ? (activePage === 'submit' 
                    ? 'text-white font-bold drop-shadow-sm' 
                    : 'text-white/85 hover:text-white font-medium hover:drop-shadow-sm')
                : (activePage === 'submit' 
                    ? 'text-[#6962F1] font-semibold' 
                    : 'text-[#2D3139] hover:text-[#6962F1] font-medium')
            }`}
          >
            Submit Job
          </button>

          {/* 4. About */}
          <button
            onClick={() => handleNav('about')}
            className={`whitespace-nowrap flex-shrink-0 text-[14px] transition-all duration-200 cursor-pointer ${
              isHeroOverlay
                ? (activePage === 'about' 
                    ? 'text-white font-bold drop-shadow-sm' 
                    : 'text-white/85 hover:text-white font-medium hover:drop-shadow-sm')
                : (activePage === 'about' 
                    ? 'text-[#6962F1] font-semibold' 
                    : 'text-[#2D3139] hover:text-[#6962F1] font-medium')
            }`}
          >
            About
          </button>

        </nav>

        {/* Right Action: Pure Pill CTA */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center gap-2 h-[42px] px-6 rounded-full bg-[#605CF8] hover:bg-[#504CD7] text-white text-[14px] font-semibold whitespace-nowrap flex-shrink-0 transition-all shadow-[0_4px_16px_rgba(96,92,248,0.35)] hover:shadow-lg active:scale-95 border border-white/10"
          >
            <Send className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Join Telegram</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors focus:outline-none flex-shrink-0 cursor-pointer ${
              isHeroOverlay
                ? 'border border-white/20 text-white bg-white/10 backdrop-blur-md hover:bg-white/20'
                : 'border border-slate-200/60 text-[#0E121B] bg-white/70 backdrop-blur-md'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer: Exactly 4 Clean Categories */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-100 bg-white/95 backdrop-blur-xl px-6 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1.5">
            
            {/* 1. Opportunities */}
            <button
              onClick={() => handleNav('opportunities')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isOppsActive 
                  ? 'bg-[#EEF0FD] text-[#6962F1]' 
                  : 'text-[#0E121B] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#6962F1]" />
                <span>Opportunities</span>
              </div>
            </button>

            {/* 2. Freelance Quote Maker */}
            <button
              onClick={() => handleNav('quote-maker')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activePage === 'quote-maker' 
                  ? 'bg-[#EEF0FD] text-[#6962F1]' 
                  : 'text-[#0E121B] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>Freelance Quote Maker</span>
              </div>
              {activePage === 'quote-maker' && <span className="w-1.5 h-1.5 rounded-full bg-[#6962F1]"></span>}
            </button>

            {/* 3. Free ATS CV Scanner */}
            <button
              onClick={() => handleNav('ats-checker')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activePage === 'ats-checker' 
                  ? 'bg-[#EEF0FD] text-[#6962F1]' 
                  : 'text-[#0E121B] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-indigo-600" />
                <span>Free ATS CV Scanner</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">FREE</span>
            </button>

            {/* 4. Professional CV Writing */}
            <button
              onClick={() => handleNav('cv-services')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activePage === 'cv-services' 
                  ? 'bg-[#EEF0FD] text-[#6962F1]' 
                  : 'text-[#0E121B] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6962F1]" />
                <span>Professional CV Writing</span>
              </div>
              {activePage === 'cv-services' && <span className="w-1.5 h-1.5 rounded-full bg-[#6962F1]"></span>}
            </button>

            {/* 5. Submit Job */}
            <button
              onClick={() => handleNav('submit')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activePage === 'submit' 
                  ? 'bg-[#EEF0FD] text-[#6962F1]' 
                  : 'text-[#0E121B] hover:bg-slate-50'
              }`}
            >
              <span>Submit Job</span>
              {activePage === 'submit' && <span className="w-1.5 h-1.5 rounded-full bg-[#6962F1]"></span>}
            </button>

            {/* 6. About */}
            <button
              onClick={() => handleNav('about')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activePage === 'about' 
                  ? 'bg-[#EEF0FD] text-[#6962F1]' 
                  : 'text-[#0E121B] hover:bg-slate-50'
              }`}
            >
              <span>About</span>
              {activePage === 'about' && <span className="w-1.5 h-1.5 rounded-full bg-[#6962F1]"></span>}
            </button>
            
            {/* Telegram Channel Link */}
            <div className="pt-3 mt-2 border-t border-slate-100">
              <a
                href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#605CF8] text-white text-xs font-semibold whitespace-nowrap shadow-sm"
              >
                <Send className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Join Official Telegram Channel</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
