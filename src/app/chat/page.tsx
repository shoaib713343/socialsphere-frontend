"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketContext"; // Use our new hook
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/lib/axios";
import { Send, User } from "lucide-react";

// Types
interface ConversationUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface ChatMessage {
  _id: string;
  sender: { _id: string; username: string };
  receiver: string;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { socket, onlineUsers } = useSocket(); // Get socket from context
  
  const [conversations, setConversations] = useState<ConversationUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations on Mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/chats/conversations");
        setConversations(data.data);
      } catch (error) {
        console.error("Failed to load conversations", error);
      }
    };
    fetchConversations();
  }, []);

  // 2. Fetch Messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chats/${selectedUser._id}`);
        setMessages(data.data);
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // 3. Listen for Incoming Messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: ChatMessage) => {
        // Only add message if it belongs to the currently selected conversation
        // OR if it's from the person we are talking to
        if (
            selectedUser && 
            (message.sender._id === selectedUser._id || message.receiver === selectedUser._id)
        ) {
            setMessages((prev) => [...prev, message]);
        }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, selectedUser]);

  // 4. Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket || !currentUser) return;

    // Emit to socket
    const messageData = { receiverId: selectedUser._id, content: newMessage };
    socket.emit("sendMessage", messageData);

    // Optimistically add to UI
    const ownMessage: ChatMessage = {
      _id: Date.now().toString(),
      sender: { _id: currentUser._id, username: currentUser.username },
      receiver: selectedUser._id,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, ownMessage]);
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {/* Sidebar (Conversations) */}
      <div className="w-1/3 md:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Messages</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
              <div className="p-4 text-gray-500 text-center text-sm">No conversations yet.</div>
          ) : (
              conversations.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center p-3 cursor-pointer border-b hover:bg-gray-50 transition ${
                    selectedUser?._id === user._id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <User />
                            </div>
                        )}
                    </div>
                    {onlineUsers.has(user._id) && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  <p className="ml-3 font-medium text-gray-700 truncate">{user.username}</p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {selectedUser.profilePicture ? (
                        <img src={selectedUser.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <User size={20} />
                        </div>
                    )}
               </div>
               <div>
                   <h2 className="text-lg font-bold text-gray-800">{selectedUser.username}</h2>
                   {onlineUsers.has(selectedUser._id) ? (
                       <p className="text-xs text-green-600 font-medium">Online</p>
                   ) : (
                       <p className="text-xs text-gray-500">Offline</p>
                   )}
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-100">
              {messages.map((msg) => {
                const isMe = msg.sender._id === currentUser?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Send size={40} className="ml-1" />
            </div>
            <h2 className="text-xl font-semibold">Select a conversation</h2>
            <p className="text-sm">Choose a user from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}