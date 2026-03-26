import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { highlightMatch } from '../../utils/search.utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  history: string[];
  onSearch: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(({
  value,
  onChange,
  suggestions,
  history,
  onSearch,
  onClear,
  placeholder = 'Search mentors, sessions, content...',
}, ref) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length + (value ? 0 : history.length) - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        const selected = value ? suggestions[activeIndex] : history[activeIndex];
        if (selected) {
          onSearch(selected);
          setShowSuggestions(false);
        }
      } else {
        onSearch(value);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          ref={ref}
          type="text"
          className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || (!value && history.length > 0)) && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {!value && history.length > 0 && (
            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 flex items-center gap-2">
                <Clock className="h-3 w-3" /> Recent Searches
              </span>
            </div>
          )}
          
          <div className="py-1">
            {(!value ? history : suggestions).map((item, index) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  activeIndex === index ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => handleSuggestionClick(item)}
              >
                <div className="flex items-center">
                  {!value && <Clock className="h-4 w-4 text-gray-400 mr-3" />}
                  <span className="text-sm font-medium">
                    {value ? (
                      highlightMatch(item, value).map((part, i) => (
                        <span key={i} className={part.highlight ? 'text-blue-600 font-bold' : ''}>
                          {part.text}
                        </span>
                      ))
                    ) : (
                      item
                    )}
                  </span>
                </div>
                <ArrowRight className={`h-4 w-4 opacity-0 transition-opacity ${activeIndex === index ? 'opacity-100' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar'

export default SearchBar;
