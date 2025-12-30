import { useState, useEffect } from 'react';
import { getTrending, getWhoToFollow, followUser, unfollowUser } from '../lib/api';
import type { User } from '../types.ts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Widgets = () => {
  const [trending, setTrending] = useState<string[]>([]);
  const [whoToFollow, setWhoToFollow] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth(); // Get the current authenticated user

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [trendingData, whoToFollowData] = await Promise.all([
        getTrending(),
        getWhoToFollow(),
      ]);
      setTrending(trendingData);
      // Filter out the current user from the whoToFollow list
      setWhoToFollow(whoToFollowData.filter((u: User) => u.id !== currentUser?.id));
    } catch (err: unknown) {
      if (err instanceof Error) {
          setError(err.message);
      } else {
          setError('An unknown error occurred while fetching widget data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]); // Refetch if currentUser changes (e.g., login/logout)

  const handleFollowToggle = async (userToFollow: User) => {
    if (!currentUser) {
      toast.error('You must be logged in to follow users.');
      return;
    }

    try {
      if (userToFollow.isFollowing) {
        await unfollowUser(String(userToFollow.id));
        toast.success(`Unfollowed ${userToFollow.name}`);
        setWhoToFollow(prev =>
          prev.map(u =>
            u.id === userToFollow.id ? { ...u, isFollowing: false, followersCount: (u.followersCount || 0) - 1 } : u
          )
        );
      } else {
        await followUser(String(userToFollow.id));
        toast.success(`Following ${userToFollow.name}`);
        setWhoToFollow(prev =>
          prev.map(u =>
            u.id === userToFollow.id ? { ...u, isFollowing: true, followersCount: (u.followersCount || 0) + 1 } : u
          )
        );
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <aside className="w-80 p-4">
      <div className="mb-4 bg-gray-100 rounded-lg p-4">
        <h2 className="font-bold mb-2">Trending</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ul>
          {trending.map((topic) => (
            <li key={topic} className="mb-2">
              <a href="#" className="text-blue-600 hover:underline">
                {topic}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="font-bold mb-2">Who to follow</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ul>
          {whoToFollow.map((user) => (
            <li key={user.id} className="flex items-center justify-between mb-2">
              <Link to={`/users/${user.id}`} className="flex items-center">
                <img
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                  src={user.profile_url || `https://avatars.dicebear.com/api/male/${user.name}.svg`} // Use user.profile_url if available
                  alt={user.name}
                />
                <div>
                  <p className="font-bold">{user.name}</p>
                </div>
              </Link>
              <button
                onClick={() => handleFollowToggle(user)}
                className={`text-sm py-1 px-3 rounded-full ${
                  user.isFollowing
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                } hover:opacity-80`}
              >
                {user.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Widgets;
