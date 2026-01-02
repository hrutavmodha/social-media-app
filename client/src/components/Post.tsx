import React, { useState, useEffect, useCallback } from 'react';
import type { Post as PostInterface, Comment as CommentType } from '../types';
import { postComment, getCommentsForPost, likePost, getPostById, deletePost } from '../lib/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaEdit, FaTrash } from 'react-icons/fa';
import EditPostForm from './EditPostForm.tsx';

interface PostProps {
  post: PostInterface;
  onPostUpdated: () => void;
}

const Post: React.FC<PostProps> = ({ post: initialPost, onPostUpdated }) => {
  const [currentPost, setCurrentPost] = useState<PostInterface>(initialPost);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    setCurrentPost(initialPost);
  }, [initialPost]);

  const fetchComments = useCallback(async () => {
    try {
      const fetchedComments = await getCommentsForPost(currentPost.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments.');
    }
  }, [currentPost.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async () => {
    if (!user?.id) {
      console.error('User not logged in. Cannot post comment.');
      toast.error('You must be logged in to post a comment.');
      return;
    }

    if (!newCommentText.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }

    try {
      await postComment(currentPost.id, newCommentText);
      console.log(JSON.stringify(currentPost, null, 4))
      console.log('Comment submitted successfully for post:', currentPost.id);
      toast.success('Comment posted successfully!');
      setNewCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to post comment. Please try again.');
    }
  };

  const handleLikeToggle = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to like a post.');
      return;
    }

    try {
      await likePost(currentPost.id);
      const updatedPost = await getPostById(currentPost.id);
      setCurrentPost(updatedPost);
      toast.success(updatedPost.is_liked ? 'Post liked!' : 'Post unliked!');
      onPostUpdated(); 
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like/unlike post. Please try again.');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSuccess = (updatedPost: PostInterface) => {
    setCurrentPost(updatedPost);
    setIsEditing(false);
    onPostUpdated();
  };

  const handleDeleteClick = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to delete a post.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(currentPost.id);
        toast.success('Post deleted successfully!');
        onPostUpdated(); // Notify parent component to refresh posts (and remove this one)
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      {isEditing ? (
        <EditPostForm
          post={currentPost}
          onCancel={handleEditCancel}
          onSuccess={handleEditSuccess}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <Link to={`/users/${currentPost.user_id}`} className="flex items-center">
              <img
                className="w-10 h-10 rounded-full border mr-4"
                src={currentPost?.user_profile_url || 'default-profile.png'}
                alt={String(currentPost.username)}
              />
              <div>
                <p className="font-bold">{currentPost.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(currentPost.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
            {user?.id === currentPost.user_id && (
              <div className="flex gap-2">
                <button
                  onClick={handleEditClick}
                  className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                >
                  <FaEdit className="text-xl" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                >
                  <FaTrash className="text-xl" />
                </button>
              </div>
            )}
          </div>
          <Link to={`/posts/${currentPost.id}`} className="block">
            <p className="mb-2">{currentPost.caption}</p>
          </Link>
          {currentPost.media_url && currentPost.media_url.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(currentPost.media_url) ? (
                currentPost.media_url.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} className="rounded-lg w-[300px] h-[300px] object-cover" />
                  </a>
                ))
              ) : (
                <a href={currentPost.media_url} target="_blank" rel="noopener noreferrer">
                    <img src={currentPost.media_url} className="rounded-lg w-[300px] h-[300px] object-cover" />
                </a>
              )}
            </div>
          )}

          <div className="flex items-center mt-4">
            <button
              onClick={handleLikeToggle}
              className="flex items-center text-gray-600 hover:text-red-500 transition-colors duration-200"
            >
              {currentPost.is_liked ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-xl" />
              )}
              <span className="ml-1 text-sm">{currentPost.likes}</span>
            </button>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Comments</h4>
            {comments.length > 0 ? (
              comments.map((comment: CommentType) => (
                <div key={comment.id} className="mb-2 p-2 bg-gray-100 rounded-lg">
                  <Link to={`/users/${comment.user_id}`} className="flex items-center text-sm font-bold">
                    <img
                        className="w-6 h-6 rounded-full border mr-2"
                        src={comment?.user_profile_url || 'default-profile.png'}
                        alt={String(comment.username)}
                    />
                    <p>{comment.username}</p>
                    <p className="ml-2 text-gray-500 font-normal">{new Date(comment.created_at).toLocaleString()}</p>
                  </Link>
                  <p className="ml-8 text-sm">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}

            <div className="mt-4 flex">
              <textarea
                className="flex-grow p-2 border rounded-lg resize-none"
                rows={2}
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleCommentSubmit}
              >
                Comment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Post;
