// src/components/PostCard.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { PostProps } from '../types';
import { updateFollowing } from '../store/authSlice';
import CommentModal from './CommentModal';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const PostCard: React.FC<{ post: PostProps }> = ({ post }) => {
  // --- THIS IS THE FIX ---
  // If a post's author has been deleted, it becomes a "ghost post".
  // We will safely skip rendering it to prevent the entire app from crashing.
  if (!post.author) {
    return null; // Render nothing for this post
  }
  // --- END OF FIX ---

  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  
  const currentUserId = user?._id;
  const isFollowing = (user?.following || []).includes(post.author._id);

  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const isLiked = currentUserId ? likes.includes(currentUserId) : false;

  const handleFollow = async () => {
    if (!user) return; 
    const currentFollowing = user.following || [];
    const newFollowingList = isFollowing
      ? currentFollowing.filter(id => id !== post.author._id)
      : [...currentFollowing, post.author._id];
    dispatch(updateFollowing(newFollowingList));
    try {
      await api.post(`/users/${post.author._id}/follow`);
    } catch (error) {
      console.error('Failed to follow/unfollow user', error);
      dispatch(updateFollowing(currentFollowing)); 
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return; 
    if (isLiked) {
      setLikes(likes.filter((id) => id !== currentUserId));
    } else {
      setLikes([...likes, currentUserId]);
    }
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch (error) {
      console.error('Failed to like post', error);
      setLikes(post.likes || []);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      const response = await api.post(`/posts/${post._id}/comments`, { text: newComment });
      setComments(response.data.data.comments || []);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  return (
    <>
      {isCommentModalOpen && (
        <CommentModal 
          comments={comments} 
          postAuthor={post.author.username} 
          onClose={() => setIsCommentModalOpen(false)} 
        />
      )}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img className="w-12 h-12 rounded-full mr-4 object-cover" src={post.author.profilePicture || `https://i.pravatar.cc/150?u=${post.author._id}`} alt={post.author.username} />
            <div>
              <Link to={`/profile/${post.author.username}`}><p className="font-bold text-gray-800 hover:underline">{post.author.username}</p></Link>
              <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {user && currentUserId !== post.author._id && (
            <button onClick={handleFollow} className={`px-4 py-1 text-sm font-semibold rounded-full ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <p className="text-gray-700 mb-4">{post.content}</p>
        {post.mediaUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {post.mediaType === 'image' ? (
              <img src={post.mediaUrl} alt="Post content" className="max-h-[600px] w-full object-cover" />
            ) : (
              <video src={post.mediaUrl} controls className="w-full" />
            )}
          </div>
        )}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex items-center space-x-6 text-gray-500">
            <button onClick={handleLike} disabled={!user} className="flex items-center space-x-2 hover:text-red-500 focus:outline-none disabled:opacity-50">
              <svg className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.273l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
              <span>{likes.length}</span>
            </button>
            <button onClick={() => setIsCommentModalOpen(true)} className="flex items-center space-x-2 hover:text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <span>{comments.length}</span>
            </button>
          </div>
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-4">
          <div className="flex items-center">
            <input type="text" disabled={!user} className="w-full p-2 border border-gray-300 rounded-l-md" placeholder={user ? "Add a comment..." : "Log in to comment"} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <button type="submit" disabled={!user} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md disabled:bg-indigo-300">Post</button>
          </div>
        </form>
      </div>
    </>
  );
};
export default PostCard;