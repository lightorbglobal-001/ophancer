import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingActionButton from './components/common/FloatingActionButton';
import BottomSheet from './components/common/BottomSheet';
import TelegramAlertsModal from './components/common/TelegramAlertsModal';
import { initTelegramWebApp } from './utils/telegramWebApp';

import HomePage from './pages/HomePage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import CVServicesPage from './pages/CVServicesPage';
import ATSCheckerPage from './pages/ATSCheckerPage';
import QuoteMakerPage from './pages/QuoteMakerPage';
import SubmitOpportunityPage from './pages/SubmitOpportunityPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AdminPage from './pages/AdminPage';

import { 
  INITIAL_SETTINGS, 
  CATEGORIES, 
  INITIAL_OPPORTUNITIES 
} from './data/mockData';
import { fetchLiveOpportunities, pushOpportunityToSupabase } from './services/supabaseClient';
import { toggleBookmarkInList } from './utils/bookmarkUtils';
import { cleanTextContent, isEnglishOpportunity, isPhysicalLaborGig, sanitizeBudget } from './utils/textUtils';

const VALID_ROUTES = {
  '': 'home',
  '/': 'home',
  'home': 'home',
  'opportunities': 'opportunities',
  'opportunity-detail': 'opportunity-detail',
  'cv-services': 'cv-services',
  'ats-checker': 'ats-checker',
  'quote-maker': 'quote-maker',
  'submit': 'submit',
  'submit-opportunity': 'submit',
  'lead-inbox': 'lead-inbox',
  'leads': 'lead-inbox',
  'about': 'about',
  'contact': 'contact',
  'privacy': 'privacy',
  'terms': 'terms',
  'admin': 'admin'
};

const getInitialRoute = () => {
  try {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (pathname && VALID_ROUTES[pathname]) {
      return VALID_ROUTES[pathname];
    }
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash && VALID_ROUTES[hash]) {
      return VALID_ROUTES[hash];
    }
    const saved = sessionStorage.getItem('ophancer_active_page');
    if (saved && VALID_ROUTES[saved]) {
      return VALID_ROUTES[saved];
    }
  } catch (e) {
    console.error('Error parsing route', e);
  }
  return 'home';
};

export default function App() {
  const [activePage, setActivePage] = useState(getInitialRoute);
  const [selectedOpportunity, setSelectedOpportunity] = useState(() => {
    try {
      const savedOpp = sessionStorage.getItem('ophancer_selected_opportunity');
      if (savedOpp) {
        return JSON.parse(savedOpp);
      }
    } catch (e) {
      console.error('Failed to parse initial opportunity', e);
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Dynamic SEO Page Title & Metadata Manager
  useEffect(() => {
    let title = 'Ophancer — High-Value Gigs, Vacancies & Career Services';
    let desc = 'Discover verified corporate vacancies, freelance contracts, and client service requests across Nigeria, Africa, and global remote markets.';

    switch (activePage) {
      case 'home':
        title = 'Ophancer — High-Value Gigs, Vacancies & Career Services';
        break;
      case 'opportunities':
        title = 'Explore Verified Jobs & Freelance Gigs | Ophancer';
        desc = 'Browse live corporate openings, client gigs, and remote contracts updated in real-time.';
        break;
      case 'opportunity-detail':
        if (selectedOpportunity) {
          title = `${selectedOpportunity.title} at ${selectedOpportunity.company_name} | Ophancer`;
          desc = selectedOpportunity.description ? selectedOpportunity.description.slice(0, 160) : desc;
        } else {
          title = 'Opportunity Details | Ophancer';
        }
        break;
      case 'cv-services':
        title = 'Executive CV & Resume Makeover Services | Ophancer';
        desc = 'Transform your resume with professional keyword optimization and ATS formatting tailored for high-ticket roles.';
        break;
      case 'ats-checker':
        title = 'Free Instant ATS Resume Scanner & Score | Ophancer';
        desc = 'Upload your PDF resume to receive a real-time ATS match score, keyword breakdown, and formatting recommendations.';
        break;
      case 'quote-maker':
        title = 'Corporate Quotation & Invoice Generator | Ophancer';
        desc = 'Generate professional corporate quotations with automatic VAT, line-item billing, and print-ready PDF export.';
        break;
      case 'submit':
        title = 'Post an Opportunity — Instant Live Publishing | Ophancer';
        desc = 'Publish your job vacancy or client gig directly to the Ophancer network. Zero approval delays.';
        break;
      case 'lead-inbox':
        title = 'Client Lead Inbox & 1-Click Outreach Cockpit | Ophancer';
        desc = 'Real-time direct social buyer leads and high-paying Abuja/Remote corporate vacancies with 1-click pitch hooks.';
        break;
      case 'about':
        title = 'About Ophancer — Mission & Platform Architecture';
        break;
      case 'contact':
        title = 'Contact Support & Help Desk | Ophancer';
        break;
      case 'privacy':
        title = 'Privacy Policy | Ophancer';
        break;
      case 'terms':
        title = 'Terms of Service | Ophancer';
        break;
      case 'admin':
        title = 'Admin Moderation Console | Ophancer';
        break;
      default:
        break;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
  }, [activePage, selectedOpportunity]);

  // Dynamic Settings with Local Persistence
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ophancer_settings');
      const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        whatsapp_support: {
          ...INITIAL_SETTINGS.whatsapp_support,
          ...(parsed?.whatsapp_support || {}),
          phone_number: "2348025100844",
          display_phone: "+234 802 510 0844"
        }
      };
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ophancer_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  }, [settings]);

  // Bookmarks with Local Persistence
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('ophancer_bookmarks');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ophancer_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to persist bookmarks', e);
    }
  }, [bookmarks]);

  const [isTelegramAlertsOpen, setIsTelegramAlertsOpen] = useState(false);

  // Initialize Telegram Mini App environment
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  const toggleBookmark = (oppOrId) => {
    if (!oppOrId) return;
    setBookmarks(prev => toggleBookmarkInList(prev, oppOrId));
  };

function isAuthenticOpportunity(item) {
  if (!item || !item.title) return false;
  const title = String(item.title).trim();
  const company = String(item.company_name || '').trim();
  const loc = String(item.location || '').trim();

  // Reject repetitive single-character or test gibberish (e.g., "jjj", "aaa", "---")
  if (/^(.)\1+$/i.test(title)) return false;
  if (/^(.)\1+$/i.test(company)) return false;
  if (title.toLowerCase() === 'jjj' || company.toLowerCase().includes('jjj') || loc.toLowerCase() === 'nj') return false;

  // Reject unrealistic short test names
  if (title.length < 4 || (company && company.length < 2) || (loc && loc.length < 3)) return false;

  // Reject explicit dummy test words
  if (/^(test|dummy|asdf|qwerty)$/i.test(title)) return false;

  // Reject non-English job posts (e.g., Spanish, German, French, Cyrillic)
  if (!isEnglishOpportunity(item)) return false;

  // Reject physical in-person labor gigs (drywall, hauling, yard work, etc.)
  if (isPhysicalLaborGig(item)) return false;

  return true;
}

function normalizeOpportunityItem(item) {
  if (!item) return item;
  const isClientGig = item.opportunity_type === 'service_request' || item.opportunity_type === 'gig';
  
  let updatedItem = {
    ...item,
    title: cleanTextContent(item.title),
    description: cleanTextContent(item.description),
    company_name: cleanTextContent(item.company_name),
    location: cleanTextContent(item.location),
    pitch_angle: cleanTextContent(item.pitch_angle),
    budget_raw_text: sanitizeBudget(item.budget_raw_text, isClientGig)
  };

  if (updatedItem.source_url && updatedItem.source_url.includes('ophancer.com')) {
    const query = `${updatedItem.title || ''} ${updatedItem.company_name || ''} ${updatedItem.location || ''} job apply`.trim();
    updatedItem.source_url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  return updatedItem;
}

  // Opportunities List State (Loaded dynamically from real harvested data)
  const [opportunities, setOpportunities] = useState(() => {
    try {
      const saved = localStorage.getItem('ophancer_opportunities');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        // Purge any test / junk jobs (like "jjj Innovations") from previous browser sessions
        const cleanedParsed = parsed.filter(isAuthenticOpportunity);
        
        // Track both ID and source_identifier to prevent any duplication
        const existingIds = new Set(cleanedParsed.map(p => p.id).filter(Boolean));
        const existingIdentifiers = new Set(cleanedParsed.map(p => p.source_identifier).filter(Boolean));
        const newFromHarvest = INITIAL_OPPORTUNITIES
          .filter(isAuthenticOpportunity)
          .filter(o => (!o.id || !existingIds.has(o.id)) && (!o.source_identifier || !existingIdentifiers.has(o.source_identifier)));
        
        const combined = [...newFromHarvest, ...cleanedParsed];
        const seenKeys = new Set();
        const merged = [];
        for (const item of combined) {
          const key = item.id || item.source_identifier || `${item.title}-${item.company_name}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);
          if (item.id) seenKeys.add(item.id);
          if (item.source_identifier) seenKeys.add(item.source_identifier);
          merged.push(item);
        }
        
        return merged.map(normalizeOpportunityItem);
      }
      return INITIAL_OPPORTUNITIES.filter(isAuthenticOpportunity).map(normalizeOpportunityItem);
    } catch {
      return INITIAL_OPPORTUNITIES.filter(isAuthenticOpportunity).map(normalizeOpportunityItem);
    }
  });

  useEffect(() => {
    try {
      // Re-save sanitized opportunities list back to localStorage, permanently wiping any purged items
      localStorage.setItem('ophancer_opportunities', JSON.stringify(opportunities));
    } catch (e) {
      console.error('Failed to persist opportunities', e);
    }
  }, [opportunities]);

  // Live Cloud Synchronization with Supabase PostgreSQL
  useEffect(() => {
    let isMounted = true;
    fetchLiveOpportunities().then(cloudItems => {
      if (isMounted && cloudItems && cloudItems.length > 0) {
        setOpportunities(prev => {
          const existingIds = new Set(prev.map(p => p.id).filter(Boolean));
          const existingIdentifiers = new Set(prev.map(p => p.source_identifier).filter(Boolean));
          const newFromCloud = cloudItems
            .filter(isAuthenticOpportunity)
            .map(normalizeOpportunityItem)
            .filter(c => (!c.id || !existingIds.has(c.id)) && (!c.source_identifier || !existingIdentifiers.has(c.source_identifier)));
          if (newFromCloud.length === 0) return prev;
          
          const combined = [...newFromCloud, ...prev];
          const seenKeys = new Set();
          const deduped = [];
          for (const item of combined) {
            const key = item.id || item.source_identifier || `${item.title}-${item.company_name}`;
            if (seenKeys.has(key)) continue;
            seenKeys.add(key);
            if (item.id) seenKeys.add(item.id);
            if (item.source_identifier) seenKeys.add(item.source_identifier);
            deduped.push(item);
          }
          return deduped;
        });
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Pending Submissions Queue
  const [submissions, setSubmissions] = useState([
    {
      id: "sub-101",
      title: "Urgent: Build a Next.js Landing Page for Logistics Startup",
      category_id: "web-dev",
      opportunity_type: "service_request",
      work_mode: "remote",
      location: "Lagos, Nigeria",
      company_name: "HaulFlow Africa",
      budget_raw_text: "₦180,000 (Milestone)",
      source_url: "https://example.com/request/haulflow",
      submitter_name: "Chukwudi N.",
      submitter_contact: "chukwudi@example.com",
      description: "We need a clean 4-page responsive marketing site for our freight dispatch platform. Designs are ready in Figma. Need delivery within 5 days."
    }
  ]);

  // Broken link reports queue
  const [brokenReports, setBrokenReports] = useState([]);

  const handleAddSubmission = (newSub) => {
    const now = new Date();
    const nowId = `opp-sub-${Date.now()}`;
    const slug = (newSub.title || 'opportunity')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);

    const publishedOpp = {
      ...newSub,
      id: nowId,
      source_identifier: nowId,
      slug,
      status: 'published',
      source_name: newSub.company_name || 'Community Direct Post',
      source_url: newSub.source_url || (newSub.submitter_contact ? (newSub.submitter_contact.includes('@') ? `mailto:${newSub.submitter_contact}` : `https://wa.me/${newSub.submitter_contact.replace(/\D/g, '')}`) : ''),
      discovered_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 14 * 86400000).toISOString(),
      is_user_submitted: true,
      tags: [
        newSub.category_name || 'Opportunity',
        newSub.location ? newSub.location.split(',')[0].trim() : 'Remote',
        (newSub.work_mode || 'remote').toUpperCase()
      ]
    };

    // 1. Immediately publish to live directory
    setOpportunities(prev => [publishedOpp, ...prev]);

    // 2. Persist to browser storage
    try {
      const saved = localStorage.getItem('ophancer_opportunities');
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem('ophancer_opportunities', JSON.stringify([publishedOpp, ...list]));
    } catch (e) {
      console.error('Failed to persist user submission', e);
    }

    // 3. Automated Cloud Synchronization with Supabase PostgreSQL
    pushOpportunityToSupabase(publishedOpp);

    // 4. Record in audit history
    setSubmissions(prev => [publishedOpp, ...prev]);

    return publishedOpp;
  };

  const handleHarvestOpportunity = (newItems) => {
    const itemsToAdd = Array.isArray(newItems) ? newItems : [newItems];
    setOpportunities((prev) => {
      const updated = [...itemsToAdd, ...prev];
      try {
        localStorage.setItem('ophancer_opportunities', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist opportunities', e);
      }
      return updated;
    });
  };

  const handleReportBrokenLink = (oppId, reason) => {
    const report = {
      id: `rep-${Date.now()}`,
      opportunity_id: oppId,
      reason,
      reported_at: new Date().toISOString()
    };
    setBrokenReports([report, ...brokenReports]);
  };

  // Global Pagewide IntersectionObserver for smooth scroll-reveal on all pages
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
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el) => observer.observe(el));
    }, 60);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activePage, opportunities.length, selectedOpportunity]);

  // Synchronize browser URL, history, and session state with active page
  useEffect(() => {
    try {
      sessionStorage.setItem('ophancer_active_page', activePage);
      const targetPath = activePage === 'home' ? '/' : `/${activePage}`;
      let targetUrl = targetPath;

      if (activePage === 'opportunity-detail' && selectedOpportunity?.id) {
        targetUrl = `/opportunity-detail?id=${encodeURIComponent(selectedOpportunity.id)}`;
        sessionStorage.setItem('ophancer_selected_opportunity', JSON.stringify(selectedOpportunity));
      }

      const currentFull = window.location.pathname + window.location.search;
      if (currentFull !== targetUrl) {
        window.history.pushState({ page: activePage }, '', targetUrl);
      }
    } catch (e) {
      console.error('Failed to sync route history', e);
    }
  }, [activePage, selectedOpportunity]);

  // Handle browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setActivePage(route);

      if (route === 'opportunity-detail') {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
          const found = opportunities.find(o => o.id === id);
          if (found) setSelectedOpportunity(found);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [opportunities]);

  // If activePage is opportunity-detail on boot, ensure selectedOpportunity is populated
  useEffect(() => {
    if (activePage === 'opportunity-detail' && !selectedOpportunity) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (id) {
        const found = opportunities.find(o => o.id === id);
        if (found) {
          setSelectedOpportunity(found);
        } else {
          setActivePage('opportunities');
        }
      } else {
        setActivePage('opportunities');
      }
    }
  }, [activePage, selectedOpportunity, opportunities]);

  return (
    <div className="min-h-screen bg-white text-[#0E121B] flex flex-col font-body selection:bg-[#6962F1]/10 selection:text-[#6962F1]">
      
      {/* Floating Scroll-Adaptive Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        settings={settings}
        onOpenTelegramAlerts={() => setIsTelegramAlertsOpen(true)}
      />

      {/* Main Page Content Body: 0pt on Home for 100vh Hero, pt-[74px] on other pages */}
      <main key={activePage} className={`flex-1 animate-page-enter ${activePage === 'home' ? '' : 'pt-[74px]'}`}>
        {activePage === 'home' && (
          <HomePage 
            opportunities={opportunities}
            categories={CATEGORIES}
            setActivePage={setActivePage}
            setSelectedOpportunity={setSelectedOpportunity}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            settings={settings}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
          />
        )}

        {activePage === 'opportunities' && (
          <OpportunitiesPage 
            opportunities={opportunities}
            categories={CATEGORIES}
            setActivePage={setActivePage}
            setSelectedOpportunity={setSelectedOpportunity}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            onHarvestOpportunity={handleHarvestOpportunity}
            initialType="all"
            onOpenTelegramAlerts={() => setIsTelegramAlertsOpen(true)}
          />
        )}

        {activePage === 'opportunity-detail' && (
          <OpportunityDetailPage 
            opportunity={selectedOpportunity}
            setActivePage={setActivePage}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            reportBrokenLink={handleReportBrokenLink}
          />
        )}

        {activePage === 'cv-services' && (
          <CVServicesPage 
            settings={settings}
          />
        )}

        {activePage === 'ats-checker' && (
          <ATSCheckerPage 
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'quote-maker' && (
          <QuoteMakerPage 
            settings={settings}
          />
        )}

        {activePage === 'submit' && (
          <SubmitOpportunityPage 
            categories={CATEGORIES}
            onAddSubmission={handleAddSubmission}
            setActivePage={setActivePage}
            setSelectedOpportunity={setSelectedOpportunity}
          />
        )}

        {activePage === 'about' && (
          <AboutPage 
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'contact' && (
          <ContactPage 
            settings={settings}
          />
        )}

        {activePage === 'privacy' && (
          <PrivacyPage />
        )}

        {activePage === 'terms' && (
          <TermsPage />
        )}

        {activePage === 'lead-inbox' && (
          <OpportunitiesPage 
            opportunities={opportunities}
            categories={CATEGORIES}
            setActivePage={setActivePage}
            setSelectedOpportunity={setSelectedOpportunity}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            onHarvestOpportunity={handleHarvestOpportunity}
            initialType="service_request"
          />
        )}

        {activePage === 'admin' && (
          <AdminPage 
            opportunities={opportunities}
            setOpportunities={setOpportunities}
            submissions={submissions}
            setSubmissions={setSubmissions}
            brokenReports={brokenReports}
            setBrokenReports={setBrokenReports}
            settings={settings}
            setSettings={setSettings}
            categories={CATEGORIES}
          />
        )}
      </main>

      {/* Floating Speed-Dial Action Button */}
      <FloatingActionButton settings={settings} activePage={activePage} />

      {/* Accessible Thumb-friendly Bottom Sheet */}
      <BottomSheet 
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        setActivePage={setActivePage}
        settings={settings}
      />

      {/* Global Technology Footer */}
      <Footer 
        setActivePage={setActivePage} 
        settings={settings}
      />

      {/* Private Telegram Alerts & VIP Pass Modal */}
      <TelegramAlertsModal 
        isOpen={isTelegramAlertsOpen}
        onClose={() => setIsTelegramAlertsOpen(false)}
      />

    </div>
  );
}
