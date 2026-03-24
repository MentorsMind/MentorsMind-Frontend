import React from 'react';

interface NoteSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const NoteSearch: React.FC<NoteSearchProps> = ({ value, onChange }) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
      <label htmlFor="note-search" className="mb-2 block text-sm font-bold text-gray-900">
        Search notes
      </label>
      <input
        id="note-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by session, mentor, tag, or note text"
        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-stellar focus:bg-white"
      />
    </div>
  );
};

export default NoteSearch;
