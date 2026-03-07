import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Provider, ProviderListItem, ExploreFilters } from '../../types';

interface ProvidersState {
  providers: ProviderListItem[];
  featuredProviders: Provider[];
  selectedProvider: Provider | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasMore: boolean;
  };
  exploreFilters: ExploreFilters;
}

const initialState: ProvidersState = {
  providers: [],
  featuredProviders: [],
  selectedProvider: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  },
  exploreFilters: {
    search: '',
    categoryId: null,
    categoryName: null,
    serviceId: null,
    serviceName: null,
    location: null,
    sortBy: null,
    latitude: null,
    longitude: null,
  },
};

const providersSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    setProviders(state, action: PayloadAction<ProviderListItem[]>) {
      state.providers = action.payload;
      state.error = null;
    },
    appendProviders(state, action: PayloadAction<ProviderListItem[]>) {
      state.providers = [...state.providers, ...action.payload];
    },
    setFeaturedProviders(state, action: PayloadAction<Provider[]>) {
      state.featuredProviders = action.payload;
    },
    setSelectedProvider(state, action: PayloadAction<Provider | null>) {
      state.selectedProvider = action.payload;
    },
    clearProviders(state) {
      state.providers = [];
      state.error = null;
    },
    setProvidersLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setProvidersLoadingMore(state, action: PayloadAction<boolean>) {
      state.isLoadingMore = action.payload;
    },
    setProvidersError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setPagination(state, action: PayloadAction<Partial<typeof initialState.pagination>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setExploreFilters(state, action: PayloadAction<Partial<ExploreFilters>>) {
      state.exploreFilters = { ...state.exploreFilters, ...action.payload };
    },
    resetExploreFilters(state) {
      state.exploreFilters = initialState.exploreFilters;
    },
  },
});

export const {
  setProviders,
  appendProviders,
  setFeaturedProviders,
  setSelectedProvider,
  clearProviders,
  setProvidersLoading,
  setProvidersLoadingMore,
  setProvidersError,
  setPagination,
  setExploreFilters,
  resetExploreFilters,
} = providersSlice.actions;

export default providersSlice.reducer;
