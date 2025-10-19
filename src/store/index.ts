// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationsReducer from './notificationsSlice'; // 1. Import the new reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer, // 2. Add it to the store
  },
});

// These types are for using Redux with TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;