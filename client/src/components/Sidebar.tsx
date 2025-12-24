import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 p-4 border-r border-gray-200 flex flex-col">
      <div className="text-2xl font-bold mb-4">Social App</div>
      <nav>
        <ul>
          <li className="mb-2">
            <Link to="/" className="p-2 rounded-md hover:bg-gray-100 block">Home</Link>
          </li>
          <li className="mb-2">
            <a href="#" className="p-2 rounded-md hover:bg-gray-100 block">Explore</a>
          </li>
          <li className="mb-2">
            <a href="#" className="p-2 rounded-md hover:bg-gray-100 block">Notifications</a>
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
