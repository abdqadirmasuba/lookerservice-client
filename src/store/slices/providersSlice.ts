import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Provider } from '../../types';

interface ProvidersState {
  providers: Provider[];
  featuredProviders: Provider[];
  selectedProvider: Provider | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProvidersState = {
  providers: [],
  featuredProviders: [],
  selectedProvider: null,
  isLoading: false,
  error: null,
};

const providersSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    setProviders(state, action: PayloadAction<Provider[]>) {
      state.providers = action.payload;
      state.error = null;
    },
    addProviders(state, action: PayloadAction<Provider[]>) {
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
    setProvidersError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setProviders,
  addProviders,
  setFeaturedProviders,
  setSelectedProvider,
  clearProviders,
  setProvidersLoading,
  setProvidersError,
} = providersSlice.actions;

export default providersSlice.reducer;
