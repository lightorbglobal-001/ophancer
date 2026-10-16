import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ArrowUp, ArrowDown, Send } from 'lucide-react';

export default function FloatingActionButton({ settings, activePage = 'home' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const fabRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Monitor scroll position to dynamically toggle directional scroll action and hero visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      setScrollY(currentScrollY);
      setIsScrolledDown(currentScrollY > 280);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On Home Page: hide while in hero section (top); show once user starts scrolling down
  // On all other pages: show normally
  const isVisible = activePage !== 'home' || scrollY > 90;

  // Auto-close menu if user scrolls back into hero
  useEffect(() => {
    if (!isVisible && isOpen) {
      setIsOpen(false);
    }
  }, [isVisible, isOpen]);

  const whatsappPhone = settings?.whatsapp_support?.phone_number || '2348025100844';
  const greeting = encodeURIComponent(settings?.whatsapp_support?.default_greeting || 'Hello Ophancer Team, I would like to inquire about:');
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${greeting}`;

  const handleScrollToggle = () => {
    if (isScrolledDown) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleChat = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <aside 
      ref={fabRef}
      aria-label="Floating Quick Actions Stack" 
      className={`fixed bottom-6 right-6 z-50 select-none transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-end">
        
        {/* ======================================================== */}
        {/* EXPANDED SPEED-DIAL STACK ITEMS                          */}
        {/* ======================================================== */}
        <div 
          className={`flex flex-col items-end gap-3 mb-3 transition-all duration-300 origin-bottom-right ${
            isOpen 
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
              : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          }`}
        >
          {/* STACK ITEM 1: CHAT WITH US (WHATSAPP) */}
          <div 
            onClick={handleChat}
            className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:-translate-x-1"
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#0E121B] text-white text-xs font-semibold shadow-xl border border-white/10 whitespace-nowrap flex items-center gap-2 group-hover:bg-black transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Chat with Us</span>
              <span className="text-[10px] text-emerald-400 font-mono">WhatsApp</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform border border-emerald-400">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.179-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.176-.3-.019-.462.132-.612.136-.135.301-.351.452-.527.15-.176.2-.301.3-.502.101-.2.05-.376-.025-.526-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.509-.678-.518-.176-.009-.377-.009-.578-.009-.201 0-.527.075-.803.376-.276.3-1.054 1.029-1.054 2.509 0 1.48 1.079 2.909 1.23 3.109.15.201 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.377.197 1.895.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.94.55 3.75 1.51 5.28L2 22l4.85-1.5c1.47.88 3.19 1.38 5.19 1.38 5.53 0 10.02-4.49 10.02-10.02S17.57 2 12.04 2zm0 18.25c-1.74 0-3.37-.5-4.75-1.37l-.34-.21-2.88.89.9-2.8-.23-.37c-.98-1.5-1.5-3.26-1.5-5.11 0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2c0 4.52-3.68 8.2-8.2 8.2z"/>
              </svg>
            </div>
          </div>

          {/* STACK ITEM 2: UNIFIED DYNAMIC SCROLL DIRECTION (TOP <-> BOTTOM) */}
          <div 
            onClick={handleScrollToggle}
            className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:-translate-x-1"
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#0E121B] text-white text-xs font-semibold shadow-xl border border-white/10 whitespace-nowrap group-hover:bg-black transition-colors">
              <span>{isScrolledDown ? 'Scroll to Top' : 'Scroll to Bottom'}</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-white text-[#0E121B] border-2 border-[#EBEFF5] hover:border-[#6962F1] shadow-lg flex items-center justify-center group-hover:text-[#6962F1] group-hover:scale-110 active:scale-95 transition-all">
              {isScrolledDown ? (
                <ArrowUp className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <ArrowDown className="w-4 h-4 transition-transform duration-200" />
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN CIRCULAR FAB TRIGGER BUTTON                         */}
        {/* ======================================================== */}
        <div className="relative group">
          
          {/* Subtle Hover Tooltip Pill (Only displayed when menu is CLOSED) */}
          {!isOpen && (
            <div className="hidden sm:flex absolute right-16 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-[#0E121B] text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none items-center gap-1.5 border border-white/10 z-10">
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              <span>Quick Actions</span>
            </div>
          )}

          {/* Master Circular Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
            className={`relative w-14 h-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer ${
              isOpen 
                ? 'bg-[#0E121B] text-white border-2 border-slate-700 shadow-slate-900/30' 
                : 'bg-[#0E121B] hover:bg-black text-white border border-slate-700/60 shadow-xl shadow-[#0E121B]/30'
            }`}
          >
            {/* Animated Rotating Icon Container */}
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-100 text-white' : 'rotate-0'}`}>
              {isOpen ? (
                <X className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Modern Sleek Conversation Bubble with 3 Message Dots */}
                  <svg 
                    className="w-6 h-6 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.9" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path 
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" 
                      fill="currentColor" 
                      fillOpacity="0.2" 
                    />
                    <circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none" />
                  </svg>

                  {/* Glowing Live Green Dot positioned DIRECTLY on top-right of the icon INSIDE the circle */}
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366] ring-1 ring-[#0E121B]"></span>
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>

      </div>
    </aside>
  );
}
