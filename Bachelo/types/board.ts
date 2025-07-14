export interface BoardCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardPost {
  id: string;
  category_id: string;
  author_name: string;
  author_email?: string;
  title: string;
  content: string;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  category?: BoardCategory;
  images?: BoardPostImage[];
  replies_count?: number;
  replies?: BoardReply[];
  plus_count?: number;
  minus_count?: number;
}

export interface BoardPostImage {
  id: string;
  post_id: string;
  image_url: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  display_order: number;
  created_at: string;
}

export interface BoardReply {
  id: string;
  post_id: string;
  parent_reply_id?: string;
  author_name: string;
  author_email?: string;
  content: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  replies?: BoardReply[];
  plus_count?: number;
  minus_count?: number;
}

export interface CreateBoardPostInput {
  category_id: string;
  author_name: string;
  author_email?: string;
  title: string;
  content: string;
  images?: File[];
}

export interface CreateBoardReplyInput {
  post_id: string;
  parent_reply_id?: string;
  author_name: string;
  author_email?: string;
  content: string;
}

export interface BoardPostsResponse {
  posts: BoardPost[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}