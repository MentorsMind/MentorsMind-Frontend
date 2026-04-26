import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import NoteSearch from './NoteSearch';
import NoteEditor from './NoteEditor';
import ResourceBookmark from './ResourceBookmark';

const LearnerNotes: React.FC = () => {
  const {
    templates,
    filteredNotes,
    selectedNote,
    resources,
    searchQuery,
    isSaving,
    setSearchQuery,
    setSelectedNoteId,
    updateSelectedNote,
    applyTemplate,
    toggleShareWithMentor,
    shareNoteWithLearner,
    setReminder,
    addAttachments,
    addResourceLink,
    removeResourceLink,
    addResourceBookmark,
    exportSelectedNote,
  } = useNotes();

  if (!selectedNote) return null;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <NoteSearch value={searchQuery} onChange={setSearchQuery} />

          <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-black text-gray-900">Session-specific notes</div>
            <div className="mt-4 space-y-3">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full rounded-3xl p-4 text-left ${
                    note.id === selectedNote.id ? 'bg-stellar text-white' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-sm font-black">{note.sessionTitle}</div>
                  <div className={`mt-1 text-xs ${note.id === selectedNote.id ? 'text-white/75' : 'text-gray-400'}`}>
                    {note.mentorName}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <ResourceBookmark resources={resources} onAdd={addResourceBookmark} />
        </div>

        <NoteEditor
          note={selectedNote}
          templates={templates}
          isSaving={isSaving}
          onApplyTemplate={applyTemplate}
          onChange={updateSelectedNote}
          onToggleShare={toggleShareWithMentor}
          onShareWithLearner={shareNoteWithLearner}
          onSetReminder={setReminder}
          onAddAttachments={addAttachments}
          onAddResourceLink={addResourceLink}
          onRemoveResourceLink={removeResourceLink}
          onExport={exportSelectedNote}
        />
      </div>
    </section>
  );
};

export default LearnerNotes;
