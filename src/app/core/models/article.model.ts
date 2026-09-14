export interface Author {
  name: string;
  username: string;
  twitter_username?: string;
  github_username?: string;
  profile_image: string;
  profile_image_90?: string;
  bio?: string;
}

export interface Article {
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  created_at: string;
  published_at: string;
  body_html?: string;
  body_markdown?: string;
  cover_image?: string;
  social_image?: string;
  tag_list: string[];
  reading_time_minutes: number;
  positive_reactions_count: number;
  comments_count: number;
  user: Author;
  url?: string;
}

export interface CommentUser {
  name: string;
  username: string;
  profile_image_90: string;
}

export interface CommentItem {
  id_code: string;
  created_at: string;
  body_html: string;
  user: CommentUser;
  children: CommentItem[];
  likes?: number;
}
