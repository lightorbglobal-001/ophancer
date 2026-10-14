import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E121B] font-heading tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-[#525866] font-mono">
          Last Updated: October 2026 &bull; Fair-Use Aggregation &amp; Platform Guidelines
        </p>
      </div>

      <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#EBEFF5] shadow-sm space-y-6 text-xs sm:text-sm text-[#525866] leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            1. Nature of Platform &amp; Aggregator Disclosure
          </h2>
          <p>
            Ophancer is an independent opportunity aggregator and discovery tool. Ophancer indexes public recruitment postings, career opportunities, and publicly posted service requests. <strong>Ophancer is not an employer, recruitment agency, recruiter, or escrow agent</strong>, and does not conduct hiring decisions on behalf of any third-party company listed on the site.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            2. External Links &amp; Third-Party Opportunities
          </h2>
          <p>
            When applying to a discovered opportunity, users are directed to the original employer’s career portal, ATS, or contact destination. Ophancer is not liable for third-party interview processes, employment disputes, or the accuracy of third-party external postings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            3. CV Writing &amp; Optimization Services
          </h2>
          <p>
            Our CV writing services provide professional, customized editorial and structural formatting. While our CVs are tailored for modern applicant tracking systems and human reviewers, <strong>we do not guarantee job offers or interviews</strong>, as recruitment outcomes depend on hiring managers, employer criteria, and market competition.
          </p>
          <p className="p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-xs">
            All CV drafting begins only after confirmation of payment via bank transfer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0E121B] font-heading">
            4. Prohibited Submissions
          </h2>
          <p>
            Users who submit opportunities through our suggestion portal agree not to submit deceptive postings, multi-level marketing (MLM) schemes, pyramid solicitations, or listings requiring upfront application fees from jobseekers.
          </p>
        </section>

      </div>

    </div>
  );
}
