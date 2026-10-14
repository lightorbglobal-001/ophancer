import React, { useState } from 'react';
import { MessageSquare, Mail, Send, HelpCircle, ChevronDown, Check, ArrowRight } from 'lucide-react';

export default function ContactPage({ settings }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [formSent, setFormSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const faqs = [
    {
      q: "Is Ophancer completely free to use for jobseekers?",
      a: "Yes. Searching, filtering, and applying to all discovered opportunities is 100% free. We never charge jobseekers to view listings or apply on original employer portals."
    },
    {
      q: "How does the ₦5,000 / $5 CV writing service work?",
      a: "You select your package (1 CV for ₦5k / $5, or 2 CVs for ₦8k), make payment via bank transfer, and send your details and receipt directly to our consultant on WhatsApp. Work begins immediately upon confirmation, with standard delivery within 48 hours."
    },
    {
      q: "Does Ophancer store my CV files on a server?",
      a: "No. Our Free ATS CV Checker runs directly inside your web browser memory. Documents are never uploaded to our servers or stored in any database. When you order paid CV services, documents are transferred directly in WhatsApp's end-to-end encrypted chat."
    },
    {
      q: "How can I get newly indexed opportunities first?",
      a: "Join our official Telegram alert channel (@OphancerAlerts). Our automated discovery pipeline broadcasts fresh listings within minutes of indexation."
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  const whatsappUrl = `https://wa.me/${settings?.whatsapp_support?.phone_number || '2348012345678'}?text=${encodeURIComponent('Hello Ophancer Support Team, I have a question:')}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight">
          Contact &amp; Support
        </h1>
        <p className="text-sm sm:text-base text-[#525866] leading-relaxed">
          Need assistance with CV optimization, want to report a broken opportunity, or have a partnership inquiry? Reach our team directly.
        </p>
      </div>

      {/* 2-Column Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WhatsApp Fast Channel */}
        <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 border border-[#EBEFF5] shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0E121B]">
              Chat on WhatsApp (Recommended)
            </h3>
            <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
              Fastest response time for CV consultations, payment confirmations, and urgent inquiries. Typical response within 15–30 minutes.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[44px] px-6 sm:px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
          >
            <span>Open WhatsApp Chat</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>

        {/* Telegram Alerts Channel */}
        <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 border border-[#EBEFF5] shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0E121B]">
              Official Telegram Alerts
            </h3>
            <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
              Join thousands of jobseekers receiving immediate notification of freshly discovered job openings and freelance client contracts.
            </p>
          </div>

          <a
            href={settings?.telegram_channel?.channel_url || "https://t.me/OphancerAlerts"}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[44px] px-6 sm:px-8 rounded-full bg-[#6962F1] hover:bg-[#5851de] text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
          >
            <span>Join @OphancerAlerts</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>

      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-[#F8F9FE] rounded-[32px] p-6 sm:p-10 border border-[#EBEFF5] space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0E121B] font-heading">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-[#EBEFF5] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#0E121B] hover:text-[#6962F1] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#99A0AE] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#6962F1]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#525866] leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
