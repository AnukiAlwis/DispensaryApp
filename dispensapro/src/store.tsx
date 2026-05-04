import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./store/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    // auth: authReducer,
    // add more slices here
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
