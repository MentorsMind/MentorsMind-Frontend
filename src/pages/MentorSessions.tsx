import React, { useState } from "react";
import { useMentorSessions } from "../hooks/useMentorSessions";
import SessionList from "../components/mentor/SessionList";
import SessionDetail from "../components/mentor/SessionDetail";

import { Link } from "lucide-react";
import TimeDisplay from "../components/ui/TimeDisplay";
import { useTimezone } from "../hooks/useTimezone";

const MentorSessions: React.FC<{ isOnline?: boolean }> = ({ isOnline = true }) => {
  const { data, refresh } = useMentorSessions();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming",
  );
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const { timezone: userTimezone, timeFormat } = useTimezone();

  const handleOpenDetail = (session: any) => {
    setSelectedSession(session);
    setShowDetail(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/mentor/dashboard"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Session Management
          </h1>
          <p className="text-xl text-gray-500 font-medium mt-1">
            Manage your upcoming and completed sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className={`px-6 py-3 border font-bold rounded-2xl transition-all shadow-sm ${
              !isOnline
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-stellar text-stellar hover:bg-stellar/5"
            }`}
            disabled={data.loading || !isOnline}
          >
            {data.loading ? "Refreshing..." : !isOnline ? "Offline" : "⟳ Refresh"}
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
        {(["upcoming", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab
                ? "border-stellar text-stellar shadow-lg"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({data[tab].length})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SessionList
            sessions={data[activeTab]}
            type={activeTab}
            onOpenDetail={handleOpenDetail}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-stellar to-stellar-dark text-white rounded-3xl p-8 shadow-xl">
            <h3 className="font-bold text-xl mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-stellar/90">Upcoming</span>
                <span className="font-black text-2xl">
                  {data.upcoming.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stellar/90">Completed</span>
                <span className="font-black text-2xl">
                  {data.completed.length}
                </span>
              </div>
              <div className="h-1 bg-white/20 rounded-full">
                <div
                  className="h-full bg-white rounded-full shadow-lg"
                  style={{
                    width: `${Math.min(100, data.upcoming.length * 10)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold mb-4">Next Actions</h3>
            <ul className="space-y-2 text-sm">
              {data.upcoming.slice(0, 3).map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-2 text-gray-600 p-2 rounded-xl hover:bg-gray-50"
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                  Confirm {session.learnerName} (
                  <TimeDisplay
                    date={session.startTime}
                    userTimezone={userTimezone}
                    mentorTimezone={session.mentorTimezone}
                    showRelative={false}
                    use24h={timeFormat === "24h"}
                    options={{
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }}
                  />
                  )
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
};

export default MentorSessions;
