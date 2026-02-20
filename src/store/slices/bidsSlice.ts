import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bid, BidStatus } from '../../types';

interface BidsState {
  bids: Bid[];
  selectedBid: Bid | null;
  isLoading: boolean;
}

const initialState: BidsState = {
  bids: [],
  selectedBid: null,
  isLoading: false,
};

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setBids(state, action: PayloadAction<Bid[]>) {
      state.bids = action.payload;
    },
    addBid(state, action: PayloadAction<Bid>) {
      state.bids = [action.payload, ...state.bids];
    },
    acceptBid(state, action: PayloadAction<string>) {
      const index = state.bids.findIndex((bid) => bid.id === action.payload);
      if (index !== -1) {
        state.bids[index].status = 'accepted' as BidStatus;
      }
    },
    rejectBid(state, action: PayloadAction<string>) {
      const index = state.bids.findIndex((bid) => bid.id === action.payload);
      if (index !== -1) {
        state.bids[index].status = 'rejected' as BidStatus;
      }
    },
    setSelectedBid(state, action: PayloadAction<Bid | null>) {
      state.selectedBid = action.payload;
    },
    setBidsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setBids,
  addBid,
  acceptBid,
  rejectBid,
  setSelectedBid,
  setBidsLoading,
} = bidsSlice.actions;

export default bidsSlice.reducer;
