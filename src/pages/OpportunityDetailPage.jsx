import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  Share2, 
  Bookmark, 
  Check, 
  Building2,
  DollarSign,
  ShieldCheck,
  X
} from 'lucide-react';
import Badge from '../components/common/Badge';
import CustomSelect from '../components/common/CustomSelect';
import { isOpportunityBookmarked } from '../utils/bookmarkUtils';

export default function OpportunityDetailPage({ 
  opportunity, 
  setActivePage, 
  bookmarks = [], 
  toggleBookmark,
  reportBrokenLink 
}) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('expired');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!opportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0E121B]">No opportunity selected</h2>
        <button
          onClick={() => setActivePage('opportunities')}
          className="h-[42px] px-6 rounded-full bg-[#0E121B] text-white text-xs font-semibold whitespace-nowrap flex-shrink-0"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const oppId = opportunity.id || opportunity.source_identifier || opportunity.slug || opportunity.title;
  const isBookmarked = isOpportunityBookmarked(opportunity, bookmarks);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareClick = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this opening on Ophancer: ${opportunity.title} at ${opportunity.company_name}`;

    // Trigger mobile native share sheet if on mobile browser
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `${opportunity.title} - Ophancer`,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIsShareModalOpen(true);
        }
        return;
      }
    }

    setIsShareModalOpen(true);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (reportBrokenLink) {
      reportBrokenLink(oppId, reportReason);
    }
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => setActivePage('opportunities')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#525866] hover:text-[#0E121B] transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Opportunities</span>
        </button>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-10 border border-[#EBEFF5] shadow-sm space-y-6">
        
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={opportunity.opportunity_type === 'service_request' ? 'amber' : 'violet'} size="sm">
              {opportunity.opportunity_type === 'service_request' ? 'Client Request' : 'Formal Vacancy'}
            </Badge>
            <Badge variant="cyan" size="sm">
              {opportunity.category_name || 'General Tech'}
            </Badge>
            <Badge variant="default" size="sm">
              {opportunity.work_mode ? opportunity.work_mode.toUpperCase() : 'REMOTE'}
            </Badge>
            {opportunity.is_demo && (
              <Badge variant="ghost" size="xs">Sample Preview</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
            <button
              onClick={handleShareClick}
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-[#EEF0FD] text-[#525866] hover:text-[#6962F1] hover:border-[#6962F1]/30 transition-all cursor-pointer"
              title="Share Opportunity to WhatsApp, Twitter, etc."
              aria-label="Share opportunity"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleBookmark(opportunity)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-50 text-amber-600 border-amber-300 ring-2 ring-amber-400/20 shadow-xs' 
                  : 'border-slate-200 bg-white hover:bg-[#F8F9FE] text-[#525866] hover:text-amber-600'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0E121B] font-heading tracking-tight leading-tight break-words">
            {opportunity.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#525866] font-medium">
            <span className="flex items-center gap-1.5 font-bold text-[#0E121B] break-words">
              <Building2 className="w-4 h-4 text-[#6962F1] shrink-0" />
              <span>{opportunity.company_name}</span>
            </span>
            <span className="flex items-center gap-1.5 break-words">
              <MapPin className="w-4 h-4 text-[#99A0AE] shrink-0" />
              <span>{opportunity.location}</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#99A0AE] shrink-0" />
              <span>Indexed {opportunity.discovered_at ? new Date(opportunity.discovered_at).toLocaleDateString() : 'Today'}</span>
            </span>
          </div>
        </div>

        {/* Compensation & Source Card */}
        <div className="rounded-2xl p-4 sm:p-6 bg-[#EEF0FD] border border-[#D6D8FB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-[#525866] uppercase tracking-wider block">
              Budget / Compensation
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#0E121B] mt-0.5 block break-words">
              {opportunity.budget_raw_text || (opportunity.opportunity_type === 'service_request' ? 'Negotiable (Discuss with Client)' : 'Competitive (Disclosed on Application)')}
            </span>
            <span className="text-xs text-[#525866] mt-1 block">
              Source: <span className="font-semibold text-[#0E121B]">{opportunity.source_name || 'Direct Channel'}</span>
            </span>
          </div>

          {/* Primary Action Buttons */}
          {(() => {
            const safeApplyUrl = (!opportunity.source_url || opportunity.source_url.includes('ophancer.com'))
              ? `https://www.google.com/search?q=${encodeURIComponent(`${opportunity.title || ''} ${opportunity.company_name || ''} ${opportunity.location || ''} job apply`.trim())}`
              : opportunity.source_url;

            return (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <a
                  href={safeApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[44px] px-6 sm:px-8 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto cursor-pointer"
                >
                  <span>Apply on Original Source</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="h-[44px] px-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-[#525866] hover:text-rose-600 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap w-full sm:w-auto cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Report Broken</span>
                </button>
              </div>
            );
          })()}
        </div>

        {/* Detailed Description */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0E121B]">
            Opportunity Description &amp; Scope
          </h2>

          <div className="p-6 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] text-sm text-[#0E121B] leading-relaxed whitespace-pre-line font-normal space-y-4 break-words overflow-hidden">
            {opportunity.description}
          </div>
        </div>

        {/* Required Skills & Tags */}
        {opportunity.skills && opportunity.skills.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0E121B]">
              Required Skills &amp; Keywords
            </h2>

            <div className="flex flex-wrap gap-2">
              {opportunity.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#EEF0FD] text-[#6962F1] border border-[#D6D8FB] whitespace-nowrap"
                >
                  #{skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integrity Notice */}
        <div className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] flex items-start gap-3 text-xs text-[#525866]">
          <ShieldCheck className="w-4 h-4 text-[#6962F1] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ophancer directly surfaces verified public job listings and freelance client requests. We never charge application fees or hold escrow for direct opportunities. Always verify client terms before starting work.
          </p>
        </div>

      </div>

      {/* Report Broken Link Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReportModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white border border-[#EBEFF5] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-[#0E121B]">
              Report Broken or Expired Opportunity
            </h3>
            
            <p className="text-xs text-[#525866]">
              Our moderator radar relies on community alerts to maintain verified accuracy.
            </p>

            {reportSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                ✓ Report logged successfully! Our team will inspect and delist if broken.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0E121B] block">Select Reason</label>
                  <CustomSelect
                    value={reportReason}
                    onChange={setReportReason}
                    options={[
                      { value: 'expired', label: 'Listing Expired or Position Filled' },
                      { value: 'broken_link', label: 'Broken 404 URL or Page Not Found' },
                      { value: 'spam', label: 'Spam / Unrelated Marketing' },
                      { value: 'scam', label: 'Suspicious or Fraudulent Request' }
                    ]}
                    variant="form"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-medium text-[#525866] hover:bg-slate-50 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Interactive Share Opportunity Modal Sheet */}
      {isShareModalOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-bottom-sheet sm:animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0E121B] font-heading">
                    Share Opportunity
                  </h3>
                  <p className="text-xs text-[#525866]">
                    Share with friends or your professional network
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close share dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opportunity Summary Card */}
            <div className="p-3.5 rounded-2xl bg-[#F8F9FE] border border-slate-200/80 space-y-1">
              <h4 className="text-xs font-bold text-[#0E121B] line-clamp-1">
                {opportunity.title}
              </h4>
              <p className="text-[11px] text-[#525866] line-clamp-1">
                {opportunity.company_name} • {opportunity.location}
              </p>
            </div>

            {/* One-Click Social Share Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this job opportunity on Ophancer: *${opportunity.title}* at *${opportunity.company_name}*\n\n${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-base">💬</span>
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this opportunity on Ophancer: ${opportunity.title} at ${opportunity.company_name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-base">✈️</span>
                <span>Telegram</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Exciting role: ${opportunity.title} at ${opportunity.company_name} via @OphancerAlerts`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-black/5 hover:bg-black/10 border border-slate-300 text-[#0E121B] font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-sm font-black">𝕏</span>
                <span>X / Twitter</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/30 text-[#0077b5] font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-base">💼</span>
                <span>LinkedIn</span>
              </a>
            </div>

            {/* Direct Copy Link Input Bar */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-[#525866] uppercase tracking-wider block">
                Or copy link directly
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="flex-1 bg-[#F8F9FE] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0E121B] font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#0E121B] hover:bg-[#6962F1] text-white'
                  }`}
                >
                  {copiedLink ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
