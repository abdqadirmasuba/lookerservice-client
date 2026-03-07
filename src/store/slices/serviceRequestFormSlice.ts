import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProviderService, ProviderCategory, Category } from '../../types';

export type RequestType = 'direct' | 'open';

export interface ServiceRequestFormData {
  // Request type
  requestType: RequestType;
  
  // Provider info (for direct requests)
  providerId: string | null;
  providerName: string | null;
  
  // Services
  // For direct requests: provider-specific services
  providerCategories: ProviderCategory[];
  selectedProviderServiceIds: string[];
  
  // For open requests: generic services from categories
  categories: Category[];
  selectedServiceIds: string[];
  
  // Step 2: Budget & Schedule
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: string | null; // ISO string
  deadline: string | null; // ISO string
  
  // Step 3: Location
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  
  // Step 4: Images (optional)
  images: string[];
  
  // Notification settings for open requests
  notifyCategories: string[];
  notifyLocation: string;
  notifyRadiusMeters: number;
  notifyLimit: number;
  
  // UI state
  currentStep: number;
  isLoadingCategories: boolean;
  error: string | null;
}

const initialState: ServiceRequestFormData = {
  requestType: 'open',
  providerId: null,
  providerName: null,
  providerCategories: [],
  selectedProviderServiceIds: [],
  categories: [],
  selectedServiceIds: [],
  description: '',
  budgetMin: null,
  budgetMax: null,
  preferredDate: null,
  deadline: null,
  latitude: null,
  longitude: null,
  address: '',
  city: '',
  images: [],
  notifyCategories: [],
  notifyLocation: '',
  notifyRadiusMeters: 50000, // 50km default
  notifyLimit: 50,
  currentStep: 1,
  isLoadingCategories: false,
  error: null,
};

const serviceRequestFormSlice = createSlice({
  name: 'serviceRequestForm',
  initialState,
  reducers: {
    // Initialize form for direct request
    initializeDirectRequest(state, action: PayloadAction<{ providerId: string; providerName: string }>) {
      return {
        ...initialState,
        requestType: 'direct',
        providerId: action.payload.providerId,
        providerName: action.payload.providerName,
        currentStep: 1,
      };
    },
    
    // Initialize form for open request
    initializeOpenRequest(state) {
      return {
        ...initialState,
        requestType: 'open',
        currentStep: 1,
      };
    },
    
    // Set request type
    setRequestType(state, action: PayloadAction<RequestType>) {
      state.requestType = action.payload;
    },
    
    // Set provider categories (for direct requests)
    setProviderCategories(state, action: PayloadAction<ProviderCategory[]>) {
      state.providerCategories = action.payload;
      state.isLoadingCategories = false;
      state.error = null;
    },
    
    // Set categories (for open requests)
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      state.isLoadingCategories = false;
      state.error = null;
    },
    
    setLoadingCategories(state, action: PayloadAction<boolean>) {
      state.isLoadingCategories = action.payload;
    },
    
    // Service selection for direct requests
    toggleProviderService(state, action: PayloadAction<string>) {
      const serviceId = action.payload;
      const index = state.selectedProviderServiceIds.indexOf(serviceId);
      if (index > -1) {
        state.selectedProviderServiceIds.splice(index, 1);
      } else {
        state.selectedProviderServiceIds.push(serviceId);
      }
    },
    
    setSelectedProviderServices(state, action: PayloadAction<string[]>) {
      state.selectedProviderServiceIds = action.payload;
    },
    
    // Service selection for open requests
    toggleService(state, action: PayloadAction<string>) {
      const serviceId = action.payload;
      const index = state.selectedServiceIds.indexOf(serviceId);
      if (index > -1) {
        state.selectedServiceIds.splice(index, 1);
      } else {
        state.selectedServiceIds.push(serviceId);
      }
    },
    
    setSelectedServices(state, action: PayloadAction<string[]>) {
      state.selectedServiceIds = action.payload;
    },
    
    // Step 2: Budget & date
    setDescription(state, action: PayloadAction<string>) {
      state.description = action.payload;
    },
    
    setBudget(state, action: PayloadAction<{ min: number | null; max: number | null }>) {
      state.budgetMin = action.payload.min;
      state.budgetMax = action.payload.max;
    },
    
    setPreferredDate(state, action: PayloadAction<string | null>) {
      state.preferredDate = action.payload;
    },
    
    setDeadline(state, action: PayloadAction<string | null>) {
      state.deadline = action.payload;
    },
    
    // Step 3: Location
    setLocation(state, action: PayloadAction<{
      latitude: number;
      longitude: number;
      address: string;
      city: string;
    }>) {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.address = action.payload.address;
      state.city = action.payload.city;
    },
    
    // Images
    addImage(state, action: PayloadAction<string>) {
      state.images.push(action.payload);
    },
    
    removeImage(state, action: PayloadAction<number>) {
      state.images.splice(action.payload, 1);
    },
    
    setImages(state, action: PayloadAction<string[]>) {
      state.images = action.payload;
    },
    
    // Notification settings for open requests
    setNotifyCategories(state, action: PayloadAction<string[]>) {
      state.notifyCategories = action.payload;
    },
    
    toggleNotifyCategory(state, action: PayloadAction<string>) {
      const categoryId = action.payload;
      const index = state.notifyCategories.indexOf(categoryId);
      if (index > -1) {
        state.notifyCategories.splice(index, 1);
      } else {
        state.notifyCategories.push(categoryId);
      }
    },
    
    setNotifyLocation(state, action: PayloadAction<string>) {
      state.notifyLocation = action.payload;
    },
    
    setNotifyRadiusMeters(state, action: PayloadAction<number>) {
      state.notifyRadiusMeters = action.payload;
    },
    
    setNotifyLimit(state, action: PayloadAction<number>) {
      state.notifyLimit = action.payload;
    },
    
    // Navigation
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    
    nextStep(state) {
      if (state.currentStep < 4) {
        state.currentStep += 1;
      }
    },
    
    previousStep(state) {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    // Error handling
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    
    // Reset form
    resetForm() {
      return initialState;
    },
  },
});

export const {
  initializeDirectRequest,
  initializeOpenRequest,
  setRequestType,
  setProviderCategories,
  setCategories,
  setLoadingCategories,
  toggleProviderService,
  setSelectedProviderServices,
  toggleService,
  setSelectedServices,
  setDescription,
  setBudget,
  setPreferredDate,
  setDeadline,
  setLocation,
  addImage,
  removeImage,
  setImages,
  setNotifyCategories,
  toggleNotifyCategory,
  setNotifyLocation,
  setNotifyRadiusMeters,
  setNotifyLimit,
  setCurrentStep,
  nextStep,
  previousStep,
  setError,
  resetForm,
} = serviceRequestFormSlice.actions;

export default serviceRequestFormSlice.reducer;
