import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E121B] font-heading tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#525866] font-mono">
          Last Updated: October 2026 &bull; Compliant with NDPR &amp; Global Privacy Standards
        </p>
      </div>

      <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#EBEFF5] shadow-sm space-y-6 text-xs sm:text-sm text-[#525866] leading-relaxed">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
          <strong className="text-sm font-bold block">1. The Zero-Storage CV Policy</strong>
          <p className="text-xs text-emerald-800">
            Ophancer will <strong>never upload or permanently store your personal CV, resume documents, or career files on our cloud servers or database buckets</strong>.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            2. How the Free ATS CV Checker Processes Files
          </h2>
          <p>
            When you use the Free ATS CV Checker tool, your uploaded document is processed <strong>locally inside your web browser’s RAM memory</strong>. Once the diagnostic score and section checks are calculated, the memory buffer is immediately released. No text, names, emails, or personal details are logged to any external server.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            3. CV Services Document Handling
          </h2>
          <p>
            When ordering a professional CV writing or optimization package, customers transfer their existing documents and transfer receipts directly via WhatsApp end-to-end encrypted messaging directly to our career consultant. This eliminates third-party cloud disk exposure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            4. Discovered Opportunities &amp; Public Indexation
          </h2>
          <p>
            The opportunities displayed on our platform are collected from publicly accessible company career pages, developer networks, and authorized community announcement feeds. We attribute all listings to original sources.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            5. Contact Inquiries &amp; Moderation Submissions
          </h2>
          <p>
            Information submitted through the "Suggest an Opportunity" form is stored solely for verification and moderation purposes. We do not sell or share contact information with third-party advertisers.
          </p>
        </section>

      </div>

    </div>
  );
}
