import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { search } from '../lib/api.ts';
import type { User, Post } from '../types';
import Layout from '../components/Layout.tsx';
import PostComponent from '../components/Post';
import toast from 'react-hot-toast';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchResults = async () => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { users: fetchedUsers, posts: fetchedPosts } = await search(query);
      setUsers(fetchedUsers);
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'Failed to fetch search results.');
      toast.error(err.message || 'Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

  const handlePostUpdated = () => {
    fetchSearchResults();
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-4">Loading search results...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center p-4 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  if (!query) {
    return (
      <Layout>
        <div className="text-center p-4 text-gray-500">Please enter a search query.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Search Results for "{query}"</h2>

        {/* User Results */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Users</h3>
          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((userResult) => (
                <Link to={`/users/${userResult.id}`} key={userResult.id} className="block">
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50">
                    <img
                      src={userResult.profile_url || '/default-profile.png'}
                      alt={userResult.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-bold">{userResult.name}</p>
                      <p className="text-sm text-gray-500">{userResult.email}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No users found.</p>
          )}
        </div>

        {/* Post Results */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Posts</h3>
          {posts.length > 0 ? (
            <div>
              {posts.map((postResult) => (
                <PostComponent key={postResult.id} post={postResult} onPostUpdated={handlePostUpdated} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No posts found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults;
