import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMethod, Transaction } from '../../types';

interface PaymentsState {
  paymentMethods: PaymentMethod[];
  defaultMethod: PaymentMethod | null;
  transactions: Transaction[];
  isProcessing: boolean;
}

const initialState: PaymentsState = {
  paymentMethods: [],
  defaultMethod: null,
  transactions: [],
  isProcessing: false,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPaymentMethods(state, action: PayloadAction<PaymentMethod[]>) {
      state.paymentMethods = action.payload;
      state.defaultMethod = action.payload.find((m) => m.isDefault) || null;
    },
    addPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.paymentMethods = [...state.paymentMethods, action.payload];
      if (action.payload.isDefault) {
        state.defaultMethod = action.payload;
      }
    },
    deletePaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethods = state.paymentMethods.filter((m) => m.id !== action.payload);
      if (state.defaultMethod?.id === action.payload) {
        state.defaultMethod = null;
      }
    },
    setDefaultMethod(state, action: PayloadAction<PaymentMethod>) {
      state.paymentMethods = state.paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === action.payload.id,
      }));
      state.defaultMethod = action.payload;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions = [action.payload, ...state.transactions];
    },
    setProcessing(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
  },
});

export const {
  setPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultMethod,
  addTransaction,
  setProcessing,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
