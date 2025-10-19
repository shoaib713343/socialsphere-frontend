// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logOut } from '../store/authSlice';
import { markNotificationsAsRead } from '../store/notificationsSlice';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0) {
      dispatch(markNotificationsAsRead());
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">SocialSphere</Link>
          <div className="flex items-center">
            <div className="ml-10 flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2">Home</Link>
                  <Link to="/chat" className="text-gray-700 hover:text-indigo-600 px-3 py-2">Chat</Link>
                  <Link to="/users" className="text-gray-700 hover:text-indigo-600 px-3 py-2">Users</Link>
                  
                  {/* ... Notification Bell ... */}
                  <div className="relative">
                    <button onClick={handleBellClick} /* ... */ >
                      {/* ... Bell SVG ... */}
                    </button>
                    {/* ... Notification Dropdown ... */}
                  </div>

                  {/* --- THIS IS THE UPDATED PART --- */}
                  <div className="ml-3 relative">
                    <Link to={`/profile/${user.username}`} className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100">
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={`https://i.pravatar.cc/150?u=${user._id}`} 
                        alt="" 
                      />
                      <span className="hidden sm:block text-sm font-medium text-gray-700">{user.username}</span>
                    </Link>
                  </div>
                  <button onClick={handleLogout} className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                  <Link to="/register" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;