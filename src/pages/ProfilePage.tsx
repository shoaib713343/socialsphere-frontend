// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PostProps } from '../types';
import PostCard from '../components/PostCard';
import UpdateAvatarModal from '../components/UpdateAvatarModal';
import api from '../api/axios';

interface UserProfile {
  _id: string;
  username: string;
  profilePicture?: string;
  following?: string[];
  followers?: string[];
}

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const isOwnProfile = !username || username === currentUser?.username;

  const fetchProfileAndPosts = useCallback(async () => {
    const profileUsername = username || currentUser?.username;
    if (!profileUsername) {
      setError('No user profile to display.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const profileRes = await api.get(`/users/${profileUsername}`);
      const userProfile = profileRes.data.data;
      setProfile(userProfile);
      if (userProfile?._id) {
        const postsRes = await api.get(`/posts/user/${userProfile._id}`);
        setUserPosts(postsRes.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch profile data", err);
      setError(err.response?.data?.message || 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);
  
  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;
  if (error || !profile) return ( <div className="text-center mt-10"><h2 className="text-2xl font-bold text-red-600">Profile Not Found</h2><p className="text-gray-600 mt-2">{error}</p><Link to="/" className="mt-4 inline-block px-4 py-2 text-white bg-indigo-600 rounded-md">Back to Home</Link></div> );

  return (
    <>
      {isAvatarModalOpen && <UpdateAvatarModal onClose={() => setIsAvatarModalOpen(false)} />}
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 flex items-center">
          <div className="relative">
            <img className="w-24 h-24 rounded-full object-cover mr-6" src={(isOwnProfile ? currentUser?.profilePicture : profile?.profilePicture) || `https://i.pravatar.cc/150?u=${profile._id}`} alt={profile.username} />
            {isOwnProfile && (<button onClick={() => setIsAvatarModalOpen(true)} className="absolute bottom-0 right-6 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <div className="flex space-x-6 mt-2 text-gray-600">
              <span><span className="font-bold">{profile.following?.length || 0}</span> Following</span>
              <span><span className="font-bold">{profile.followers?.length || 0}</span> Followers</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Posts by {profile.username}</h2>
        <div>{userPosts.length > 0 ? (userPosts.map((post) => <PostCard key={post._id} post={post} />)) : (<p>This user hasn't created any posts yet.</p>)}</div>
      </div>
    </>
  );
};
export default ProfilePage;