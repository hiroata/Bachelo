-- ライブチャットシステムのテーブル作成

-- チャットルームテーブル
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- チャットメッセージテーブル
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_id TEXT NOT NULL, -- セッションベースのID
    message TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- アクティブユーザーテーブル（現在チャットに参加中のユーザー）
CREATE TABLE IF NOT EXISTS chat_active_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- インデックス作成
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_active_users_room_id ON chat_active_users(room_id);
CREATE INDEX idx_chat_active_users_last_seen ON chat_active_users(last_seen);

-- リアルタイム用のパブリケーション設定
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_active_users;

-- サンプルチャットルーム作成（人気スレッド用）
INSERT INTO chat_rooms (name, description) VALUES
    ('深夜の雑談部屋', '深夜限定！みんなでエロトーク'),
    ('初心者歓迎チャット', '初めての方も気軽に参加してください'),
    ('過激な告白部屋', '普段言えない過激な話をしよう');

-- RLSポリシー（開発環境では無効）
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_active_users DISABLE ROW LEVEL SECURITY;