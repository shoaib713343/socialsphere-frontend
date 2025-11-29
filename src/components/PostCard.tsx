"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/lib/axios";
import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import CommentModal from "./CommentModal";

export interface Post {
  _id: string;
  content: string;
  image?: string;
  mediaUrl?: string; 
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  } | null;
  createdAt: string;
  likes: string[];
  comments: any[];
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Local state for interactions
  const [isLiked, setIsLiked] = useState(user ? post.likes.includes(user._id) : false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  
  // Local state for comments (so we can update UI instantly)
  const [comments, setComments] = useState(post.comments);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Guard clause for deleted authors
  if (!post.author) return null;

  const handleLike = async () => {
    if (!user) return;

    // Optimistic Update
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await api.post(`/posts/${post._id}/like`);
    } catch (error) {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      console.error("Failed to like post", error);
    }
  };

  const handleCommentAdded = (newComment: any) => {
    // Add the new comment to the local list instantly
    setComments((prev) => [...prev, newComment]);
  };

  // Check if I own this post
  const isOwner = user?._id === post.author._id;

  // Handle Image display (Backend might send 'image', 'mediaUrl' or 'imageUrl')
  const displayImage = post.mediaUrl || post.image;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.username}`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
                  {post.author.profilePicture ? (
                      <img src={post.author.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {post.author.username[0].toUpperCase()}
                      </div>
                  )}
              </div>
            </Link>
            <div>
              <Link href={`/profile/${post.author.username}`} className="font-semibold text-gray-900 hover:underline">
                  {post.author.username}
              </Link>
              <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {isOwner && onDelete && (
              <button 
                  onClick={() => onDelete(post._id)}
                  className="text-gray-400 hover:text-red-500 transition"
              >
                  <Trash2 size={18} />
              </button>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-2">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Image Attachment */}
        {displayImage && (
          <div className="w-full max-h-[500px] bg-gray-100 mt-2 overflow-hidden">
            <img src={displayImage} alt="Post content" className="w-full h-full object-contain bg-black" />
          </div>
        )}

        {/* Footer / Actions */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
          <button 
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-medium transition ${
                  isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
          >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
          </button>

          {/* Comment Button - Opens Modal */}
          <button 
            onClick={() => setIsCommentModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
          >
              <MessageCircle size={20} />
              <span>{comments.length}</span>
          </button>
          
          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition ml-auto">
              <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* The Comment Modal */}
      <CommentModal 
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={{ ...post, comments: comments }} // Pass updated comments
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
}