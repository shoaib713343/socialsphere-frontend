"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { updateFollowing, updateUser } from "@/store/authSlice"; 
import api from "@/lib/axios";
import { Loader2, Calendar, UserPlus, UserCheck, MessageCircle, Camera } from "lucide-react";
import PostCard, { Post } from "@/components/PostCard";
import Link from "next/link";
import { useParams } from "next/navigation";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  coverPicture?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  posts?: Post[]; 
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference to hidden input

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // New loading state for upload

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get(`/users/${username}`);
        setProfile(userRes.data.data);

        const postsRes = await api.get(`/posts/user/${username}`);
        setPosts(postsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchData();
  }, [username]);

  // --- NEW: Handle Image Upload ---
  const handleAvatarClick = () => {
    // Only allow clicking if it's MY profile
    if (currentUser?._id === profile?._id) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file); // Must match backend 'upload.single("avatar")'

    setIsUploading(true);
    try {
        const { data } = await api.put("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // 1. Update Local State (Immediate Feedback)
        if (profile) {
            setProfile({ ...profile, profilePicture: data.data.profilePicture });
        }

        // 2. Update Global Redux State (So Navbar updates instantly)
        dispatch(updateUser({ profilePicture: data.data.profilePicture }));
        
    } catch (error) {
        console.error("Failed to upload avatar", error);
        alert("Failed to update profile picture");
    } finally {
        setIsUploading(false);
    }
  };
  // --------------------------------

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) return;
    
    const isFollowing = currentUser.following.includes(profile._id);
    let newFollowingList = [...currentUser.following];
    if (isFollowing) {
        newFollowingList = newFollowingList.filter(id => id !== profile._id);
    } else {
        newFollowingList.push(profile._id);
    }
    dispatch(updateFollowing(newFollowingList));

    try {
      await api.post(`/users/${profile._id}/follow`);
    } catch (error) {
      console.error("Follow failed", error);
      dispatch(updateFollowing(currentUser.following)); 
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">User not found</div>;

  const isMe = currentUser?._id === profile._id;
  const isFollowing = currentUser?.following.includes(profile._id);

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        {profile.coverPicture && (
            <img src={profile.coverPicture} alt="Cover" className="w-full h-full object-cover opacity-50" />
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row items-end -mt-12 sm:-mt-16 mb-6 gap-4">
            
            {/* --- AVATAR SECTION --- */}
            <div 
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md z-10 relative group ${isMe ? 'cursor-pointer' : ''}`}
                onClick={handleAvatarClick}
            >
                {/* The Image */}
                {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-3xl font-bold">
                        {profile.username[0].toUpperCase()}
                    </div>
                )}

                {/* Loading Spinner Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <Loader2 className="animate-spin text-white w-8 h-8" />
                    </div>
                )}

                {/* Camera Icon Overlay (Only for Me) */}
                {isMe && !isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Camera className="text-white w-8 h-8" />
                    </div>
                )}
            </div>
            {/* ---------------------- */}

            {/* Actions */}
            <div className="flex-1 w-full flex justify-end gap-2 mb-2 sm:mb-4">
                {isMe ? (
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 bg-white">
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <Link href="/chat" className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white text-gray-700">
                            <MessageCircle size={20} />
                        </Link>
                        <button 
                            onClick={handleFollowToggle}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                isFollowing 
                                ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                        >
                            {isFollowing ? <><UserCheck size={16}/> Following</> : <><UserPlus size={16}/> Follow</>}
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* User Info */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            
            {profile.bio && <p className="mt-4 text-gray-800">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center sm:text-left">
                    <span className="font-bold text-gray-900 block sm:inline">{profile.posts?.length || posts.length}</span>
                    <span className="text-gray-500 ml-1">Posts</span>
                </div>
                <div className="text-center sm:text-left">
                    <span className="font-bold text-gray-900 block sm:inline">{profile.followers.length}</span>
                    <span className="text-gray-500 ml-1">Followers</span>
                </div>
                <div className="text-center sm:text-left">
                    <span className="font-bold text-gray-900 block sm:inline">{profile.following.length}</span>
                    <span className="text-gray-500 ml-1">Following</span>
                </div>
            </div>
        </div>

        {/* User's Posts */}
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Posts</h2>
            {posts.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">No posts yet</div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}