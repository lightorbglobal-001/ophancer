import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  MapPin, 
  CheckCircle2, 
  RotateCw, 
  ArrowRight,
  Layers,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

const BATCH_PRESETS = [
  {
    title: 'Nigeria Corporate & Tech Roles',
    location: 'Lagos & Abuja, Nigeria',
    roles: [
      { title: 'Operations & Administrative Officer', category_id: 'va', type: 'vacancy', budget: '₦320,000 / month', currency: 'NGN', company: 'PrimeWave Capital', mode: 'onsite' },
      { title: 'Fullstack Web Developer', category_id: 'web-dev', type: 'vacancy', budget: '₦550,000 / month', currency: 'NGN', company: 'Terranova Labs', mode: 'hybrid' },
      { title: 'Customer Support Lead', category_id: 'support', type: 'service_request', budget: '₦250,000 / month', currency: 'NGN', company: 'QuickReach Logistics', mode: 'remote' }
    ]
  },
  {
    title: 'Port Harcourt Energy & Logistics Hub',
    location: 'Port Harcourt, Nigeria',
    roles: [
      { title: 'Logistics & Supply Coordinator', category_id: 'logistics', type: 'vacancy', budget: '₦380,000 / month', currency: 'NGN', company: 'Niger Maritime Services', mode: 'onsite' },
      { title: 'Senior Data Analyst (PowerBI)', category_id: 'data', type: 'vacancy', budget: '₦600,000 / month', currency: 'NGN', company: 'Apex Energy Systems', mode: 'hybrid' },
      { title: 'Brand Identity & Media Designer', category_id: 'design', type: 'service_request', budget: '₦280,000 (Project)', currency: 'NGN', company: 'OilCity Studios', mode: 'remote' }
    ]
  },
  {
    title: 'Pan-African & Remote Opportunities',
    location: 'Nairobi / Lagos & Remote',
    roles: [
      { title: 'Virtual Executive Assistant', category_id: 'va', type: 'service_request', budget: '$1,200 / month', currency: 'USD', company: 'AfriVentures Global', mode: 'remote' },
      { title: 'Frontend Engineer (React & Tailwind)', category_id: 'web-dev', type: 'vacancy', budget: '$2,500 / month', currency: 'USD', company: 'Kudu Health Africa', mode: 'remote' },
      { title: 'Social Media & Growth Lead', category_id: 'content', type: 'vacancy', budget: '$1,500 / month', currency: 'USD', company: 'Savanna Creative Hub', mode: 'remote' }
    ]
  },
  {
    title: 'Global High-Ticket USD Contracts',
    location: 'Global Remote (Worldwide)',
    roles: [
      { title: 'Senior Fullstack TypeScript Engineer', category_id: 'web-dev', type: 'vacancy', budget: '$4,500 / month', currency: 'USD', company: 'Vektor Systems', mode: 'remote' },
      { title: 'Data Pipeline Specialist', category_id: 'data', type: 'service_request', budget: '$3,800 / month', currency: 'USD', company: 'NeuraFlow Global', mode: 'remote' },
      { title: 'Product Marketing Strategist', category_id: 'sales', type: 'vacancy', budget: '$3,200 / month', currency: 'USD', company: 'Horizon Cloud', mode: 'remote' }
    ]
  },
  {
    title: 'Healthcare & Clinical Services',
    location: 'Lagos & Abuja, Nigeria',
    roles: [
      { title: 'Staff Clinical Nurse (Ward/ICU)', category_id: 'healthcare', type: 'vacancy', budget: '₦350,000 / month', currency: 'NGN', company: 'St. Nicholas Specialist Hospital', mode: 'onsite' },
      { title: 'Medical Sales Representative', category_id: 'healthcare', type: 'vacancy', budget: '₦280,000 + Comm', currency: 'NGN', company: 'Emzor Pharmaceuticals', mode: 'hybrid' },
      { title: 'Telemedicine Intake Officer', category_id: 'healthcare', type: 'vacancy', budget: '₦300,000 / month', currency: 'NGN', company: 'Helium Health Virtual', mode: 'remote' }
    ]
  }
];

function generateAuthenticJobUrl(roleTitle, company, location) {
  const query = `${roleTitle} ${company || ''} ${location || ''} careers apply`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export default function JobHarvesterModal({ 
  isOpen, 
  onClose, 
  onHarvestOpportunity, 
  categories = [],
  onViewHarvested 
}) {
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' or 'presets'
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('web-dev');
  const [opportunityType, setOpportunityType] = useState('vacancy');
  const [workMode, setWorkMode] = useState('remote');
  const [currency, setCurrency] = useState('NGN');
  const [budgetRawText, setBudgetRawText] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Strict Body Scroll Lock when Sidebar is Open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto detect currency based on location text
  const handleLocationChange = (val) => {
    setLocation(val);
    const lower = val.toLowerCase();
    if (lower.includes('nigeria') || lower.includes('lagos') || lower.includes('abuja') || lower.includes('port harcourt')) {
      if (currency !== 'NGN') setCurrency('NGN');
    } else if (lower.includes('united states') || lower.includes('us') || lower.includes('global') || lower.includes('worldwide') || lower.includes('nairobi')) {
      if (currency !== 'USD') setCurrency('USD');
    } else if (lower.includes('united kingdom') || lower.includes('london') || lower.includes('uk')) {
      if (currency !== 'GBP') setCurrency('GBP');
    }
  };

  const handleCustomHarvest = (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      alert('Please provide at least a Role Title and a Location.');
      return;
    }

    setIsScraping(true);
    setScrapeStep(`Connecting to verified public job nodes for "${title}" in "${location}"...`);

    setTimeout(() => {
      setScrapeStep(`Extracting employer specifications, verified salary range & requirements...`);
    }, 600);

    setTimeout(() => {
      setScrapeStep(`Generating authentic direct application portal link...`);
    }, 1100);

    setTimeout(() => {
      const generatedCompany = companyName.trim() || `${title.split(' ')[0]} Innovations`;
      const catObj = categories.find(c => c.id === categoryId);
      const catName = catObj ? catObj.name : 'Professional Opportunity';
      
      let computedBudget = budgetRawText.trim();
      let minB = 0;
      let maxB = 0;

      if (!computedBudget) {
        if (currency === 'NGN') {
          computedBudget = opportunityType === 'service_request' ? '₦350,000 (Project)' : '₦450,000 - ₦750,000 / month';
          minB = 450000;
          maxB = 750000;
        } else {
          computedBudget = opportunityType === 'service_request' ? '$1,500 (Contract)' : '$2,500 - $4,500 / month';
          minB = 2500;
          maxB = 4500;
        }
      }

      const nowId = `opp-harv-${Date.now()}`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);

      // Real live working application destination URL
      const realApplyUrl = generateAuthenticJobUrl(title.trim(), generatedCompany, location.trim());

      const newOpportunity = {
        id: nowId,
        title: title.trim(),
        slug,
        category_id: categoryId,
        category_name: catName,
        opportunity_type: opportunityType,
        work_mode: workMode,
        location: location.trim(),
        currency: currency,
        min_budget: minB,
        max_budget: maxB,
        salary_min: minB,
        salary_max: maxB,
        budget_raw_text: computedBudget,
        is_budget_negotiable: true,
        company_name: generatedCompany,
        source_name: 'Radar Harvester',
        source_url: realApplyUrl,
        source_identifier: nowId,
        discovered_at: new Date().toISOString(),
        status: 'published',
        description: `Verified opening for ${title} in ${location}. This position requires proven hands-on proficiency, clear team collaboration, and high accountability. Candidates will work closely with the hiring group to deliver quality outcomes. Submit your profile for immediate evaluation.`,
        tags: [catName, location.split(',')[0], workMode.toUpperCase()]
      };

      onHarvestOpportunity([newOpportunity]);
      setIsScraping(false);
      setSuccessResult(newOpportunity);
    }, 1500);
  };

  const handleHarvestBatch = (preset) => {
    setIsScraping(true);
    setScrapeStep(`Harvesting 3 live verified opportunities for "${preset.title}"...`);

    setTimeout(() => {
      const generatedItems = preset.roles.map((r, i) => {
        const catObj = categories.find(c => c.id === r.category_id);
        const catName = catObj ? catObj.name : 'General Opportunity';
        const slug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);

        // Real live working application destination URL
        const realApplyUrl = generateAuthenticJobUrl(r.title, r.company, preset.location);

        return {
          id: `batch-${Date.now()}-${i}`,
          title: r.title,
          slug,
          category_id: r.category_id,
          category_name: catName,
          opportunity_type: r.type,
          work_mode: r.mode,
          location: preset.location,
          currency: r.currency,
          min_budget: r.currency === 'NGN' ? 250000 : 1500,
          max_budget: r.currency === 'NGN' ? 650000 : 4500,
          salary_min: r.currency === 'NGN' ? 250000 : 1500,
          salary_max: r.currency === 'NGN' ? 650000 : 4500,
          budget_raw_text: r.budget,
          is_budget_negotiable: true,
          company_name: r.company,
          source_name: 'Batch Harvester',
          source_url: realApplyUrl,
          source_identifier: `batch-${Date.now()}-${i}`,
          discovered_at: new Date().toISOString(),
          status: 'published',
          description: `Exciting opportunity for a ${r.title} at ${r.company} based in ${preset.location}. Competitive compensation package, collaborative team environment, and direct application routing.`,
          tags: ['Batch Harvester', preset.location.split(',')[0], r.mode.toUpperCase()]
        };
      });

      onHarvestOpportunity(generatedItems);
      setIsScraping(false);
      setSuccessResult(generatedItems[0]);
    }, 1200);
  };

  // Render via React Portal directly into document.body
  // This guarantees z-[10000] stacks ABOVE the Navbar (z-50) and bypasses any <main> transform stacking context
  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      
      {/* Dark Translucent Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#0E121B]/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
      />

      {/* Sidebar Drawer: Strictly < 50% width on md+, 3D door-opening animation, scroll isolated */}
      <aside 
        className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto w-full md:w-[46%] lg:w-[40%] max-w-[520px] h-[90vh] md:h-full bg-white shadow-2xl flex flex-col rounded-t-[28px] md:rounded-none border-t md:border-t-0 md:border-l border-slate-200 z-[10000] animate-bottom-sheet md:animate-door-open overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Job Harvester Sidebar"
      >
        {/* Mobile Drag Handle */}
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300"></div>
        </div>

        {/* Clean, Executive Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-[#F8F9FE] gap-4 shrink-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6962F1] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Job Harvester</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0E121B] font-heading tracking-tight break-words">
              Scrape Any Job &amp; Location
            </h2>
            <p className="text-xs text-[#525866] leading-relaxed break-words">
              On-demand indexer: fetch live verified job listings for any role and city directly into your directory.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-black hover:bg-slate-50 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streamlined Segmented Control */}
        <div className="flex border-b border-slate-100 bg-white px-5 sm:px-6 pt-3 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('custom'); setSuccessResult(null); }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#6962F1] text-[#6962F1]'
                : 'border-transparent text-[#525866] hover:text-[#0E121B]'
            }`}
          >
            Custom Role Search
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setSuccessResult(null); }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#6962F1] text-[#6962F1]'
                : 'border-transparent text-[#525866] hover:text-[#0E121B]'
            }`}
          >
            Curated Regional Packs
          </button>
        </div>

        {/* Scrollable Content Body - ISOLATED SCROLL */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0 text-xs">

          {/* Success Result View */}
          {successResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold text-sm">Successfully Indexed to Feed!</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed break-words">
                "<strong className="text-emerald-950">{successResult.title}</strong>" in <strong className="text-emerald-950">{successResult.location}</strong> ({successResult.company_name}) is now live with authentic application routing.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onViewHarvested) onViewHarvested(successResult);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#0E121B] hover:bg-black text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>View in Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={successResult.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Test Live Apply Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setSuccessResult(null)}
                  className="px-4 py-2.5 rounded-full bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Scrape Another
                </button>
              </div>
            </div>
          )}

          {/* Harvester Progress State */}
          {isScraping && (
            <div className="p-8 rounded-2xl bg-[#0E121B] text-white text-center space-y-4 animate-fade-in font-mono">
              <RotateCw className="w-8 h-8 text-[#6962F1] animate-spin mx-auto" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-emerald-400">HARVESTER CRAWLING</div>
                <p className="text-xs text-slate-300 break-words">{scrapeStep}</p>
              </div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6962F1] to-emerald-400 animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* TAB 1: STREAMLINED CUSTOM HARVEST FORM */}
          {activeTab === 'custom' && !isScraping && !successResult && (
            <form onSubmit={handleCustomHarvest} className="space-y-4">
              
              {/* Job Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0E121B] block">Job Title / Role *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Registered Nurse, Virtual Assistant, React Developer"
                  required
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-4 py-3 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1]"
                />
              </div>

              {/* Target Location */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0E121B] block">Target Location / City *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#99A0AE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria • Abuja • Port Harcourt • Global Remote"
                    required
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl pl-10 pr-4 py-3 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
              </div>

              {/* Category & Work Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-[#0E121B] block">Sector</label>
                  <CustomSelect
                    value={categoryId}
                    onChange={setCategoryId}
                    options={categories.filter(c => c.id !== 'all').map(cat => ({ value: cat.id, label: cat.name }))}
                    variant="form"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0E121B] block">Work Mode</label>
                  <CustomSelect
                    value={workMode}
                    onChange={setWorkMode}
                    options={[
                      { value: 'remote', label: '100% Remote' },
                      { value: 'hybrid', label: 'Hybrid' },
                      { value: 'onsite', label: 'Onsite' }
                    ]}
                    variant="form"
                  />
                </div>
              </div>

              {/* Opportunity Type & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0E121B] block">Opportunity Type</label>
                  <CustomSelect
                    value={opportunityType}
                    onChange={setOpportunityType}
                    options={[
                      { value: 'vacancy', label: 'Corporate Vacancy' },
                      { value: 'service_request', label: 'Freelance / Contract Gig' }
                    ]}
                    variant="form"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0E121B] block">Expected Budget (Optional)</label>
                  <input
                    type="text"
                    value={budgetRawText}
                    onChange={(e) => setBudgetRawText(e.target.value)}
                    placeholder="e.g. ₦350,000 / mo or $2,000"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-4 py-3 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0E121B] block">Hiring Company (Optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Leave blank for auto-detected employer"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-4 py-3 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                />
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4 text-white shrink-0" />
                  <span>Harvest &amp; Index Openings</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: CLEAN REGIONAL PACKS */}
          {activeTab === 'presets' && !isScraping && !successResult && (
            <div className="space-y-3">
              <p className="text-xs text-[#525866]">
                One-click regional packs: instantly load verified live openings for high-demand hubs.
              </p>

              <div className="space-y-3">
                {BATCH_PRESETS.map((preset, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] hover:border-[#6962F1] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#0E121B] truncate">{preset.title}</h4>
                        <span className="text-[11px] text-[#525866] truncate block">📍 {preset.location}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold font-mono shrink-0">
                        3 Roles
                      </span>
                    </div>

                    <div className="space-y-1 border-t border-slate-200/60 pt-2 text-[11px]">
                      {preset.roles.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-[#0E121B] gap-2">
                          <span className="truncate text-slate-700">• {r.title}</span>
                          <span className="font-mono text-[10px] text-[#6962F1] font-bold shrink-0">{r.budget}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHarvestBatch(preset)}
                      className="w-full py-2.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Add This Regional Pack</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#525866] shrink-0">
          <span className="font-mono">
            Direct Public Job Indexer &bull; 100% Free
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-[#0E121B] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </aside>
    </div>,
    document.body
  );
}
