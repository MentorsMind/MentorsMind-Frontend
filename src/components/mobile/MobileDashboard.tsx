import { useState } from "react";

export default function MobileDashboard() {
  const [note, setNote] = useState("");

  return (
    <div className="p-4 space-y-4 md:hidden">
      <h2 className="text-xl font-bold">Mobile Dashboard</h2>

      {/* Sessions */}
      <div className="rounded-lg shadow p-4 bg-white">
        <h3 className="font-semibold">Upcoming Sessions</h3>
        <p className="text-sm text-gray-600 mb-2">
          View and manage your sessions
        </p>
        <button className="w-full bg-black text-white py-2 rounded">
          View Sessions
        </button>
      </div>

      {/* Notes */}
      <div className="rounded-lg shadow p-4 bg-white">
        <h3 className="font-semibold">Quick Notes</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write something..."
          className="w-full mt-2 p-2 border rounded text-sm"
        />
        <button className="w-full mt-2 bg-blue-600 text-white py-2 rounded">
          Save Note
        </button>
      </div>

      {/* Progress */}
      <div className="rounded-lg shadow p-4 bg-white">
        <h3 className="font-semibold">Progress</h3>
        <p className="text-sm text-gray-600 mb-2">
          Track your learning progress
        </p>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div className="bg-green-500 h-2 rounded w-2/3"></div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around">
        <button className="text-sm">Home</button>
        <button className="text-sm">Sessions</button>
        <button className="text-sm">Notes</button>
        <button className="text-sm">Profile</button>
      </div>
    </div>
  );
}