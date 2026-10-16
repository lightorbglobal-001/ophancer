import React from 'react';
import { MessageSquare, FileText, PlusCircle, Send, X, ArrowUpRight } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, setActivePage, settings }) {
  if (!isOpen) return null;

  const handleAction = (pageId) => {
    setActivePage(pageId);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = `https://wa.me/${settings?.whatsapp_support?.phone_number || '2348025100844'}?text=${encodeURIComponent(settings?.whatsapp_support?.default_greeting || 'Hello Ophancer Team, I have an inquiry:')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal / Sheet Container */}
      <div className="relative w-full max-w-lg bg-white border border-[#EBEFF5] rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl z-10 animate-in slide-in-from-bottom-6 duration-200 space-y-5">
        
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2 sm:hidden"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0E121B] font-heading">
              Quick Actions &amp; Support
            </h3>
            <p className="text-xs text-[#525866]">
              Instant access to Ophancer support and services
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#0E121B] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          {/* WhatsApp Chat */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] hover:border-[#D6D8FB] hover:bg-[#EEF0FD] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors">
                  Chat with Us on WhatsApp
                </h4>
                <p className="text-xs text-[#525866]">
                  Instant human assistance &amp; custom inquiries
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#6962F1] shrink-0" />
          </a>

          {/* Need a CV */}
          <button
            onClick={() => handleAction('cv-services')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] hover:border-[#D6D8FB] hover:bg-[#EEF0FD] transition-all group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors">
                    Professional CV Services
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF0FD] text-[#6962F1]">
                    ₦5,000 / $5
                  </span>
                </div>
                <p className="text-xs text-[#525866]">
                  Create new or optimize your existing CV
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#6962F1] shrink-0" />
          </button>

          {/* Suggest an Opportunity */}
          <button
            onClick={() => handleAction('submit')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] hover:border-[#D6D8FB] hover:bg-[#EEF0FD] transition-all group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors">
                  Suggest an Opportunity
                </h4>
                <p className="text-xs text-[#525866]">
                  Submit a job opening or freelance gig for review
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#6962F1] shrink-0" />
          </button>

          {/* Telegram Channel */}
          <a
            href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] hover:border-[#D6D8FB] hover:bg-[#EEF0FD] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0E121B] group-hover:text-[#6962F1] transition-colors">
                  Join Telegram Alert Channel
                </h4>
                <p className="text-xs text-[#525866]">
                  Automated opportunity alerts in real time
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#6962F1] shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
