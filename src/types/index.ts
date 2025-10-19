// No mongoose import is needed here.

export interface PostProps {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  likes: string[];
  comments: {
    _id: string;
    author: { _id: string; username: string };
    text: string;
    createdAt: string;
  }[];
}