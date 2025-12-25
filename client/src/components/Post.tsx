import React from 'react';
import type { Post as PostType } from '../types.ts';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  console.log(JSON.stringify(post, null, 4))
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center mb-2">
        <img
          className="w-10 h-10 rounded-full border mr-4"
          src={post?.user_profile_url}
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
          {post.media_url.map((url, index) => (
            <a key={index} href={url} target="_blank" rel="noopener noreferrer">
              <img src={url} className="rounded-lg w-[300px] h-[300px] object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
