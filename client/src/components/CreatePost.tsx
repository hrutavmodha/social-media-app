import { useState } from 'react';
import { createPost } from '../lib/api';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<File[]>([]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = createPost(caption, media);

    toast.promise(promise, {
        loading: 'Creating post...',
        success: () => {
            setCaption('');
            setMedia([]);
            onPostCreated();
            return 'Post created successfully!';
        },
        error: (err: any) => { // TODO: Refine error type
            return err.message;
        }
    })
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={3} // Changed from "3" to {3}
          placeholder="What's happening?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        ></textarea>
        <div className="flex justify-between items-center mt-2">
          <input
            type="file"
            multiple
            onChange={handleMediaChange}
            className="text-sm"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full py-2 px-4"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
