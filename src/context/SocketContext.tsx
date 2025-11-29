"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { RootState } from "@/store/store";
import { addNotification } from "@/store/notificationsSlice"; 
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Set(),
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch(); // <--- Init dispatch
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
      
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("online_users", (users: { userId: string }[]) => {
        setOnlineUsers(new Set(users.map((u) => u.userId)));
      });

      newSocket.on("user_online", (user: { userId: string }) => {
        setOnlineUsers((prev) => new Set(prev).add(user.userId));
      });

      newSocket.on("user_offline", (user: { userId: string }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(user.userId);
          return newSet;
        });
      });

      // --- NEW: Listen for Notifications ---
      newSocket.on("newNotification", (notification) => {
        dispatch(addNotification(notification));
      });
      // -------------------------------------

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
        if(socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
  }, [isAuthenticated, token, dispatch]); 

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};