import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Download, 
  Building2, 
  MapPin, 
  Mail, 
  Clock, 
  DollarSign, 
  Target, 
  Briefcase, 
  CheckCircle2, 
  Radio, 
  ChevronLeft,
  ChevronRight,
  Filter,
  Lightbulb,
  RotateCcw,
  X,
  ChevronDown,
  Send,
  RefreshCw
} from 'lucide-react';
import { fetchBuyerLeads, fetchCorporateJobs, updateLeadStatus } from '../services/supabaseClient';
import CustomSelect from '../components/common/CustomSelect';

const ITEMS_PER_PAGE = 8;

const STATUS_OPTIONS = [
  { value: 'new', label: '🆕 New' },
  { value: 'contacted', label: '📩 Pitched' },
  { value: 'won', label: '🎉 Won' },
];

const JOB_STATUS_OPTIONS = [
  { value: 'new', label: '🆕 New' },
  { value: 'applied', label: '✅ Applied' },
];

const FILTER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'new', label: '🆕 New' },
  { value: 'contacted', label: '📩 Pitched' },
  { value: 'won', label: '🎉 Won' },
];

const INITIAL_BUYERS = [
  {
    id: 1,
    title: "Need someone to build my Wix website for boutique fashion brand",
    buyer_name: "@elena_couture (Threads)",
    budget: "$450",
    platform: "Threads",
    link: "https://www.threads.net/@elena_couture/post/wix_brand_launch_2026",
    posted_at_wat: "2026-10-14 11:05 PM WAT",
    pitch_angle: "Pitch 48h Wix Studio redesign + responsive mobile optimization with zero downtime.",
    raw_text: "I need someone to build Wix website urgently. 5 pages, product gallery, and booking integration. Budget $450. Can start today.",
    status: "new"
  },
  {
    id: 2,
    title: "Urgently need website developer budget $340 for SaaS landing page",
    buyer_name: "@dan_fintech (X/Twitter)",
    budget: "$340",
    platform: "Twitter/X",
    link: "https://x.com/dan_fintech/status/1784920481920381024",
    posted_at_wat: "2026-10-14 09:29 PM WAT",
    pitch_angle: "Share portfolio of fast, high-converting responsive sites + free speed optimization guarantee.",
    raw_text: "I need website developer budget $340. Need clean Tailwind/React landing page for our beta launch. Must finish this weekend.",
    status: "new"
  },
  {
    id: 3,
    title: "Need Excel expert help - messy inventory registers and financial balance",
    buyer_name: "@kemi_retail (Facebook Business)",
    budget: "$250 / ₦200,000",
    platform: "Facebook",
    link: "https://www.facebook.com/groups/freelancebusinesshub/posts/891274019284/",
    posted_at_wat: "2026-10-14 08:23 PM WAT",
    pitch_angle: "Propose automated macro/VBA cleaning + instant dynamic dashboard sample deliverable.",
    raw_text: "Need Excel expert help. My multi-branch store has 4 months of unreconciled sales sheets. Need formulas and automated pivot sheets.",
    status: "new"
  },
  {
    id: 4,
    title: "Looking for Wix developer to finalize our agency website and portfolio",
    buyer_name: "@marcus_design (LinkedIn Client)",
    budget: "$500",
    platform: "LinkedIn",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7251892049182940182",
    posted_at_wat: "2026-10-14 06:47 PM WAT",
    pitch_angle: "Pitch 48h Wix Studio redesign + responsive mobile optimization with zero downtime.",
    raw_text: "Need someone to finalize my Wix website. 80% done, need custom animations and mobile responsive fixes before client presentation.",
    status: "new"
  },
  {
    id: 5,
    title: "Need virtual assistant today for executive calendar and client email follow-ups",
    buyer_name: "@sarah_vc (Threads)",
    budget: "$20/hr",
    platform: "Threads",
    link: "https://www.threads.net/@sarah_vc/post/need_va_calendar_ops",
    posted_at_wat: "2026-10-14 06:11 PM WAT",
    pitch_angle: "Highlight rigorous task organization, English fluency, fast typing (70+ WPM), and same-day availability.",
    raw_text: "Need virtual assistant today. Managing 30+ investor calls this week. Need someone organized who can start immediately.",
    status: "new"
  },
  {
    id: 6,
    title: "Need Power BI help to build CEO executive dashboard from SQL & Google Sheets",
    buyer_name: "@tunde_logistics (LinkedIn Client)",
    budget: "$750",
    platform: "LinkedIn",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7251893049182940293",
    posted_at_wat: "2026-10-14 05:29 PM WAT",
    pitch_angle: "Offer clean DAX data modeling + visual KPI executive dashboard with drill-down metrics.",
    raw_text: "Need Power BI help urgently. We have shipment logs across Nigeria and Ghana. Need interactive dashboard showing delivery turnaround.",
    status: "new"
  },
  {
    id: 7,
    title: "I need someone to build website like suparmax.com with member dashboard",
    buyer_name: "@kevin_holdings (X/Twitter)",
    budget: "$1,500",
    platform: "Twitter/X",
    link: "https://x.com/kevin_holdings/status/1784920481920389920",
    posted_at_wat: "2026-10-14 04:05 PM WAT",
    pitch_angle: "Share portfolio of custom web dashboards with user authentication and payment gateways.",
    raw_text: "I need someone to build website like suparmax.com. Custom front end, user login, Stripe/crypto gateway. Serious devs only.",
    status: "new"
  },
  {
    id: 8,
    title: "Urgently recruiting website builder and promo team for upcoming product launch",
    buyer_name: "@global_launch (Facebook)",
    budget: "$1,200 Retainer",
    platform: "Facebook",
    link: "https://www.facebook.com/groups/startuplaunches/posts/991827401928/",
    posted_at_wat: "2026-10-14 02:23 PM WAT",
    pitch_angle: "Present 30-day website maintenance roadmap + landing page conversion setup.",
    raw_text: "Urgently recruiting website builder and promo team. Looking for dedicated web creator to maintain pages and drive traffic.",
    status: "new"
  },
  {
    id: 9,
    title: "Need social media manager today to handle Instagram, TikTok & X reels",
    buyer_name: "@amara_glow (Instagram)",
    budget: "$600 / month",
    platform: "Instagram",
    link: "https://www.instagram.com/p/DBI9284nK19/",
    posted_at_wat: "2026-10-14 01:35 PM WAT",
    pitch_angle: "Present 30-day content calendar outline + proof of engagement growth & scheduling automation.",
    raw_text: "Need social media manager today. Skincare brand launching 5 new products. Need 4 reels per week + caption writing and engagement.",
    status: "new"
  },
  {
    id: 10,
    title: "I need virtual assistant data entry to transfer 2,000 product catalogs to Shopify",
    buyer_name: "@direct_retail (Threads)",
    budget: "$350",
    platform: "Threads",
    link: "https://www.threads.net/@direct_retail/post/shopify_va_migration",
    posted_at_wat: "2026-10-14 12:11 PM WAT",
    pitch_angle: "Propose automated CSV bulk import formatting with image tag validation.",
    raw_text: "I need virtual assistant data entry. Converting supplier PDF sheets into formatted Shopify CSV with image tags.",
    status: "new"
  },
  {
    id: 11,
    title: "Need white label website builder for ongoing digital marketing client accounts",
    buyer_name: "@apex_agency (LinkedIn Client)",
    budget: "$2,500 / month",
    platform: "LinkedIn",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7251894049182940384",
    posted_at_wat: "2026-10-14 11:23 AM WAT",
    pitch_angle: "Offer white-label client turnaround agreement with branded staging previews.",
    raw_text: "Need white label website builder. We sell SEO/Ads to local businesses and need a reliable builder to churn out 3-4 sites/month.",
    status: "new"
  },
  {
    id: 12,
    title: "Can someone help me with my Wix website store checkout bug?",
    buyer_name: "@chic_home (Facebook)",
    budget: "$150",
    platform: "Facebook",
    link: "https://www.facebook.com/groups/wixusersgroup/posts/771829401928/",
    posted_at_wat: "2026-10-14 10:35 AM WAT",
    pitch_angle: "Offer immediate 2-hour bug diagnostic and mobile checkout resolution.",
    raw_text: "Can someone help me with my Wix website? Customers complain payment button freezes on mobile checkout. Need fixed ASAP.",
    status: "new"
  }
];

const INITIAL_JOBS = [
  {
    id: 1,
    job_title: "Executive Assistant to Managing Director",
    company: "Solina Centre for International Development and Research (SCIDaR)",
    location: "Abuja FCT, Nigeria",
    salary: "₦350,000 - ₦450,000 / month",
    link: "https://scidar.org/careers/executive-assistant-abuja-2026",
    email: "careers@scidar.org",
    source: "Jobberman / Direct Employer",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-15 12:05 AM WAT"
  },
  {
    id: 2,
    job_title: "Senior Administrative Officer & Facility Coordinator",
    company: "Eko Maintenance Services Limited",
    location: "Abuja FCT, Nigeria",
    salary: "₦280,000 - ₦340,000 / month",
    link: "https://www.jobberman.com/listings/senior-administrative-officer-abuja-891028",
    email: "recruitment@ekomaintenance.com",
    source: "Jobberman",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 10:35 PM WAT"
  },
  {
    id: 3,
    job_title: "Virtual Executive Assistant (US/UK Client Support)",
    company: "Openhill Global LLC",
    location: "Remote Nigeria",
    salary: "₦290,000 / month ($350)",
    link: "https://www.myjobmag.com/jobs/virtual-assistant-remote-openhill-2026",
    email: "talent@openhillglobal.com",
    source: "MyJobMag",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 09:23 PM WAT"
  },
  {
    id: 4,
    job_title: "Executive Personal Assistant to CEO",
    company: "Akman Digitals Consulting",
    location: "Remote Nigeria / Abuja Hybrid",
    salary: "₦290,000 / month",
    link: "https://www.linkedin.com/jobs/view/executive-pa-akman-digitals-729182048",
    email: "hr@akmandigitals.com",
    source: "LinkedIn Jobs",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 08:35 PM WAT"
  },
  {
    id: 5,
    job_title: "Executive Assistant to Regional Director",
    company: "Action Against Hunger (ACF Nigeria)",
    location: "Abuja FCT, Nigeria",
    salary: "₦420,000 - ₦550,000 / month",
    link: "https://careers.actionagainsthunger.org/job/ea-regional-abuja-2026",
    email: "recruitment@ng-actionagainsthunger.org",
    source: "Direct Employer / NGO",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 03:35 PM WAT"
  },
  {
    id: 6,
    job_title: "Bilingual Executive Assistant (French/English)",
    company: "ECOWAS Trade & Investment Commission Partner",
    location: "Abuja FCT, Nigeria",
    salary: "₦450,000 - ₦600,000 / month",
    link: "https://www.myjobmag.com/jobs/bilingual-executive-assistant-abuja",
    email: "applications@ecowastrade.org",
    source: "MyJobMag",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 10:05 AM WAT"
  },
  {
    id: 7,
    job_title: "Office Administrator & Travel Protocol Officer",
    company: "Apex Minerals & Energy Resources Ltd",
    location: "Abuja FCT, Nigeria",
    salary: "₦300,000 / month",
    link: "https://www.jobberman.com/listings/office-administrator-travel-abuja-99128",
    email: "hr@apexminerals.ng",
    source: "Jobberman",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 12:47 PM WAT"
  },
  {
    id: 8,
    job_title: "Executive Assistant to Vice President",
    company: "Veritas Healthcare Partners",
    location: "Abuja FCT, Nigeria",
    salary: "₦320,000 - ₦380,000 / month",
    link: "https://www.hotnigerianjobs.com/hotjobs/executive-assistant-veritas-abuja",
    email: "talent@veritashealth.ng",
    source: "HotNigerianJobs NG",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 11:29 AM WAT"
  },
  {
    id: 9,
    job_title: "HR & Administrative Officer",
    company: "a Manufacturing Company - DMOT Enterprises",
    location: "Remote Nigeria",
    salary: "₦250,000 - ₦350,000 / month",
    link: "https://www.hotnigerianjobs.com/hotjobs/974878/human-resource-admin-officer-at-a-manufacturing-co.html",
    email: "careers@dmotenterprises.com",
    source: "HotNigerianJobs NG",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-15 01:35 AM WAT"
  },
  {
    id: 10,
    job_title: "Confidential Secretary & Document Controller",
    company: "Primegate Chambers & Legal Advisory",
    location: "Abuja FCT, Nigeria",
    salary: "₦220,000 - ₦260,000 / month",
    link: "https://www.jobberman.com/listings/confidential-secretary-abuja-771928",
    email: "admin@primegatechambers.ng",
    source: "Jobberman",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 07:05 PM WAT"
  },
  {
    id: 11,
    job_title: "Virtual Operations & Admin Assistant",
    company: "ScaleApex Africa Retainer",
    location: "Remote Nigeria",
    salary: "₦260,000 / month",
    link: "https://www.myjobmag.com/jobs/operations-virtual-assistant-scaleapex",
    email: "jobs@scaleapex.io",
    source: "MyJobMag",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 05:47 PM WAT"
  },
  {
    id: 12,
    job_title: "Remote Administrative & Data Entry Assistant",
    company: "KloudLogix Tech Solutions",
    location: "Remote Nigeria / Lagos",
    salary: "₦250,000 / month",
    link: "https://www.linkedin.com/jobs/view/remote-admin-assistant-kloudlogix",
    email: "careers@kloudlogix.tech",
    source: "LinkedIn Jobs",
    priority: "HIGH",
    status: "new",
    posted_at_wat: "2026-10-14 02:11 PM WAT"
  }
];

export default function LeadInboxPage({ isEmbedded = false }) {
  const [activeTab, setActiveTab] = useState('buyers'); // 'buyers' | 'jobs'
  const [buyers, setBuyers] = useState(INITIAL_BUYERS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedPitchId, setCopiedPitchId] = useState(null);
  const [copiedEmailId, setCopiedEmailId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLeadIds, setExpandedLeadIds] = useState(new Set());

  const listContainerRef = useRef(null);

  const toggleExpandLead = (leadId) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  // Sync live leads from Supabase on load and on demand
  const loadCloudLeads = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const [cloudBuyers, cloudJobs] = await Promise.all([
        fetchBuyerLeads(100),
        fetchCorporateJobs(100)
      ]);

      if (cloudBuyers && cloudBuyers.length > 0) {
        setBuyers(cloudBuyers);
      }
      if (cloudJobs && cloudJobs.length > 0) {
        setJobs(cloudJobs);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Failed to load cloud leads, falling back to local pile:', err);
    } finally {
      if (showIndicator) setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCloudLeads(false);
  }, [loadCloudLeads]);

  // Auto-sync every 60 seconds so counts automatically increase in the background
  useEffect(() => {
    const timer = setInterval(() => {
      loadCloudLeads(false);
    }, 60000);
    return () => clearInterval(timer);
  }, [loadCloudLeads]);

  // Reset pagination when filters, tabs, or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, platformFilter, locationFilter, statusFilter]);

  const scrollToTop = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1-Click Copy Pitch Hook
  const handleCopyPitch = (lead) => {
    const textToCopy = `Hey ${lead.buyer_name || 'there'},\n\n${lead.pitch_angle}\n\nSaw your post regarding: "${lead.title}". Would love to discuss this directly!`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPitchId(lead.id);
    setTimeout(() => setCopiedPitchId(null), 2500);
  };

  // 1-Click Copy Recruiter Email
  const handleCopyEmail = (job) => {
    navigator.clipboard.writeText(job.email);
    setCopiedEmailId(job.id);
    setTimeout(() => setCopiedEmailId(null), 2500);
  };

  // Status toggle handler
  const handleStatusChange = async (type, item, nextStatus) => {
    if (type === 'buyer') {
      setBuyers(prev => prev.map(b => b.link === item.link ? { ...b, status: nextStatus } : b));
      await updateLeadStatus('client_outreach_proposals_pile', item.link, nextStatus);
    } else {
      setJobs(prev => prev.map(j => j.link === item.link ? { ...j, status: nextStatus } : j));
      await updateLeadStatus('admin_va_jobs_pile', item.link, nextStatus);
    }
  };

  // Export CSV functions
  const handleExportCSV = (type) => {
    const data = type === 'buyers' ? buyers : jobs;
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_pile_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Buyers
  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        b.title?.toLowerCase().includes(q) || 
        b.buyer_name?.toLowerCase().includes(q) || 
        b.pitch_angle?.toLowerCase().includes(q) ||
        b.platform?.toLowerCase().includes(q);
      const matchPlatform = platformFilter === 'ALL' || b.platform?.toLowerCase().includes(platformFilter.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || (b.status || 'new') === statusFilter;
      return matchQuery && matchPlatform && matchStatus;
    });
  }, [buyers, searchQuery, platformFilter, statusFilter]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        j.job_title?.toLowerCase().includes(q) || 
        j.company?.toLowerCase().includes(q) || 
        j.location?.toLowerCase().includes(q) ||
        j.email?.toLowerCase().includes(q);
      const matchLocation = locationFilter === 'ALL' || j.location?.toLowerCase().includes(locationFilter.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || (j.status || 'new') === statusFilter;
      return matchQuery && matchLocation && matchStatus;
    });
  }, [jobs, searchQuery, locationFilter, statusFilter]);

  // Active items and pagination calculations
  const activeItems = activeTab === 'buyers' ? filteredBuyers : filteredJobs;
  const totalItems = activeItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [activeItems, currentPage]);

  const contactedCount = activeTab === 'buyers'
    ? buyers.filter(b => b.status === 'contacted' || b.status === 'won').length
    : jobs.filter(j => j.status === 'applied').length;

  const getPlatformBadge = (platform = '') => {
    const p = platform.toLowerCase();
    if (p.includes('threads')) return 'bg-slate-900 text-white';
    if (p.includes('twitter') || p.includes('x')) return 'bg-[#0E121B] text-white';
    if (p.includes('facebook')) return 'bg-blue-600 text-white';
    if (p.includes('linkedin')) return 'bg-[#0077B5] text-white';
    if (p.includes('reddit')) return 'bg-orange-600 text-white';
    return 'bg-purple-600 text-white';
  };

  return (
    <div className={isEmbedded ? "w-full" : "min-h-screen bg-[#F8F9FE] pt-24 pb-20"}>
      <div className={isEmbedded ? "w-full space-y-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"}>
        
        {/* Header Hero Banner (Clean, Airy & Native to Ophancer) */}
        {!isEmbedded && (
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0E121B] font-heading tracking-tight">
              Direct Client Leads &amp; Outreach Radar
            </h1>
            <p className="text-sm text-[#525866] max-w-xl mx-auto leading-relaxed">
              Curated direct buyer inquiries from social channels and verified corporate vacancies across Abuja, Lagos, and Remote Nigeria.
            </p>
          </div>
        )}

        {/* Live Sync Control Strip */}
        <div className="flex items-center justify-between text-xs text-[#525866] px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-[#0E121B] font-semibold">
              Live Cloud Radar Active
            </span>
            <span className="text-[11px] text-[#99A0AE] hidden sm:inline">
              • Auto-syncs every 60s
            </span>
          </div>

          <button
            onClick={() => loadCloudLeads(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EBEFF5] hover:border-[#6962F1] text-[11px] font-semibold text-[#0E121B] hover:text-[#6962F1] transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh leads from Supabase"
          >
            <RefreshCw className={`w-3 h-3 text-[#6962F1] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Radar'}</span>
            {lastRefreshed && (
              <span className="text-[10px] text-[#99A0AE] font-mono hidden md:inline">
                ({lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
              </span>
            )}
          </button>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBEFF5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#525866] uppercase tracking-wider">Direct Social Buyers</span>
              <Target className="w-4 h-4 text-[#6962F1]" />
            </div>
            <div className="text-2xl font-black text-[#0E121B] mt-2 font-heading">{buyers.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Scanned from Threads, X, FB</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBEFF5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#525866] uppercase tracking-wider">Corporate Vacancies</span>
              <Briefcase className="w-4 h-4 text-[#6962F1]" />
            </div>
            <div className="text-2xl font-black text-[#0E121B] mt-2 font-heading">{jobs.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Abuja &amp; Remote Nigeria</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBEFF5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#525866] uppercase tracking-wider">Pitched / Contacted</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2 font-heading">{contactedCount}</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Tracked in this session</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBEFF5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#525866] uppercase tracking-wider">Radar Frequency</span>
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-[#6962F1] mt-2 font-heading">5 Mins</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Automated background sync</div>
          </div>
        </div>

        {/* VIP Telegram Alert Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-[#1E1B4B] to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white border border-white/10 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
              <span>⭐ VIP Telegram Alerts</span>
              <span>•</span>
              <span>Personal Instant DMs</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-heading">
              Want private instant alerts for Virtual Assistant or Tech roles?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect directly to our Telegram Bot. Receive instant private pings the moment matching jobs drop, with ready-to-send pitch hooks and 1-tap Telegram Stars checkout.
            </p>
          </div>

          <a
            href="https://t.me/OphancerAlertsBot?start=va"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#605CF8] hover:bg-[#504CD7] text-white text-xs font-bold whitespace-nowrap transition-all shadow-md active:scale-95 shrink-0 w-full sm:w-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Connect Private Alerts</span>
          </a>
        </div>

        {/* Controls Console: Tabs + Search + CSV Export */}
        <div ref={listContainerRef} className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            
            {/* Primary Tab Switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-white border border-[#EBEFF5] shadow-xs self-start w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('buyers')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'buyers'
                    ? 'bg-[#6962F1] text-white shadow-xs'
                    : 'text-[#525866] hover:text-[#0E121B]'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Direct Social Buyers ({buyers.length})</span>
              </button>
              
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-[#6962F1] text-white shadow-xs'
                    : 'text-[#525866] hover:text-[#0E121B]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Abuja &amp; Remote Roles ({jobs.length})</span>
              </button>
            </div>

            {/* Search Input + Export Button */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-[#99A0AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={activeTab === 'buyers' ? 'Search Wix, VA, budget...' : 'Search SCIDaR, EA, Abuja...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#EBEFF5] rounded-xl pl-9 pr-8 py-2 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10 shadow-xs"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => handleExportCSV(activeTab)}
                title="Download CSV"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0E121B] text-xs font-bold border border-[#EBEFF5] shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#6962F1]" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Sub-Filters (Platform for Buyers / Location for Jobs) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar w-full sm:w-auto">
              <span className="text-[#525866] font-bold shrink-0 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" /> {activeTab === 'buyers' ? 'Platform:' : 'Location:'}
              </span>
              
              {activeTab === 'buyers' ? (
                ['ALL', 'Threads', 'Twitter/X', 'Facebook', 'LinkedIn', 'Reddit'].map(plat => (
                  <button
                    key={plat}
                    onClick={() => setPlatformFilter(plat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      platformFilter === plat
                        ? 'bg-[#0E121B] text-white shadow-xs'
                        : 'bg-white text-[#525866] hover:bg-slate-100 border border-[#EBEFF5]'
                    }`}
                  >
                    {plat}
                  </button>
                ))
              ) : (
                ['ALL', 'Abuja', 'Remote', 'Lagos'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setLocationFilter(loc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      locationFilter === loc
                        ? 'bg-[#0E121B] text-white shadow-xs'
                        : 'bg-white text-[#525866] hover:bg-slate-100 border border-[#EBEFF5]'
                    }`}
                  >
                    {loc === 'ALL' ? 'All Locations' : loc}
                  </button>
                ))
              )}
            </div>

            {/* Status Filter with Styled Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#525866] font-semibold text-[11px]">Status:</span>
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={FILTER_STATUS_OPTIONS}
                size="sm"
                className="w-36"
              />
            </div>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-[#525866] font-medium px-1">
          <span>
            Showing <strong className="text-[#0E121B]">{totalItems > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong>–<strong className="text-[#0E121B]">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> of <strong className="text-[#0E121B]">{totalItems}</strong> {activeTab === 'buyers' ? 'direct client requests' : 'corporate roles'}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Page {currentPage} of {totalPages}</span>
        </div>

        {/* ----------------- CARDS GRID: CLEAN & ELEGANT ----------------- */}
        {totalItems === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EBEFF5] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0E121B]">No matching leads found</h3>
            <p className="text-xs text-[#525866] max-w-sm mx-auto">
              Try adjusting your search keywords or resetting filters to see active leads.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPlatformFilter('ALL');
                setLocationFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6962F1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {activeTab === 'buyers' ? (
              paginatedItems.map((lead) => {
                const isContacted = lead.status === 'contacted';
                const isWon = lead.status === 'won';

                return (
                  <div
                    key={lead.id || lead.link}
                    className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between gap-4 overflow-hidden ${
                      isWon
                        ? 'border border-emerald-300 bg-emerald-50/15'
                        : isContacted
                        ? 'border border-violet-200 bg-slate-50/30'
                        : 'job-container-blue-border bg-white'
                    }`}
                  >
                    {/* Header Row: Platform Badge + Buyer + Budget */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${getPlatformBadge(lead.platform)}`}>
                            {lead.platform}
                          </span>
                          <span className="text-xs font-bold text-[#525866] truncate max-w-[140px] sm:max-w-[180px]">
                            {lead.buyer_name}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200/80 shrink-0">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{lead.budget}</span>
                        </div>
                      </div>

                      {/* Title & Client Snippet */}
                      <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading leading-snug">
                          {lead.title}
                        </h3>
                        {lead.raw_text && (() => {
                          const leadKey = lead.id || lead.link;
                          const isExpanded = expandedLeadIds.has(leadKey);
                          const isLong = lead.raw_text.length > 180;
                          const displayText = isLong && !isExpanded 
                            ? `${lead.raw_text.slice(0, 180).trim()}...` 
                            : lead.raw_text;

                          return (
                            <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#EBEFF5] text-xs text-[#525866] leading-relaxed">
                              <p className="whitespace-pre-line">
                                "{displayText}"
                              </p>
                              {isLong && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpandLead(leadKey)}
                                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#6962F1] hover:text-[#504CD7] cursor-pointer"
                                >
                                  <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Pitch Strategy Box (Clean & Clear, No Sparkles) */}
                      <div className="p-3.5 rounded-xl bg-[#EEF0FD]/70 border border-[#D6D8FB] space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6962F1] uppercase tracking-wide">
                            <Lightbulb className="w-3.5 h-3.5 text-[#6962F1]" />
                            <span>Recommended Pitch Hook:</span>
                          </div>
                          <span className="text-[10px] text-[#525866] font-mono">
                            {lead.posted_at_wat?.split(' ')[1] || 'Today'}
                          </span>
                        </div>
                        <p className="text-xs text-[#1E1B4B] font-medium leading-relaxed italic">
                          "{lead.pitch_angle}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-[#EBEFF5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      {/* Status Selector with CustomSelect */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-[#525866] font-semibold">Status:</span>
                        <CustomSelect
                          value={lead.status || 'new'}
                          onChange={(nextVal) => handleStatusChange('buyer', lead, nextVal)}
                          options={STATUS_OPTIONS}
                          size="sm"
                          className="w-32 sm:w-36"
                        />
                      </div>

                      {/* Primary Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPitch(lead)}
                          className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 ${
                            copiedPitchId === lead.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-slate-50 border border-slate-300 text-[#0E121B]'
                          }`}
                        >
                          {copiedPitchId === lead.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="whitespace-nowrap">Copied! ✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#6962F1]" />
                              <span className="whitespace-nowrap">Copy Pitch</span>
                            </>
                          )}
                        </button>

                        <a
                          href={lead.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                          <span>Open Post</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              paginatedItems.map((job) => {
                const isHigh = job.priority === 'HIGH';
                const isApplied = job.status === 'applied';

                return (
                  <div
                    key={job.id || job.link}
                    className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between gap-4 overflow-hidden ${
                      isApplied
                        ? 'border border-emerald-300 bg-emerald-50/15'
                        : 'job-container-blue-border bg-white'
                    }`}
                  >
                    {/* Top Row: Priority Badge + Salary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider border border-amber-300/80">
                            ★ High Priority (Abuja / ₦250k+)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                            Verified Vacancy
                          </span>
                        )}

                        <div className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shrink-0">
                          {job.salary}
                        </div>
                      </div>

                      {/* Job Title & Company */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading leading-snug">
                          {job.job_title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#525866]">
                          <Building2 className="w-3.5 h-3.5 text-[#6962F1] shrink-0" />
                          <span className="font-semibold text-[#2D3139]">{job.company}</span>
                        </div>
                      </div>

                      {/* Location & Source */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#525866]">
                        <span className="inline-flex items-center gap-1 bg-[#F8F9FE] px-2.5 py-1 rounded-lg border border-[#EBEFF5]">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{job.location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                          Source: {job.source}
                        </span>
                      </div>

                      {/* Recruiter Email Bar if Available */}
                      {job.email && job.email.includes('@') && (
                        <div className="p-3 rounded-xl bg-[#F8F9FE] border border-[#EBEFF5] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-[#6962F1] shrink-0" />
                            <span className="text-xs font-mono text-[#0E121B] truncate select-all">
                              {job.email}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyEmail(job)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-[#2D3139] shrink-0 cursor-pointer"
                          >
                            {copiedEmailId === job.id ? 'Copied! ✓' : 'Copy Email'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Console */}
                    <div className="pt-3 border-t border-[#EBEFF5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-[#525866] font-semibold">Status:</span>
                        <CustomSelect
                          value={job.status || 'new'}
                          onChange={(nextVal) => handleStatusChange('job', job, nextVal)}
                          options={JOB_STATUS_OPTIONS}
                          size="sm"
                          className="w-32 sm:w-36"
                        />
                      </div>

                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <span>Apply on Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ----------------- CLEAN PAGINATION BAR ----------------- */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EBEFF5]">
            <div className="text-xs text-[#525866]">
              Showing <span className="font-bold text-[#0E121B]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-[#0E121B]">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>{' '}
              of <span className="font-bold text-[#0E121B]">{totalItems}</span> leads
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  scrollToTop();
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0E121B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          scrollToTop();
                        }}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#6962F1] text-white shadow-xs'
                            : 'bg-white border border-[#EBEFF5] text-[#525866] hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-slate-400 px-1 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  scrollToTop();
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0E121B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
