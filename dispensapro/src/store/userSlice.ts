import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserDetails {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
  doctorCharge?: number;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  userDetails: UserDetails | null;
}

const initialState: UserState = {
  userDetails: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<UserState['userDetails']>) => {
      state.userDetails = action.payload;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
  },
});

export const { setUserDetails, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
