"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logOut } from "@/store/authSlice";
import { setNotifications, markAllAsRead } from "@/store/notificationsSlice";
import api from "@/lib/axios";
import { Bell, MessageCircle, User, LogOut, Home, Users, Heart, UserPlus, Menu, X } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New State

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get("/users/notifications");
                dispatch(setNotifications(data.data));
            } catch (error) {
                console.error("Failed to load notifications");
            }
        };
        fetchNotifications();
    }
  }, [isAuthenticated, dispatch]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logOut());
    router.push("/login");
  };

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
        try {
            await api.put("/users/notifications/read");
            dispatch(markAllAsRead());
        } catch (error) {
            console.error("Failed to mark read on server", error);
            dispatch(markAllAsRead()); 
        }
    }
  };

  const isActive = (path: string) => pathname === path ? "text-indigo-600 bg-indigo-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50";

  // ... (Helper functions for icons - keep them same) ...
  const getNotificationContent = (type: string) => {
    switch (type) {
        case 'like': return "liked your post";
        case 'comment': return "commented on your post";
        case 'follow': return "started following you";
        default: return "interacted with you";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'like': return <Heart size={14} className="text-white fill-current" />;
        case 'comment': return <MessageCircle size={14} className="text-white fill-current" />;
        case 'follow': return <UserPlus size={14} className="text-white" />;
        default: return <Bell size={14} className="text-white" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
        case 'like': return "bg-red-500";
        case 'comment': return "bg-blue-500";
        case 'follow': return "bg-indigo-500";
        default: return "bg-gray-500";
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600 hidden sm:block">SocialSphere</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Link href="/" className={`p-2 rounded-full transition ${isActive("/")}`}>
                  <Home className="w-6 h-6" />
                </Link>
                <Link href="/chat" className={`p-2 rounded-full transition ${isActive("/chat")}`}>
                  <MessageCircle className="w-6 h-6" />
                </Link>
                <Link href="/users" className={`p-2 rounded-full transition ${isActive("/users")}`}>
                  <Users className="w-6 h-6" />
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={handleNotificationClick}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-900 relative outline-none hover:bg-gray-100 transition"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown (Desktop) */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-1 ring-1 ring-black ring-opacity-5 overflow-hidden max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-700">
                          Notifications
                      </div>
                      {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-sm text-center text-gray-500">No notifications yet</div>
                      ) : (
                          notifications.map((notif) => {
                              if (!notif.sender) return null;
                              return (
                                <div key={notif._id} className={`px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 ${!notif.read ? 'bg-indigo-50/40' : ''}`}>
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                            {notif.sender.profilePicture ? (
                                                <img src={notif.sender.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                                    {(notif.sender.username || "?")[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${getIconBg(notif.type)}`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">{notif.sender.username}</span> {getNotificationContent(notif.type)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                              );
                          })
                      )}
                    </div>
                  )}
                </div>

                <Link href={`/profile/${user.username}`} className="flex items-center gap-2 pl-2 pr-4 py-1 rounded-full hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-gray-200">
                     {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                     ) : (
                        <User className="w-5 h-5 text-indigo-600" />
                     )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-500 hover:text-red-600 transition hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 transition">
                  Login
                </Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm transition shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-4">
             {isAuthenticated && (
                <button 
                    onClick={handleNotificationClick}
                    className="p-2 -mr-2 text-gray-500 relative"
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
             )}
             
             <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
             >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg z-40 animate-in slide-in-from-top-2 duration-200">
            {isAuthenticated && user ? (
                <div className="p-4 space-y-2">
                    {/* Notification List (Mobile) - Only show if bell was clicked previously? No, let's keep it simple */}
                    {showNotifications && (
                         <div className="mb-4 border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 uppercase">Notifications</div>
                            <div className="max-h-60 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                                ) : (
                                    notifications.map(notif => {
                                        if (!notif.sender) return null;
                                        return (
                                            <div key={notif._id} className="p-3 border-b text-sm flex gap-3">
                                                <span className="font-bold">{notif.sender.username}</span> 
                                                <span className="text-gray-600">{getNotificationContent(notif.type)}</span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                         </div>
                    )}

                    <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive("/")}`}>
                        <Home size={20} /> Home
                    </Link>
                    <Link href="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive("/chat")}`}>
                        <MessageCircle size={20} /> Messages
                    </Link>
                    <Link href="/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive("/users")}`}>
                        <Users size={20} /> Find People
                    </Link>
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 overflow-hidden">
                             {user.profilePicture && <img src={user.profilePicture} className="w-full h-full object-cover" />}
                        </div>
                        My Profile
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            ) : (
                <div className="p-4 space-y-3">
                    <Link href="/login" className="block w-full text-center py-2 text-gray-700 font-medium border rounded-lg">
                        Login
                    </Link>
                    <Link href="/register" className="block w-full text-center py-2 bg-indigo-600 text-white font-medium rounded-lg">
                        Sign Up
                    </Link>
                </div>
            )}
        </div>
      )}
    </nav>
  );
}