import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById } from '../lib/api.ts';
import type { Post } from '../types';
import PostComponent from '../components/Post';
import toast from 'react-hot-toast';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!postId) {
      setError('Post ID is missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedPost = await getPostById(parseInt(postId));
      setPost(fetchedPost);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching post details:', err);
      setError(err.message || 'Failed to fetch post details.');
      toast.error(err.message || 'Failed to fetch post details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (loading) {
    return <div className="text-center p-4">Loading post...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!post) {
    return <div className="text-center p-4">Post not found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto my-4 bg-white shadow-lg rounded-lg">
      <PostComponent post={post} onPostUpdated={fetchPost} />
    </div>
  );
};

export default PostDetail;
