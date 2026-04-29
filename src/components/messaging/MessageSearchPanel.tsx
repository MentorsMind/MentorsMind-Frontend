import React, { useId } from 'react';
import type { MessageSearchResult, MessageSearchMeta } from '../../hooks/useMessages';
import UserAvatar from '../ui/UserAvatar';

interface MessageSearchPanelProps {
  query: string;
  results: MessageSearchResult[];
  meta: MessageSearchMeta | null;
  loading: boolean;
  page: number;
  onSelectResult: (conversationId: string, messageId: string) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Strips all HTML tags from a string, returning plain text.
 * Used as a fallback when dangerouslySetInnerHTML is not appropriate.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitises the server-supplied headline HTML so only <b> and <em> tags survive.
 * Everything else is stripped. This keeps highlight markup while preventing XSS.
 */
function sanitiseHeadline(html: string): string {
  // Allow only <b> and <em> — strip every other tag
  return html.replace(/<(?!\/?(?:b|em)\b)[^>]*>/gi, '');
}

// ─── Result item ──────────────────────────────────────────────────────────────

const SearchResultItem: React.FC<{
  result: MessageSearchResult;
  onSelect: (conversationId: string, messageId: string) => void;
}> = ({ result, onSelect }) => {
  const headlineHtml = result.headline
    ? sanitiseHeadline(result.headline)
    : null;

  return (
    <button
      onClick={() => onSelect(result.conversationId, result.id)}
      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left border-b border-gray-50 last:border-b-0"
      aria-label={`Message from ${result.senderName}: ${stripHtml(result.headline ?? result.content)}`}
    >
      <UserAvatar
        avatarUrl={result.senderAvatar}
        name={result.senderName}
        size="sm"
        className="flex-shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-800 truncate">
            {result.senderName}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatTimestamp(result.timestamp)}
          </span>
        </div>

        {/* Headline with highlighted matches — sandboxed to only allow <b>/<em> */}
        {headlineHtml ? (
          <p
            className="text-xs text-gray-600 line-clamp-2 [&_b]:font-semibold [&_b]:text-gray-900 [&_b]:bg-yellow-100 [&_b]:rounded-sm [&_b]:px-0.5 [&_em]:italic [&_em]:text-gray-700"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: headlineHtml }}
          />
        ) : (
          <p className="text-xs text-gray-600 line-clamp-2">{result.content}</p>
        )}
      </div>
    </button>
  );
};

// ─── Main panel ───────────────────────────────────────────────────────────────

const MessageSearchPanel: React.FC<MessageSearchPanelProps> = ({
  query,
  results,
  meta,
  loading,
  page,
  onSelectResult,
  onNextPage,
  onPrevPage,
}) => {
  const statusId = useId();

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-full" role="status" aria-label="Searching…">
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (meta && meta.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      {meta && (
        <div
          id={statusId}
          className="px-4 py-2 border-b border-gray-100 flex items-center justify-between"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{meta.total}</span>{' '}
            result{meta.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          {meta.totalPages > 1 && (
            <p className="text-xs text-gray-400">
              Page {page} of {meta.totalPages}
            </p>
          )}
        </div>
      )}

      {/* Result list */}
      <ul
        className="flex-1 overflow-y-auto"
        aria-label="Search results"
        aria-describedby={statusId}
      >
        {results.map((result) => (
          <li key={result.id}>
            <SearchResultItem result={result} onSelect={onSelectResult} />
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {meta && (meta.hasNext || meta.hasPrev) && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50">
          <button
            onClick={onPrevPage}
            disabled={!meta.hasPrev}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page of results"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={onNextPage}
            disabled={!meta.hasNext}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page of results"
          >
            Next
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageSearchPanel;
