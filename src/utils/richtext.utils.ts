/**
 * Rich text utilities for the NoteEditor.
 * Operates on plain Markdown strings — no external deps required.
 */

/** Wrap the current textarea selection with a prefix/suffix pair. */
export function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix,
): string {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  const wrapped = `${prefix}${selected || 'text'}${suffix}`;
  return value.slice(0, start) + wrapped + value.slice(end);
}

/** Insert a block prefix at the beginning of each selected line. */
export function prefixLines(
  textarea: HTMLTextAreaElement,
  linePrefix: string,
): string {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const before = value.slice(0, start);
  const selected = value.slice(start, end) || 'item';
  const after = value.slice(end);
  const prefixed = selected
    .split('\n')
    .map((line) => `${linePrefix}${line}`)
    .join('\n');
  return before + prefixed + after;
}

/** Insert a fenced code block around the selection. */
export function wrapCodeBlock(
  textarea: HTMLTextAreaElement,
  language = '',
): string {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end) || 'code here';
  const block = `\`\`\`${language}\n${selected}\n\`\`\``;
  return value.slice(0, start) + block + value.slice(end);
}

/** Convert Markdown to a plain-text representation for PDF export. */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, (match) =>
      match.replace(/`{3}[^\n]*\n?/, '').replace(/\n?`{3}/, ''),
    )
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, (m) => m)
    .trim();
}

/** Trigger a browser download for Markdown or plain-text PDF content. */
export function downloadNote(
  content: string,
  filename: string,
  format: 'pdf' | 'markdown',
): void {
  const text = format === 'pdf' ? markdownToPlainText(content) : content;
  const type = format === 'pdf' ? 'text/plain' : 'text/markdown';
  const ext = format === 'pdf' ? 'txt' : 'md';
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Format an ISO date string as a human-readable "last saved" label. */
export function formatLastSaved(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Saved just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Saved ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Saved ${diffHr}h ago`;
  return `Saved on ${date.toLocaleDateString()}`;
}
