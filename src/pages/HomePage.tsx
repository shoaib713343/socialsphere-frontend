// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { PostProps } from '../types';
import api from '../api/axios';

type FeedType = 'public' | 'following' | 'trending' | 'reels';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState<FeedType>('public');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    
    let url = '/posts'; // Default to public feed
    if (activeFeed === 'following') {
      url = '/posts/feed';
    } else if (activeFeed === 'trending') {
      url = '/posts/trending';
    } else if (activeFeed === 'reels') {
      url = '/posts/reels';
    }

    try {
      const response = await api.get(url);
      setPosts(response.data.data);
    } catch (err) {
      setError('Failed to fetch posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeFeed]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = () => {
    setActiveFeed('public'); 
    fetchPosts();
  };

  const renderFeedContent = () => {
    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (posts.length === 0) {
      return <p className="text-center mt-10 text-gray-500">No posts to show in this feed.</p>;
    }
    return posts.map((post) => (
      <PostCard key={post._id} post={post} />
    ));
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Post
        </button>
      </div>

      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveFeed('public')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeFeed === 'public' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
          >
            Public
          </button>
          <button
            onClick={() => setActiveFeed('following')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeFeed === 'following' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveFeed('trending')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeFeed === 'trending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveFeed('reels')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeFeed === 'reels' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
          >
            Reels
          </button>
        </nav>
      </div>
      
      <div>{renderFeedContent()}</div>
    </div>
  );
};
export default HomePage;