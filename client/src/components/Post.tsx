import React, { useState, useEffect } from 'react';
import type { Post as PostType, Comment as CommentType } from '../types.ts';
import { postComment, getCommentsForPost } from '../lib/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post: initialPost }) => {
  const [post, setPost] = useState<PostType>(initialPost); // Keep original post data for caption, media, etc.
  const [comments, setComments] = useState<CommentType[]>([]); // State to hold fetched comments
  const [newCommentText, setNewCommentText] = useState<string>('');
  const { user } = useAuth();

  // Fetch comments when component mounts or post.id changes
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
  }, [post.id]); // Re-fetch comments if post.id changes

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
      // Optimistic UI Update
      tempComment = {
        id: Date.now(), // Temporary ID for optimistic update
        user_id: user.id,
        post_id: post.id,
        text: newCommentText,
        created_at: new Date().toISOString(),
        username: user.name || 'Anonymous',
        user_profile_url: undefined
      };

      setComments(prevComments => [...prevComments, tempComment!]); // Add to fetchedComments state

      // Call API to post the comment
      await postComment(post.id, newCommentText);

      console.log('Comment submitted successfully for post:', post.id);
      toast.success('Comment posted successfully!');
      setNewCommentText('');
      // In a real app, you might refresh comments or update the temp comment with real data from response
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to post comment. Please try again.');
      // Revert optimistic update if API call fails
      if (tempComment) {
        setComments(prevComments => prevComments.filter(c => c.id !== tempComment!.id));
      }
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

      {/* Comments Section */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Comments</h4>
        {comments.length > 0 ? ( // Use comments state here
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

