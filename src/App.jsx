import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingActionButton from './components/common/FloatingActionButton';
import BottomSheet from './components/common/BottomSheet';

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

  // Dynamic Settings with Local Persistence
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ophancer_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
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
      return saved ? JSON.parse(saved) : [];
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

  const toggleBookmark = (id) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(b => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  // Opportunities List State (Loaded dynamically from real harvested data)
  const [opportunities, setOpportunities] = useState(() => {
    try {
      const saved = localStorage.getItem('ophancer_opportunities');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        // Merge newly discovered items so fresh harvests immediately show up in the browser
        const existingIdentifiers = new Set(parsed.map(p => p.source_identifier || p.id));
        const newFromHarvest = INITIAL_OPPORTUNITIES.filter(o => !existingIdentifiers.has(o.source_identifier || o.id));
        const merged = [...newFromHarvest, ...parsed];
        
        return merged.map(item => {
          let updatedItem = { ...item };
          if (updatedItem.budget_raw_text && (updatedItem.budget_raw_text.startsWith(',000') || updatedItem.budget_raw_text.startsWith('000'))) {
            updatedItem.budget_raw_text = '$1,' + updatedItem.budget_raw_text.replace(/^[,\s0]+/, '');
          }
          if (updatedItem.source_url && updatedItem.source_url.includes('ophancer.com')) {
            const query = `${updatedItem.title || ''} ${updatedItem.company_name || ''} ${updatedItem.location || ''} job apply`.trim();
            updatedItem.source_url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          }
          return updatedItem;
        });
      }
      return INITIAL_OPPORTUNITIES;
    } catch {
      return INITIAL_OPPORTUNITIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ophancer_opportunities', JSON.stringify(opportunities));
    } catch (e) {
      console.error('Failed to persist opportunities', e);
    }
  }, [opportunities]);

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
    const item = {
      ...newSub,
      id: `sub-${Date.now()}`
    };
    setSubmissions([item, ...submissions]);
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

    </div>
  );
}
