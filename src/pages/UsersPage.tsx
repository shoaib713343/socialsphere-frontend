// src/pages/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateFollowing } from '../store/authSlice';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFollow = async (targetUserId: string) => {
    if (!currentUser) return;
    const currentFollowing = currentUser.following || [];
    const isFollowing = currentFollowing.includes(targetUserId);
    const newFollowingList = isFollowing
      ? currentFollowing.filter(id => id !== targetUserId)
      : [...currentFollowing, targetUserId];
    dispatch(updateFollowing(newFollowingList));
    try {
      await api.post(`/users/${targetUserId}/follow`);
    } catch (error) {
      console.error('Failed to follow/unfollow user', error);
      dispatch(updateFollowing(currentFollowing));
    }
  };

  if (loading) return <div className="text-center mt-10">Loading users...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Discover Users</h1>
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => {
            const isFollowing = (currentUser?.following || []).includes(user._id);
            return (
              <li key={user._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img className="w-12 h-12 rounded-full object-cover" src={user.profilePicture || `https://i.pravatar.cc/150?u=${user._id}`} alt={user.username} />
                  <Link to={`/profile/${user.username}`}><span className="ml-4 font-semibold text-gray-800 hover:underline">{user.username}</span></Link>
                </div>
                <button
                  onClick={() => handleFollow(user._id)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
export default UsersPage;