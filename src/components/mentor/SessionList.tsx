import React from "react";
import type { ExtendedSession } from "../../hooks/useMentorSessions";
import { useMentorSessions } from "../../hooks/useMentorSessions";
import { useTimezone } from "../../hooks/useTimezone";
import TimeDisplay from "../ui/TimeDisplay";

interface SessionListProps {
  sessions: ExtendedSession[];
  type: "upcoming" | "completed";
  onOpenDetail: (session: ExtendedSession) => void;
}



const SessionList: React.FC<SessionListProps> = ({
  sessions,
  type,
  onOpenDetail,
}) => {
  const { cancelWithReason } = useMentorSessions();
  const { timezone: userTimezone, timeFormat } = useTimezone();

  const handleCancel = (sessionId: string) => {
    const reason = prompt("Reason for cancellation:");
    if (reason) {
      cancelWithReason(sessionId, reason);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-gray-400";
      case "rescheduled":
        return "bg-orange-500";
      default:
        return "bg-gray-300";
    }
  };

  const paymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-bold">
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-bold">
            Pending
          </span>
        );
      case "refunded":
        return (
          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold">
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900">
          {type === "upcoming" ? "Upcoming Sessions" : "Completed Sessions"}
        </h3>
        <span className="bg-stellar/10 text-stellar text-xs font-bold px-3 py-1 rounded-full">
          {sessions.length} {type}
        </span>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 italic">
            No {type} sessions.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="group p-5 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-stellar/20 hover:shadow-lg hover:shadow-stellar/5 transition-all duration-300 cursor-pointer"
              onClick={() => onOpenDetail(session)}
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${statusColor(session.status)}`}
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {session.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-stellar transition-colors">
                    {session.topic}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <TimeDisplay
                        date={session.startTime}
                        userTimezone={userTimezone}
                        mentorTimezone={session.mentorTimezone}
                        use24h={timeFormat === "24h"}
                        showRelative={type === "upcoming"}
                      />
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {session.learnerName}
                    </span>
                    {paymentBadge(session.paymentStatus)}
                  </div>
                  {session.notes && (
                    <p className="text-xs text-gray-500 italic mt-1">
                      "{session.notes.slice(0, 80)}..."
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 shadow-md shadow-green-100 transition-all"
                    >
                      Join
                    </a>
                  )}
                  {type === "upcoming" && session.status !== "cancelled" && (
                    <>
                      <button className="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all">
                        Reschedule
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(session.id);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Cancel Session"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;
