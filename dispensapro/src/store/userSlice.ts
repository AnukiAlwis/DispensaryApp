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
  //   id: 'c57ab2ff-f06b-4bfb-9fda-2765b86650e3',
  //   username: 'PHARMA10',
  //   fullName: 'PHARMA10 User',
  //   email: 'PHARMA10@example.com',
  //   phone: '+94123456789',
  //   role: "PHARMACIST",
  //   doctorCharge: null,
  //   tenantId: 'f9a84146-cd5d-44da-b689-d6fd1c4ec896',
  //   createdAt: '2025-11-06T20:15:16.007009',
  //   updatedAt: null,
  // },
  userDetails: {
    id: "3c2c95c5-db0d-42e9-86de-b02cfecddbda",
    username: "DOCTOR9",
    email: "DOCTOR9@example.com",
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
