import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import SortOptions from '../components/search/SortOptions';
import SearchResults from '../components/search/SearchResults';
import SavedSearches from '../components/search/SavedSearches';
import AdvancedSearch from '../components/search/AdvancedSearch';
import { useSearch } from '../hooks/useSearch';
import { Search as SearchIcon, Sliders, History, Sparkles } from 'lucide-react';

const SearchPage: React.FC = () => {
  const {
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    results,
    loading,
    error,
    suggestions,
    history,
    savedSearches,
    saveCurrentSearch,
    setPage,
  } = useSearch();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-linear-to-b from-blue-50/50 to-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
            <Sparkles className="h-4 w-4" /> Discover Mentors & Knowledge
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Find exactly what <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">you need</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-12">
            Search across our global network of mentors, active learning sessions, and premium educational content.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <SearchBar
              ref={searchInputRef}
              value={query}
              onChange={setQuery}
              suggestions={suggestions}
              history={history}
              onSearch={(val) => setQuery(val)}
              onClear={() => setQuery('')}
            />
            <button
              onClick={() => setIsAdvancedOpen(true)}
              className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all flex items-center gap-2 font-bold"
            >
              <Sliders className="h-5 w-5" />
              <span className="md:hidden">Advanced Search</span>
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center flex-wrap gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mr-2">
              <History className="h-3 w-3" /> Trending:
            </span>
            {['Soroban', 'Smart Contracts', 'Defi', 'Rust'].map(tag => (
              <button 
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-8">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
            <SavedSearches 
              savedSearches={savedSearches} 
              onApply={(opts) => {
                if (opts.query) setQuery(opts.query);
                if (opts.filters) setFilters(opts.filters);
                if (opts.sortBy) setSortBy(opts.sortBy);
              }}
              onSave={saveCurrentSearch}
              query={query}
            />
          </aside>

          {/* Results Area */}
          <section className="flex-1 min-w-0">
            <SortOptions 
              sortBy={sortBy} 
              onSortChange={setSortBy} 
              resultCount={results?.total || 0} 
            />

            {error && (
              <div className="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center gap-4 text-red-700 animate-in shake duration-500">
                <div className="h-10 w-10 shrink-0 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">!</span>
                </div>
                <div>
                  <h4 className="font-bold">Search encountered an issue</h4>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
            )}

            <SearchResults 
              results={results} 
              loading={loading} 
              onPageChange={setPage} 
            />
          </section>
        </div>
      </main>

      <AdvancedSearch 
        isOpen={isAdvancedOpen} 
        onClose={() => setIsAdvancedOpen(false)} 
        filters={filters} 
        onApply={setFilters} 
      />

      {/* Analytics Indicator (Fake) */}
      <div className="fixed bottom-6 right-6 z-40 px-4 py-2 bg-gray-900/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 pointer-events-none">
        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
        Search Analytics Active
      </div>
    </div>
  );
};

export default SearchPage;
