export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  user_id: number;
  caption: string;
  media_url: string;
  media_type: string;
  created_at: string;
  username: string
}
