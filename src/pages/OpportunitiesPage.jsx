import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  MapPin, 
  Bookmark, 
  ArrowRight, 
  X, 
  Grid3X3, 
  List, 
  AlertCircle, 
  RotateCcw, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Plus, 
  SlidersHorizontal, 
  Briefcase 
} from 'lucide-react';
import JobHarvesterModal from '../components/opportunities/JobHarvesterModal';
import CustomSelect from '../components/common/CustomSelect';

const ITEMS_PER_PAGE = 9;

const GRADIENT_PALETTES = [
  { bg: 'from-[#6962F1] to-[#8B5CF6]', text: 'text-white' },
  { bg: 'from-[#0284C7] to-[#0EA5E9]', text: 'text-white' },
  { bg: 'from-[#059669] to-[#10B981]', text: 'text-white' },
  { bg: 'from-[#D97706] to-[#F59E0B]', text: 'text-white' },
  { bg: 'from-[#6366F1] to-[#4F46E5]', text: 'text-white' },
  { bg: 'from-[#E11D48] to-[#F43F5E]', text: 'text-white' },
];

function getCompanyInitials(name) {
  if (!name) return 'OP';
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getCompanyColor(name) {
  if (!name) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[idx];
}

export default function OpportunitiesPage({ 
  opportunities, 
  categories, 
  setActivePage, 
  setSelectedOpportunity, 
  searchQuery, 
  setSearchQuery,
  bookmarks = [], 
  toggleBookmark,
  onHarvestOpportunity
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isHarvesterOpen, setIsHarvesterOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Compute number of active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLocation !== 'all') count++;
    if (selectedType !== 'all') count++;
    if (selectedWorkMode !== 'all') count++;
    if (selectedCurrency !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [selectedLocation, selectedType, selectedWorkMode, selectedCurrency, sortBy]);

  // Lock body scroll when filter modal is open on mobile
  useEffect(() => {
    if (isFilterModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterModalOpen]);

  // Extract dynamic specific locations present in active opportunities
  const customLocations = useMemo(() => {
    const locSet = new Set();
    opportunities.forEach((o) => {
      if (o.location) {
        const trimmed = o.location.trim();
        if (
          trimmed && 
          !['Global Remote', 'Nigeria / Remote', 'Global Remote / Africa Eligible'].includes(trimmed)
        ) {
          locSet.add(trimmed);
        }
      }
    });
    return Array.from(locSet).slice(0, 14);
  }, [opportunities]);

  const getLocationLabel = (locVal) => {
    switch (locVal) {
      case 'nigeria': return 'Nigeria (All Cities)';
      case 'lagos': return 'Lagos, Nigeria';
      case 'abuja': return 'Abuja, Nigeria';
      case 'port-harcourt': return 'Port Harcourt, Nigeria';
      case 'africa': return 'Africa & Regional';
      case 'global-remote': return 'Global Remote (Worldwide)';
      case 'us-canada': return 'US & Canada';
      case 'uk-europe': return 'UK & Europe';
      default: return locVal;
    }
  };

  // Structured option configs for CustomSelect dropdowns
  const locationOptions = useMemo(() => {
    const base = [
      { value: 'all', label: 'All Locations (Global & Local)' },
      {
        group: 'Regional Presets',
        options: [
          { value: 'nigeria', label: '🇳🇬 Nigeria (All Cities)' },
          { value: 'lagos', label: '📍 Lagos, Nigeria' },
          { value: 'abuja', label: '📍 Abuja, Nigeria' },
          { value: 'port-harcourt', label: '📍 Port Harcourt, Nigeria' },
          { value: 'africa', label: '🌍 Africa & Regional' },
          { value: 'global-remote', label: '🌐 Global Remote (Worldwide)' },
          { value: 'us-canada', label: '🇺🇸 United States & Canada' },
          { value: 'uk-europe', label: '🇬🇧 UK & Europe' }
        ]
      }
    ];
    if (customLocations.length > 0) {
      base.push({
        group: 'Specific Harvested Locations',
        options: customLocations.map((loc) => ({ value: loc, label: `📍 ${loc}` }))
      });
    }
    return base;
  }, [customLocations]);

  const typeOptions = [
    { value: 'all', label: 'All Types (Gigs & Vacancies)' },
    { value: 'service_request', label: 'Client Gigs Only' },
    { value: 'vacancy', label: 'Company Vacancies Only' }
  ];

  const workModeOptions = [
    { value: 'all', label: 'All Work Modes' },
    { value: 'remote', label: 'Remote Only' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'Onsite' }
  ];

  const currencyOptions = [
    { value: 'all', label: 'All Currencies' },
    { value: 'NGN', label: 'Naira (₦)' },
    { value: 'USD', label: 'Dollar ($)' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Sort: Newest First' },
    { value: 'budget_high', label: 'Sort: Highest Pay' }
  ];

  // Reset to first page when any search/filter parameter shifts
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedWorkMode, selectedType, selectedCurrency, selectedLocation, sortBy]);

  const filteredOpportunities = useMemo(() => {
    const now = new Date();
    return opportunities.filter((opp) => {
      // Auto-filter stale expired opportunities
      if (opp.expires_at && new Date(opp.expires_at) < now) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = opp.title.toLowerCase().includes(query);
        const descMatch = opp.description.toLowerCase().includes(query);
        const companyMatch = opp.company_name.toLowerCase().includes(query);
        const tagMatch = opp.tags?.some(t => t.toLowerCase().includes(query));
        if (!titleMatch && !descMatch && !companyMatch && !tagMatch) return false;
      }

      if (selectedCategory !== 'all') {
        const matchesCategory = opp.category_id === selectedCategory ||
          (selectedCategory === 'design' && (opp.category_id === 'graphic-design' || opp.category_id === 'design')) ||
          (selectedCategory === 'content' && (opp.category_id === 'social' || opp.category_id === 'content'));
        if (!matchesCategory) return false;
      }
      if (selectedWorkMode !== 'all' && opp.work_mode !== selectedWorkMode) return false;
      if (selectedType !== 'all' && opp.opportunity_type !== selectedType) return false;
      if (selectedCurrency !== 'all' && opp.currency !== selectedCurrency) return false;

      if (selectedLocation !== 'all') {
        const loc = (opp.location || '').toLowerCase();
        if (selectedLocation === 'nigeria') {
          if (!loc.includes('nigeria') && !loc.includes('lagos') && !loc.includes('abuja') && !loc.includes('port harcourt') && !loc.includes('ibadan')) return false;
        } else if (selectedLocation === 'lagos') {
          if (!loc.includes('lagos')) return false;
        } else if (selectedLocation === 'abuja') {
          if (!loc.includes('abuja')) return false;
        } else if (selectedLocation === 'port-harcourt') {
          if (!loc.includes('port harcourt') && !loc.includes('harcourt')) return false;
        } else if (selectedLocation === 'africa') {
          if (!loc.includes('africa') && !loc.includes('nairobi') && !loc.includes('kenya') && !loc.includes('ghana') && !loc.includes('dakar') && !loc.includes('abidjan') && !loc.includes('nigeria') && !loc.includes('lagos') && !loc.includes('abuja') && !loc.includes('accra')) return false;
        } else if (selectedLocation === 'global-remote') {
          if (!loc.includes('global') && !loc.includes('worldwide')) return false;
        } else if (selectedLocation === 'us-canada') {
          if (!loc.includes('united states') && !loc.includes('canada') && !loc.includes('us')) return false;
        } else if (selectedLocation === 'uk-europe') {
          if (!loc.includes('united kingdom') && !loc.includes('uk') && !loc.includes('london') && !loc.includes('france') && !loc.includes('germany') && !loc.includes('poland') && !loc.includes('ireland') && !loc.includes('europe')) return false;
        } else {
          if (!loc.includes(selectedLocation.toLowerCase())) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.discovered_at || 0) - new Date(a.discovered_at || 0);
      if (sortBy === 'budget_high') return (b.salary_max || 0) - (a.salary_max || 0);
      return 0;
    });
  }, [opportunities, searchQuery, selectedCategory, selectedWorkMode, selectedType, selectedCurrency, selectedLocation, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE));
  const paginatedOpportunities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOpportunities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOpportunities, currentPage]);

  const handleOpportunityClick = (opp) => {
    setSelectedOpportunity(opp);
    setActivePage('opportunity-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const topAnchor = document.getElementById('listings-container-top');
    if (topAnchor) {
      topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 340, behavior: 'smooth' });
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedWorkMode('all');
    setSelectedType('all');
    setSelectedCurrency('all');
    setSelectedLocation('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedWorkMode !== 'all' || selectedType !== 'all' || selectedCurrency !== 'all' || selectedLocation !== 'all';

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        
        {/* Header Hero Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100 reveal-on-scroll">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight leading-tight">
              Find Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
              Explore {opportunities.length} live openings: corporate vacancies, freelance contracts, and client service requests indexed across all industries.
            </p>
          </div>

          {/* Counter Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF0FD] border border-[#D6D8FB] text-[#0E121B] text-xs font-semibold whitespace-nowrap self-start sm:self-auto shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>{filteredOpportunities.length} Available Listings</span>
          </div>
        </div>

        {/* Quick Category Navigation Bar - Horizontal swipe on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 snap-x">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 snap-start cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0E121B] text-white shadow-md'
                : 'bg-[#F8F9FE] text-[#525866] hover:text-[#0E121B] hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories ({opportunities.length})
          </button>
          {categories.filter(c => c.id !== 'all').map((cat) => {
            const count = opportunities.filter(o => o.category_id === cat.id).length;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 snap-start cursor-pointer ${
                  isActive
                    ? 'bg-[#6962F1] text-white shadow-md'
                    : 'bg-[#F8F9FE] text-[#525866] hover:text-[#0E121B] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name} {count > 0 && <span className="opacity-70 ml-1">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Structured Search & Controls Console (Center-Aligned) */}
        <div className="relative z-20 bg-[#F8F9FE] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 border border-[#EBEFF5] space-y-3.5 shadow-xs max-w-3xl mx-auto w-full">
          
          {/* Row 1: Search Input - Centered with max-w-xl */}
          <div className="relative w-full max-w-xl mx-auto">
            <Search className="w-4 h-4 text-[#99A0AE] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, company, skills, or keywords..."
              className="w-full bg-white border border-[#EBEFF5] rounded-full pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10 shadow-xs transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black p-1 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Row 2: Filter Button + Scrape Button + Grid & List Icons on a Single Centered Line */}
          <div className="flex items-center justify-center flex-nowrap gap-1.5 sm:gap-2.5 w-full max-w-xl mx-auto px-1">
            
            {/* Filter Trigger Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap ${
                activeFilterCount > 0
                  ? 'bg-[#0E121B] text-white hover:bg-black'
                  : 'bg-white border border-[#EBEFF5] text-[#0E121B] hover:border-[#6962F1] hover:text-[#6962F1]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#6962F1] text-white text-[10px] font-mono font-bold inline-flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Scrape Action Button */}
            <button
              onClick={() => setIsHarvesterOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all shadow-xs whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="hidden sm:inline">Scrape Any Job &amp; Location</span>
              <span className="sm:hidden">Scrape Jobs</span>
            </button>

            {/* View Mode Toggle (Grid & List) */}
            <div className="inline-flex items-center rounded-full bg-white border border-[#EBEFF5] p-0.5 sm:p-1 shadow-xs shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-full text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#EEF0FD] text-[#6962F1]' : 'text-[#99A0AE] hover:text-black'
                }`}
                title="Grid View"
                aria-label="Grid view"
              >
                <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-full text-xs transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#EEF0FD] text-[#6962F1]' : 'text-[#99A0AE] hover:text-black'
                }`}
                title="List View"
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Reset Button (visible when filters are active) */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#525866] hover:text-[#0E121B] px-2 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 text-[#6962F1]" />
                <span className="hidden md:inline">Reset</span>
              </button>
            )}

          </div>

          {/* Active Filter Chips (Center-Aligned) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-200/80 text-xs text-[#525866] max-w-xl mx-auto">
              <span className="text-[10px] font-mono font-bold text-[#0E121B] uppercase tracking-wider">Active:</span>
              {searchQuery && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#6962F1] font-bold text-xs inline-flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              {selectedLocation !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0E121B] font-semibold text-xs inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#6962F1]" />
                  <span>{getLocationLabel(selectedLocation)}</span>
                  <button onClick={() => setSelectedLocation('all')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0E121B] font-semibold text-xs inline-flex items-center gap-1">
                  <span>{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0E121B] font-semibold text-xs inline-flex items-center gap-1">
                  <span>{selectedType === 'vacancy' ? 'Vacancies' : 'Client Gigs'}</span>
                  <button onClick={() => setSelectedType('all')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              {selectedWorkMode !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0E121B] font-semibold text-xs inline-flex items-center gap-1">
                  <span>{selectedWorkMode.toUpperCase()}</span>
                  <button onClick={() => setSelectedWorkMode('all')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              {selectedCurrency !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0E121B] font-semibold text-xs inline-flex items-center gap-1">
                  <span>{selectedCurrency}</span>
                  <button onClick={() => setSelectedCurrency('all')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0E121B] font-semibold text-xs inline-flex items-center gap-1">
                  <span>Highest Pay</span>
                  <button onClick={() => setSortBy('newest')} className="hover:text-black ml-0.5 cursor-pointer">&times;</button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-[#6962F1] hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

        </div>

        {/* Scroll Target Anchor & Listings Status Bar */}
        <div id="listings-container-top" className="relative z-10 flex items-center justify-between text-xs text-[#525866] pt-1">
          <span className="font-semibold text-[#0E121B]">
            Showing <span className="font-mono text-[#6962F1] font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOpportunities.length)}</span> of <span className="font-mono text-[#0E121B] font-bold">{filteredOpportunities.length}</span> opportunities
          </span>
          <span className="text-[11px] font-mono text-[#525866] hidden sm:inline">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Main Opportunities Content */}
        {filteredOpportunities.length === 0 ? (
          <div className="p-14 text-center max-w-lg mx-auto my-10 space-y-4 bg-[#F8F9FE] rounded-[32px] border border-[#EBEFF5] animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#0E121B] font-heading">
                No matching opportunities found
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed max-w-md mx-auto">
                No active listings match your selected location, role, or filter criteria. You can clear your filters or scrape and index this role right now!
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setIsHarvesterOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Scrape &amp; Harvest This Role</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* ========================================================= */
          /* GRID VIEW: High-Impact Symmetrical Containers             */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOpportunities.map((opp) => {
              const isBookmarked = bookmarks.includes(opp.id);
              const palette = getCompanyColor(opp.company_name);
              const initials = getCompanyInitials(opp.company_name);

              return (
                <div
                  key={opp.id}
                  onClick={() => handleOpportunityClick(opp)}
                  className="bg-white rounded-[28px] border border-[#E8ECF2] hover:border-[#6962F1]/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(105,98,241,0.12)] hover:-translate-y-1.5 transition-all duration-250 flex flex-col justify-between overflow-hidden cursor-pointer group relative"
                >
                  {/* Card Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    
                    {/* Top Identity Row: Company Monogram + Company & Location + Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Vibrant Squircle Avatar */}
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-xs font-mono shadow-sm shrink-0 tracking-wider ring-2 ring-white select-none`}>
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#0E121B] truncate" title={opp.company_name}>
                            {opp.company_name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-[#525866] truncate pt-0.5" title={opp.location}>
                            <MapPin className="w-3 h-3 text-[#99A0AE] shrink-0" />
                            <span className="truncate">{opp.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Icon Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(opp.id);
                        }}
                        className={`p-2 rounded-full border transition-all shrink-0 ${
                          isBookmarked 
                            ? 'bg-amber-50 text-amber-600 border-amber-300' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-black hover:border-slate-300'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Opportunity'}
                        aria-label="Bookmark opportunity"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Badge Pill Strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        opp.opportunity_type === 'service_request'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-[#EEF0FD] text-[#6962F1] border border-[#D6D8FB]'
                      }`}>
                        {opp.opportunity_type === 'service_request' ? 'Client Gig' : 'Vacancy'}
                      </span>

                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {opp.work_mode ? opp.work_mode.toUpperCase() : 'REMOTE'}
                      </span>

                      <span 
                        className="text-[10px] font-mono text-[#525866] truncate max-w-[120px]" 
                        title={opp.source_name}
                      >
                        {opp.source_name}
                      </span>
                    </div>

                    {/* Job Title & Description Clamp */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className="text-[15px] sm:text-base font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors line-clamp-2 leading-snug font-heading min-h-[2.75rem] break-words">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-[#525866] line-clamp-2 leading-relaxed break-words">
                        {opp.description}
                      </p>
                    </div>

                    {/* Skill Tags */}
                    {opp.tags && opp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {opp.tags.slice(0, 3).map((tag, tIdx) => (
                          <span 
                            key={tIdx} 
                            className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#F4F5FD] text-[#525866] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {opp.tags.length > 3 && (
                          <span className="text-[10px] text-[#99A0AE] font-mono self-center">
                            +{opp.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Card Footer Bar: Compensation & View Button */}
                  <div className="bg-[#F8F9FE] border-t border-[#EAEFF5] p-3.5 px-6 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#99A0AE] block uppercase tracking-wider leading-none mb-1">
                        Compensation
                      </span>
                      <span 
                        className="text-xs sm:text-[13px] font-mono font-extrabold text-[#0E121B] truncate block" 
                        title={opp.budget_raw_text || (opp.opportunity_type === 'service_request' ? 'Negotiable' : 'Competitive')}
                      >
                        {opp.budget_raw_text || (opp.opportunity_type === 'service_request' ? 'Negotiable' : 'Competitive')}
                      </span>
                    </div>

                    <button className="px-4 py-2 rounded-full bg-[#0E121B] group-hover:bg-[#6962F1] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm shrink-0 whitespace-nowrap">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* LIST VIEW: Streamlined Executive Row Cards                */
          /* ========================================================= */
          <div className="space-y-3 sm:space-y-3.5">
            {paginatedOpportunities.map((opp) => {
              const isBookmarked = bookmarks.includes(opp.id);
              const palette = getCompanyColor(opp.company_name);
              const initials = getCompanyInitials(opp.company_name);

              return (
                <div
                  key={opp.id}
                  onClick={() => handleOpportunityClick(opp)}
                  className="bg-white rounded-2xl border border-[#E8ECF2] hover:border-[#6962F1]/50 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shadow-sm hover:shadow-[0_8px_24px_rgba(105,98,241,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden"
                >
                  {/* Left Column: Avatar & Job Info */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0 tracking-wider ring-2 ring-white select-none`}>
                      {initials}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          opp.opportunity_type === 'service_request'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-[#EEF0FD] text-[#6962F1] border border-[#D6D8FB]'
                        }`}>
                          {opp.opportunity_type === 'service_request' ? 'Client Gig' : 'Vacancy'}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {opp.work_mode ? opp.work_mode.toUpperCase() : 'REMOTE'}
                        </span>
                        <span className="text-xs font-semibold text-[#525866] truncate max-w-[140px] sm:max-w-[200px]" title={opp.company_name}>
                          {opp.company_name}
                        </span>
                        <span className="text-xs text-[#99A0AE] hidden sm:inline">&bull;</span>
                        <span className="text-xs text-[#525866] truncate max-w-[120px] sm:max-w-[180px] hidden sm:inline" title={opp.location}>
                          {opp.location}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors line-clamp-1 sm:line-clamp-2 leading-snug break-words">
                        {opp.title}
                      </h3>

                      {/* Location visible on mobile */}
                      <div className="flex sm:hidden items-center gap-1 text-[11px] text-[#525866] truncate">
                        <MapPin className="w-3 h-3 text-[#99A0AE] shrink-0" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Salary & Action Button (Contained securely with min-w-0 and shrink-0) */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100 min-w-0 md:shrink-0">
                    <div className="text-left md:text-right min-w-0 flex-1 md:flex-initial md:max-w-[200px] pr-1">
                      <span className="text-[10px] font-bold text-[#99A0AE] uppercase block leading-none mb-1">
                        Pay / Budget
                      </span>
                      <span 
                        className="text-xs sm:text-sm font-mono font-bold text-[#0E121B] truncate block" 
                        title={opp.budget_raw_text || (opp.opportunity_type === 'service_request' ? 'Negotiable' : 'Competitive')}
                      >
                        {opp.budget_raw_text || (opp.opportunity_type === 'service_request' ? 'Negotiable' : 'Competitive')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(opp.id);
                        }}
                        className={`p-2 rounded-full border transition-all shrink-0 cursor-pointer ${
                          isBookmarked 
                            ? 'bg-amber-50 text-amber-600 border-amber-300' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-black hover:border-slate-300'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Opportunity'}
                        aria-label="Bookmark opportunity"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button className="px-3.5 sm:px-4 py-2 rounded-full bg-[#0E121B] group-hover:bg-[#6962F1] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* COMPREHENSIVE PAGINATION CONTROLS BAR                     */}
        {/* ========================================================= */}
        {totalPages > 1 && (
          <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-[#525866] font-medium">
              Page <span className="font-bold text-[#0E121B] font-mono">{currentPage}</span> of <span className="font-bold text-[#0E121B] font-mono">{totalPages}</span> ({filteredOpportunities.length} Total Listings)
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0E121B] text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, current, and adjacent pages
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-full text-xs font-bold font-mono transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-[#0E121B] text-white shadow-md'
                          : 'bg-white border border-slate-200 text-[#525866] hover:bg-slate-50 hover:text-[#0E121B]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="px-1 text-slate-400 font-mono text-xs select-none">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0E121B] text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Live Opportunity Harvester Modal */}
        <JobHarvesterModal
          isOpen={isHarvesterOpen}
          onClose={() => setIsHarvesterOpen(false)}
          categories={categories}
          onHarvestOpportunity={(newItems) => {
            if (onHarvestOpportunity) {
              onHarvestOpportunity(newItems);
            }
          }}
          onViewHarvested={(item) => {
            setSelectedOpportunity(item);
            setActivePage('opportunity-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Interactive Filter Modal Sheet (Rendered via Portal to document.body) */}
        {isFilterModalOpen && createPortal(
          <div 
            className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsFilterModalOpen(false)}
          >
            <div 
              className="bg-white w-full sm:max-w-lg rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-bottom-sheet sm:animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-white">
                <div className="w-12 h-1.5 rounded-full bg-slate-300"></div>
              </div>

              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
                      Filter Opportunities
                    </h3>
                    <p className="text-[11px] text-[#525866]">
                      Narrow down by role type, mode &amp; locations
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 space-y-5 overflow-y-auto overscroll-contain flex-1">
                
                {/* Section 1: Opportunity Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0E121B] uppercase tracking-wider block">
                    Opportunity Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All Types' },
                      { id: 'service_request', label: 'Client Gigs' },
                      { id: 'vacancy', label: 'Vacancies' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedType(t.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          selectedType === t.id
                            ? 'bg-[#0E121B] text-white shadow-xs'
                            : 'bg-[#F8F9FE] text-[#525866] hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Work Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0E121B] uppercase tracking-wider block">
                    Work Mode
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'remote', label: 'Remote' },
                      { id: 'hybrid', label: 'Hybrid' },
                      { id: 'onsite', label: 'Onsite' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedWorkMode(m.id)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          selectedWorkMode === m.id
                            ? 'bg-[#0E121B] text-white shadow-xs'
                            : 'bg-[#F8F9FE] text-[#525866] hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3: Location Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0E121B] uppercase tracking-wider block">
                      Target Location
                    </label>
                    {selectedLocation !== 'all' && (
                      <button 
                        type="button"
                        onClick={() => setSelectedLocation('all')} 
                        className="text-[11px] text-[#6962F1] font-semibold hover:underline cursor-pointer"
                      >
                        Reset Location
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All Locations' },
                      { id: 'nigeria', label: '🇳🇬 Nigeria' },
                      { id: 'lagos', label: '📍 Lagos' },
                      { id: 'abuja', label: '📍 Abuja' },
                      { id: 'port-harcourt', label: '📍 Port Harcourt' },
                      { id: 'africa', label: '🌍 Africa & Regional' },
                      { id: 'global-remote', label: '🌐 Global Remote' },
                      { id: 'us-canada', label: '🇺🇸 US & Canada' },
                      { id: 'uk-europe', label: '🇬🇧 UK & Europe' },
                    ].map((loc) => {
                      const isSelected = selectedLocation === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setSelectedLocation(loc.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#6962F1] text-white shadow-xs'
                              : 'bg-[#F8F9FE] text-[#525866] hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {loc.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Harvested specific locations */}
                  {customLocations.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] text-[#99A0AE] block mb-1 font-mono uppercase">
                        Harvested Locations:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                        {customLocations.map((loc) => {
                          const isSelected = selectedLocation === loc;
                          return (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => setSelectedLocation(loc)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#6962F1] text-white shadow-xs'
                                  : 'bg-white text-[#525866] hover:bg-slate-50 border border-slate-200'
                              }`}
                            >
                              📍 {loc}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Currency */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0E121B] uppercase tracking-wider block">
                    Payment Currency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All Currencies' },
                      { id: 'NGN', label: '₦ Naira' },
                      { id: 'USD', label: '$ US Dollar' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCurrency(c.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          selectedCurrency === c.id
                            ? 'bg-[#0E121B] text-white shadow-xs'
                            : 'bg-[#F8F9FE] text-[#525866] hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 5: Sort Order */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0E121B] uppercase tracking-wider block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'newest', label: '⚡ Newest First' },
                      { id: 'budget_high', label: '💰 Highest Pay' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSortBy(s.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          sortBy === s.id
                            ? 'bg-[#0E121B] text-white shadow-xs'
                            : 'bg-[#F8F9FE] text-[#525866] hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 px-5 border-t border-slate-100 bg-[#F8F9FE] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-[#525866] hover:text-[#0E121B] px-3 py-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Show {filteredOpportunities.length} Results
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
}
