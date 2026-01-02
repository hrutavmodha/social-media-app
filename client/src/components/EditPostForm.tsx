import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import toast from 'react-hot-toast';
import { updatePost } from '../lib/api.ts';

interface EditPostFormProps {
  post: Post;
  onCancel: () => void;
  onSuccess: (updatedPost: Post) => void;
}

const EditPostForm: React.FC<EditPostFormProps> = ({ post, onCancel, onSuccess }) => {
  const [caption, setCaption] = useState(post.caption);
  const [newMedia, setNewMedia] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>(post.media_url || []);
  const [clearAllMedia, setClearAllMedia] = useState<boolean>(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const MAX_MEDIA_FILES = 5;

  useEffect(() => {
    setCaption(post.caption);
    setExistingMediaUrls(post.media_url || []);
    setNewMedia([]);
    setClearAllMedia(false);
    setCaptionError(null);
  }, [post]);

  const handleNewMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const currentMediaCount = existingMediaUrls.length + newMedia.length;
      if (currentMediaCount + filesArray.length > MAX_MEDIA_FILES) {
        toast.error(`You can only upload a maximum of ${MAX_MEDIA_FILES} files in total.`);
        e.target.value = '';
        return;
      }
      setNewMedia(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveExistingMedia = (urlToRemove: string) => {
    setExistingMediaUrls(prev => {
      const updated = prev.filter(url => url !== urlToRemove);
      if (updated.length === 0 && newMedia.length === 0 && post.has_media) {
          setClearAllMedia(true);
      }
      return updated;
    });
  };

  const handleRemoveNewMedia = (index: number) => {
    setNewMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClearAllMedia(e.target.checked);
    if (e.target.checked) {
      setExistingMediaUrls([]);
      setNewMedia([]);
    } else {
      setExistingMediaUrls(post.media_url || []);
    }
  };

  const validateForm = () => {
    let isValid = true;
    setCaptionError(null);

    const effectiveCaption = caption.trim();
    const effectiveMediaCount = clearAllMedia ? newMedia.length : (existingMediaUrls.length + newMedia.length);

    if (!effectiveCaption && effectiveMediaCount === 0) {
      setCaptionError("Post must have either a caption or media.");
      isValid = false;
    } else if (effectiveCaption.length > 500) {
        setCaptionError("Caption cannot exceed 500 characters.");
        isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const mediaToUpload = clearAllMedia ? [] : newMedia;
    const shouldClearMediaOnServer = (existingMediaUrls.length === 0 && newMedia.length === 0 && post.has_media === true) || clearAllMedia;

    try {
      await updatePost(
        post.id,
        caption,
        mediaToUpload,
        shouldClearMediaOnServer
      );
      toast.success('Post updated successfully!');
      onSuccess({ ...post, caption, media_url: existingMediaUrls, has_media: existingMediaUrls.length > 0 || newMedia.length > 0 });
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post.');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Edit Post</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          className={`w-full p-2 border rounded-md mb-3 ${captionError ? 'border-red-500' : 'border-gray-300'}`}
          rows={3}
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
            setCaptionError(null);
          }}
        ></textarea>
        {captionError && <p className="text-red-500 text-sm mt-1">{captionError}</p>}

        {existingMediaUrls.length > 0 && !clearAllMedia && (
          <div className="mb-3">
            <p className="font-semibold text-sm mb-1">Existing Media:</p>
            <div className="flex flex-wrap gap-2">
              {existingMediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`existing-${index}`} className="w-24 h-24 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingMedia(url)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">Add New Media:</label>
          <input
            type="file"
            multiple
            onChange={handleNewMediaChange}
            className="text-sm border p-1 rounded-md w-full"
            accept="image/*"
            disabled={existingMediaUrls.length + newMedia.length >= MAX_MEDIA_FILES}
          />
          {newMedia.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {newMedia.map((file, index) => (
                <div key={index} className="relative">
                  <img src={URL.createObjectURL(file)} alt={`new-preview-${index}`} className="w-24 h-24 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewMedia(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={clearAllMedia}
              onChange={handleClearAllMediaChange}
              className="mr-2"
            />
            Remove all media from post
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostForm;
