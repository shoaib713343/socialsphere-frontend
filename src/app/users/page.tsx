"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { updateFollowing } from "@/store/authSlice"; 
import api from "@/lib/axios";
import { Loader2, UserPlus, UserCheck, Search, MessageCircle } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  followers: string[];
}

export default function UsersPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set(currentUser?.following || []));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFollowToggle = async (targetUserId: string) => {
    const isFollowing = followingIds.has(targetUserId);
    const newSet = new Set(followingIds);
    if (isFollowing) {
        newSet.delete(targetUserId);
    } else {
        newSet.add(targetUserId);
    }
    setFollowingIds(newSet);
    dispatch(updateFollowing(Array.from(newSet)));

    try {
      await api.post(`/users/${targetUserId}/follow`); // Fixed URL structure here too
    } catch (error) {
      console.error("Follow action failed", error);
      // Revert
      if (isFollowing) newSet.add(targetUserId);
      else newSet.delete(targetUserId);
      setFollowingIds(new Set(newSet));
      dispatch(updateFollowing(Array.from(newSet)));
    }
  };

  const filteredUsers = users.filter(u => 
    u._id !== currentUser?._id && 
    u.username && // --- FIX: Ensure username exists before checking it ---
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Discover People</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const isFollowing = followingIds.has(user._id);

            return (
              <div key={user._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition">
                <Link href={`/profile/${user.username}`}>
                    <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-white shadow-sm">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <span className="text-2xl font-bold text-indigo-300">
                                {(user.username || "?")[0].toUpperCase()}
                             </span>
                        </div>
                    )}
                    </div>
                </Link>
                
                <h3 className="text-lg font-bold text-gray-900">{user.username || "Unknown User"}</h3>
                <p className="text-sm text-gray-500 mb-4">{user.followers?.length || 0} followers</p>

                <div className="flex gap-2 w-full mt-auto">
                    <button 
                        onClick={() => handleFollowToggle(user._id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                            isFollowing 
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        {isFollowing ? (
                            <>
                                <UserCheck size={16} /> Following
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} /> Follow
                            </>
                        )}
                    </button>
                    
                    <Link href="/chat" className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
                         <MessageCircle size={20} />
                    </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}