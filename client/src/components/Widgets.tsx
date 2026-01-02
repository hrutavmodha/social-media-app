import { useState, useEffect } from 'react';
import { getTrending, getWhoToFollow, followUser, unfollowUser } from '../lib/api';
import type { User, Post } from '../types.ts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Widgets = () => {
  const [trending, setTrending] = useState<Post[]>([]);
  const [whoToFollow, setWhoToFollow] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [trendingData, whoToFollowData] = await Promise.all([
        getTrending(),
        getWhoToFollow(),
      ]);
      setTrending(trendingData);
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
  }, [currentUser]);

  const handleFollowToggle = async (userToToggle: User) => {
    if (!currentUser) {
      toast.error('You must be logged in to follow users.');
      return;
    }

    try {
      if (userToToggle.isFollowing) {
        await unfollowUser(String(userToToggle.id));
        toast.success(`Unfollowed ${userToToggle.name}`);
        setWhoToFollow(prev =>
          prev.map(u =>
            u.id === userToToggle.id ? { ...u, isFollowing: false, followersCount: (u.followersCount || 0) - 1 } : u
          )
        );
      } else {
        await followUser(String(userToToggle.id));
        toast.success(`Following ${userToToggle.name}`);
        setWhoToFollow(prev =>
          prev.map(u =>
            u.id === userToToggle.id ? { ...u, isFollowing: true, followersCount: (u.followersCount || 0) + 1 } : u
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
        <h2 className="font-bold mb-2">Trending Posts</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {trending.length > 0 ? (
          <ul>
            {trending.map((post) => (
              <li key={post.id} className="mb-2 border-b border-gray-200 pb-2 last:border-b-0">
                <Link to={`/posts/${post.id}`} className="block hover:underline">
                  <p className="font-semibold">{post.caption}</p>
                  <p className="text-sm text-gray-600">by {post.username}</p>
                  <p className="text-xs text-gray-500">{post.likes} likes</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className="text-gray-500">No trending posts found.</p>
        )}
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="font-bold mb-2">Who to follow</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {whoToFollow.length > 0 ? (
          <ul>
            {whoToFollow.map((userToFollow) => (
              <li key={userToFollow.id} className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                <Link to={`/users/${userToFollow.id}`} className="flex items-center">
                  <img
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                    src={userToFollow.profile_url || '/default-profile.png'}
                    alt={userToFollow.name}
                  />
                  <div>
                    <p className="font-bold">{userToFollow.name}</p>
                    <p className="text-sm text-gray-600">{userToFollow.followersCount} followers</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollowToggle(userToFollow)}
                  className={`text-sm py-1 px-3 rounded-full ${
                    userToFollow.isFollowing
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                  } hover:opacity-80`}
                >
                  {userToFollow.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className="text-gray-500">No suggestions.</p>
        )}
      </div>
    </aside>
  );
};

export default Widgets;
