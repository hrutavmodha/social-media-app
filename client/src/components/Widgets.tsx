import { useState, useEffect } from 'react';
import { getTrending, getWhoToFollow } from '../lib/api';
import type { User } from '../types.ts';

const Widgets = () => {
  const [trending, setTrending] = useState<string[]>([]);
  const [whoToFollow, setWhoToFollow] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [trendingData, whoToFollowData] = await Promise.all([
          getTrending(),
          getWhoToFollow(),
        ]);
        setTrending(trendingData);
        setWhoToFollow(whoToFollowData);
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

    fetchData();
  }, []);

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
            <li key={user.id} className="flex items-center mb-2">
              <img
                className="w-10 h-10 rounded-full mr-4"
                src={`https://avatars.dicebear.com/api/male/${user.name}.svg`}
                alt={user.name}
              />
              <div>
                <p className="font-bold">{user.name}</p>
                <button className="text-sm text-blue-600 hover:underline">
                  Follow
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Widgets;
