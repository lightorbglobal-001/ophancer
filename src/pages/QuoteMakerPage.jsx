import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Share2, 
  Upload, 
  X, 
  Check, 
  Building2, 
  User, 
  DollarSign, 
  Layers, 
  Palette, 
  Receipt,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import CustomSelect from '../components/common/CustomSelect';
import { 
  CorporateWaveTemplate, 
  MinimalistTemplate, 
  BentoTemplate, 
  BoutiqueSlipTemplate 
} from '../components/quote/QuoteTemplates';
import { generateQuotationCanvas } from '../components/quote/QuoteCanvasGenerators';

const COLOR_PALETTES = [
  { name: 'Ophancer Indigo', hex: '#6962F1' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Executive Obsidian', hex: '#0E121B' },
  { name: 'Royal Sapphire', hex: '#0284C7' },
  { name: 'Rose Coral', hex: '#E11D48' },
  { name: 'Amber Gold', hex: '#D97706' },
];

const CURRENCIES = [
  { value: 'NGN', label: 'Naira (₦)', symbol: '₦' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
];

const STORAGE_KEY_PROFILE = 'ophancer_quote_profile';
const STORAGE_KEY_ITEMS = 'ophancer_quote_items';
const STORAGE_KEY_TEMPLATE = 'ophancer_quote_template';

const TEMPLATES = [
  { id: 'corporate', name: 'Corporate Wave', icon: '🏢', desc: 'Wave header & table' },
  { id: 'minimalist', name: 'Minimal Pro-Forma', icon: '🌿', desc: 'Centered with fluid wave' },
  { id: 'bento', name: 'Creative Bento', icon: '⚡', desc: 'Modern bento capsules' },
  { id: 'classic-slip', name: 'Boutique Slip', icon: '🧾', desc: 'Vintage serrated ticket' },
];

const DEFAULT_PROFILE = {
  providerName: 'Teejay Creative Studio',
  providerTagline: 'Digital Products & Brand Systems',
  providerPhone: '+234 802 510 0844',
  providerEmail: 'hello@teejaystudio.com',
  providerLocation: 'Lagos, Nigeria',
  logoUrl: null,
  accentColor: '#6962F1',
  bankName: 'Kuda Microfinance Bank',
  accountNumber: '3002678880',
  accountName: 'Lightorb Innovations',
  termsText: '50% deposit to commence. Delivery turnaround: 5 business days.',
  currency: 'NGN'
};

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: 'CV Revamp & ATS Optimization',
    description: 'Full rewrite, ATS keyword alignment, Word (.docx) & PDF',
    price: 10000
  },
  {
    id: 2,
    title: 'Website Design & Development',
    description: 'Responsive marketing layout & domain configuration',
    price: 90000
  }
];

export default function QuoteMakerPage({ settings }) {
  const [mobileTab, setMobileTab] = useState('edit');
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Lock body scroll when mobile receipt preview modal is open
  useEffect(() => {
    if (isMobilePreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobilePreviewOpen]);

  // Selected Template Style (persisted to localStorage)
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATE);
      if (saved && TEMPLATES.some(t => t.id === saved)) return saved;
    } catch {
      // ignore
    }
    return 'corporate';
  });

  // Load Persisted Freelancer Profile from localStorage (Logo, Name, Bank, Color)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load saved quote profile', e);
    }
    return DEFAULT_PROFILE;
  });

  // Client & Project Information
  const [clientName, setClientName] = useState('Apex Horizon Group');
  const [clientContact, setClientContact] = useState('client@apexgroup.com');
  const [projectTitle, setProjectTitle] = useState('CV Design & Website Development');
  const [quoteNumber, setQuoteNumber] = useState(`REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Tasks / Line Items
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved quote items', e);
    }
    return DEFAULT_ITEMS;
  });

  const [toastMsg, setToastMsg] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const documentRef = useRef(null);

  // Auto-Persist Profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to persist quote profile to localStorage', e);
    }
  }, [profile]);

  // Auto-Persist Items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist quote items to localStorage', e);
    }
  }, [items]);

  // Auto-Persist Template to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATE, selectedTemplate);
    } catch (e) {
      console.warn('Failed to persist quote template to localStorage', e);
    }
  }, [selectedTemplate]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const updateProfile = (field, val) => {
    setProfile(prev => ({ ...prev, [field]: val }));
  };

  const currObj = CURRENCIES.find(c => c.value === profile.currency) || CURRENCIES[0];
  const symbol = currObj.symbol;
  const total = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  // Logo Upload with Local Storage
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Logo file must be under 2.5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateProfile('logoUrl', ev.target.result);
        showToast('✓ Logo uploaded & remembered in browser!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        title: '',
        description: '',
        price: 0
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      alert('A receipt quotation must have at least 1 task.');
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleLoadSample = () => {
    setProfile(DEFAULT_PROFILE);
    setClientName('Apex Horizon Group');
    setClientContact('client@apexgroup.com');
    setProjectTitle('CV Design & Website Development');
    setQuoteNumber(`REC-${new Date().getFullYear()}-419`);
    setItems(DEFAULT_ITEMS);
    showToast('Loaded sample receipt quotation!');
  };

  const handleResetBranding = () => {
    if (confirm('Reset your saved branding to default?')) {
      setProfile(DEFAULT_PROFILE);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      showToast('Branding reset to clean studio defaults.');
    }
  };

  // ========================================================
  // EXECUTIVE LUXURY QUOTATION CANVAS EXPORTER
  // ========================================================
  // ========================================================
  // MULTI-TEMPLATE QUOTATION CANVAS EXPORTER
  // ========================================================
  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    showToast('Generating official quotation image...');

    try {
      const canvas = await generateQuotationCanvas(selectedTemplate, {
        profile,
        items,
        clientName,
        projectTitle,
        quoteNumber,
        issueDate,
        symbol,
        total,
        scale: 2,
        logicalW: 430
      });

      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Canvas conversion failed');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Quotation_${quoteNumber}_${clientName.replace(/\s+/g, '_')}_${selectedTemplate}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsGeneratingImage(false);
        showToast('✓ Official quotation image downloaded!');
      }, 'image/png');

    } catch (err) {
      console.error('Image export failed', err);
      setIsGeneratingImage(false);
      showToast('⚠️ Could not generate image. Use PDF / Print button instead.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let text = `*QUOTATION RECEIPT: ${projectTitle}*\n`;
    text += `*From:* ${profile.providerName}\n`;
    text += `*Billed To:* ${clientName}\n`;
    text += `*Receipt Ref:* ${quoteNumber} (${issueDate})\n\n`;
    text += `*Scope of Work:*\n`;

    items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.title}*: ${symbol}${Number(item.price || 0).toLocaleString()}\n`;
      if (item.description) {
        text += `   _${item.description}_\n`;
      }
    });

    text += `\n*TOTAL DUE:* *${symbol}${total.toLocaleString()}*\n\n`;
    text += `*Payment Details:*\n`;
    text += `Bank: ${profile.bankName}\n`;
    text += `Acct: ${profile.accountNumber} (${profile.accountName})\n\n`;
    text += `*Terms:* ${profile.termsText}\n`;

    navigator.clipboard.writeText(text);
    showToast('✓ Receipt copied to clipboard!');

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-[#F8F9FE] min-h-screen py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        
        {/* Toast Alert Notification */}
        {toastMsg && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[#0E121B] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in border border-white/10">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Clean Header - NO STARTUP OR FREELANCER BADGES AT TOP */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 no-print">
          <div className="space-y-0.5 max-w-2xl">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0E121B] font-heading tracking-tight">
              Quotation &amp; Invoice Generator
            </h1>
            <p className="text-xs sm:text-sm text-[#525866]">
              Real-time side-by-side receipt studio. Your branding, logo, and bank details stay saved in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#0E121B] transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={handleResetBranding}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#525866] transition-colors cursor-pointer active:scale-95"
              title="Reset your saved branding"
            >
              Reset Branding
            </button>
          </div>
        </div>

        {/* Mobile Quick Preview Banner (Visible on mobile only) */}
        <div className="md:hidden flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EBEFF5] shadow-xs no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#6962F1]" />
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Live Total</span>
              <span className="text-xs font-mono font-extrabold text-[#0E121B]">{symbol}{total.toLocaleString()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobilePreviewOpen(true)}
            className="px-4 py-2 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>Preview Receipt</span>
            <Receipt className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main 2-Column Split Workspace (Side-by-side on md and lg) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start relative">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: COMPACT STUDIO CONTROLS                     */}
          {/* ======================================================== */}
          <div className="md:col-span-6 lg:col-span-6 space-y-4 block no-print pb-20 md:pb-0">
            
            {/* 1. Branding (Saved to localStorage) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-[#0E121B] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#6962F1]" />
                    <span>Your Studio Branding</span>
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    💾 Saved in browser &bull; No need to re-type next time
                  </span>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="flex items-center gap-3">
                {profile.logoUrl ? (
                  <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => updateProfile('logoUrl', null)}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-500 text-white shadow-xs cursor-pointer"
                      title="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#6962F1] bg-slate-50 text-xs font-semibold text-[#525866] hover:text-[#6962F1] cursor-pointer transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
                <p className="text-[11px] text-[#525866] leading-tight">
                  Upload your logo once. It stays saved for all future receipt quotes.
                </p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Studio / Freelancer Name *</label>
                  <input
                    type="text"
                    value={profile.providerName}
                    onChange={(e) => updateProfile('providerName', e.target.value)}
                    placeholder="e.g. Teejay Creative Studio"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    value={profile.providerPhone}
                    onChange={(e) => updateProfile('providerPhone', e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
              </div>

              {/* Email & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Email Address</label>
                  <input
                    type="email"
                    value={profile.providerEmail}
                    onChange={(e) => updateProfile('providerEmail', e.target.value)}
                    placeholder="hello@studio.com"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Accent Color</label>
                  <div className="flex items-center gap-2 pt-0.5">
                    {COLOR_PALETTES.map((palette) => (
                      <button
                        key={palette.hex}
                        type="button"
                        onClick={() => updateProfile('accentColor', palette.hex)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                          profile.accentColor === palette.hex ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: palette.hex }}
                        title={palette.name}
                      >
                        {profile.accentColor === palette.hex && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={profile.accentColor}
                        onChange={(e) => updateProfile('accentColor', e.target.value)}
                        className="w-6 h-6 rounded-full cursor-pointer opacity-0 absolute inset-0"
                      />
                      <div className="w-6 h-6 rounded-full border border-slate-300 bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center pointer-events-none">
                        <Palette className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Client & Project Details */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#0E121B] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#6962F1]" />
                  <span>Customer &amp; Project Info</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Client Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Apex Horizon Group"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Project / Service Title *</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. CV Design &amp; Website Development"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Receipt Ref #</label>
                  <input
                    type="text"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3 py-2 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Currency</label>
                  <CustomSelect
                    value={profile.currency}
                    onChange={(val) => updateProfile('currency', val)}
                    options={CURRENCIES}
                    variant="form"
                  />
                </div>
              </div>

            </div>

            {/* 3. Tasks & Deliverables (Line Items) - ROOMY FULL-VIEW INPUTS */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-[#0E121B] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#6962F1]" />
                    <span>Tasks &amp; Scope of Work</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Spacious text fields so you can read everything you type.
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#6962F1]">
                  Total: {symbol}{total.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3.5">
                {items.map((item, index) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] space-y-2.5 relative transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#6962F1] uppercase">
                        Deliverable #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Task Title & Price in Generous Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-8 space-y-1">
                        <label className="text-[11px] font-bold text-[#0E121B] block">Task / Service Title *</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                          placeholder="e.g. CV Revamp &amp; ATS Optimization"
                          className="w-full bg-white border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] font-semibold focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10"
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[11px] font-bold text-[#0E121B] block">Price ({symbol}) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#525866]">
                            {symbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-full bg-white border border-[#EBEFF5] rounded-xl pl-7 pr-3 py-2.5 text-xs text-[#0E121B] font-mono font-bold focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deliverable Scope Description - FULL-VIEW MULTI-LINE TEXTAREA */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#525866] block">
                        Deliverables Scope &amp; Notes (Full View)
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="Detail the deliverables (e.g. Full rewrite, ATS keyword alignment, 2 revisions, Word &amp; PDF files)"
                        className="w-full bg-white border border-[#EBEFF5] rounded-xl p-3 text-xs text-[#0E121B] leading-relaxed focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10 resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#6962F1]/50 hover:border-[#6962F1] bg-[#EEF0FD]/40 hover:bg-[#EEF0FD] text-[#6962F1] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Task</span>
              </button>
            </div>

            {/* 4. Bank & Payment Details - FULL-WIDTH COMFORTABLE FIELDS */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#0E121B] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#6962F1]" />
                  <span>Bank &amp; Payment Details</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Bank Name *</label>
                  <input
                    type="text"
                    value={profile.bankName}
                    onChange={(e) => updateProfile('bankName', e.target.value)}
                    placeholder="e.g. Kuda Bank / GTBank"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0E121B] block">Account Number *</label>
                  <input
                    type="text"
                    value={profile.accountNumber}
                    onChange={(e) => updateProfile('accountNumber', e.target.value)}
                    placeholder="0123456789"
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] font-mono font-bold focus:outline-none focus:border-[#6962F1] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0E121B] block">Account Name (Beneficiary) *</label>
                <input
                  type="text"
                  value={profile.accountName}
                  onChange={(e) => updateProfile('accountName', e.target.value)}
                  placeholder="e.g. Teejay Creative Studio"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] font-semibold focus:outline-none focus:border-[#6962F1] focus:bg-white"
                />
              </div>
            </div>

            {/* 5. Terms of Service & Turnaround Note - FULL-VIEW COMFORTABLE TEXTAREA */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-3">
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#0E121B] flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#6962F1]" />
                  <span>Turnaround &amp; Payment Terms</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-medium">Full view</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0E121B] block">
                  Service Terms &amp; Estimated Turnaround Note
                </label>
                <textarea
                  rows={3}
                  value={profile.termsText}
                  onChange={(e) => updateProfile('termsText', e.target.value)}
                  placeholder="e.g. 50% deposit to commence. Remaining 50% payable upon final delivery approval. Delivery turnaround: 5 business days."
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl p-3.5 text-xs text-[#0E121B] leading-relaxed focus:outline-none focus:border-[#6962F1] focus:bg-white resize-y transition-all"
                />
                <p className="text-[11px] text-[#8C94A0]">
                  This note is displayed clearly on the receipt slip so clients understand your payment schedule and turnaround time.
                </p>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: BEAUTIFUL COMPACT DIGITAL RECEIPT SLIP     */}
          {/* (Shown sticky on desktop md+, accessed via mobile FAB)   */}
          {/* ======================================================== */}
          <div className="hidden md:block md:col-span-6 lg:col-span-6 space-y-3.5 md:sticky md:top-[88px] md:self-start md:max-h-[calc(100vh-100px)] md:overflow-y-auto custom-scrollbar">
            
            {/* Template Selector Bar */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#EBEFF5] shadow-xs space-y-2 no-print">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#6962F1]" />
                  <span className="text-xs font-bold text-[#0E121B]">Select Receipt Style</span>
                </div>
                <span className="text-[10px] font-bold text-[#6962F1] bg-[#6962F1]/10 px-2.5 py-0.5 rounded-full">
                  {TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Style'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      showToast(`Switched to ${tpl.name}!`);
                    }}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-0.5 border ${
                      selectedTemplate === tpl.id
                        ? 'bg-[#0E121B] text-white border-[#0E121B] shadow-sm'
                        : 'bg-[#F8F9FE] hover:bg-slate-100 text-[#525866] border-[#EBEFF5]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{tpl.icon}</span>
                      <span className="truncate">{tpl.name}</span>
                    </div>
                    <span className={`text-[10px] leading-tight truncate ${selectedTemplate === tpl.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {tpl.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#EBEFF5] shadow-xs flex flex-wrap items-center justify-between gap-2 no-print">
              <div className="text-xs font-bold text-[#0E121B] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#6962F1]" />
                <span className="hidden sm:inline">Live Receipt Slip Preview</span>
                <span className="sm:hidden">Live Receipt</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isGeneratingImage}
                  className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95 whitespace-nowrap shrink-0"
                  title="Download picture to send directly on WhatsApp"
                >
                  <Download className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{isGeneratingImage ? 'Exporting...' : 'Picture'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="px-3 sm:px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-[#0E121B] text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 sm:px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                  title="Copy and send on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* THE COMPACT LUXURY DIGITAL RECEIPT SLIP CARD */}
            <div className="flex justify-center pb-2">
              <div 
                ref={documentRef}
                id="quotation-document"
                className="w-full max-w-[430px] bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_36px_rgba(14,18,27,0.06)] overflow-hidden transition-all relative print:shadow-none print:border-none print:rounded-none"
              >
                {selectedTemplate === 'corporate' && (
                  <CorporateWaveTemplate
                    profile={profile}
                    clientName={clientName}
                    projectTitle={projectTitle}
                    quoteNumber={quoteNumber}
                    issueDate={issueDate}
                    items={items}
                    symbol={symbol}
                    total={total}
                  />
                )}
                {selectedTemplate === 'minimalist' && (
                  <MinimalistTemplate
                    profile={profile}
                    clientName={clientName}
                    projectTitle={projectTitle}
                    quoteNumber={quoteNumber}
                    issueDate={issueDate}
                    items={items}
                    symbol={symbol}
                    total={total}
                  />
                )}
                {selectedTemplate === 'bento' && (
                  <BentoTemplate
                    profile={profile}
                    clientName={clientName}
                    projectTitle={projectTitle}
                    quoteNumber={quoteNumber}
                    issueDate={issueDate}
                    items={items}
                    symbol={symbol}
                    total={total}
                  />
                )}
                {selectedTemplate === 'classic-slip' && (
                  <BoutiqueSlipTemplate
                    profile={profile}
                    clientName={clientName}
                    projectTitle={projectTitle}
                    quoteNumber={quoteNumber}
                    issueDate={issueDate}
                    items={items}
                    symbol={symbol}
                    total={total}
                  />
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Floating Mobile Action Bar (FAB) for Receipt Slip */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between p-2.5 rounded-2xl bg-[#0E121B] text-white shadow-2xl border border-white/10 backdrop-blur-md no-print">
          <div className="pl-2">
            <span className="text-[10px] text-slate-400 block uppercase font-mono leading-none mb-1">Total Quote</span>
            <span className="text-sm font-extrabold font-mono text-emerald-400 leading-none">{symbol}{total.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobilePreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#6962F1] hover:bg-[#5851E0] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <Receipt className="w-4 h-4" />
            <span>View Receipt Slip</span>
          </button>
        </div>

        {/* Full-Height Mobile Bottom-Sheet Preview Modal */}
        {isMobilePreviewOpen && (
          <div 
            className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end animate-fade-in no-print"
            onClick={() => setIsMobilePreviewOpen(false)}
          >
            <div 
              className="bg-[#F8F9FE] w-full h-[92vh] rounded-t-[32px] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 px-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#6962F1]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#0E121B] font-heading">
                      Receipt Slip Preview
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      Total: {symbol}{total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobilePreviewOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Template Switcher */}
                <div className="bg-white rounded-2xl p-2.5 border border-[#EBEFF5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-[#0E121B]">Select Receipt Style</span>
                    <span className="text-[10px] font-bold text-[#6962F1] bg-[#6962F1]/10 px-2 py-0.5 rounded-full">
                      {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          showToast(`Switched to ${tpl.name}!`);
                        }}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-0.5 border ${
                          selectedTemplate === tpl.id
                            ? 'bg-[#0E121B] text-white border-[#0E121B] shadow-xs'
                            : 'bg-[#F8F9FE] hover:bg-slate-100 text-[#525866] border-[#EBEFF5]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>{tpl.icon}</span>
                          <span className="truncate">{tpl.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="bg-white rounded-2xl p-2.5 border border-[#EBEFF5] shadow-xs flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isGeneratingImage}
                    className="flex-1 py-2 px-2.5 rounded-full bg-[#0E121B] hover:bg-black text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-95 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGeneratingImage ? 'Exporting...' : 'Save Picture'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    className="py-2 px-3 rounded-full bg-white border border-slate-200 text-[#0E121B] text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 px-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Rendered Template */}
                <div className="flex justify-center pb-2">
                  <div className="w-full max-w-[430px] bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                    {selectedTemplate === 'corporate' && (
                      <CorporateWaveTemplate
                        profile={profile}
                        clientName={clientName}
                        projectTitle={projectTitle}
                        quoteNumber={quoteNumber}
                        issueDate={issueDate}
                        items={items}
                        symbol={symbol}
                        total={total}
                      />
                    )}
                    {selectedTemplate === 'minimalist' && (
                      <MinimalistTemplate
                        profile={profile}
                        clientName={clientName}
                        projectTitle={projectTitle}
                        quoteNumber={quoteNumber}
                        issueDate={issueDate}
                        items={items}
                        symbol={symbol}
                        total={total}
                      />
                    )}
                    {selectedTemplate === 'bento' && (
                      <BentoTemplate
                        profile={profile}
                        clientName={clientName}
                        projectTitle={projectTitle}
                        quoteNumber={quoteNumber}
                        issueDate={issueDate}
                        items={items}
                        symbol={symbol}
                        total={total}
                      />
                    )}
                    {selectedTemplate === 'classic-slip' && (
                      <BoutiqueSlipTemplate
                        profile={profile}
                        clientName={clientName}
                        projectTitle={projectTitle}
                        quoteNumber={quoteNumber}
                        issueDate={issueDate}
                        items={items}
                        symbol={symbol}
                        total={total}
                      />
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Bottom Close / Minimize Button */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMobilePreviewOpen(false)}
                  className="w-full py-3 rounded-full bg-[#0E121B] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer text-center"
                >
                  ← Back to Editing Tasks &amp; Info
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
