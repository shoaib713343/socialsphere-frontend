// src/pages/ChatPage.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { io, Socket } from 'socket.io-client';
import api from '../api/axios';

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

const ChatPage = ({ socket }: { socket: Socket | null }) => {
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<ConversationUser[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/chats/conversations');
        setConversations(response.data.data);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      }
    };
    if (token) {
      fetchConversations();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const socket: Socket = io('http://localhost:8000', { auth: { token } });
      socketRef.current = socket;
      socket.on('online_users', (users: { userId: string }[]) => {
        setOnlineUserIds(new Set(users.map(u => u.userId)));
      });
      socket.on('user_online', (newUser: { userId: string }) => {
        setOnlineUserIds((prev) => new Set(prev).add(newUser.userId));
      });
      socket.on('user_offline', (offlineUser: { userId: string }) => {
        setOnlineUserIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(offlineUser.userId);
          return newSet;
        });
      });
      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [token]);
  
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleReceiveMessage = (message: ChatMessage) => {
      if (message.sender._id === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on('receiveMessage', handleReceiveMessage);
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserSelect = useCallback(async (user: ConversationUser) => {
    setSelectedUser(user);
    try {
      const response = await api.get(`/chats/${user._id}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch chat history', error);
      setMessages([]);
    }
  }, []);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socketRef.current) return;
    const messageData = { receiverId: selectedUser._id, content: newMessage };
    socketRef.current.emit('sendMessage', messageData);
    const ownMessage: any = {
      _id: Date.now().toString(),
      sender: { _id: (currentUser as any)._id, username: (currentUser as any).username },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, ownMessage]);
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200"><h2 className="text-xl font-bold">Chats</h2></div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`flex items-center p-3 cursor-pointer border-b ${selectedUser?._id === user._id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
            >
              <div className="relative">
                <img className="w-12 h-12 rounded-full object-cover" src={user.profilePicture || `https://i.pravatar.cc/150?u=${user._id}`} alt={user.username} />
                {onlineUserIds.has(user._id) && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </div>
              <p className="ml-4 font-semibold text-gray-700">{user.username}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-gray-100">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white"><h2 className="text-xl font-bold text-gray-800">{selectedUser.username}</h2></div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender._id === (currentUser as any)._id ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender._id === (currentUser as any)._id ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800'}`}>{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full p-2 border border-gray-300 rounded-l-md" />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-r-md">Send</button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full"><h2 className="text-xl font-bold text-gray-500">Select a conversation</h2></div>
        )}
      </div>
    </div>
  );
};
export default ChatPage;