import React, { useRef } from 'react';
import type { LearnerNote, NoteTemplate } from '../../types';
import {
  wrapSelection,
  prefixLines,
  wrapCodeBlock,
  formatLastSaved,
} from '../../utils/richtext.utils';
import ResourceLinks from '../session/ResourceLinks';

interface NoteEditorProps {
  note: LearnerNote;
  templates: NoteTemplate[];
  isSaving?: boolean;
  onApplyTemplate: (templateId: string) => void;
  onChange: (content: string) => void;
  onToggleShare: () => void;
  onShareWithLearner: () => void;
  onSetReminder: (reminder: string) => void;
  onAddAttachments: (files: FileList | File[]) => void;
  onAddResourceLink: (title: string, url: string) => void;
  onRemoveResourceLink: (id: string) => void;
  onExport: (format: 'pdf' | 'markdown') => void;
}

interface ToolbarButtonProps {
  label: string;
  title: string;
  onClick: () => void;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, title, onClick, active }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
      active
        ? 'bg-stellar text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  templates,
  isSaving,
  onApplyTemplate,
  onChange,
  onToggleShare,
  onShareWithLearner,
  onSetReminder,
  onAddAttachments,
  onAddResourceLink,
  onRemoveResourceLink,
  onExport,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (fn: (el: HTMLTextAreaElement) => string) => {
    const el = textareaRef.current;
    if (!el) return;
    const next = fn(el);
    onChange(next);
    // Restore focus after React re-render
    requestAnimationFrame(() => el.focus());
  };

  return (
    <div className="space-y-5">
      {/* Main editor card */}
      <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-stellar">
              Rich-text Note Editor
            </div>
            <h3 className="mt-2 text-2xl font-black text-gray-900">{note.sessionTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">with {note.mentorName}</p>
          </div>

          {/* Templates */}
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template.id)}
                className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {template.title}
              </button>
            ))}
          </div>
        </div>

        {/* Rich-text toolbar */}
        <div className="mt-5 flex flex-wrap gap-2 rounded-2xl bg-gray-50 p-3">
          <ToolbarButton
            label="B"
            title="Bold"
            onClick={() => applyFormat((el) => wrapSelection(el, '**'))}
          />
          <ToolbarButton
            label="I"
            title="Italic"
            onClick={() => applyFormat((el) => wrapSelection(el, '*'))}
          />
          <ToolbarButton
            label="H2"
            title="Heading"
            onClick={() => applyFormat((el) => wrapSelection(el, '## ', ''))}
          />
          <ToolbarButton
            label="• List"
            title="Bullet list"
            onClick={() => applyFormat((el) => prefixLines(el, '- '))}
          />
          <ToolbarButton
            label="1. List"
            title="Numbered list"
            onClick={() => applyFormat((el) => prefixLines(el, '1. '))}
          />
          <ToolbarButton
            label="` Code"
            title="Inline code"
            onClick={() => applyFormat((el) => wrapSelection(el, '`'))}
          />
          <ToolbarButton
            label="⌥ Code block"
            title="Fenced code block"
            onClick={() => applyFormat((el) => wrapCodeBlock(el))}
          />

          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleShare}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                note.sharedWithMentor
                  ? 'bg-stellar text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              {note.sharedWithMentor ? '✓ Shared with mentor' : 'Share with mentor'}
            </button>
            <button
              type="button"
              onClick={onShareWithLearner}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                note.sharedWithLearner
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {note.sharedWithLearner ? '✓ Shared with learner' : 'Share with learner'}
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          aria-label="Note content"
          value={note.content}
          onChange={(e) => onChange(e.target.value)}
          className="mt-4 min-h-72 w-full rounded-3xl border border-gray-100 bg-gray-50 px-5 py-5 font-mono text-sm leading-relaxed text-gray-700 outline-none focus:border-stellar focus:bg-white"
          placeholder="Start writing your session notes… Markdown is supported."
          spellCheck
        />

        {/* Footer: last saved + export */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            {isSaving ? 'Saving…' : formatLastSaved(note.updatedAt)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onExport('markdown')}
              className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Export .md
            </button>
            <button
              type="button"
              onClick={() => onExport('pdf')}
              className="rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Resource links */}
      <ResourceLinks
        links={note.resourceLinks}
        onAdd={onAddResourceLink}
        onRemove={onRemoveResourceLink}
      />

      {/* Attachments + Version history */}
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-black text-gray-900">Attachments & Follow-ups</h4>
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-2xl bg-stellar px-4 py-3 text-sm font-bold text-white hover:bg-stellar/90 transition-colors">
            Add attachment
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onAddAttachments(e.target.files);
                  e.target.value = '';
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
            onChange={(e) => onSetReminder(e.target.value)}
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
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{version.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
