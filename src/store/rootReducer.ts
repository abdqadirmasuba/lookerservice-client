import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import searchReducer from './slices/searchSlice';
import providersReducer from './slices/providersSlice';
import categoriesReducer from './slices/categoriesSlice';
import requestsReducer from './slices/requestsSlice';
import serviceRequestFormReducer from './slices/serviceRequestFormSlice';
import bidsReducer from './slices/bidsSlice';
import bookingsReducer from './slices/bookingsSlice';
import messagesReducer from './slices/messagesSlice';
import paymentsReducer from './slices/paymentsSlice';
import notificationsReducer from './slices/notificationsSlice';
import dashboardReducer from './slices/dashboardSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  search: searchReducer,
  providers: providersReducer,
  categories: categoriesReducer,
  requests: requestsReducer,
  serviceRequestForm: serviceRequestFormReducer,
  bids: bidsReducer,
  bookings: bookingsReducer,
  messages: messagesReducer,
  payments: paymentsReducer,
  notifications: notificationsReducer,
  dashboard: dashboardReducer,
});

export default rootReducer;
