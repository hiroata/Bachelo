-- Performance optimization indexes for the Bachelo application
-- This migration adds indexes to improve query performance on frequently accessed columns

-- Board Posts Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_created_at 
ON board_posts (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_category_id 
ON board_posts (category_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_plus_count 
ON board_posts (plus_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_view_count 
ON board_posts (view_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_trending_score 
ON board_posts (created_at DESC, view_count DESC, plus_count DESC);

-- Board Categories Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_categories_active_display_order 
ON board_categories (is_active, display_order);

-- Board Replies Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_replies_post_id 
ON board_replies (post_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_replies_created_at 
ON board_replies (created_at DESC);

-- Board Post Images Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_post_images_post_id 
ON board_post_images (post_id);

-- Board Votes Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_post_votes_post_id 
ON board_post_votes (post_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_reply_votes_reply_id 
ON board_reply_votes (reply_id);

-- Voice Posts Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_voice_posts_created_at 
ON anonymous_voice_posts (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_voice_posts_status 
ON anonymous_voice_posts (status);

-- Search Performance Indexes (using GIN for full-text search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_search_title 
ON board_posts USING gin(to_tsvector('japanese', title));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_search_content 
ON board_posts USING gin(to_tsvector('japanese', content));

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_category_created 
ON board_posts (category_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_posts_active_trending 
ON board_posts (created_at DESC, plus_count DESC) 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Note: CONCURRENTLY prevents locking during index creation
-- These indexes should significantly improve query performance for:
-- - Post listing by category
-- - Trending posts calculation
-- - Search functionality
-- - Vote counting
-- - Reply counting