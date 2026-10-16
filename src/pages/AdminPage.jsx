import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Settings, 
  FileText, 
  AlertTriangle, 
  Save, 
  Database, 
  Activity, 
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Layers,
  Download
} from 'lucide-react';
import JobHarvesterModal from '../components/opportunities/JobHarvesterModal';

export default function AdminPage({ 
  opportunities, 
  setOpportunities, 
  submissions, 
  setSubmissions, 
  brokenReports, 
  setBrokenReports, 
  settings, 
  setSettings,
  categories = []
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (sessionStorage.getItem('ophancer_admin_auth') === 'true') return true;
      const urlParams = new URLSearchParams(window.location.search);
      const authVal = urlParams.get('auth') || urlParams.get('key') || urlParams.get('admin');
      if (authVal) {
        const cleaned = authVal.replace(/[\s\-\+\(\)]/g, '').trim();
        if (['2348025100844', '08025100844', '8025100844'].includes(cleaned) || authVal.trim() === 'ophancer2026') {
          sessionStorage.setItem('ophancer_admin_auth', 'true');
          return true;
        }
      }
    } catch {}
    return false;
  });
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions', 'settings', 'reports', 'logs'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isHarvesterOpen, setIsHarvesterOpen] = useState(false);

  // Editable settings draft
  const [draftSettings, setDraftSettings] = useState({ ...settings });

  const handleLogin = (e) => {
    e.preventDefault();
    const cleaned = passcode.replace(/[\s\-\+\(\)]/g, '').trim();
    const validNumbers = ['2348025100844', '08025100844', '8025100844'];
    const trimmed = passcode.trim();

    if (
      validNumbers.includes(cleaned) ||
      trimmed === 'ophancer2026' ||
      trimmed === 'admin'
    ) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('ophancer_admin_auth', 'true');
      } catch {}
    } else {
      alert('Invalid credentials. Enter your registered WhatsApp number or admin passcode.');
    }
  };

  const handleLockSession = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('ophancer_admin_auth');
    } catch {}
  };

  const handleApproveSubmission = (sub) => {
    const newOpp = {
      id: `opp-${Date.now()}`,
      title: sub.title,
      slug: sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
      category_id: sub.category_id || 'web-dev',
      category_name: 'Community Approved',
      opportunity_type: sub.opportunity_type || 'service_request',
      work_mode: sub.work_mode || 'remote',
      location: sub.location || 'Nigeria / Remote',
      currency: sub.budget_raw_text?.includes('$') ? 'USD' : 'NGN',
      salary_min: 0,
      salary_max: 0,
      budget_raw_text: sub.budget_raw_text || 'Budget: Discuss with Client',
      is_budget_negotiable: true,
      company_name: sub.company_name || 'Direct Client',
      source_name: 'Community Verified',
      source_url: sub.source_url,
      discovered_at: new Date().toISOString(),
      status: 'published',
      is_demo: false,
      description: sub.description,
      tags: ['Community Verified', sub.work_mode || 'Remote']
    };

    setOpportunities([newOpp, ...opportunities]);
    setSubmissions(submissions.filter(s => s.id !== sub.id));
  };

  const handleRejectSubmission = (subId) => {
    setSubmissions(submissions.filter(s => s.id !== subId));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettings(draftSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResolveReport = (reportId, action) => {
    if (action === 'expire') {
      const report = brokenReports.find(r => r.id === reportId);
      if (report) {
        setOpportunities(opportunities.map(o => o.id === report.opportunity_id ? { ...o, status: 'expired' } : o));
      }
    }
    setBrokenReports(brokenReports.filter(r => r.id !== reportId));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-[32px] p-8 border border-[#EBEFF5] text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#0E121B] font-heading">
              Admin Command Portal
            </h1>
            <p className="text-xs text-[#525866]">
              Restricted area for Ophancer moderation and configuration.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter WhatsApp (+234...) or Passcode"
              className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-full px-4 py-3 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1] text-center font-mono"
            />
            <button
              type="submit"
              className="w-full h-[44px] rounded-full bg-[#0E121B] hover:bg-black text-white text-xs font-bold transition-all shadow-md whitespace-nowrap cursor-pointer active:scale-95"
            >
              Authenticate Session
            </button>
          </form>

          <p className="text-[11px] text-[#525866]">
            Authorized admin contact: <span className="text-[#0E121B] font-mono font-bold">+234 802 510 0844</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EEF0FD] text-[#6962F1] text-xs font-bold font-mono">
              ADMINISTRATOR CONTROL
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E121B] font-heading tracking-tight mt-1">
            Ophancer Operations Console
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsHarvesterOpen(true)}
            className="px-4 py-2 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-white" />
            <span>Harvester Studio</span>
          </button>

          <button
            onClick={handleLockSession}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0E121B] transition-colors whitespace-nowrap cursor-pointer"
          >
            Lock Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 snap-x sm:flex-wrap">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'submissions'
              ? 'pill-active'
              : 'pill-inactive'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Submissions Queue ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'settings'
              ? 'pill-active'
              : 'pill-inactive'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>CV Pricing &amp; Bank Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'reports'
              ? 'pill-active'
              : 'pill-inactive'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Broken Link Reports ({brokenReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'logs'
              ? 'pill-active'
              : 'pill-inactive'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span>Discovery Engine Radar</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS QUEUE */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#525866]">
            <span>Pending moderation review before indexation</span>
            <span>Total: {submissions.length}</span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#EBEFF5]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#0E121B]">Queue Clean</h3>
              <p className="text-xs text-[#525866]">No pending community submissions to moderate.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-3xl p-6 border border-[#EBEFF5] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF0FD] text-[#6962F1]">
                          {sub.category_id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                          {sub.opportunity_type}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0E121B] mt-1">{sub.title}</h3>
                      <p className="text-xs text-[#525866]">
                        {sub.company_name} &bull; {sub.location} &bull; {sub.work_mode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                      <button
                        onClick={() => handleApproveSubmission(sub)}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve &amp; Publish
                      </button>
                      <button
                        onClick={() => handleRejectSubmission(sub.id)}
                        className="px-4 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#0E121B] bg-[#F8F9FE] p-4 rounded-2xl border border-slate-100 leading-relaxed">
                    {sub.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#525866] pt-1">
                    <span>Submitter: <strong>{sub.submitter_name}</strong> ({sub.submitter_contact})</span>
                    <a
                      href={sub.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6962F1] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Verify Original Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRICING & SETTINGS CONFIGURATOR */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#EBEFF5] shadow-sm space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0E121B]">CV Service Pricing Configuration</h2>
            <p className="text-xs text-[#525866]">Dynamic rates applied across the pricing table and WhatsApp prefill.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0E121B] block">Nigeria 1 CV (₦)</label>
              <input
                type="number"
                value={draftSettings?.cv_pricing?.ngn_single || 5000}
                onChange={(e) => setDraftSettings({
                  ...draftSettings,
                  cv_pricing: { ...draftSettings.cv_pricing, ngn_single: Number(e.target.value) }
                })}
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0E121B] block">Nigeria 2 CVs Bundle (₦)</label>
              <input
                type="number"
                value={draftSettings?.cv_pricing?.ngn_double || 8000}
                onChange={(e) => setDraftSettings({
                  ...draftSettings,
                  cv_pricing: { ...draftSettings.cv_pricing, ngn_double: Number(e.target.value) }
                })}
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0E121B] block">International 1 CV ($)</label>
              <input
                type="number"
                value={draftSettings?.cv_pricing?.usd_single || 5}
                onChange={(e) => setDraftSettings({
                  ...draftSettings,
                  cv_pricing: { ...draftSettings.cv_pricing, usd_single: Number(e.target.value) }
                })}
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0E121B] block">International 2 CVs ($)</label>
              <input
                type="number"
                value={draftSettings?.cv_pricing?.usd_double || 8}
                onChange={(e) => setDraftSettings({
                  ...draftSettings,
                  cv_pricing: { ...draftSettings.cv_pricing, usd_double: Number(e.target.value) }
                })}
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-[#0E121B]">Direct Bank Settlement Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#525866] block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={draftSettings?.bank_details?.bank_name || ''}
                  onChange={(e) => setDraftSettings({
                    ...draftSettings,
                    bank_details: { ...draftSettings.bank_details, bank_name: e.target.value }
                  })}
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B]"
                />
              </div>

              <div>
                <label className="text-xs text-[#525866] block mb-1">Account Number</label>
                <input
                  type="text"
                  value={draftSettings?.bank_details?.account_number || ''}
                  onChange={(e) => setDraftSettings({
                    ...draftSettings,
                    bank_details: { ...draftSettings.bank_details, account_number: e.target.value }
                  })}
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#525866] block mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  value={draftSettings?.bank_details?.account_name || ''}
                  onChange={(e) => setDraftSettings({
                    ...draftSettings,
                    bank_details: { ...draftSettings.account_name, account_name: e.target.value }
                  })}
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600">✓ Settings saved and active across website!</span>
            )}
            <button
              type="submit"
              className="ml-auto h-[44px] px-8 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>Save &amp; Apply Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BROKEN REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#EBEFF5] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#0E121B]">Broken / Expired Link Reports ({brokenReports.length})</h2>
          
          {brokenReports.length === 0 ? (
            <p className="text-xs text-[#525866]">No broken links currently reported by community members.</p>
          ) : (
            <div className="space-y-3">
              {brokenReports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-[#F8F9FE] border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0E121B] block">Opportunity #{rep.opportunity_id}</span>
                    <span className="text-xs text-[#525866]">Reason: {rep.reason}</span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'expire')}
                      className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold"
                    >
                      Mark Expired
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismiss')}
                      className="px-3 py-1.5 rounded-full bg-slate-200 text-[#0E121B] text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DISCOVERY RADAR LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#EBEFF5] shadow-sm space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-sans">
            <h2 className="text-base font-bold text-[#0E121B]">Python Discovery Engine Telemetry</h2>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">RADAR ACTIVE</span>
          </div>

          <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl space-y-2 overflow-x-auto">
            <p className="text-emerald-400">[2026-10-13 14:00:00] Engine initialized in headless mode.</p>
            <p>[2026-10-13 14:00:01] Scraped WeWorkRemotely RSS feed &bull; 25 opportunities found.</p>
            <p>[2026-10-13 14:00:03] Scraped Greenhouse public API &bull; 15 opportunities found.</p>
            <p className="text-cyan-400">[2026-10-13 14:00:04] Normalizing currency &bull; Extracted ₦ and $ budgets.</p>
            <p className="text-amber-400">[2026-10-13 14:00:05] Deduplication filter &bull; 0 duplicates detected.</p>
            <p className="text-emerald-400">[2026-10-13 14:00:06] Broadcaster dispatched 40 new listings to local cache.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-xs">
            <span className="text-[#525866]">Trigger on-demand harvester across any location, role, or URL:</span>
            <button
              onClick={() => setIsHarvesterOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Scrape Any Job &amp; Any Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Harvester Modal in Admin */}
      <JobHarvesterModal
        isOpen={isHarvesterOpen}
        onClose={() => setIsHarvesterOpen(false)}
        categories={categories}
        onHarvestOpportunity={(newItems) => {
          setOpportunities([...newItems, ...opportunities]);
        }}
      />

    </div>
  );
}
