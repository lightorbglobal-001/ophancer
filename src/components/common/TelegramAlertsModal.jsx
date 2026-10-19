import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Bell, 
  ShieldCheck, 
  ExternalLink,
  Smartphone,
  Briefcase,
  MapPin,
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  isTelegramWebApp, 
  getTelegramUser, 
  telegramHaptic, 
  openTelegramLink 
} from '../../utils/telegramWebApp';
import { saveTelegramSubscriber, getTelegramSubscriber } from '../../services/supabaseClient';

const SECTOR_OPTIONS = [
  { id: 'all', label: 'All Verified Sectors (General)' },
  { id: 'ngo', label: 'NGO & Humanitarian Development' },
  { id: 'finance', label: 'Banking, Accounting & Finance' },
  { id: 'energy', label: 'Oil, Gas, Energy & Engineering' },
  { id: 'healthcare', label: 'Healthcare & Medical' },
  { id: 'education', label: 'Education & Teaching' },
  { id: 'admin', label: 'Executive Admin & Virtual Assistant' },
  { id: 'logistics', label: 'Logistics, Procurement & Supply' },
  { id: 'sales', label: 'Sales, Marketing & Business Dev' },
  { id: 'hospitality', label: 'Hospitality & Tourism' },
  { id: 'legal', label: 'Legal & Corporate Compliance' },
  { id: 'web-dev', label: 'Web & Software Development' },
  { id: 'design', label: 'Creative, Media & Graphic Design' }
];

const LOCATION_OPTIONS = [
  { id: 'all', label: 'All (Nigeria & Global Remote)' },
  { id: 'remote', label: '100% Remote Only' },
  { id: 'lagos', label: 'Lagos, Nigeria' },
  { id: 'abuja', label: 'Abuja FCT, Nigeria' }
];

export default function TelegramAlertsModal({ isOpen, onClose }) {
  const [tgUser, setTgUser] = useState(null);
  const [isInsideTMA, setIsInsideTMA] = useState(false);

  // Form Fields
  const [telegramId, setTelegramId] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Detect Telegram environment on open
  useEffect(() => {
    if (!isOpen) return;

    const inTMA = isTelegramWebApp();
    setIsInsideTMA(inTMA);

    const user = getTelegramUser();
    if (user) {
      setTgUser(user);
      setTelegramId(String(user.id));
      setUsername(user.username || '');
      setFirstName(user.first_name || '');

      // Load saved preferences from Supabase
      getTelegramSubscriber(user.id).then(sub => {
        if (sub) {
          if (sub.category) setSelectedSector(sub.category);
          if (sub.location_pref) setSelectedLocation(sub.location_pref);
          if (sub.phone_number) setPhoneNumber(sub.phone_number);
        }
      });
    } else {
      // Check localStorage for previously entered Telegram info
      try {
        const cached = localStorage.getItem('ophancer_tg_alerts_pref');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.telegramId) setTelegramId(parsed.telegramId);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
          if (parsed.selectedSector) setSelectedSector(parsed.selectedSector);
          if (parsed.selectedLocation) setSelectedLocation(parsed.selectedLocation);
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    telegramHaptic('medium');

    const cleanId = telegramId.trim();
    if (!cleanId) {
      setStatusMessage('Please provide your Telegram Username or ID so the bot can DM you.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    const subscriberPayload = {
      chat_id: cleanId,
      username: username.replace(/^@/, '').trim(),
      first_name: firstName.trim() || 'Ophancer Member',
      phone_number: phoneNumber.trim(),
      category: selectedSector,
      location_pref: selectedLocation
    };

    // Save to local storage for instant browser recall
    try {
      localStorage.setItem('ophancer_tg_alerts_pref', JSON.stringify({
        telegramId: cleanId,
        username,
        phoneNumber,
        selectedSector,
        selectedLocation
      }));
    } catch {}

    // Save to Supabase Cloud
    await saveTelegramSubscriber(subscriberPayload);

    setIsSaving(false);
    setIsSaved(true);
    telegramHaptic('success');
  };

  const handleOpenBotForStars = () => {
    telegramHaptic('medium');
    const botUrl = `https://t.me/OphancerAlertsBot?start=stars_vip`;
    openTelegramLink(botUrl);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dark Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#0E121B]/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Private Telegram Job Alerts Setup"
        className="relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col z-[10001] animate-bottom-sheet sm:animate-scale-in"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#0E121B] via-[#1a1f30] to-[#0E121B] text-white flex items-start justify-between shrink-0">
          <div className="space-y-1 pr-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#6962F1]/20 border border-[#6962F1]/40 text-[#A5A0FF] text-[11px] font-bold tracking-wide">
              <Send className="w-3.5 h-3.5" />
              <span>PRIVATE TELEGRAM RADAR</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black font-heading tracking-tight text-white">
              Instant Private Job &amp; Gig Alerts
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Never miss a high-paying role. Get direct DM pings within 60 seconds of discovery.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#0E121B] flex-1">
          
          {/* Telegram User Connected Card */}
          {tgUser ? (
            <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#6962F1] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {tgUser.first_name ? tgUser.first_name[0] : 'U'}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#0E121B]">
                    Connected as {tgUser.first_name} {tgUser.last_name}
                  </div>
                  <div className="text-[11px] text-[#525866]">
                    @{tgUser.username || `ID: ${tgUser.id}`} &bull; Telegram Mini App Active
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Linked
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-[#0E121B]">Connect Telegram Bot</div>
                <div className="text-[11px] text-[#525866]">
                  Receive private messages directly to your Telegram chat.
                </div>
              </div>
              <a
                href="https://t.me/OphancerAlertsBot?start=web_connect"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => telegramHaptic('light')}
                className="px-3 py-1.5 rounded-full bg-[#6962F1] hover:bg-[#5249D6] text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                <span>Start Bot</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Success Banner */}
          {isSaved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Alert Filters Saved Successfully!</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Your private radar is configured. You will receive real-time direct pings whenever matching verified vacancies or client requests are found.
              </p>
            </div>
          )}

          {/* Filter Form */}
          <form onSubmit={handleSavePreferences} className="space-y-4">
            
            {/* Telegram Username / Chat ID */}
            {!tgUser && (
              <div className="space-y-1.5">
                <label className="font-bold text-[#0E121B] block">
                  Telegram Username or Chat ID *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (!telegramId) setTelegramId(e.target.value.replace(/^@/, ''));
                    }}
                    placeholder="e.g. johndoe"
                    required
                    className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl pl-8 pr-4 py-2.5 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1]"
                  />
                </div>
              </div>
            )}

            {/* Optional Phone Number (WhatsApp / SMS Fallback) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#0E121B] block">
                  Phone Number (Optional)
                </label>
                <span className="text-[10px] text-[#525866]">For WhatsApp / Direct Contact</span>
              </div>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0E121B] placeholder-[#99A0AE] focus:outline-none focus:border-[#6962F1]"
                />
              </div>
            </div>

            {/* Industry / Sector Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#0E121B] block flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#6962F1]" />
                <span>Job Sector / Industry Filter</span>
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
              >
                {SECTOR_OPTIONS.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.label}</option>
                ))}
              </select>
            </div>

            {/* Location Preference */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#0E121B] block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6962F1]" />
                <span>Location Preference</span>
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
              >
                {LOCATION_OPTIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.label}</option>
                ))}
              </select>
            </div>

            {statusMessage && (
              <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {statusMessage}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5 text-white" />
              <span>{isSaving ? 'Saving Alerts...' : 'Save Private Alert Filters'}</span>
            </button>
          </form>

          {/* 100% Free VIP Alert Radar Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  ⭐
                </span>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">100% Free VIP Alert Radar</h4>
                  <span className="text-[10px] text-emerald-800 font-semibold">Community Edition &bull; No Fees or Stars Required</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
                Free Lifetime Access
              </span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-emerald-900">
              <li className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Instant private alert dispatch the moment new verified jobs drop</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Pre-written cold pitch hooks &amp; direct employer contact info included</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={handleOpenBotForStars}
              className="w-full py-2.5 rounded-full bg-[#0E121B] hover:bg-[#6962F1] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Connect Free Telegram Radar Bot</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#525866] shrink-0">
          <span className="font-mono">
            Encrypted &bull; 0 Spam Guarantee
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-[#0E121B] font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
