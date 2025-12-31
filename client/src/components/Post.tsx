import React, { useState, useEffect } from 'react';
import type { Post as PostType, Comment as CommentType } from '../types.ts';
import { postComment, getCommentsForPost, likePost } from '../lib/api.ts'; // Added likePost
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import Font Awesome heart icons

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post: initialPost }) => {
  const [post, setPost] = useState<PostType>(initialPost);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(initialPost.likes); // State for likes count
  const [isLiked, setIsLiked] = useState<boolean>(false); // State for current user's like status
  const { user } = useAuth();

  useEffect(() => {
    // For now, assume not liked by default.
    // In a real application, you would make an API call here to check if the current user
    // has liked this post and set `isLiked` accordingly.
    // Example: checkIsLiked(post.id, user?.id).then(setIsLiked);
  }, [post.id, user?.id]); // Re-run if post.id or user changes

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await getCommentsForPost(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments.');
      }
    };
    fetchComments();
  }, [post.id]);

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

    let tempComment: CommentType | undefined;

    try {
      tempComment = {
        id: Date.now(),
        user_id: user.id,
        post_id: post.id,
        text: newCommentText,
        created_at: new Date().toISOString(),
        username: user.name || 'Anonymous',
        user_profile_url: undefined
      };

      setComments(prevComments => [...prevComments, tempComment!]);

      await postComment(post.id, newCommentText);

      console.log('Comment submitted successfully for post:', post.id);
      toast.success('Comment posted successfully!');
      setNewCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to post comment. Please try again.');
      if (tempComment) {
        setComments(prevComments => prevComments.filter(c => c.id !== tempComment!.id));
      }
    }
  };

  const handleLikeToggle = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to like a post.');
      return;
    }

    // Optimistic UI update
    setIsLiked(prev => !prev);
    setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));

    try {
      // Assuming backend handles the toggle (like/unlike) based on user and post ID
      await likePost(post.id);
      // Backend response could confirm new like count and status,
      // which we could use to update state more robustly if needed.
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like/unlike post. Please try again.');
      // Revert optimistic update if API call fails
      setIsLiked(prev => !prev);
      setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center mb-2">
        <Link to={`/users/${post.user_id}`} className="flex items-center">
          <img
            className="w-10 h-10 rounded-full border mr-4"
            src={post?.user_profile_url || 'default-profile.png'}
            alt={String(post.username)}
          />
          <div>
            <p className="font-bold">{post.username}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </Link>
      </div>
      <p className="mb-2">{post.caption}</p>
      {post.media_url && post.media_url.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.isArray(post.media_url) ? (
            post.media_url.map((url, index) => (
              <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} className="rounded-lg w-[300px] h-[300px] object-cover" />
              </a>
            ))
          ) : (
            <a href={post.media_url} target="_blank" rel="noopener noreferrer">
                <img src={post.media_url} className="rounded-lg w-[300px] h-[300px] object-cover" />
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
          {isLiked ? (
            <FaHeart className="text-red-500 text-xl" /> // Filled heart for liked
          ) : (
            <FaRegHeart className="text-xl" /> // Empty heart for not liked
          )}
          <span className="ml-1 text-sm">{likesCount}</span>
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
