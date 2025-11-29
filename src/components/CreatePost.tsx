"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/lib/axios";
import { Image as ImageIcon, Send, Loader2, X } from "lucide-react";

interface CreatePostProps {
  onPostCreated: () => void; // Callback to tell the parent to refresh the feed
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    
    // We must use FormData because we are sending a file
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      // The Axios interceptor automatically adds the token
      await api.post("/posts", formData);
      
      // Cleanup
      setContent("");
      removeImage();
      onPostCreated(); // Refresh the feed
    } catch (error) {
      console.error("Failed to create post", error);
      alert("Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 overflow-hidden">
          {user.profilePicture ? (
             <img src={user.profilePicture} alt="Me" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">
                {user.username[0].toUpperCase()}
             </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-100 resize-none outline-none"
            placeholder={`What's on your mind, ${user.username}?`}
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative mt-2">
              <img src={previewUrl} alt="Preview" className="w-full max-h-60 object-cover rounded-lg" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            {/* Image Upload Button */}
            <label className="cursor-pointer text-gray-500 hover:text-indigo-600 transition flex items-center gap-2 text-sm font-medium">
              <ImageIcon size={20} />
              <span>Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!content && !image)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}