import type { MentorMatch, Session } from '../types';

export interface SearchContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'course';
  author: string;
  tags: string[];
  thumbnail: string;
}

export type SearchResultItem = 
  | { type: 'mentor'; data: MentorMatch }
  | { type: 'session'; data: Session }
  | { type: 'content'; data: SearchContent };

export interface SearchFilters {
  categories?: string[];
  priceRange?: [number, number];
  minRating?: number;
  availability?: string[];
  contentType?: string[];
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Mock Data
const MOCK_MENTORS: MentorMatch[] = [
  { id: '1', name: 'Alex Johnson', specialization: 'Blockchain Development', rating: 4.8, hourlyRate: 50, matchScore: 95, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Smith', specialization: 'UI/UX Design', rating: 4.9, hourlyRate: 45, matchScore: 90, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Michael Chen', specialization: 'Smart Contracts', rating: 4.7, hourlyRate: 60, matchScore: 85, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Emma Davis', specialization: 'Stellar Ecosystem', rating: 4.9, hourlyRate: 55, matchScore: 98, avatar: 'https://i.pravatar.cc/150?u=4' },
];

const MOCK_SESSIONS: Session[] = [
  { id: 's1', learnerId: 'l1', learnerName: 'John Doe', topic: 'Intro to Stellar', startTime: '2026-04-01T10:00:00Z', duration: 60, status: 'confirmed', price: 50, currency: 'XLM' },
  { id: 's2', learnerId: 'l2', learnerName: 'Jane Doe', topic: 'Advanced Rust', startTime: '2026-04-02T14:00:00Z', duration: 90, status: 'pending', price: 75, currency: 'XLM' },
];

const MOCK_CONTENT: SearchContent[] = [
  { id: 'c1', title: 'Getting Started with Soroban', description: 'A comprehensive guide to building smart contracts on Stellar.', type: 'article', author: 'Emma Davis', tags: ['stellar', 'soroban', 'rust'], thumbnail: 'https://picsum.photos/seed/c1/300/200' },
  { id: 'c2', title: 'DeFi on Stellar', description: 'Understanding decentralized finance in the Stellar ecosystem.', type: 'video', author: 'Michael Chen', tags: ['defi', 'stellar'], thumbnail: 'https://picsum.photos/seed/c2/300/200' },
];

class SearchService {
  private history: string[] = JSON.parse(localStorage.getItem('search_history') || '[]');
  private savedSearches: { id: string, name: string, options: SearchOptions }[] = JSON.parse(localStorage.getItem('saved_searches') || '[]');

  async search(options: SearchOptions): Promise<PaginatedResult<SearchResultItem>> {
    const { query, filters, sortBy, page = 1, limit = 10 } = options;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let allResults: SearchResultItem[] = [
      ...MOCK_MENTORS.map(m => ({ type: 'mentor' as const, data: m })),
      ...MOCK_SESSIONS.map(s => ({ type: 'session' as const, data: s })),
      ...MOCK_CONTENT.map(c => ({ type: 'content' as const, data: c })),
    ];

    // Filter by query
    if (query) {
      allResults = allResults.filter(item => {
        const searchText = item.type === 'mentor' ? item.data.name + item.data.specialization 
          : item.type === 'session' ? item.data.topic 
          : item.data.title + item.data.description;
        return searchText.toLowerCase().includes(query.toLowerCase());
      });
      this.addToHistory(query);
    }

    // Apply filters (Simplified)
    if (filters) {
      if (filters.minRating) {
        allResults = allResults.filter(item => (item.type === 'mentor' ? item.data.rating >= filters.minRating! : true));
      }
      if (filters.priceRange) {
        allResults = allResults.filter(item => {
          const price = item.type === 'mentor' ? item.data.hourlyRate : item.type === 'session' ? item.data.price : 0;
          return price >= filters.priceRange![0] && price <= filters.priceRange![1];
        });
      }
    }

    // Sort
    if (sortBy === 'price_low') {
      allResults.sort((a, b) => this.getPrice(a) - this.getPrice(b));
    } else if (sortBy === 'price_high') {
      allResults.sort((a, b) => this.getPrice(b) - this.getPrice(a));
    } else if (sortBy === 'rating') {
      allResults.sort((a, b) => this.getRating(b) - this.getRating(a));
    }

    const total = allResults.length;
    const startIndex = (page - 1) * limit;
    const items = allResults.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private getPrice(item: SearchResultItem): number {
    if (item.type === 'mentor') return item.data.hourlyRate;
    if (item.type === 'session') return item.data.price;
    return 0;
  }

  private getRating(item: SearchResultItem): number {
    if (item.type === 'mentor') return item.data.rating;
    return 0;
  }

  getHistory(): string[] {
    return this.history;
  }

  private addToHistory(query: string) {
    if (!this.history.includes(query)) {
      this.history = [query, ...this.history.slice(0, 9)];
      localStorage.setItem('search_history', JSON.stringify(this.history));
    }
  }

  getSavedSearches() {
    return this.savedSearches;
  }

  saveSearch(name: string, options: SearchOptions) {
    const newSave = { id: Date.now().toString(), name, options };
    this.savedSearches = [newSave, ...this.savedSearches];
    localStorage.setItem('saved_searches', JSON.stringify(this.savedSearches));
    return newSave;
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (!query) return [];
    const allTitles = [
      ...MOCK_MENTORS.map(m => m.name),
      ...MOCK_MENTORS.map(m => m.specialization),
      ...MOCK_SESSIONS.map(s => s.topic),
      ...MOCK_CONTENT.map(c => c.title),
    ];
    return allTitles
      .filter(t => t.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
}

export const searchService = new SearchService();
