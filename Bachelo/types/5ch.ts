// 5ch型掲示板の型定義

export interface Board {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  display_order: number;
  default_name: string;
  settings: BoardSettings;
  is_active: boolean;
  max_threads: number;
  created_at: string;
  updated_at: string;
}

export interface BoardSettings {
  require_email?: boolean;
  enable_id?: boolean;
  enable_trip?: boolean;
  max_file_size?: number;
  allowed_file_types?: string[];
  thread_autosage?: number;
  thread_autoarchive?: number;
  enable_be?: boolean;
  force_id?: boolean;
  enable_team_icons?: boolean;
  baseball_mode?: boolean;
}

export interface Thread {
  id: string;
  board_id: string;
  thread_number: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_post_at: string;
  post_count: number;
  is_archived: boolean;
  is_locked: boolean;
  is_pinned: boolean;
  board?: Board;
  posts?: Post[];
}

export interface Post {
  id: string;
  thread_id: string;
  post_number: number;
  author_name: string;
  author_email?: string;
  author_id?: string;
  author_trip?: string;
  content: string;
  created_at: string;
  ip_hash?: string;
  user_agent?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_reason?: string;
  thread?: Thread;
  images?: PostImage[];
  anchors?: PostAnchor[];
}

export interface PostAnchor {
  id: string;
  from_post_id: string;
  thread_id: string;
  to_post_number: number;
  created_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  display_order: number;
  created_at: string;
}

// API レスポンス型
export interface BoardListResponse {
  boards: Board[];
  categories: string[];
}

export interface ThreadListResponse {
  threads: Thread[];
  board: Board;
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ThreadDetailResponse {
  thread: Thread;
  posts: Post[];
  board: Board;
}

// フォーム入力型
export interface CreateThreadInput {
  board_id: string;
  title: string;
  author_name?: string;
  author_email?: string;
  content: string;
  images?: File[];
}

export interface CreatePostInput {
  thread_id: string;
  author_name?: string;
  author_email?: string;
  content: string;
  images?: File[];
}

// ユーティリティ型
export interface ThreadWithSpeed extends Thread {
  speed: number; // レス/日
}

export interface PostWithReplies extends Post {
  replies: Post[]; // このレスへの返信
}

// 表示用の定数
export const POST_STATUSES = {
  NORMAL: 'normal',
  DELETED: 'deleted',
  ABON: 'abon'
} as const;

export const THREAD_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  LOCKED: 'locked'
} as const;

// sage判定
export const isSage = (email?: string): boolean => {
  return email?.toLowerCase() === 'sage';
};

// ID生成（日付ベース）
export const generatePostId = (ipHash: string, date: Date = new Date()): string => {
  const dateStr = date.toISOString().slice(5, 10).replace('-', '/');
  const hash = ipHash.slice(0, 8);
  return `ID:${hash}`;
};

// アンカーパース
export const parseAnchors = (content: string): number[] => {
  const anchorPattern = />>(\d+)(?:-(\d+))?/g;
  const anchors: number[] = [];
  let match;
  
  while ((match = anchorPattern.exec(content)) !== null) {
    const start = parseInt(match[1]);
    const end = match[2] ? parseInt(match[2]) : start;
    
    for (let i = start; i <= end && i <= 1000; i++) {
      anchors.push(i);
    }
  }
  
  return Array.from(new Set(anchors)).sort((a, b) => a - b);
};

// アンカーをHTMLに変換
export const renderAnchors = (content: string, threadId: string): string => {
  return content.replace(/>>(\d+)(?:-(\d+))?/g, (match, start, end) => {
    if (end) {
      return `<a href="#${start}-${end}" class="anchor" data-start="${start}" data-end="${end}">${match}</a>`;
    }
    return `<a href="#${start}" class="anchor" data-post="${start}">${match}</a>`;
  });
};

// スレッドの勢い計算
export const calculateThreadSpeed = (thread: Thread): number => {
  const now = new Date();
  const created = new Date(thread.created_at);
  const hours = Math.max((now.getTime() - created.getTime()) / (1000 * 60 * 60), 1);
  return Math.round((thread.post_count / hours) * 24);
};

// 時刻表示フォーマット（5ch形式）
export const format5chDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(2, '0');
  
  return `${year}/${month}/${day}(${weekday}) ${hours}:${minutes}:${seconds}.${milliseconds}`;
};