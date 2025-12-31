import React, { useState, useEffect, useCallback } from 'react';
import type { Post as PostType, Comment as CommentType } from '../types.ts';
import { postComment, getCommentsForPost, likePost, getPostById } from '../lib/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import Font Awesome heart icons

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post: initialPost }) => {
  const [currentPost, setCurrentPost] = useState<PostType>(initialPost);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const { user } = useAuth();

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

      console.log('Comment submitted successfully for post:', currentPost.id);
      toast.success('Comment posted successfully!');
      setNewCommentText('');
      fetchComments(); // Re-fetch comments after successful post
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
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like/unlike post. Please try again.');
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center mb-2">
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
      </div>
      <p className="mb-2">{currentPost.caption}</p>
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

      {/* Like Button */}
      <div className="flex items-center mt-4">
        <button
          onClick={handleLikeToggle}
          className="flex items-center text-gray-600 hover:text-red-500 transition-colors duration-200"
        >
          {currentPost.is_liked ? (
            <FaHeart className="text-red-500 text-xl" /> // Filled heart for liked
          ) : (
            <FaRegHeart className="text-xl" /> // Empty heart for not liked
          )}
          <span className="ml-1 text-sm">{currentPost.likes}</span>
        </button>
      </div>

      {/* Comments Section */}
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

        {/* New Comment Input */}
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
    </div>
  );
};

export default Post;
