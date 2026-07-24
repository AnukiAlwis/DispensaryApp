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
  // userDetails: {
  //   "id": "1fc9e3c0-7c95-40f6-bdf6-9251c0fefba9",
    // "username": "drhemantha",
    // "fullName": "Dr. Hemantha Alwis",
    // "email": "hemantha.alwis@medcare.com",
    // "phone": "+94771234567",
    // "role": "DOCTOR",
  // },
  userDetails: {
    id: "1fc9e3c0-7c95-40f6-bdf6-9251c0fefba9",
    username: "drhemantha",
    email: "hemantha.alwis@medcare.com",
    role: "DOCTOR"
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
