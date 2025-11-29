"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/lib/axios";
import { Loader2, Globe, Users } from "lucide-react";
import Link from "next/link";
import CreatePost from "@/components/CreatePost";
import PostCard, { Post } from "@/components/PostCard";

export default function Home() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // --- NEW: Tab State ---
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  const fetchPosts = async () => {
    setLoading(true); // Show loading spinner when switching tabs
    setError("");
    try {
      // --- NEW: Dynamic Endpoint Selection ---
      // Make sure your backend has a route for /posts/following. 
      // If not, it might be /posts/feed or similar.
      const endpoint = activeTab === "for-you" ? "/posts" : "/posts/feed";
      
      const { data } = await api.get(endpoint);
      setPosts(data.data);
    } catch (err: any) {
      console.error(err);
      // If 404 on following, it usually means the route doesn't exist yet or user follows no one
      if (activeTab === "following" && err.response?.status === 404) {
          setPosts([]); // Just show empty list
      } else {
          setError("Failed to load posts");
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the activeTab changes
  useEffect(() => {
    if (isAuthenticated) {
        fetchPosts();
    }
  }, [activeTab, isAuthenticated]);

  const handlePostCreated = () => {
    // If we create a post, usually we want to see it in the public feed or just refresh current
    fetchPosts(); 
  };
  
  const handleDeletePost = async (postId: string) => {
      if(!confirm("Are you sure you want to delete this post?")) return;
      setPosts(prev => prev.filter(p => p._id !== postId));
      try {
          await api.delete(`/posts/${postId}`);
      } catch (error) {
          console.error("Failed to delete", error);
          alert("Could not delete post");
          fetchPosts(); 
      }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SocialSphere</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          The next generation social platform. Connect, share, and chat in real-time.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Create Post Widget */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* --- NEW: Tabs Header --- */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl overflow-hidden">
        <button
            onClick={() => setActiveTab("for-you")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
                activeTab === "for-you" 
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
            <Globe size={18} />
            For You
        </button>
        <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
                activeTab === "following" 
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
            <Users size={18} />
            Following
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-gray-400 mb-2">
                {activeTab === "following" ? <Users size={48} className="mx-auto"/> : <Globe size={48} className="mx-auto"/>}
            </div>
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-500 mt-1">
                {activeTab === "following" 
                    ? "Start following people to see their posts here!" 
                    : "Be the first to create a post!"}
            </p>
            {activeTab === "following" && (
                <Link href="/users" className="mt-4 inline-block text-indigo-600 font-medium hover:underline">
                    Find people to follow
                </Link>
            )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
             <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handleDeletePost}
             />
          ))}
        </div>
      )}
    </div>
  );
}