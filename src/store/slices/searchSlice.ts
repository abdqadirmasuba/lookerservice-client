import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SearchFilters } from '../../types';

interface SearchState {
  query: string;
  location: string;
  filters: SearchFilters;
  recentSearches: string[];
  isLoading: boolean;
}

const initialState: SearchState = {
  query: '',
  location: '',
  filters: {},
  recentSearches: [],
  isLoading: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    updateFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {};
    },
    addRecentSearch(state, action: PayloadAction<string>) {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches = [query, ...state.recentSearches.slice(0, 9)]; // Keep max 10
      }
    },
    clearRecentSearches(state) {
      state.recentSearches = [];
    },
    setSearchLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setLocation,
  updateFilters,
  clearFilters,
  addRecentSearch,
  clearRecentSearches,
  setSearchLoading,
} = searchSlice.actions;

export default searchSlice.reducer;
