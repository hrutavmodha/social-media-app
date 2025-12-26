export interface User {
  id: number;
  name: string;
  email: string;
  profile_url?: string;
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
  media_url: string;
  media_type: string;
  created_at: string;
  username: string;
  user_profile_url?: string;
  comments?: Comment[];
}
