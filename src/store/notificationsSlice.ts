import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  type: 'like' | 'comment' | 'follow';
  post?: string; 
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter((n) => !n.read).length;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload); 
      state.unreadCount += 1;
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    }
});

export const { setNotifications, addNotification, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;