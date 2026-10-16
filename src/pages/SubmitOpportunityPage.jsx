import React, { useState } from 'react';
import { PlusCircle, CheckCircle2, ShieldCheck, ArrowRight, FileText, Cpu } from 'lucide-react';
import Badge from '../components/common/Badge';
import CustomSelect from '../components/common/CustomSelect';

export default function SubmitOpportunityPage({ 
  categories, 
  onAddSubmission, 
  setActivePage, 
  setSelectedOpportunity 
}) {
  const [submitted, setSubmitted] = useState(false);
  const [createdOpportunity, setCreatedOpportunity] = useState(null);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category_id: 'web-dev',
    opportunity_type: 'service_request',
    work_mode: 'remote',
    location: '',
    budget_raw_text: '',
    source_url: '',
    company_name: '',
    description: '',
    submitter_name: '',
    submitter_contact: ''
  });

  const handleAutoFillFromText = () => {
    if (!rawText.trim()) return;
    const text = rawText;
    let extractedTitle = formData.title;
    let extractedCompany = formData.company_name;
    let extractedLocation = formData.location;
    let extractedBudget = formData.budget_raw_text;
    let extractedCat = formData.category_id;
    let extractedType = formData.opportunity_type;
    let extractedMode = formData.work_mode;

    const titleMatch = text.match(/(?:hiring|looking for|seeking|role|title|position):\s*([^\n\r]+)/i) ||
                       text.match(/(?:senior|lead|junior|mid-level)?\s*(?:frontend|backend|fullstack|developer|engineer|designer|virtual assistant|copywriter|data analyst|manager|specialist)[^\n\r,.]*/i);
    if (titleMatch) extractedTitle = titleMatch[0].replace(/^(?:hiring|looking for|seeking|role|title|position):\s*/i, '').trim();

    const compMatch = text.match(/(?:at|company|team):\s*([^\n\r,]+)/i);
    if (compMatch) extractedCompany = compMatch[1].trim();

    if (/lagos/i.test(text)) extractedLocation = 'Lagos, Nigeria & Remote';
    else if (/abuja/i.test(text)) extractedLocation = 'Abuja, Nigeria & Remote';
    else if (/port harcourt/i.test(text)) extractedLocation = 'Port Harcourt, Nigeria';
    else if (/nairobi/i.test(text)) extractedLocation = 'Nairobi, Kenya';
    else if (/ghana|accra/i.test(text)) extractedLocation = 'Accra, Ghana';
    else if (/remote/i.test(text)) extractedLocation = 'Global Remote (Worldwide)';

    if (/hybrid/i.test(text)) extractedMode = 'hybrid';
    else if (/onsite|on-site/i.test(text)) extractedMode = 'onsite';
    else extractedMode = 'remote';

    if (/[₦]|ngn|naira/i.test(text)) {
      const bMatch = text.match(/[₦]\s*[\d,]+(?:\s*-\s*[₦]?[\d,]+)?/);
      if (bMatch) extractedBudget = bMatch[0];
    } else if (/[$]|usd|dollar/i.test(text)) {
      const bMatch = text.match(/[$]\s*[\d,]+(?:\s*-\s*[$]?[\d,]+)?/);
      if (bMatch) extractedBudget = bMatch[0];
    }

    if (/design|figma|ui\/ux|graphic/i.test(text)) extractedCat = 'design';
    else if (/data|sql|excel|sheets|analytics/i.test(text)) extractedCat = 'data';
    else if (/virtual assistant|admin|calendar/i.test(text)) extractedCat = 'va';
    else if (/content|copywriter|social media|writer/i.test(text)) extractedCat = 'content';
    else if (/video|editor|reels|tiktok|youtube/i.test(text)) extractedCat = 'media';
    else if (/sales|b2b|marketing|leads/i.test(text)) extractedCat = 'sales';
    else if (/support|customer success|agent/i.test(text)) extractedCat = 'support';
    else if (/product manager|owner|operations/i.test(text)) extractedCat = 'product';

    if (/gig|project|freelance|one-off|bounty/i.test(text)) extractedType = 'service_request';

    setFormData(prev => ({
      ...prev,
      title: extractedTitle || prev.title,
      company_name: extractedCompany || prev.company_name,
      location: extractedLocation || prev.location,
      budget_raw_text: extractedBudget || prev.budget_raw_text,
      category_id: extractedCat,
      opportunity_type: extractedType,
      work_mode: extractedMode,
      description: text.length > 50 ? text : prev.description
    }));
    setShowAutoFill(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSubmission = {
      ...formData,
      category_id: isCustomCategory && customCategoryInput.trim() 
        ? customCategoryInput.trim().toLowerCase().replace(/\s+/g, '-')
        : formData.category_id,
      category_name: isCustomCategory && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : categories.find(c => c.id === formData.category_id)?.name || formData.category_id
    };
    let publishedResult = null;
    if (onAddSubmission) {
      publishedResult = onAddSubmission(finalSubmission);
    }
    setCreatedOpportunity(publishedResult || finalSubmission);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Instantly Published &amp; Live</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E121B] font-heading tracking-tight">
            Your Opportunity is Live on Ophancer!
          </h2>
          <p className="text-xs sm:text-sm text-[#525866] leading-relaxed max-w-md mx-auto">
            Your listing is immediately discoverable across the live directory and candidates can now apply directly to your contact or portal.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              if (createdOpportunity && setSelectedOpportunity) {
                setSelectedOpportunity(createdOpportunity);
                setActivePage('opportunity-detail');
              } else if (setActivePage) {
                setActivePage('opportunities');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto h-[48px] px-8 rounded-full bg-[#6962F1] hover:bg-[#5851DE] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>View Listing in Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setCreatedOpportunity(null);
              setIsCustomCategory(false);
              setCustomCategoryInput('');
              setFormData({
                title: '',
                category_id: 'web-dev',
                opportunity_type: 'service_request',
                work_mode: 'remote',
                location: '',
                budget_raw_text: '',
                source_url: '',
                company_name: '',
                description: '',
                submitter_name: '',
                submitter_contact: ''
              });
            }}
            className="w-full sm:w-auto h-[48px] px-6 rounded-full bg-[#F8F9FE] hover:bg-slate-200 text-[#0E121B] border border-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <span>Post Another Opportunity</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Executive Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF0FD] border border-[#D6D8FB] text-[#6962F1] text-xs font-bold font-mono">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>COMMUNITY INDEXATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight">
          Suggest an Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-[#525866] max-w-xl mx-auto leading-relaxed">
          Found an open corporate vacancy, freelance client request, or contract? Submit it to help fellow professionals discover it.
        </p>
      </div>

      {/* Instant Publishing Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EEF0FD] border border-[#D6D8FB] flex items-start gap-3.5 text-xs text-[#0E121B]">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[#525866]">
          <strong className="text-[#0E121B]">Instant Live Publishing:</strong> Submissions that fulfill all required fields are published immediately to the live Ophancer directory and radar with zero admin delay.
        </p>
      </div>

      {/* Redesigned Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-[#EBEFF5] shadow-[0_12px_40px_rgba(14,18,27,0.04)] space-y-8">
        
        {/* SECTION 1: Primary Role & Source Information */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-mono font-bold text-[#6962F1] uppercase tracking-wider block">
              Section 1 of 3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0E121B]">
              Role Identity &amp; Source Link
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                Opportunity Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Need a Freelance Graphic Designer for Beverage Packaging"
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white focus:ring-2 focus:ring-[#6962F1]/10 transition-all font-semibold"
              />
            </div>

            {/* Paste Job Post URL + Dedicated "Paste and Autofill" Button Immediately Underneath */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0E121B] block mb-1">
                Paste Job Post URL (Original Source Link) *
              </label>
              <input
                type="url"
                name="source_url"
                required
                value={formData.source_url}
                onChange={handleChange}
                placeholder="e.g. https://company.com/jobs/123 or https://linkedin.com/jobs/view/456"
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white focus:ring-2 focus:ring-[#6962F1]/10 transition-all font-mono"
              />

              {/* Single-line button directly under the field */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAutoFill(!showAutoFill)}
                  className="h-[38px] px-4 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
                >
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  <span>Paste and Autofill</span>
                </button>
                <span className="text-[11px] text-[#525866]">
                  {showAutoFill ? 'Collapse auto-fill box' : 'Paste raw text or WhatsApp broadcast to automatically populate fields'}
                </span>
              </div>

              {/* Expandable Auto-Fill Box */}
              {showAutoFill && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FE] border border-[#D6D8FB] space-y-3 mt-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#6962F1]" />
                      <span className="text-xs font-bold text-[#0E121B]">Raw Job Details / Broadcast Text</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAutoFill(false)}
                      className="text-xs text-[#99A0AE] hover:text-black cursor-pointer font-semibold"
                    >
                      Close
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste raw job description, WhatsApp forward, tweet, or email specs here..."
                    className="w-full bg-white border border-[#EBEFF5] rounded-xl p-3 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] font-mono leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAutoFillFromText}
                      className="h-[38px] px-5 rounded-full bg-[#6962F1] hover:bg-[#5851E8] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Extract &amp; Populate Form Fields</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Classification, Budget & Work Setup */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-mono font-bold text-[#6962F1] uppercase tracking-wider block">
              Section 2 of 3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0E121B]">
              Classification &amp; Work Specifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#0E121B] block">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setFormData(prev => ({ ...prev, category_id: 'custom' }));
                      } else {
                        setFormData(prev => ({ ...prev, category_id: 'web-dev' }));
                        setCustomCategoryInput('');
                      }
                    }}
                    className="text-[11px] font-semibold text-[#6962F1] hover:underline cursor-pointer"
                  >
                    {isCustomCategory ? 'Pick standard list' : '+ Enter new category'}
                  </button>
                </div>

                {!isCustomCategory ? (
                  <CustomSelect
                    value={formData.category_id}
                    onChange={(val) => {
                      if (val === 'custom') {
                        setIsCustomCategory(true);
                      } else {
                        setFormData(prev => ({ ...prev, category_id: val }));
                      }
                    }}
                    options={[
                      ...categories.filter(c => c.id !== 'all').map(c => ({ value: c.id, label: c.name })),
                      { value: 'custom', label: '➕ Other (Type Custom Category)' }
                    ]}
                    variant="form"
                  />
                ) : (
                  <div className="space-y-1 animate-fade-in">
                    <input
                      type="text"
                      required
                      value={customCategoryInput}
                      onChange={(e) => {
                        setCustomCategoryInput(e.target.value);
                        setFormData(prev => ({ ...prev, category_id: e.target.value.toLowerCase().replace(/\s+/g, '-'), custom_category_name: e.target.value }));
                      }}
                      placeholder="Type custom category (e.g. Healthcare, Legal, Culinary, Real Estate...)"
                      className="w-full bg-[#F8F9FE] border border-[#6962F1] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] sm:text-[11px] text-[#525866]">Type any custom trade or field — not restricted to tech roles!</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Opportunity Type
                </label>
                <CustomSelect
                  value={formData.opportunity_type}
                  onChange={(val) => setFormData(prev => ({ ...prev, opportunity_type: val }))}
                  options={[
                    { value: 'service_request', label: 'Client Service Request (Gig)' },
                    { value: 'job_vacancy', label: 'Formal Job Vacancy' },
                    { value: 'freelance_gig', label: 'Freelance Project' }
                  ]}
                  variant="form"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Company or Client Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g. Retail Brand Ltd or Private Client"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Work Mode
                </label>
                <CustomSelect
                  value={formData.work_mode}
                  onChange={(val) => setFormData(prev => ({ ...prev, work_mode: val }))}
                  options={[
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'Onsite' }
                  ]}
                  variant="form"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Lagos, Nigeria or Global Remote"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Budget / Estimated Compensation
                </label>
                <input
                  type="text"
                  name="budget_raw_text"
                  value={formData.budget_raw_text}
                  onChange={handleChange}
                  placeholder="e.g. ₦150,000 Milestone or $800/mo"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Scope, Requirements & Submitter Details */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-mono font-bold text-[#6962F1] uppercase tracking-wider block">
              Section 3 of 3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0E121B]">
              Scope, Requirements &amp; Verification
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                Description &amp; Requirements *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide key project requirements, deliverables, timeline, or qualifications..."
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-4 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Your Name (Submitter)
                </label>
                <input
                  type="text"
                  name="submitter_name"
                  value={formData.submitter_name}
                  onChange={handleChange}
                  placeholder="e.g. Samuel K."
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0E121B] block mb-1.5">
                  Your Contact (Email or WhatsApp)
                </label>
                <input
                  type="text"
                  name="submitter_contact"
                  value={formData.submitter_contact}
                  onChange={handleChange}
                  placeholder="e.g. samuel@example.com"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-center sm:justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto h-[48px] px-8 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>Publish Opportunity Instantly</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

      </form>

    </div>
  );
}
