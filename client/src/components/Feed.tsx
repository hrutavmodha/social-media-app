import { useEffect, useState } from 'react';
import CreatePost from './CreatePost';
import Post from './Post';
import { getPosts } from '../lib/api';
import type { Post as PostType } from '../types.ts';

const Feed = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching posts.');
      }
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Home</h1>
      <CreatePost onPostCreated={fetchPosts} />
      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {posts.map((post) => { 
          console.log(JSON.stringify(post, null, 4))
          return <Post key={post.id} post={post} />
         })}
      </div>
    </div>
  );
};

export default Feed;
