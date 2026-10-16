import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

// ========================================================
// 1. CORPORATE WAVE TEMPLATE (B2B Executive Layout)
// ========================================================
export function CorporateWaveTemplate({
  profile,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  items,
  symbol,
  total
}) {
  return (
    <div className="relative text-slate-800 bg-white">
      {/* Wave Header in dark obsidian with accent curve */}
      <div className="relative bg-[#0F172A] text-white pt-5 pb-7 px-5 sm:px-6 overflow-hidden">
        {/* Subtle accent glow */}
        <div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 blur-2xl pointer-events-none"
          style={{ backgroundColor: profile.accentColor }}
        />
        
        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* Logo & Studio Info */}
          <div className="flex items-center gap-3 min-w-0">
            {profile.logoUrl ? (
              <div className="w-11 h-11 rounded-xl bg-white p-0.5 border border-white/20 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black font-mono text-base shadow-sm shrink-0"
                style={{ backgroundColor: profile.accentColor }}
              >
                {profile.providerName ? profile.providerName.slice(0, 2).toUpperCase() : 'PS'}
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate font-heading">
                {profile.providerName || 'Freelance Studio'}
              </h2>
              <p className="text-[11px] text-slate-300 truncate">
                {profile.providerPhone} &bull; {profile.providerEmail}
              </p>
            </div>
          </div>

          {/* Quotation Ref Badge */}
          <div className="text-right shrink-0">
            <span 
              className="inline-block text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full text-white uppercase shadow-sm"
              style={{ backgroundColor: profile.accentColor }}
            >
              #{quoteNumber}
            </span>
            <span className="block text-[10px] font-mono text-emerald-400 font-bold mt-1">
              ● OFFICIAL ESTIMATE
            </span>
          </div>
        </div>

        {/* Dynamic Curved Wave Bottom Border SVG */}
        <svg 
          className="absolute bottom-0 left-0 right-0 w-full h-3.5 text-white" 
          viewBox="0 0 430 16" 
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,16 280,0 430,16 L430,16 L0,16 Z" fill="currentColor"></path>
        </svg>
      </div>

      {/* Content Container */}
      <div className="p-5 sm:p-6 pt-2 space-y-3.5">
        {/* Client & Date Information */}
        <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PREPARED FOR:
            </span>
            <strong className="text-slate-900 block truncate text-xs sm:text-sm font-bold">
              {clientName || 'Valued Client'}
            </strong>
            <span className="text-[11px] text-slate-600 block truncate">
              {projectTitle || 'Services Engagement'}
            </span>
          </div>

          <div className="text-right space-y-0.5 min-w-0">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              ISSUE DATE:
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 block">
              {issueDate}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Valid for 14 Days
            </span>
          </div>
        </div>

        {/* Deliverables Scope Table */}
        <div className="rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs">
          {/* Solid Accent Header Bar */}
          <div 
            className="flex items-center justify-between px-3.5 py-1.5 text-white text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: profile.accentColor }}
          >
            <span>DELIVERABLE / SCOPE</span>
            <span>AMOUNT</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 text-xs">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className={`p-2.5 sm:p-3 space-y-0.5 ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 leading-snug flex-1">
                    <span className="font-mono text-slate-400 mr-1.5">{String(idx + 1).padStart(2, '0')}.</span>
                    {item.title || 'Service Item'}
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 shrink-0">
                    {symbol}{Number(item.price || 0).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-500 pl-5 italic leading-tight">
                    ↳ {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Investment Card (Dark Corporate Solid) */}
        <div className="p-3 rounded-xl bg-[#0F172A] text-white flex items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Total Investment
            </span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold block">
              ● ALL SCOPE INCLUDED &bull; FIXED QUOTE
            </span>
          </div>
          <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white">
            {symbol}{total.toLocaleString()}
          </span>
        </div>

        {/* Bank & Payment Instructions */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-400">
            <span>Payment Instructions</span>
            <span className="text-emerald-600 font-bold">Direct Bank Transfer</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>{profile.bankName}</span>
            <span className="font-mono font-extrabold tracking-wide" style={{ color: profile.accentColor }}>
              {profile.accountNumber}
            </span>
          </div>
          <div className="text-[11px] text-slate-600">
            Beneficiary: <strong className="text-slate-900">{profile.accountName}</strong>
          </div>
        </div>

        {/* Terms of Service */}
        {profile.termsText && (
          <div className="p-2 rounded-lg bg-slate-100/70 text-[10px] text-slate-600 text-center leading-relaxed">
            <span className="font-bold text-slate-900">Terms &amp; Turnaround: </span>
            {profile.termsText}
          </div>
        )}

        {/* Authorized Signature & Official Seal */}
        <div className="pt-2 flex items-end justify-between border-t border-slate-200/80 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold text-slate-800 block">Verified Freelance Quotation</span>
              <span className="text-[9px] text-slate-400">Electronically issued via Ophancer Studio</span>
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 border-b border-slate-400 mb-1"></div>
            <span className="text-[9px] text-slate-500 font-medium block">Authorized Sign-Off</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// 2. MINIMALIST PRO-FORMA TEMPLATE (Scandinavian Clean)
// ========================================================
export function MinimalistTemplate({
  profile,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  items,
  symbol,
  total
}) {
  return (
    <div className="relative text-slate-800 bg-white">
      {/* Top Thin Accent Line */}
      <div className="h-1.5 w-full" style={{ backgroundColor: profile.accentColor }} />

      <div className="p-5 sm:p-6 space-y-3.5">
        {/* Centered Minimal Header */}
        <div className="text-center space-y-1 pb-1">
          {profile.logoUrl && (
            <div className="mx-auto w-11 h-11 rounded-full overflow-hidden border border-slate-200 p-0.5 bg-slate-50 flex items-center justify-center mb-1.5 shadow-2xs">
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-heading">
            {profile.providerName || 'Freelance Studio'}
          </h2>
          <p className="text-[11px] text-slate-500">
            {profile.providerPhone} &bull; {profile.providerEmail}
          </p>
          <div className="pt-1.5">
            <span className="inline-block text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 border-y border-slate-200 py-1 px-4">
              P R O - F O R M A &nbsp; Q U O T A T I O N
            </span>
          </div>
        </div>

        {/* 4-Item Minimal Info Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 py-2 border-y border-slate-200/80 text-xs">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Billed To:</span>
            <strong className="text-slate-900 text-xs font-bold block truncate">{clientName || 'Valued Client'}</strong>
            <span className="text-[11px] text-slate-500 block truncate">{projectTitle || 'Services Engagement'}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Ref &amp; Date:</span>
            <strong className="font-mono text-xs text-slate-900 block">{quoteNumber}</strong>
            <span className="text-[11px] text-slate-500 block">{issueDate}</span>
          </div>
        </div>

        {/* Deliverables Table (Swiss Minimalist Hairline Lines) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-200 pb-1">
            <span>SCOPE / DELIVERABLE</span>
            <span>PRICE</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {items.map((item, idx) => (
              <div key={item.id} className="py-2 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 leading-snug flex-1">
                    <span className="text-slate-400 font-mono mr-1.5">{idx + 1}.</span>
                    {item.title || 'Service Item'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {symbol}{Number(item.price || 0).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-500 pl-4 italic">
                    ↳ {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Due (Clean Right Aligned Minimalist) */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
            Total Investment Due
          </span>
          <span 
            className="font-mono text-xl sm:text-2xl font-black"
            style={{ color: profile.accentColor }}
          >
            {symbol}{total.toLocaleString()}
          </span>
        </div>

        {/* Payment & Bank Details */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
            <span>Direct Payment Transfer</span>
            <span className="text-slate-600 font-semibold">{profile.bankName}</span>
          </div>
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Account: <span className="font-mono" style={{ color: profile.accentColor }}>{profile.accountNumber}</span></span>
            <span className="text-[11px] text-slate-600 font-normal">({profile.accountName})</span>
          </div>
        </div>

        {/* Terms */}
        {profile.termsText && (
          <p className="text-[10px] text-slate-500 text-center italic">
            Terms: {profile.termsText}
          </p>
        )}
      </div>

      {/* Bottom Fluid Accent Banner */}
      <div 
        className="py-2 px-4 text-center text-white text-[10px] font-mono font-bold uppercase tracking-wider"
        style={{ backgroundColor: profile.accentColor }}
      >
        THANK YOU FOR YOUR BUSINESS &bull; VERIFIED QUOTATION
      </div>
    </div>
  );
}

// ========================================================
// 3. CREATIVE BENTO TEMPLATE (Tech Agency Capsules)
// ========================================================
export function BentoTemplate({
  profile,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  items,
  symbol,
  total
}) {
  return (
    <div className="p-4 sm:p-5 bg-slate-50/70 space-y-3 text-slate-800">
      {/* 1. Header Bento Capsule */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {profile.logoUrl ? (
            <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-0.5 shrink-0">
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black font-mono text-base shadow-2xs shrink-0"
              style={{ backgroundColor: profile.accentColor }}
            >
              {profile.providerName ? profile.providerName.slice(0, 2).toUpperCase() : 'PS'}
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {profile.providerName || 'Freelance Studio'}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              {profile.providerPhone}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span 
            className="inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded-full text-white uppercase shadow-2xs whitespace-nowrap shrink-0"
            style={{ backgroundColor: profile.accentColor }}
          >
            QUOTE #{quoteNumber}
          </span>
        </div>
      </div>

      {/* 2. Client & Meta Bento Split */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5 min-w-0">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            CLIENT / PROJECT
          </span>
          <strong className="text-slate-900 block truncate font-bold text-xs">
            {clientName || 'Valued Client'}
          </strong>
          <span className="text-[11px] text-slate-500 block truncate">
            {projectTitle || 'Services Engagement'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5 min-w-0 text-right">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            DATE &amp; STATUS
          </span>
          <span className="font-mono text-xs font-bold text-slate-900 block">
            {issueDate}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block">
            ● 14 Days Guaranteed
          </span>
        </div>
      </div>

      {/* 3. Scope of Work Bento Capsule */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase pb-1 border-b border-slate-100">
          <span>TASK DELIVERABLE</span>
          <span>INVESTMENT</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {items.map((item, idx) => (
            <div key={item.id} className="py-2 space-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 leading-snug flex-1">
                  <span 
                    className="inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mr-1.5"
                    style={{ backgroundColor: `${profile.accentColor}18`, color: profile.accentColor }}
                  >
                    #{idx + 1}
                  </span>
                  {item.title || 'Service Item'}
                </span>
                <span className="font-mono font-extrabold text-slate-900 shrink-0">
                  {symbol}{Number(item.price || 0).toLocaleString()}
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-500 pl-6 italic">
                  ↳ {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Total & Payment Split Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Total Capsule */}
        <div 
          className="p-3 rounded-2xl text-white flex flex-col justify-between shadow-2xs"
          style={{ backgroundColor: profile.accentColor }}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90 block">
            Total Due
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black mt-0.5">
            {symbol}{total.toLocaleString()}
          </span>
          <span className="text-[9px] opacity-85 mt-0.5 block">
            All deliverables included
          </span>
        </div>

        {/* Bank Capsule */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5 text-xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            BANK SETTLEMENT
          </span>
          <div className="font-bold text-slate-900 text-xs truncate">
            {profile.bankName}
          </div>
          <div className="font-mono text-xs font-black truncate" style={{ color: profile.accentColor }}>
            {profile.accountNumber}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {profile.accountName}
          </div>
        </div>
      </div>

      {/* 5. Terms Capsule */}
      {profile.termsText && (
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-[10px] text-slate-600 text-center shadow-2xs">
          <strong className="text-slate-800">Turnaround: </strong>
          {profile.termsText}
        </div>
      )}

      {/* Trust Pill */}
      <div className="text-center pt-0.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verified Electronic Quotation &bull; Ophancer</span>
        </span>
      </div>
    </div>
  );
}

// ========================================================
// 4. BOUTIQUE SLIP TEMPLATE (Vintage Serrated Ticket)
// ========================================================
export function BoutiqueSlipTemplate({
  profile,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  items,
  symbol,
  total
}) {
  return (
    <div className="bg-white text-slate-900 relative">
      {/* Top Zigzag Serrated Teeth Edge SVG */}
      <svg className="w-full h-2.5 text-slate-100 fill-current" viewBox="0 0 430 10" preserveAspectRatio="none">
        <polygon points="0,0 10,10 20,0 30,10 40,0 50,10 60,0 70,10 80,0 90,10 100,0 110,10 120,0 130,10 140,0 150,10 160,0 170,10 180,0 190,10 200,0 210,10 220,0 230,10 240,0 250,10 260,0 270,10 280,0 290,10 300,0 310,10 320,0 330,10 340,0 350,10 360,0 370,10 380,0 390,10 400,0 410,10 420,0 430,10 430,0" />
      </svg>

      <div className="p-5 sm:p-6 pt-2 space-y-3">
        {/* Header */}
        <div className="text-center space-y-1">
          {profile.logoUrl ? (
            <div className="mx-auto w-10 h-10 rounded-full border border-slate-200 p-0.5 overflow-hidden flex items-center justify-center mb-1">
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div 
              className="mx-auto w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1"
              style={{ backgroundColor: profile.accentColor }}
            >
              {profile.providerName ? profile.providerName.slice(0, 2).toUpperCase() : 'PS'}
            </div>
          )}
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 font-heading">
            {profile.providerName || 'Freelance Studio'}
          </h2>
          <p className="text-[11px] text-slate-500">
            {profile.providerPhone} &bull; {profile.providerEmail}
          </p>
          <div className="text-[10px] font-mono text-slate-500 pt-0.5">
            RECEIPT #{quoteNumber} &bull; {issueDate}
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="border-b-2 border-dashed border-slate-300"></div>

        {/* Client Row */}
        <div className="text-xs space-y-0.5">
          <div className="flex justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CUSTOMER:</span>
            <strong className="text-slate-900">{clientName || 'Valued Client'}</strong>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>PROJECT:</span>
            <span>{projectTitle || 'Services Engagement'}</span>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="border-b-2 border-dashed border-slate-300"></div>

        {/* Deliverables Table (Receipt Slip Format) */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between font-mono font-bold text-[10px] text-slate-400 uppercase pb-0.5">
            <span>ITEM &bull; DESCRIPTION</span>
            <span>AMT</span>
          </div>

          <div className="space-y-1.5">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 flex-1 leading-snug">
                    <span className="font-mono text-slate-400 mr-1">{String(idx + 1).padStart(2, '0')}</span>
                    {item.title || 'Service Item'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {symbol}{Number(item.price || 0).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-500 pl-4 italic">
                    ↳ {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="border-b-2 border-dashed border-slate-300"></div>

        {/* Subtotal & Total */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-600 font-mono">
            <span>SUBTOTAL:</span>
            <span>{symbol}{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400 font-mono text-[11px]">
            <span>TAX / VAT (0.0%):</span>
            <span>{symbol}0.00</span>
          </div>
          
          <div className="pt-1.5 border-t-2 border-b-2 border-slate-900 py-1 flex items-center justify-between">
            <span className="font-mono font-black text-sm uppercase tracking-wider text-slate-900">
              TOTAL DUE:
            </span>
            <span 
              className="font-mono text-xl sm:text-2xl font-black"
              style={{ color: profile.accentColor }}
            >
              {symbol}{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-0.5 font-mono">
          <div className="text-[9px] text-slate-400 uppercase">TRANSFER SETTLEMENT:</div>
          <div className="font-bold text-slate-900">{profile.bankName}</div>
          <div className="font-bold" style={{ color: profile.accentColor }}>
            ACCT: {profile.accountNumber}
          </div>
          <div className="text-[10px] text-slate-600">NAME: {profile.accountName}</div>
        </div>

        {/* Terms */}
        {profile.termsText && (
          <div className="text-[10px] text-slate-500 text-center italic">
            NOTE: {profile.termsText}
          </div>
        )}

        {/* Perforated Divider */}
        <div className="border-b-2 border-dashed border-slate-300"></div>

        {/* Bottom Boutique Message */}
        <div className="text-center space-y-0.5 pt-0.5 pb-0.5">
          <div className="text-[11px] font-mono font-bold tracking-wider text-slate-900">
            ★ THANK YOU FOR YOUR PATRONAGE ★
          </div>
          <div className="text-[9px] font-mono text-slate-400">
            OFFICIAL RECEIPT SLIP &bull; OPHANCER
          </div>
        </div>
      </div>

      {/* Bottom Zigzag Serrated Teeth Edge SVG */}
      <svg className="w-full h-2.5 text-slate-100 fill-current rotate-180" viewBox="0 0 430 10" preserveAspectRatio="none">
        <polygon points="0,0 10,10 20,0 30,10 40,0 50,10 60,0 70,10 80,0 90,10 100,0 110,10 120,0 130,10 140,0 150,10 160,0 170,10 180,0 190,10 200,0 210,10 220,0 230,10 240,0 250,10 260,0 270,10 280,0 290,10 300,0 310,10 320,0 330,10 340,0 350,10 360,0 370,10 380,0 390,10 400,0 410,10 420,0 430,10 430,0" />
      </svg>
    </div>
  );
}
