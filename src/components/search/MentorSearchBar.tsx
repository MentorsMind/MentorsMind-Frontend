import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Copy, Check } from "lucide-react";

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface MentorSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  presets?: FilterPreset[];
  onPresetClick?: (presetId: string) => void;
  getShareableUrl?: () => string;
  activeFilterCount?: number;
}

const MentorSearchBar: React.FC<MentorSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  suggestions,
  placeholder = "Search mentors by name, skill, or expertise...",
  presets = [],
  onPresetClick,
  getShareableUrl,
  activeFilterCount = 0,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          onSelectSuggestion(suggestions[highlightedIndex]);
        } else if (onSearch) {
          onSearch(value);
        }
        break;
      case "Escape":
        setIsFocused(false);
        break;
    }
  };

  const onSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setIsFocused(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleShareLink = async () => {
    if (getShareableUrl) {
      const url = getShareableUrl();
      try {
        await navigator.clipboard.writeText(url);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      } catch {
        // Fallback: show URL in prompt
        prompt("Copy this link to share:", url);
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full space-y-4">
      {/* Filter Presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick filters:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetClick?.(preset.id)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-full text-xs font-bold text-purple-700 hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-300 transition-all flex items-center gap-1.5"
            >
              <span>{preset.icon}</span>
              {preset.name}
            </button>
          ))}

          {/* Share Link Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleShareLink}
              onMouseEnter={() => setShowShareTooltip(true)}
              onMouseLeave={() => setShowShareTooltip(false)}
              className="ml-auto px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1.5 relative"
            >
              {showShareTooltip ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Share results
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div
        className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-5 py-4 transition-all duration-300 ${
          isFocused
            ? "border-stellar shadow-lg shadow-stellar/10"
            : "border-gray-100 shadow-sm hover:border-gray-200"
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 outline-none text-gray-900 placeholder-gray-400 font-medium"
        />

        {value && (
          <button
            onClick={() => {
              onChange("");
              setHighlightedIndex(-1);
            }}
            title="Clear search"
            aria-label="Clear search"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-400"
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
        )}

        <button
          onClick={() => onSearch?.(value)}
          className="px-5 py-2 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark transition-all active:scale-95"
        >
          Search
        </button>
      </div>

      {/* Autocomplete Suggestions */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-5 py-3 text-left flex items-center gap-3 transition-colors ${
                index === highlightedIndex
                  ? "bg-stellar/5 text-stellar"
                  : "hover:bg-gray-50 text-gray-700"
              } border-b border-gray-50 last:border-0`}
            >
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="font-medium">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSearchBar;
