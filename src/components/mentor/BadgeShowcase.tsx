import React, { useEffect, useState } from "react";
import type { MentorBadge } from "../../hooks/useBadges";

// Internal Confetti component solely driven by CSS and lightweight DOM nodes
const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<
    {
      id: number;
      left: string;
      delay: string;
      duration: string;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    // Premium MentorsMind colors + some vivid accents
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${1 + Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 rounded-3xl">
      <style>
        {`
          @keyframes badge-confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(250px) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: "-20px",
            width: "8px",
            height: "8px",
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `badge-confetti-fall ${p.duration} ease-in forwards`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

interface BadgeShowcaseProps {
  badges: MentorBadge[];
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges }) => {
  // Check if any badge is marked as newly earned to trigger the effect
  const hasNewBadge = badges.some((b) => b.isNew);
  const [showConfetti, setShowConfetti] = useState(hasNewBadge);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (badges.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative">
      {showConfetti && <Confetti />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Mentor Badges</h2>
        <span className="text-sm font-bold text-stellar bg-stellar/10 px-3 py-1 rounded-lg">
          {badges.length} Earned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
              badge.isNew
                ? "border-stellar bg-stellar/5 shadow-md shadow-stellar/10 relative overflow-hidden"
                : "border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md"
            }`}
          >
            {badge.isNew && (
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                <div className="absolute top-4 right-[-14px] bg-stellar text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-6 rotate-45 shadow-sm">
                  NEW
                </div>
              </div>
            )}

            <div
              className={`p-3 rounded-xl ${badge.badgeBgColor} shadow-sm shrink-0 border`}
            >
              <svg
                className={`w-6 h-6 ${badge.badgeTextColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={badge.icon}
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3
                  className={`font-bold text-gray-900 truncate ${badge.isNew ? "text-stellar" : ""}`}
                >
                  {badge.name}
                </h3>
                {badge.rarity < 5 && (
                  <span className="shrink-0 flex items-center gap-0.5 text-[9px] uppercase font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-md border border-yellow-200">
                    <svg
                      className="w-2.5 h-2.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    Rare
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-snug">
                {badge.description}
              </p>

              <div className="text-[11px] font-semibold text-gray-400 mt-auto flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(badge.earnedDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeShowcase;
