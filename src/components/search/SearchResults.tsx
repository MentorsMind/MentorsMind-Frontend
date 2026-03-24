import React from 'react';
import { SearchResultItem, PaginatedResult } from '../../services/search.service';
import { Star, Clock, User, FileText, Video, Play, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

interface SearchResultsProps {
  results: PaginatedResult<SearchResultItem> | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, loading, onPageChange }) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-32" />
        ))}
      </div>
    );
  }

  if (!results || results.items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {results.items.map((item, index) => (
          <div 
            key={`${item.type}-${index}`} 
            className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300"
          >
            {item.type === 'mentor' && (
              <div className="flex items-start gap-4">
                <img src={item.data.avatar} alt={item.data.name} className="h-16 w-16 rounded-2xl object-cover ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{item.data.name}</h4>
                    <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full">{item.data.hourlyRate} XLM/hr</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-3">{item.data.specialization}</p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Star className="h-3 w-3 fill-current" /> {item.data.rating}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> Mentor
                    </span>
                  </div>
                </div>
              </div>
            )}

            {item.type === 'session' && (
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{item.data.topic}</h4>
                    <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full">{item.data.price} XLM</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-3">With {item.data.learnerName} • {item.data.duration} mins</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {item.data.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Session
                    </span>
                  </div>
                </div>
              </div>
            )}

            {item.type === 'content' && (
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-32 rounded-2xl overflow-hidden ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all flex-shrink-0">
                  <img src={item.data.thumbnail} alt={item.data.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {item.data.type === 'video' && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{item.data.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{item.data.description}</p>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-gray-400 capitalize flex items-center gap-1">
                      {item.data.type === 'video' ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      {item.data.type}
                    </span>
                    <span className="text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">By {item.data.author}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {results.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <button
            onClick={() => onPageChange(results.page - 1)}
            disabled={results.page === 1}
            className="p-2.5 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1 px-4">
            <span className="text-sm font-bold text-gray-900">{results.page}</span>
            <span className="text-sm font-medium text-gray-400">of</span>
            <span className="text-sm font-bold text-gray-400">{results.totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(results.page + 1)}
            disabled={results.page === results.totalPages}
            className="p-2.5 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
