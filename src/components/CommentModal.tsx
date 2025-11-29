"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Post } from "./PostCard"; 

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onCommentAdded: (newComment: any) => void; 
}

export default function CommentModal({ isOpen, onClose, post, onCommentAdded }: CommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      // API call to add comment
      // Note: Adjust URL if your backend route is different (e.g., /posts/:id/comments)
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      
      // The backend usually returns the updated Post or the new Comment. 
      // Based on your controller logic, let's assume it returns the Updated Post.
      // We need to extract the *last* comment from that array to add it to our UI.
      const updatedPost = data.data || data.post; // Handle structure variations
      const newComment = updatedPost.comments[updatedPost.comments.length - 1];

      onCommentAdded(newComment);
      setCommentText(""); // Clear input
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Comments</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Comments List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {post.comments.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              No comments yet. Be the first to say something!
            </div>
          ) : (
            post.comments.map((comment: any, index: number) => (
              <div key={comment._id || index} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 overflow-hidden">
                  {comment.author.profilePicture ? (
                    <img src={comment.author.profilePicture} alt={comment.author.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {(comment.author.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{comment.author.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}