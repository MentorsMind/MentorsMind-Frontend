import React, { useState } from "react";
import type { MentorBadge } from "../../hooks/useBadges";

interface BadgeTooltipProps {
  badge: MentorBadge;
  children: React.ReactNode;
}

const BadgeTooltip: React.FC<BadgeTooltipProps> = ({ badge, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block cursor-help group focus:outline-none focus:ring-2 focus:ring-stellar focus:rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}

      {isHovered && (
        <div className="absolute z-50 w-64 p-4 mt-2 -ml-32 left-1/2 bg-gray-900 rounded-2xl shadow-xl border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          {/* Arrow */}
          <div className="absolute w-3 h-3 bg-gray-900 border-l border-t border-gray-800 transform rotate-45 -top-1.5 left-1/2 -ml-1.5" />

          <div className="relative">
            <div className="flex items-start justify-between mb-2">
              <h4 className={`text-sm font-bold ${badge.color}`}>
                {badge.name}
              </h4>
              {badge.rarity < 5 && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rare
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 font-medium mb-3 leading-relaxed">
              {badge.description}
            </p>

            <div className="pt-3 border-t border-gray-800/50 mt-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                How to earn
              </span>
              <p className="text-xs text-gray-400">{badge.howToEarn}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeTooltip;
