import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Check, 
  ExternalLink,
  Code2,
  Palette,
  BarChart3,
  Headphones,
  Zap,
  Bookmark,
  ShieldCheck,
  Send,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Lock,
  Search
} from 'lucide-react';

const STAGE_PREVIEWS = {
  web: {
    tag: 'Web & Tech',
    badge: 'Remote Contract',
    title: 'Full-Stack React & Node.js Developer',
    meta: 'Fintech Startup • Lagos & Global Remote',
    budget: '₦450,000 / month',
    source: 'Twitter/X Founder Post'
  },
  requests: {
    tag: 'Client Request',
    badge: 'Direct Client',
    title: 'WordPress & Paystack Store Redesign',
    meta: 'Abuja Skincare Brand • 10-day turnaround',
    budget: '₦180,000 Fixed',
    source: 'Community Freelance Hub'
  },
  design: {
    tag: 'Design & UI/UX',
    badge: 'Milestone Contract',
    title: 'Mobile App UI/UX & Figma Design System',
    meta: 'London Logistics • Remote',
    budget: '$1,200 Fixed',
    source: 'Reddit r/forhire [Hiring]'
  },
  data: {
    tag: 'Data & Sheets',
    badge: 'Short-Term Gig',
    title: 'Automated Sales Pipeline & Inventory Sheet',
    meta: 'E-commerce Brand • Remote',
    budget: '₦85,000 Fixed',
    source: 'Public Founder Board'
  },
  va: {
    tag: 'Virtual Support',
    badge: 'Part-Time Hire',
    title: 'Executive Assistant & Lead Prospecting',
    meta: 'Digital Agency • 20 hrs/week Remote',
    budget: '$450 / month',
    source: 'Direct Client Channel'
  }
};

const CV_PREVIEWS = {
  single: {
    title: 'Single ATS CV Optimization',
    price: '₦5,000',
    badge: 'Human-Crafted',
    timeline: '24 - 48 Hours',
    score: '95+ ATS Target',
    bullets: [
      'Full resume rewrite & ATS keyword alignment',
      'Editable Word (.docx) + Clean PDF',
      '1 Free revision included',
      'Direct WhatsApp consultation'
    ]
  },
  double: {
    title: 'Dual Target CV Bundle',
    price: '₦8,000',
    badge: 'Best Value',
    timeline: '48 Hours',
    score: '98+ ATS Target',
    bullets: [
      '2 Tailored CVs for separate career paths',
      'Matched to 2 target job descriptions',
      'Complimentary cover letter draft',
      'Direct WhatsApp consultation'
    ]
  },
  usd: {
    title: 'International Remote CV',
    price: '$5 USD',
    badge: 'Global Remote',
    timeline: '24 - 48 Hours',
    score: '96+ ATS Target',
    bullets: [
      'Optimized for US, UK & EU ATS standards',
      'Global skills taxonomy & clean layout',
      'Editable Word (.docx) + Clean PDF',
      'Direct WhatsApp consultation'
    ]
  },
  free: {
    title: 'In-Browser ATS Scanner',
    price: '₦0 Free',
    badge: '100% Private in RAM',
    timeline: 'Instant (1 second)',
    score: 'RAM Diagnostic',
    bullets: [
      'Evaluated 100% in browser RAM',
      'Zero cloud storage & zero tracking',
      '100-point section & keyword breakdown',
      'Direct paste or PDF file upload'
    ]
  }
};

export default function HomePage({ 
  opportunities, 
  categories, 
  setActivePage, 
  setSelectedOpportunity, 
  searchQuery, 
  setSearchQuery,
  settings,
  bookmarks,
  toggleBookmark 
}) {
  const [activeTabStage, setActiveTabStage] = useState('web');
  const [activeCvTab, setActiveCvTab] = useState('single');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef(null);

  // Set gentle, smooth slowed video playback speed (0.7x) so it plays comfortably
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for pagewide scroll-reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTabStage, activeCvTab, carouselIndex]);

  const currentStagePreview = STAGE_PREVIEWS[activeTabStage] || STAGE_PREVIEWS.web;
  const currentCvPreview = CV_PREVIEWS[activeCvTab] || CV_PREVIEWS.single;
  
  const activeOpportunities = useMemo(() => {
    const now = new Date();
    return opportunities.filter(o => !o.expires_at || new Date(o.expires_at) >= now);
  }, [opportunities]);

  const maxCarouselIndex = Math.max(0, activeOpportunities.length - 4);

  const handleOpportunityClick = (opp) => {
    setSelectedOpportunity(opp);
    setActivePage('opportunity-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white relative">
      
      {/* Pagewide Scroll Reading Progress Line */}
      <div 
        style={{ 
          width: `${Math.min(100, (scrollY / Math.max(1, (document.documentElement.scrollHeight - window.innerHeight || 1))) * 100)}%` 
        }}
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-[#6962F1] via-[#857FF7] to-[#A5A0FA] z-50 transition-all duration-75 pointer-events-none"
      ></div>

      {/* 1. HERO SECTION - 100% VH Full Viewport Height with Cinematic Parallax */}
      <section className="relative w-full h-screen min-h-[640px] max-h-[1080px] flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
        
        {/* Ambient 1080p Video with GPU-Accelerated Parallax */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={(e) => {
              e.currentTarget.playbackRate = 0.7;
            }}
            poster="/hero-bg.jpg"
            style={{
              transform: `translate3d(0, ${scrollY * 0.35}px, 0) scale(1.06)`,
              willChange: 'transform'
            }}
            className="w-full h-full object-cover object-center transition-transform duration-75 ease-out"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Gentle cinematic lighting vignette for razor-sharp typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Top Spacer under floating navbar + Top-Right Floating Pill Badge */}
        <div 
          style={{ transform: `translate3d(0, ${scrollY * 0.22}px, 0)` }}
          className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] flex justify-end transition-transform duration-75 ease-out"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-[#0E121B] shadow-2xl border border-white text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap flex-shrink-0 animate-float">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            <span className="whitespace-nowrap">+ {opportunities.length} Live Gigs Indexed</span>
          </div>
        </div>

        {/* Bottom Area: 3-Line Headline + Black Pill Button (Left) & Work Mode Badge (Right) */}
        <div 
          style={{ 
            transform: `translate3d(0, ${scrollY * 0.14}px, 0)`,
            opacity: Math.max(0, 1 - scrollY / 650)
          }}
          className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 transition-all duration-75 ease-out"
        >
          
          <div className="space-y-4 sm:space-y-6 max-w-2xl w-full">
            {/* Work Mode Indicator on Mobile (Top of Headline on small screens only) */}
            <div className="sm:hidden">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-xs font-semibold text-white border border-white/25 shadow-lg">
                <span>Hybrid &bull; Remote &bull; Onsite</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.15] sm:leading-[1.12] font-heading drop-shadow-md">
              #1 Opportunity <br className="hidden md:block" />
              Discovery Platform <br className="hidden md:block" />
              in Africa
            </h1>

            <div className="w-full sm:w-auto">
              <button
                onClick={() => setActivePage('opportunities')}
                className="w-full sm:w-auto h-[48px] sm:h-[44px] px-8 rounded-full bg-[#0E121B] hover:bg-black text-white text-sm font-semibold transition-all shadow-xl flex sm:inline-flex items-center justify-center gap-2 border border-white/10 active:scale-95 cursor-pointer"
              >
                <span>Explore Gigs</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Desktop Work Mode Indicator (sm+ only, bottom right) */}
          <div className="hidden sm:inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-xs sm:text-sm font-semibold text-white border border-white/20 whitespace-nowrap flex-shrink-0 self-start sm:self-auto shadow-lg">
            <span>Hybrid &bull; Remote &bull; Onsite</span>
          </div>

        </div>

      </section>

      {/* 2. BEYOND JOB BOARDS: WHAT OPHANCER ACTUALLY DOES */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 overflow-hidden">
        
        {/* Parallax Ambient Glow Orb */}
        <div 
          style={{ transform: `translate3d(0, ${(scrollY - 400) * 0.08}px, 0)` }}
          className="parallax-orb-1 -top-20 -left-20"
        ></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
          
          {/* Left Column: Clear, High-Impact Value Proposition */}
          <div className="space-y-4 sm:space-y-6 reveal-on-scroll">
            <div>
              <span className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#6962F1] font-heading block tracking-tight">
                Beyond Job Boards.
              </span>
              <span className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E121B] font-heading block tracking-tight mt-1">
                Where Real Gigs Hide.
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base sm:text-xl font-bold text-[#0E121B]">
                We crawl where traditional job boards never look.
              </h3>
              <p className="text-xs sm:text-sm text-[#525866] leading-relaxed max-w-lg">
                High-paying opportunities aren't just on corporate career portals. They are scattered across social media, founder posts, and community chats. We index them all in one place.
              </p>
            </div>

            {/* Real Feature Badges */}
            <div className="space-y-2 pt-1">
              <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm font-semibold text-[#0E121B]">
                <span className="text-[#6962F1] text-base leading-none">✦</span>
                <span>Social Media Client Requests (Twitter, Reddit &amp; Communities)</span>
              </div>
              <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm font-semibold text-[#0E121B]">
                <span className="text-[#6962F1] text-base leading-none">✦</span>
                <span>Direct Company Career Portals (Greenhouse &amp; Lever ATS)</span>
              </div>
              <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm font-semibold text-[#0E121B]">
                <span className="text-[#6962F1] text-base leading-none">✦</span>
                <span>100% Free Direct Application Links (Zero Middleman Fees)</span>
              </div>
            </div>

            {/* Telegram Channel Scan Badge */}
            <div className="pt-2">
              <a
                href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-3 p-3 px-4 rounded-2xl bg-[#EEF0FD] border border-[#D6D8FB] text-[#0E121B] hover:bg-[#E2E5FA] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#6962F1] text-white flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-[#0E121B] block">Join @OphancerAlerts</span>
                  <span className="text-[#525866]">Real-time Telegram notifications</span>
                </div>
              </a>
            </div>

          </div>

          {/* Right Column: Soft Lavender Showcase Card */}
          <div className="rounded-3xl sm:rounded-[36px] bg-[#EEF0FD] p-5 sm:p-10 relative overflow-hidden border border-[#E0E3FA] shadow-xs flex flex-col justify-between min-h-0 sm:min-h-[420px] reveal-on-scroll reveal-delay-200">
            
            <div className="space-y-1">
              <h3 className="text-lg sm:text-2xl font-bold text-[#0E121B]">
                One stream. Every gig.
              </h3>
              <p className="text-xs text-[#525866]">
                Informal freelance projects and corporate openings in real time.
              </p>
            </div>

            {/* Central Mockup Visual (Live Real Discovered Gig) */}
            <div className="my-4 sm:my-6 relative">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_12px_32px_rgba(105,98,241,0.12)] border border-[#EBEFF5] w-full max-w-sm mx-auto space-y-2.5 hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#6962F1] uppercase tracking-wider">Client Gig (Social Lead)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">● Active</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0E121B] leading-snug">
                  Full-Stack Dev for Animation Streaming Platform
                </h4>
                <div className="flex items-center justify-between text-xs text-[#525866] pt-0.5">
                  <span>Direct Client &bull; Remote</span>
                  <span className="font-mono font-bold text-[#0E121B]">$1,500 Fixed</span>
                </div>
              </div>

              {/* Floating Pill Tag (safely positioned on small screens) */}
              <div className="absolute -top-2.5 right-2 sm:-top-3 sm:right-4 bg-white rounded-full px-3 py-1 sm:px-4 sm:py-1.5 shadow-md border border-[#EBEFF5] flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#0E121B] whitespace-nowrap">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#6962F1]"></span>
                <span>+ Discovered 20m ago</span>
              </div>
            </div>

            <div className="pt-1 text-center sm:text-left">
              <span className="text-[11px] sm:text-xs font-bold text-[#525866] uppercase tracking-wider block">
                Zero Recruitment Agency Markup
              </span>
              <p className="text-[11px] sm:text-xs text-[#525866] mt-0.5">
                We connect jobseekers directly to original source applications at no cost.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. FEATURE STAGE 1: DIGITAL OPPORTUNITIES FOR EVERYONE */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-slate-100 overflow-hidden">
        
        {/* Parallax Ambient Glow Orb */}
        <div 
          style={{ transform: `translate3d(0, ${(scrollY - 1000) * 0.06}px, 0)` }}
          className="parallax-orb-2 -top-24 -right-24"
        ></div>

        {/* Top Pill Tabs: Touch-Friendly Horizontal Swipe Row on Mobile */}
        <div className="flex items-center sm:justify-center overflow-x-auto no-scrollbar gap-2 mb-6 sm:mb-12 py-1 px-4 -mx-4 sm:mx-0 snap-x relative z-10">
          {[
            { id: 'web', label: 'Web & Tech' },
            { id: 'requests', label: 'Client Requests' },
            { id: 'design', label: 'Creative & Design' },
            { id: 'data', label: 'Data & Sheets' },
            { id: 'va', label: 'Virtual Assistance' },
          ].map((tab) => {
            const isActive = activeTabStage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabStage(tab.id)}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 snap-start active:scale-95 cursor-pointer ${
                  isActive ? 'pill-active shadow-xs' : 'pill-inactive'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 2-Column Content: On Mobile, Dynamic Card is Order-1 So It Appears Immediately Below the Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
          
          {/* Dynamic Mockup Card: Order-1 on mobile so user instantly sees what changes */}
          <div className="order-1 lg:order-1 rounded-3xl sm:rounded-[36px] bg-[#F4F5FD] p-4 sm:p-10 border border-[#E0E3FA] flex items-center justify-center">
            <div key={activeTabStage} className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-[#EBEFF5] space-y-3.5 hover:shadow-2xl transition-all animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-[#6962F1] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6962F1] animate-pulse"></span>
                  <span>Ophancer Signal</span>
                </span>
                <span className="text-[11px] font-mono text-[#525866] truncate max-w-[55%] text-right font-medium">{currentStagePreview.source}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#6962F1] font-bold inline-block">
                  {currentStagePreview.badge}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#0E121B] pt-0.5 leading-snug">
                  {currentStagePreview.title}
                </h4>
                <p className="text-xs text-[#525866]">
                  {currentStagePreview.meta}
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8F9FE] border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-[#525866]">Budget / Pay</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#0E121B]">{currentStagePreview.budget}</span>
              </div>

              <button
                onClick={() => {
                  setActivePage('opportunities');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs font-semibold transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                Apply on Direct Source
              </button>
            </div>
          </div>

          {/* Right Column: Typography & 2x2 Feature Grid (Order-2 on mobile) */}
          <div className="order-2 lg:order-2 space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight leading-tight">
              Digital opportunities for everyone.
            </h2>

            <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
              Connecting African and global talent directly to paying clients and companies. Zero agency middleman or hidden markups.
            </p>

            {/* 2x2 Micro-Icon Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Free to search &amp; apply</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Original source links</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Pan-African &amp; Remote</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Transparent ₦ &amp; $ Budgets</span>
              </div>
            </div>

            {/* Solid Black Pill Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActivePage('opportunities');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex sm:inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Browse All Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURE STAGE 2: ATS ENHANCEMENT & CAREER ACCELERATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-slate-100">
        
        {/* Top Pill Tabs for CV - Horizontal swipeable row on mobile, centered on desktop */}
        <div className="flex items-center sm:justify-center overflow-x-auto no-scrollbar gap-2 mb-6 sm:mb-12 py-1 px-4 -mx-4 sm:mx-0 snap-x">
          {[
            { id: 'single', label: 'Single CV (₦5,000)' },
            { id: 'double', label: 'Dual Bundle (₦8,000)' },
            { id: 'usd', label: 'International ($5)' },
            { id: 'free', label: 'Free ATS Scanner (₦0)' },
          ].map((tab) => {
            const isActive = activeCvTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCvTab(tab.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 snap-start active:scale-95 cursor-pointer ${
                  isActive ? 'pill-active shadow-sm' : 'pill-inactive'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 2-Column Content: Dynamic card first on mobile (order-1) so user sees the change right under tabs! */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          
          {/* Dynamic ATS Diagnostic / Package Card (order-1 on mobile, order-2 on lg desktop) */}
          <div className="order-1 lg:order-2 rounded-3xl sm:rounded-[36px] bg-[#F4F5FD] p-4 sm:p-10 border border-[#E0E3FA] flex items-center justify-center">
            <div key={activeCvTab} className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-[#EBEFF5] space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-[#0E121B]">{currentCvPreview.title}</span>
                <span className="text-xs font-mono font-bold text-[#6962F1]">{currentCvPreview.score}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#0E121B] font-heading">{currentCvPreview.price}</span>
                  <span className="text-xs text-[#525866]">&bull; {currentCvPreview.timeline}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold inline-block">
                  {currentCvPreview.badge}
                </span>
              </div>

              {/* Package Bullets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {currentCvPreview.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#525866]">
                    <span className="text-[#6962F1] text-xs font-bold">✓</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (activeCvTab === 'free') {
                    setActivePage('ats-checker');
                  } else {
                    setActivePage('cv-services');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 rounded-full bg-[#0E121B] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{activeCvTab === 'free' ? 'Launch Free Scanner' : `Get Started (${currentCvPreview.price})`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Left Column: Typography & Feature Checklist (order-2 on mobile, order-1 on lg desktop) */}
          <div className="order-2 lg:order-1 space-y-5 sm:space-y-6">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight leading-tight">
              CV optimization made honest and simple.
            </h2>

            <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
              Test your CV in-browser for free with zero server storage, or let our human career specialists craft an interview-ready resume for ₦5,000 ($5) via WhatsApp.
            </p>

            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>In-Browser Free Scanner</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Zero Server Storage (RAM Only)</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Human Writers (No AI Spam)</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#0E121B]">
                <div className="w-5 h-5 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Word (.docx) &amp; PDF Deliverables</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActivePage('cv-services');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Order CV (₦5,000 / $5)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActivePage('ats-checker');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#EEF0FD] hover:bg-[#E2E5FA] text-[#6962F1] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Test Score for Free</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 5. LATEST RELEASES / FRESH OPPORTUNITIES CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-slate-100">
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#0E121B] font-heading tracking-tight">
              Latest releases.
            </h2>
            <p className="text-xs sm:text-sm text-[#525866] mt-0.5">
              Newly harvested client gigs and career vacancies updated in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
              disabled={carouselIndex === 0}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 bg-white text-[#0E121B] hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              aria-label="Previous opportunities"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCarouselIndex(prev => Math.min(maxCarouselIndex, prev + 1))}
              disabled={carouselIndex >= maxCarouselIndex}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 bg-white text-[#0E121B] hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              aria-label="Next opportunities"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {activeOpportunities.length === 0 ? (
            <div className="col-span-full p-8 sm:p-12 text-center text-xs sm:text-sm text-[#525866] bg-[#F8F9FE] rounded-2xl sm:rounded-3xl border border-slate-100">
              No live opportunities currently loaded.
            </div>
          ) : (
            activeOpportunities.slice(carouselIndex, carouselIndex + 4).map((opp) => (
              <div
                key={opp.id}
                onClick={() => handleOpportunityClick(opp)}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#EBEFF5] hover:border-[#6962F1]/40 shadow-sm hover:shadow-[0_12px_32px_rgba(105,98,241,0.12)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group h-full"
              >
                {/* Card Main Body */}
                <div className="p-4 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  
                  {/* Top Row: Type Badge (Left) + Source Portal with Truncate (Right) */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#6962F1] uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                      {opp.opportunity_type === 'service_request' ? 'Client Gig' : 'Vacancy'}
                    </span>
                    <span 
                      className="text-[10px] font-mono text-[#525866] truncate max-w-[55%] text-right font-medium" 
                      title={opp.source_name}
                    >
                      {opp.source_name}
                    </span>
                  </div>

                  {/* Title (2-Line Clamp with Uniform Min-Height) */}
                  <div className="space-y-1 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors line-clamp-2 leading-snug">
                      {opp.title}
                    </h3>

                    {/* Company & Location with icon & truncate */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#525866] min-w-0 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#99A0AE] shrink-0" />
                      <span className="truncate font-medium">
                        {opp.company_name} &bull; {opp.location}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Card Footer Bar */}
                <div className="p-3 sm:p-3.5 px-4 sm:px-5 bg-[#F8F9FE] border-t border-[#EBEFF5] flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#0E121B] truncate max-w-[65%]" title={opp.budget_raw_text || 'Competitive / Disclosed on Application'}>
                    {opp.budget_raw_text || (opp.opportunity_type === 'service_request' ? 'Negotiable' : 'Competitive')}
                  </span>
                  <span className="text-xs font-bold text-[#6962F1] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Explore More CTA Button */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <button
            onClick={() => {
              setActivePage('opportunities');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex sm:inline-flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 active:scale-95 group cursor-pointer"
          >
            <span>Explore All {activeOpportunities.length} Opportunities</span>
            <ArrowRight className="w-4 h-4 text-[#6962F1] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 6. BIG BOTTOM BANNER: START DISCOVERING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="rounded-3xl sm:rounded-[36px] interlink-banner-cta p-6 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-lg z-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
              Start discovering opportunities today.
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Find informal client requests, apply to global remote vacancies, or get your CV professionally optimized. Fast, transparent, and always free for talent.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 justify-center sm:justify-start">
              <button
                onClick={() => {
                  setActivePage('opportunities');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0E121B] text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4 text-[#6962F1]" />
              </button>

              <button
                onClick={() => {
                  setActivePage('ats-checker');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Free ATS Scan</span>
              </button>
            </div>
          </div>

          {/* 3D Isometric Steps Illustration (responsive on mobile) */}
          <div className="relative w-40 sm:w-48 h-28 sm:h-36 flex items-end justify-center z-10 shrink-0">
            <div className="w-10 sm:w-12 h-16 sm:h-20 bg-white/25 rounded-t-lg backdrop-blur-sm shadow-lg mr-1 border-t border-x border-white/30"></div>
            <div className="w-10 sm:w-12 h-22 sm:h-28 bg-white/45 rounded-t-lg backdrop-blur-sm shadow-lg mr-1 border-t border-x border-white/40"></div>
            <div className="w-10 sm:w-12 h-28 sm:h-36 bg-white/80 rounded-t-lg backdrop-blur-sm shadow-xl flex items-start justify-center pt-2 border-t border-x border-white/60">
              <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#6962F1] text-white flex items-center justify-center font-bold text-xs shadow-md">
                ✦
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
