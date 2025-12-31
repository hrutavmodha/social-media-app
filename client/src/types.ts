export interface User {
  id: number;
  name: string;
  email: string;
  profile_url?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  text: string;
  created_at: string;
  username: string;
  user_profile_url?: string;
}

export interface Post {
  id: number;
  user_id: number;
  caption: string;
  has_media?: boolean;
  media_url: string[];
  likes: number;
  created_at: string;
  username: string;
  user_profile_url?: string;
  comments?: Comment[];
  is_liked?: boolean;
}
