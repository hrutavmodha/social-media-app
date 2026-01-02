import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell } from 'react-icons/fa';
import { getNotifications } from '../lib/api.ts';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const fetchUnreadNotifications = async () => {
    if (user) {
      try {
        const notifications = await getNotifications();
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <aside className="w-64 p-4 border-r border-gray-200 flex flex-col">
      <div className="text-2xl font-bold mb-4">Social App</div>

      <form onSubmit={handleSearchSubmit} className="mb-4 relative">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 pl-10 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </form>

      <nav>
        <ul>
          <li className="mb-2">
            <Link to="/" className="p-2 rounded-md hover:bg-gray-100 block">Home</Link>
          </li>
          <li className="mb-2">
            <a href="#" className="p-2 rounded-md hover:bg-gray-100 block">Explore</a>
          </li>
          <li className="mb-2">
            <Link to="/notifications" className="relative p-2 rounded-md hover:bg-gray-100 flex items-center">
              <FaBell className="mr-2" /> Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full absolute -top-1 -right-1">
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
          <li className="mb-2">
            <a href="#" className="p-2 rounded-md hover:bg-gray-100 block">Messages</a>
          </li>
          <li className="mb-2">
            <Link to="/profile" className="p-2 rounded-md hover:bg-gray-100 block">Profile</Link>
          </li>
        </ul>
      </nav>
      <button className="bg-blue-500 text-white rounded-full py-2 px-4 w-full mt-4">
        Post
      </button>
      <div className="mt-auto">
      {user && (
          <button
              onClick={logout}
              className="w-full text-left p-2 rounded-md hover:bg-gray-100"
          >
              Logout
          </button>
      )}
      </div>
    </aside>
  );
};

export default Sidebar;
