import { useState } from 'react';
import Button from '../ui/Button';

interface NoteEditorProps { sessionId?: string; }

export default function NoteEditor({ sessionId }: NoteEditorProps) {
  const key = `mm_notes_${sessionId ?? 'general'}`;
  const [text, setText] = useState(() => localStorage.getItem(key) ?? '');
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(key, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Session Notes</h3>
        <Button size="sm" variant="outline" onClick={save}>{saved ? '✓ Saved' : 'Save'}</Button>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder="Take notes during your session..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono" />
    </div>
  );
}
