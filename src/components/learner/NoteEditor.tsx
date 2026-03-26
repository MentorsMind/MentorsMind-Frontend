import React from 'react';
import type { LearnerNote, NoteTemplate } from '../../types';

interface NoteEditorProps {
  note: LearnerNote;
  templates: NoteTemplate[];
  onApplyTemplate: (templateId: string) => void;
  onChange: (content: string) => void;
  onToggleShare: () => void;
  onSetReminder: (reminder: string) => void;
  onAddAttachments: (files: FileList | File[]) => void;
  onExport: (format: 'pdf' | 'markdown') => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  templates,
  onApplyTemplate,
  onChange,
  onToggleShare,
  onSetReminder,
  onAddAttachments,
  onExport,
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-stellar">Rich-text Note Editor</div>
            <h3 className="mt-2 text-2xl font-black text-gray-900">{note.sessionTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">with {note.mentorName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template.id)}
                className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500"
              >
                {template.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => onChange(`## ${note.content}`)} className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">
            Add Heading
          </button>
          <button type="button" onClick={() => onChange(`${note.content}\n- New bullet`)} className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">
            Add Bullet
          </button>
          <button type="button" onClick={onToggleShare} className="rounded-full bg-gray-900 px-3 py-2 text-xs font-bold text-white">
            {note.sharedWithMentor ? 'Shared with mentor' : 'Share with mentor'}
          </button>
          <button type="button" onClick={() => onExport('markdown')} className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">
            Export Markdown
          </button>
          <button type="button" onClick={() => onExport('pdf')} className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">
            Export PDF
          </button>
        </div>

        <textarea
          aria-label="Note content"
          value={note.content}
          onChange={(event) => onChange(event.target.value)}
          className="mt-5 min-h-72 w-full rounded-3xl border border-gray-100 bg-gray-50 px-5 py-5 text-sm leading-relaxed text-gray-700 outline-none focus:border-stellar focus:bg-white"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-black text-gray-900">Attachments & Follow-ups</h4>
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-2xl bg-stellar px-4 py-3 text-sm font-bold text-white">
            Add attachment
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files && event.target.files.length > 0) {
                  onAddAttachments(event.target.files);
                  event.target.value = '';
                }
              }}
            />
          </label>

          <div className="mt-4 space-y-3">
            {note.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded-2xl bg-gray-50 px-4 py-4">
                <div className="text-sm font-bold text-gray-900">{attachment.name}</div>
                <div className="mt-1 text-xs text-gray-400">{attachment.sizeLabel}</div>
              </div>
            ))}
          </div>

          <label htmlFor="note-reminder" className="mt-5 block text-sm font-bold text-gray-900">
            Reminder / follow-up
          </label>
          <input
            id="note-reminder"
            value={note.reminder ?? ''}
            onChange={(event) => onSetReminder(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:bg-white"
          />
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-black text-gray-900">Version History</h4>
          <div className="mt-4 space-y-3">
            {note.versions.map((version) => (
              <div key={version.id} className="rounded-2xl bg-gray-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  {new Date(version.savedAt).toLocaleString()}
                </div>
                <p className="mt-2 text-sm text-gray-600">{version.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
