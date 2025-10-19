// src/store/notificationsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a single notification
interface Notification {
  _id: string; // Or a unique identifier
  message: string;
  createdAt: string;
}

// Define the shape of the notifications state
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Action to add a new notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add the new notification to the beginning of the array
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    // Action to reset the unread count when the user views them
    markNotificationsAsRead: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markNotificationsAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;