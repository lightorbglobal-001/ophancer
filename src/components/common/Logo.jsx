import React from 'react';

/**
 * Ophancer Brand Logo
 * Inspired by Interlink's world-class, fluid iridescent emblem and clean neo-grotesque typography.
 * Represents: Opportunity Enhancer — a kinetic ascending catalyst unlocking human potential.
 */
export default function Logo({ 
  isLight = false, 
  size = "md", 
  showTag = false, 
  className = "" 
}) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11"
  };

  const textSizes = {
    sm: "text-[17px]",
    md: "text-[21px]",
    lg: "text-[26px]"
  };

  return (
    <div className={`flex items-center gap-2.5 select-none whitespace-nowrap flex-shrink-0 ${className}`}>
      {/* Exquisite Ophancer Fluid Iridescent Emblem */}
      <div className={`relative ${iconSizes[size] || iconSizes.md} shrink-0`}>
        <svg 
          viewBox="0 0 44 44" 
          className="w-full h-full drop-shadow-[0_4px_14px_rgba(105,98,241,0.4)]" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich multi-stop iridescent background gradient */}
            <linearGradient id="ophPebbleGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8176FF" />
              <stop offset="45%" stopColor="#6962F1" />
              <stop offset="100%" stopColor="#4335DC" />
            </linearGradient>

            {/* Inner dynamic ribbon gradient */}
            <linearGradient id="ophRibbonGrad" x1="8" y1="8" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#EDE9FE" />
              <stop offset="100%" stopColor="#DDD8FF" />
            </linearGradient>

            {/* Ambient specular highlight */}
            <radialGradient id="ophGlowRadial" cx="30%" cy="25%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#8176FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6962F1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Base pebble squircle with smooth continuous curvature */}
          <rect x="1.5" y="1.5" width="41" height="41" rx="13.5" fill="url(#ophPebbleGrad)" />
          
          {/* 2. Soft glass illumination layer */}
          <rect x="1.5" y="1.5" width="41" height="41" rx="13.5" fill="url(#ophGlowRadial)" />

          {/* 3. Ultra-fine glass edge rim */}
          <rect x="2" y="2" width="40" height="40" rx="13" stroke="white" strokeOpacity="0.3" strokeWidth="1" />

          {/* 4. Fluid Möbius Opportunity Loop (The 'O' catalyst) */}
          <path 
            d="M22 10.5C15.65 10.5 10.5 15.65 10.5 22C10.5 28.35 15.65 33.5 22 33.5C28.35 33.5 33.5 28.35 33.5 22C33.5 19.8 32.88 17.75 31.8 16" 
            stroke="url(#ophRibbonGrad)" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
          />

          {/* 5. Ascending Career Vector / Piercing Trajectory */}
          <path 
            d="M16.5 26.5L27 16M27 16H20.5M27 16V22.5" 
            stroke="white" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* 6. Discovered Opportunity Spark / Starburst */}
          <circle cx="32" cy="11.5" r="2.2" fill="#FDE047" />
        </svg>
      </div>

      {/* Bespoke Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <span className={`${textSizes[size] || textSizes.md} font-extrabold tracking-[-0.03em] font-heading flex items-center transition-colors ${
          isLight ? 'text-white' : 'text-[#605CF8]'
        }`}>
          <span>Ophancer</span>
        </span>
        {showTag && (
          <span className={`text-[10px] tracking-wider font-semibold uppercase mt-1 ${
            isLight ? 'text-white/70' : 'text-[#6962F1]'
          }`}>
            Opportunity Enhancer
          </span>
        )}
      </div>
    </div>
  );
}
