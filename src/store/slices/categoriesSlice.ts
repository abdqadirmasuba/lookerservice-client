import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../../types';

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
};

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
  },
});

export const {
  setCategories,
  selectCategory,
  setCategoriesLoading,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
