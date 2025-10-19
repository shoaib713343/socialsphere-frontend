// src/components/CommentModal.tsx
import React from 'react';
import type { PostProps } from '../types';

interface CommentModalProps {
  comments: PostProps['comments'];
  postAuthor: string;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ comments, postAuthor, onClose }) => {
  return (
    // The Modal Overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose} // Close modal when clicking the background
    >
      {/* The Modal Content */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg h-3/4 flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-center">Comments on {postAuthor}'s post</h2>
        </div>

        {/* Scrollable Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-3">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={`https://i.pravatar.cc/150?u=${comment.author._id}`}
                  alt={comment.author.username}
                />
                <div className="flex-1 bg-gray-100 rounded-lg p-3">
                  <p className="font-semibold text-sm">{comment.author.username}</p>
                  <p className="text-gray-800">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No comments yet.</p>
          )}
        </div>

        <div className="p-4 border-t">
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;