import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '../types/enums';

interface UserState {
  userDetails: {
    id: string;
    role: UserRole;
    email: string;
    username: string;
  } | null;
}

const initialState: UserState = {
  userDetails: {
    id: 'c57ab2ff-f06b-4bfb-9fda-2765b86650e3',
    username: 'PHARMA10',
    email: 'PHARMA10@example.com',
    role:"PHARMACIST"
  },
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
