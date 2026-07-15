import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./store/userSlice";
import consultationSessionReducer from "./store/consultationSlice";
import { savePersistedSession } from "./store/sessionStoragePersist";

export const store = configureStore({
  reducer: {
    user: userReducer,
    consultationSession: consultationSessionReducer,
    // auth: authReducer,
    // add more slices here
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customMiddleware),
});

store.subscribe(() => {
  savePersistedSession(store.getState().consultationSession);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
