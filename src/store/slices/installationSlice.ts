import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InstallationState {
  installationId: string | null;
}

const initialState: InstallationState = {
  installationId: null,
};

const installationSlice = createSlice({
  name: 'installation',
  initialState,
  reducers: {
    setInstallationId(state, action: PayloadAction<string>) {
      state.installationId = action.payload;
    },
    clearInstallationId(state) {
      state.installationId = null;
    },
  },
});

export const { setInstallationId, clearInstallationId } = installationSlice.actions;
export default installationSlice.reducer;
