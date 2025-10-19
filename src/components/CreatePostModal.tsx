// src/components/CreatePostModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void; // Function to refetch posts
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [error, setError] = useState('');

  const { token } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }

    try {
      await axios.post('http://localhost:8000/api/v1/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      onPostCreated(); // Tell the homepage to refetch posts
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create a new post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
          <input
            type="file"
            accept="image/*,video/*"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            onChange={(e) => e.target.files && setMedia(e.target.files[0])}
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;