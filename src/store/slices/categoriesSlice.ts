import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../../types';
import { apiRequests } from '../../utils/apiRequests';

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch categories from API
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequests.get('/client/categories');
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
    selectCategory(state, action: PayloadAction<Category | null>) {
      state.selectedCategory = action.payload;
    },
    setCategoriesLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setCategoriesError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCategories,
  selectCategory,
  setCategoriesLoading,
  setCategoriesError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
