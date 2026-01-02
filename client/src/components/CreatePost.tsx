import { useState } from 'react';
import { createPost } from '../lib/api';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [captionError, setCaptionError] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (media.length + newFiles.length > 5) {
        toast.error('You can only upload a maximum of 5 files.');
        e.target.value = '';
        return;
      }
      setMedia(prevMedia => [...prevMedia, ...newFiles]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptionError(null);

    if (!caption.trim() && media.length === 0) {
        setCaptionError("You can't create an empty post. Add a caption or media.");
        return;
    }
    if (caption.trim().length > 500) {
        setCaptionError("Caption cannot exceed 500 characters.");
        return;
    }

    const promise = createPost(caption, media);

    toast.promise(promise, {
        loading: 'Creating post...',
        success: () => {
            setCaption('');
            setMedia([]);
            onPostCreated();
            return 'Post created successfully!';
        },
        error: (err: any) => {
            return err.message || 'Failed to create post. Please try again.';
        }
    })
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <form onSubmit={handleSubmit}>
        <textarea
          className={`w-full p-2 border rounded-md ${captionError ? 'border-red-500' : 'border-gray-300'}`}
          rows={3}
          placeholder="What's happening?"
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
            setCaptionError(null);
          }}
        ></textarea>
        {captionError && <p className="text-red-500 text-sm mt-1">{captionError}</p>}
        <div className="flex justify-between items-center mt-2">
          <input
            type="file"
            multiple
            onChange={handleMediaChange}
            className="text-sm"
            accept="image/*"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full py-2 px-4"
          >
            Post
          </button>
        </div>
      </form>
      {media.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
            {media.map((file, index) => (
                <div key={index} className="relative">
                <img
                    src={URL.createObjectURL(file)}
                    alt={`preview ${index}`}
                    className="w-24 h-24 object-cover rounded-md"
                />
                <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                    X
                </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CreatePost;
