// src/store/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define a more specific type for our user object
export interface User {
  _id: string;
  username: string;
  email: string;
  following: string[]; // Add the 'following' array
  isEmailVerified: boolean;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // --- NEW ACTION ---
    // Action to update the following list after a follow/unfollow action
    updateFollowing: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.following = action.payload;
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      // Update the user object with the new data from the backend
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setCredentials, logOut, updateFollowing, updateUser } = authSlice.actions;
export default authSlice.reducer;