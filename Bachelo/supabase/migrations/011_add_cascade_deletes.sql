-- 投稿が削除されたときに関連データも削除されるようにカスケード削除を設定

-- 既存の外部キー制約を削除して、カスケード削除付きで再作成

-- board_post_images
ALTER TABLE board_post_images 
DROP CONSTRAINT IF EXISTS board_post_images_post_id_fkey;

ALTER TABLE board_post_images 
ADD CONSTRAINT board_post_images_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES board_posts(id) 
ON DELETE CASCADE;

-- board_replies
ALTER TABLE board_replies 
DROP CONSTRAINT IF EXISTS board_replies_post_id_fkey;

ALTER TABLE board_replies 
ADD CONSTRAINT board_replies_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES board_posts(id) 
ON DELETE CASCADE;

-- board_post_votes
ALTER TABLE board_post_votes 
DROP CONSTRAINT IF EXISTS board_post_votes_post_id_fkey;

ALTER TABLE board_post_votes 
ADD CONSTRAINT board_post_votes_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES board_posts(id) 
ON DELETE CASCADE;

-- 返信が削除されたときに関連する投票も削除
ALTER TABLE board_reply_votes 
DROP CONSTRAINT IF EXISTS board_reply_votes_reply_id_fkey;

ALTER TABLE board_reply_votes 
ADD CONSTRAINT board_reply_votes_reply_id_fkey 
FOREIGN KEY (reply_id) 
REFERENCES board_replies(id) 
ON DELETE CASCADE;

-- 親返信が削除されたときに子返信も削除
ALTER TABLE board_replies 
DROP CONSTRAINT IF EXISTS board_replies_parent_reply_id_fkey;

ALTER TABLE board_replies 
ADD CONSTRAINT board_replies_parent_reply_id_fkey 
FOREIGN KEY (parent_reply_id) 
REFERENCES board_replies(id) 
ON DELETE CASCADE;