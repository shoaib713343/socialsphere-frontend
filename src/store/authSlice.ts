// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  following: string[];
  followers?: string[];
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
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateFollowing: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.following = action.payload;
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
    },
  },
});

export const { setCredentials, logOut, updateFollowing, updateUser } = authSlice.actions;
export default authSlice.reducer;