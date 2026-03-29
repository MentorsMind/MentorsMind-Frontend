import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../components/mentor/ProfileHeader";
import RatingBreakdown from "../components/mentor/RatingBreakdown";
import PublicAvailability from "../components/mentor/PublicAvailability";
import ReviewsList from "../components/mentor/ReviewsList";
import { useBadges } from "../hooks/useBadges";
import BadgeShowcase from "../components/mentor/BadgeShowcase";

const mentor = {
  name: "John Doe",
  bio: "Senior software engineer with 8+ years of experience in frontend development. Passionate about React, TypeScript, and helping developers level up their skills.",
  joinDate: "January 2023",
  sessionCount: 142,
  learnerCount: 89,
  verified: true,
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "GraphQL",
    "Tailwind CSS",
    "Next.js",
  ],
  languages: ["English", "Spanish"],
  pricing: [
    { type: "1-on-1 Session", amount: "$20 / hr" },
    { type: "Code Review", amount: "$15 / session" },
    { type: "Mock Interview", amount: "$30 / session" },
  ],
};

export default function MentorPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { badges } = useBadges(id || "");

  useEffect(() => {
    document.title = `${mentor.name} | Mentor Profile`;

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `View ${mentor.name}'s mentor profile, skills, languages, ratings, availability, and session pricing.`;

    return () => {
      document.title = "MentorMinds Stellar";
      meta!.content = "";
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <ProfileHeader
        name={mentor.name}
        bio={mentor.bio}
        joinDate={mentor.joinDate}
        sessionCount={mentor.sessionCount}
        learnerCount={mentor.learnerCount}
        verified={mentor.verified}
      />

      <RatingBreakdown />

      <PublicAvailability />

      <ReviewsList />

      {/* Badges Showcase */}
      <BadgeShowcase badges={badges} />

      {/* Skills */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {mentor.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-stellar/10 px-4 py-1.5 text-sm font-semibold text-stellar"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Languages</h2>
        <ul className="space-y-2">
          {mentor.languages.map((lang) => (
            <li
              key={lang}
              className="flex items-center gap-2 text-gray-600 text-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-stellar inline-block" />
              {lang}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing</h2>
        <ul className="space-y-3">
          {mentor.pricing.map((p) => (
            <li
              key={p.type}
              className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3"
            >
              <span className="text-sm font-medium text-gray-700">
                {p.type}
              </span>
              <span className="text-sm font-bold text-stellar">{p.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
