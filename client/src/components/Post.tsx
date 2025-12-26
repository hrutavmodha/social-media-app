import React, { useState } from 'react';
import type { Post as PostType, Comment as CommentType } from '../types.ts';
import { postComment } from '../lib/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post: initialPost }) => {
  const [post, setPost] = useState<PostType>(initialPost);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const { user } = useAuth();

  const handleCommentSubmit = async () => {
    if (!user?.id) {
      console.error('User not logged in. Cannot post comment.');
      alert('You must be logged in to post a comment.'); // Provide user feedback
      return;
    }

    if (!newCommentText.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      // Optimistic UI Update
      const tempComment: CommentType = {
        id: Date.now(), // Temporary ID for optimistic update
        user_id: user.id,
        post_id: post.id,
        text: newCommentText,
        created_at: new Date().toISOString(),
        username: user.name || 'Anonymous', // Use user.name from AuthContext
        user_profile_url: undefined // Placeholder, might be fetched later
      };

      setPost(prevPost => ({
        ...prevPost,
        comments: prevPost.comments ? [...prevPost.comments, tempComment] : [tempComment]
      }));

      // Call API to post the comment
      await postComment(post.id, newCommentText);

      console.log('Comment submitted successfully for post:', post.id);
      setNewCommentText(''); // Clear the input field
      // In a real app, you might refresh comments or update the temp comment with real data
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
      // Revert optimistic update if API call fails
      setPost(prevPost => ({
        ...prevPost,
        comments: prevPost.comments?.filter(c => c.id !== tempComment.id)
      }));
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center mb-2">
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
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment: CommentType) => (
            <div key={comment.id} className="mb-2 p-2 bg-gray-100 rounded-lg">
              <div className="flex items-center text-sm font-bold">
                <img
                    className="w-6 h-6 rounded-full border mr-2"
                    src={comment?.user_profile_url || 'default-profile.png'}
                    alt={String(comment.username)}
                />
                <p>{comment.username}</p>
                <p className="ml-2 text-gray-500 font-normal">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
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

