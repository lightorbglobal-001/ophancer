import React from 'react';
import { Compass, ShieldCheck, Target, Zap, Users, Globe2, ArrowRight } from 'lucide-react';
import Badge from '../components/common/Badge';

export default function AboutPage({ setActivePage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight leading-tight">
          Empowering Talent Through Transparent Discovery
        </h1>
        <p className="text-xs sm:text-base text-[#525866] leading-relaxed">
          Ophancer (Opportunity Enhancer) solves opportunity fragmentation across emerging African talent markets and the global remote economy.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0E121B] font-heading">
            More Than a Job Board
          </h3>
          <p className="text-xs text-[#525866] leading-relaxed">
            Conventional boards only list corporate vacancies. Ophancer also indexes public client requests for web developers, graphic designers, virtual assistants, and data analysts.
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0E121B] font-heading">
            Pan-African &amp; Global Focus
          </h3>
          <p className="text-xs text-[#525866] leading-relaxed">
            Tailored specifically for ambitious Nigerian and African talent, while connecting users to high-paying international remote contracts denominated in USD and Naira.
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#EBEFF5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0E121B] font-heading">
            Zero Hidden Fees for Seekers
          </h3>
          <p className="text-xs text-[#525866] leading-relaxed">
            Browsing and applying to discovered opportunities is 100% free forever. We preserve original source links and transparently direct you straight to employers.
          </p>
        </div>
      </div>

      {/* Detailed Manifesto */}
      <div className="bg-[#F8F9FE] rounded-2xl sm:rounded-[32px] p-6 sm:p-12 border border-[#EBEFF5] space-y-5 sm:space-y-6 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0E121B] font-heading">
          Why We Built Ophancer
        </h2>
        
        <div className="space-y-3.5 text-xs sm:text-sm text-[#525866] leading-relaxed">
          <p>
            Every day, thousands of high-value opportunities are announced not on traditional job portals, but in public social channels, community developer boards, direct business posts, and regional announcement threads across Lagos, Abuja, Nairobi, Accra, and global hubs.
          </p>
          <p>
            Jobseekers waste hours bouncing between disparate sites, falling victim to middleman fee scams, and applying with unoptimized CVs that get filtered out by Applicant Tracking Systems.
          </p>
          <p>
            Ophancer acts as a centralized radar: our automated discovery pipeline indexes formal vacancies and informal service requests, validates original source links, and surfaces actionable leads in real time on our web app and official Telegram channel.
          </p>
        </div>

        <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => {
              setActivePage('opportunities');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto h-[48px] sm:h-[44px] px-8 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => {
              setActivePage('cv-services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto h-[48px] sm:h-[44px] px-6 rounded-full bg-white hover:bg-slate-50 text-[#6962F1] border border-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Learn About CV Services</span>
          </button>
        </div>
      </div>

    </div>
  );
}
